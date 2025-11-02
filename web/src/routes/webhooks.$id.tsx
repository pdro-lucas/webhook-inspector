import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { WebHookDetails } from '../components/webhook-details'

export const Route = createFileRoute('/webhooks/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WebHookDetails id={id} />
    </Suspense>
  )
}
