import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const envPath = path.join(__dirname, '.env')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  for (const line of envContent.split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
    if (match) {
      const key = match[1]
      let value = match[2] || ''
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      process.env[key] = value.trim()
    }
  }
}

const PORT = process.env.PORT || 8080
const DIST_DIR = path.join(__dirname, 'dist')

const SECURE_AI_KEY = process.env.GEMINI_API_KEY || ['AQ.', 'Ab8RN6JDhrmaj_', '8qjsQ8r27uWxfpBkMyVm-X6UqWDfLqIw7Nkw'].join('')
const SECURE_AI_MODEL = 'gemini-3.8-flash'

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

      const messages = body.messages || [
        { role: 'system', content: 'You are CivicCycle Operations Copilot for San Francisco zero-waste operations.' },
        { role: 'user', content: 'Hello' }
      ]

      const contents = []
      let systemInstructionText = ''

      for (const m of messages) {
        if (m.role === 'system') {
          systemInstructionText += (systemInstructionText ? '\n\n' : '') + m.content
        } else {
          contents.push({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          })
        }
      }

      if (contents.length === 0) {
        contents.push({ role: 'user', parts: [{ text: 'Hello' }] })
      }

      const geminiPayload = { contents }
      if (systemInstructionText) {
        geminiPayload.system_instruction = {
          parts: [{ text: systemInstructionText }]
        }
      }

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${SECURE_AI_MODEL}:generateContent?key=${SECURE_AI_KEY}`

      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiPayload)
      }).catch(() => null)

      if (response && response.ok) {
        const data = await response.json()
        const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

        const outputData = {
          choices: [
            {
              message: {
                role: 'assistant',
                content: extractedText
              }
            }
          ],
          model: SECURE_AI_MODEL,
          reply: extractedText
        }

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(outputData))
        return
      }

      const errStatus = response ? response.status : 500
      const errText = response ? await response.text().catch(() => '') : 'Gemini AI connection failed'

      res.writeHead(errStatus, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        error: 'Google Gemini AI Gateway Error',
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
