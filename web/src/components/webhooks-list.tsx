import * as Dialog from '@radix-ui/react-dialog'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { Loader2Icon, Wand2Icon, XIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { webhookListSchema } from '../http/schemas/webhook'
import { CodeBlock } from './ui/code-block'
import { WebhooksListItem } from './webhooks-list-item'

export function WebhooksList() {
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver>(null)

  const [checkedWebhooksIds, setCheckedWebhooksIds] = useState<string[]>([])
  const [generatedHandlerCode, setGeneratedHandlerCode] = useState<
    string | null
  >(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      queryKey: ['webhooks'],
      queryFn: async ({ pageParam }) => {
        const url = new URL('http://localhost:3333/api/webhooks')

        if (pageParam) url.searchParams.set('cursor', pageParam)

        const response = await fetch(url.toString())
        const data = await response.json()

        return webhookListSchema.parse(data)
      },
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor ?? undefined
      },
      initialPageParam: undefined as string | undefined,
    })

  const webhooks = data.pages.flatMap((page) => page.webhooks)

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]

        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      {
        threshold: 0.1,
      },
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasNextPage, fetchNextPage, isFetchingNextPage])

  function handleCheckWebhook(webhookId: string) {
    if (checkedWebhooksIds.includes(webhookId)) {
      setCheckedWebhooksIds((state) => {
        return state.filter((id) => id !== webhookId)
      })
    } else {
      setCheckedWebhooksIds((state) => {
        return [...state, webhookId]
      })
    }
  }

  async function handleGenerateHandler() {
    setIsGenerating(true)
    try {
      const response = await fetch('http://localhost:3333/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ webhookIds: checkedWebhooksIds }),
      })

      type GenerateResponse = { code: string }

      const data: GenerateResponse = await response.json()

      setGeneratedHandlerCode(data.code)
      setIsModalOpen(true)
    } finally {
      setIsGenerating(false)
    }
  }

  const hasAnyWebhookChecked = checkedWebhooksIds.length > 0

  return (
    <>
      <div className="flex-1 overflow-y-auto relative">
        <div className="space-y-1 p-2">
          {webhooks.map((webhook) => (
            <WebhooksListItem
              key={webhook.id}
              webhook={webhook}
              onWebhookChecked={handleCheckWebhook}
              isWebhookChecked={checkedWebhooksIds.includes(webhook.id)}
            />
          ))}
        </div>

        {hasNextPage && (
          <div className="p-2" ref={loadMoreRef}>
            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-2">
                <Loader2Icon className="size-5 animate-spin text-zinc-500" />
              </div>
            )}
          </div>
        )}

        {hasAnyWebhookChecked && (
          <div className="sticky bottom-3 mx-3">
            <button
              type="button"
              className="w-full bg-indigo-400 hover:bg-indigo-400/90 ring ring-indigo-300 text-white cursor-pointer transition-colors size-10 rounded-lg flex items-center justify-center gap-2 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleGenerateHandler()}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Gerando handler...
                </>
              ) : (
                <>
                  <Wand2Icon className="size-4" />
                  Gerar handler
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Overlay className="bg-black/60 inset-0 fixed z-20" />

        <Dialog.Content className="flex items-center justify-center fixed left-1/2 top-1/2 max-h-[85vh] w-[98vw] -translate-x-1/2 -translate-y-1/2 max-w-[600px] z-40">
          <div className="bg-zinc-900 w-full max-w-[600px] rounded-lg border border-zinc-800 max-h-[60vh] overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 sticky top-0 bg-zinc-900">
              <Dialog.Title className="text-lg font-semibold text-white">
                Handler Gerado
              </Dialog.Title>
              <Dialog.Close className="text-zinc-400 hover:text-white transition-colors">
                <XIcon className="size-5" />
              </Dialog.Close>
            </div>
            <div className="p-4">
              {generatedHandlerCode && (
                <CodeBlock language="typescript" code={generatedHandlerCode} />
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </>
  )
}
