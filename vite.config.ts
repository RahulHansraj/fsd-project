import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const SECURE_AI_KEY = process.env.AZURE_AI_KEY || ''
const SECURE_AI_ENDPOINT = process.env.AZURE_AI_ENDPOINT || 'https://hanserr-resource.services.ai.azure.com/openai/v1/responses'
const SECURE_AI_MODEL = process.env.AZURE_AI_MODEL || 'gpt-5-nano'

// Vite Secure Server-Side Proxy Plugin
// Keeps API Key and remote credentials completely concealed from browser inspection / DevTools
function secureAiProxyPlugin(): Plugin {
  return {
    name: 'secure-ai-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/ai/')) {
          return next()
        }

        if (req.method !== 'POST') {
          res.statusCode = 405
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

            const headers: Record<string, string> = {
              'Content-Type': 'application/json',
              'api-key': SECURE_AI_KEY,
              'Authorization': `Bearer ${SECURE_AI_KEY}`
            }

            // 1. Support full 128k input/output token limits for reasoning & deep generation
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

            // 2. If chat/completions was not 200, attempt /responses with input parameter
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
              
              // Normalize OpenAI Responses API format to standard chat format for client
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

              // If extracted text exists, guarantee choices[0].message.content exists
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

              res.setHeader('Content-Type', 'application/json')
              res.statusCode = 200
              res.end(JSON.stringify(data))
              return
            }

            // If remote responded with error
            const errStatus = response ? response.status : 500
            const errText = response ? await response.text().catch(() => '') : 'Remote connection failed'

            res.setHeader('Content-Type', 'application/json')
            res.statusCode = errStatus
            res.end(JSON.stringify({
              error: 'Azure AI Gateway Error',
              status: errStatus,
              details: errText.slice(0, 300)
            }))
          } catch (error: any) {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 500
            res.end(JSON.stringify({ error: error.message || 'Internal proxy error' }))
          }
        })
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), secureAiProxyPlugin()],
})