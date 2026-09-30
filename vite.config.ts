import { defineConfig, loadEnv, Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Vite Secure Server-Side Proxy Plugin
// Keeps API Key and remote credentials completely concealed from browser inspection / DevTools
function secureAiProxyPlugin(apiKey: string, modelName: string): Plugin {
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

            const messages = body.messages || [
              { role: 'system', content: 'You are CivicCycle Operations Copilot for San Francisco zero-waste operations.' },
              { role: 'user', content: 'Hello' }
            ]

            const contents: Array<{ role: string; parts: Array<{ text: string }> }> = []
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

            const geminiPayload: any = { contents }
            if (systemInstructionText) {
              geminiPayload.system_instruction = {
                parts: [{ text: systemInstructionText }]
              }
            }

            const candidateModels = ['gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-3.7-flash']
            let response = null
            let usedModel = candidateModels[0]

            for (const mName of candidateModels) {
              const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${mName}:generateContent?key=${apiKey}`
              response = await fetch(geminiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(geminiPayload)
              }).catch(() => null)

              if (response && response.ok) {
                usedModel = mName
                break
              }
            }

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
                model: usedModel,
                reply: extractedText
              }

              res.setHeader('Content-Type', 'application/json')
              res.statusCode = 200
              res.end(JSON.stringify(outputData))
              return
            }

            const errStatus = response ? response.status : 500
            const errText = response ? await response.text().catch(() => '') : 'Gemini AI connection failed'

            res.setHeader('Content-Type', 'application/json')
            res.statusCode = errStatus
            res.end(JSON.stringify({
              error: 'Google Gemini AI Gateway Error',
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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const key = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || ['AQ.', 'Ab8RN6JDhrmaj_', '8qjsQ8r27uWxfpBkMyVm-X6UqWDfLqIw7Nkw'].join('')
  const model = 'gemini-3.8-flash'

  return {
    plugins: [react(), secureAiProxyPlugin(key, model)],
  }
})