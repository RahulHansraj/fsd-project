import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 8080
const DIST_DIR = path.join(__dirname, 'dist')

const SECURE_AI_KEY = process.env.AZURE_AI_KEY || ''
const SECURE_AI_ENDPOINT = process.env.AZURE_AI_ENDPOINT || 'https://hanserr-resource.services.ai.azure.com/openai/v1/responses'
const SECURE_AI_MODEL = process.env.AZURE_AI_MODEL || 'gpt-5-nano'

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp'
}

async function handleAiProxy(req, res) {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Method Not Allowed' }))
    return
  }

  let rawBody = ''
  req.on('data', chunk => {
    rawBody += chunk
  })

  req.on('end', async () => {
    try {
      const body = rawBody ? JSON.parse(rawBody) : {}
      const isTest = req.url?.includes('/test')

      const model = body.model || SECURE_AI_MODEL
      const messages = body.messages || [
        { role: 'system', content: 'You are CivicCycle Operations Copilot for San Francisco zero-waste operations.' },
        { role: 'user', content: 'Hello' }
      ]

      const chatCompletionsUrl = SECURE_AI_ENDPOINT.includes('/responses')
        ? SECURE_AI_ENDPOINT.replace('/responses', '/chat/completions')
        : SECURE_AI_ENDPOINT
      const responsesUrl = SECURE_AI_ENDPOINT.includes('/chat/completions')
        ? SECURE_AI_ENDPOINT.replace('/chat/completions', '/responses')
        : SECURE_AI_ENDPOINT

      const headers = {
        'Content-Type': 'application/json',
        'api-key': SECURE_AI_KEY,
        'Authorization': `Bearer ${SECURE_AI_KEY}`
      }

      const requestedTokens = Number(body.max_completion_tokens || body.max_tokens || 16384)
      const tokenLimit = Math.min(128000, Math.max(1000, requestedTokens))

      const chatPayload = {
        model,
        messages,
        max_completion_tokens: isTest ? 1000 : tokenLimit
      }

      let response = await fetch(chatCompletionsUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(chatPayload)
      }).catch(() => null)

      if (!response || !response.ok) {
        const responsesPayload = {
          model,
          input: messages
        }
        const respRes = await fetch(responsesUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(responsesPayload)
        }).catch(() => null)
        if (respRes && respRes.ok) {
          response = respRes
        }
      }

      if (response && response.ok) {
        const data = await response.json()
        let extractedText = ''
        if (Array.isArray(data.output)) {
          for (const item of data.output) {
            if (item.type === 'message' && Array.isArray(item.content)) {
              for (const c of item.content) {
                if (c.text) {
                  extractedText = c.text
                  break
                }
              }
            }
            if (extractedText) break
          }
        } else if (typeof data.output_text === 'string') {
          extractedText = data.output_text
        }

        if (extractedText && (!data.choices || !data.choices[0])) {
          data.choices = [
            {
              message: {
                role: 'assistant',
                content: extractedText
              }
            }
          ]
        }

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(data))
        return
      }

      const errStatus = response ? response.status : 500
      const errText = response ? await response.text().catch(() => '') : 'Remote connection failed'

      res.writeHead(errStatus, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        error: 'Azure AI Gateway Error',
        status: errStatus,
        details: errText.slice(0, 300)
      }))
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: error.message || 'Internal proxy error' }))
    }
  })
}

const server = http.createServer((req, res) => {
  // 1. Health check endpoint for Azure App Service & Container Apps
  if (req.url === '/health' || req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok', service: 'civiccycle-backend' }))
    return
  }

  // 2. Secure AI proxy endpoint
  if (req.url?.startsWith('/api/ai/')) {
    handleAiProxy(req, res)
    return
  }

  // 3. Static asset serving & SPA Fallback
  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host}`)
  let pathname = decodeURIComponent(parsedUrl.pathname)
  let filePath = path.join(DIST_DIR, pathname)

  // Security: prevent directory traversal
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA Fallback: serve index.html
      const indexPath = path.join(DIST_DIR, 'index.html')
      fs.readFile(indexPath, (indexErr, content) => {
        if (indexErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' })
          res.end('Not Found - Please run "npm run build" first.')
          return
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' })
        res.end(content)
      })
      return
    }

    const ext = path.extname(filePath).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'
    const headers = { 'Content-Type': contentType }

    // Cache immutable assets
    if (pathname.startsWith('/assets/')) {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable'
    }

    res.writeHead(200, headers)
    fs.createReadStream(filePath).pipe(res)
  })
})

server.listen(PORT, () => {
  console.log(`CivicCycle production server listening on port ${PORT}`)
})
