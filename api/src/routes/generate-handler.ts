import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { inArray } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '@/db'
import { webhooks } from '@/db/schema'

export const generateHandler: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/api/generate',
    {
      schema: {
        summary: 'Generate a TypeScript handler',
        tags: ['Webhooks'],
        body: z.object({
          webhookIds: z.array(z.string()),
        }),
        response: {
          201: z.object({ code: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { webhookIds } = request.body

      const result = await db
        .select({
          body: webhooks.body,
        })
        .from(webhooks)
        .where(inArray(webhooks.id, webhookIds))

      const webhooksBodies = result.map((webhook) => webhook.body).join('\n\n')

      const { text } = await generateText({
        model: google('gemini-2.5-flash'),
        prompt: `
        You will receive one or more examples of webhook request bodies from different events of an API.
        Each example will represent a different event type (e.g., user.created, payment.failed, order.shipped, etc.).

        The following webhook payloads include:

        ¨¨¨
        ${webhooksBodies}
        """

        Your task is to:

        - Analyze all the provided webhook payloads and infer their event types, field names, and data structures.

        - Generate a single TypeScript file that exports a function called handleWebhook, which:

        - Accepts a request body (any or unknown) and an event name (string).

        - Uses Zod to validate and infer the correct type for each possible webhook event.

        - Uses a discriminated union or type guard approach to determine which event was received.

        - Calls the appropriate handler logic for each event type (e.g., log a message, trigger a switch block, etc.).

        - Include all Zod schemas for the webhook payloads in the same file.

        - Export all inferred types from Zod using z.infer<typeof SchemaName>.

        ✅ The output must be a complete, runnable TypeScript code file.
        ✅ Use realistic Zod schemas inferred from the examples.
        ✅ Do not include explanations — only the code without any markdown or symbols (ex: \`\`\`typescript) or comments.
        `,
      })

      return reply.status(201).send({ code: text })
    },
  )
}
