import { faker } from '@faker-js/faker'
import { uuidv7 } from 'uuidv7'
import { db } from '.'
import { webhooks } from './schema/webhooks'

// Tipos comuns de eventos do Stripe
const stripeEventTypes = [
  'payment_intent.succeeded',
  'payment_intent.created',
  'payment_intent.payment_failed',
  'charge.succeeded',
  'charge.failed',
  'charge.refunded',
  'customer.created',
  'customer.updated',
  'customer.deleted',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.trial_will_end',
  'invoice.created',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'invoice.finalized',
  'checkout.session.completed',
  'checkout.session.expired',
  'payment_method.attached',
  'payment_method.detached',
  'payout.created',
  'payout.paid',
  'payout.failed',
  'refund.created',
  'refund.updated',
]

function generateStripeWebhookBody(eventType: string) {
  const baseEvent = {
    id: `evt_${faker.string.alphanumeric(24)}`,
    object: 'event',
    api_version: '2023-10-16',
    created: faker.date.recent({ days: 30 }).getTime() / 1000,
    type: eventType,
    livemode: faker.datatype.boolean(),
    pending_webhooks: faker.number.int({ min: 0, max: 3 }),
    request: {
      id: `req_${faker.string.alphanumeric(24)}`,
      idempotency_key: faker.string.uuid(),
    },
  }

  // Gera dados específicos baseado no tipo de evento
  if (eventType.startsWith('payment_intent')) {
    return {
      ...baseEvent,
      data: {
        object: {
          id: `pi_${faker.string.alphanumeric(24)}`,
          object: 'payment_intent',
          amount: faker.number.int({ min: 1000, max: 100000 }),
          currency: faker.helpers.arrayElement(['usd', 'eur', 'brl']),
          status: eventType.includes('succeeded')
            ? 'succeeded'
            : eventType.includes('failed')
              ? 'failed'
              : 'requires_payment_method',
          customer: `cus_${faker.string.alphanumeric(14)}`,
          description: faker.commerce.productDescription(),
          metadata: {
            order_id: faker.string.uuid(),
            customer_name: faker.person.fullName(),
          },
        },
      },
    }
  }

  if (eventType.startsWith('charge')) {
    return {
      ...baseEvent,
      data: {
        object: {
          id: `ch_${faker.string.alphanumeric(24)}`,
          object: 'charge',
          amount: faker.number.int({ min: 1000, max: 100000 }),
          currency: faker.helpers.arrayElement(['usd', 'eur', 'brl']),
          status: eventType.includes('succeeded') ? 'succeeded' : 'failed',
          customer: `cus_${faker.string.alphanumeric(14)}`,
          description: faker.commerce.product(),
          receipt_email: faker.internet.email(),
        },
      },
    }
  }

  if (eventType.startsWith('customer')) {
    return {
      ...baseEvent,
      data: {
        object: {
          id: `cus_${faker.string.alphanumeric(14)}`,
          object: 'customer',
          email: faker.internet.email(),
          name: faker.person.fullName(),
          phone: faker.phone.number(),
          description: faker.company.catchPhrase(),
          metadata: {
            user_id: faker.string.uuid(),
          },
        },
      },
    }
  }

  if (eventType.startsWith('invoice')) {
    return {
      ...baseEvent,
      data: {
        object: {
          id: `in_${faker.string.alphanumeric(24)}`,
          object: 'invoice',
          amount_due: faker.number.int({ min: 1000, max: 50000 }),
          amount_paid: eventType.includes('succeeded')
            ? faker.number.int({ min: 1000, max: 50000 })
            : 0,
          currency: faker.helpers.arrayElement(['usd', 'eur', 'brl']),
          customer: `cus_${faker.string.alphanumeric(14)}`,
          status: eventType.includes('succeeded')
            ? 'paid'
            : eventType.includes('failed')
              ? 'open'
              : 'draft',
          subscription: `sub_${faker.string.alphanumeric(14)}`,
        },
      },
    }
  }

  if (eventType.startsWith('checkout.session')) {
    return {
      ...baseEvent,
      data: {
        object: {
          id: `cs_${faker.string.alphanumeric(24)}`,
          object: 'checkout.session',
          amount_total: faker.number.int({ min: 1000, max: 100000 }),
          currency: faker.helpers.arrayElement(['usd', 'eur', 'brl']),
          customer: `cus_${faker.string.alphanumeric(14)}`,
          customer_email: faker.internet.email(),
          payment_status: eventType.includes('completed') ? 'paid' : 'unpaid',
          status: eventType.includes('completed') ? 'complete' : 'expired',
          mode: faker.helpers.arrayElement([
            'payment',
            'subscription',
            'setup',
          ]),
        },
      },
    }
  }

  if (eventType.startsWith('payout')) {
    return {
      ...baseEvent,
      data: {
        object: {
          id: `po_${faker.string.alphanumeric(24)}`,
          object: 'payout',
          amount: faker.number.int({ min: 10000, max: 1000000 }),
          currency: faker.helpers.arrayElement(['usd', 'eur', 'brl']),
          status: eventType.includes('paid')
            ? 'paid'
            : eventType.includes('failed')
              ? 'failed'
              : 'pending',
          arrival_date: faker.date.future().getTime() / 1000,
          method: 'standard',
        },
      },
    }
  }

  if (eventType.startsWith('refund')) {
    return {
      ...baseEvent,
      data: {
        object: {
          id: `re_${faker.string.alphanumeric(24)}`,
          object: 'refund',
          amount: faker.number.int({ min: 1000, max: 50000 }),
          currency: faker.helpers.arrayElement(['usd', 'eur', 'brl']),
          charge: `ch_${faker.string.alphanumeric(24)}`,
          reason: faker.helpers.arrayElement([
            'duplicate',
            'fraudulent',
            'requested_by_customer',
          ]),
          status: 'succeeded',
        },
      },
    }
  }

  // Evento genérico
  return {
    ...baseEvent,
    data: {
      object: {
        id: faker.string.alphanumeric(24),
        object: eventType.split('.')[0],
      },
    },
  }
}

async function seed() {
  console.log('🌱 Starting seed...')

  // Limpa todos os webhooks existentes
  console.log('🧹 Cleaning existing webhooks...')
  await db.delete(webhooks)
  console.log('✅ Existing data cleaned!')

  const webhooksToInsert = []

  // Gera 70 webhooks com distribuição variada de eventos
  for (let i = 0; i < 70; i++) {
    const eventType = faker.helpers.arrayElement(stripeEventTypes)
    const body = generateStripeWebhookBody(eventType)

    const webhook = {
      id: uuidv7(),
      method: 'POST',
      pathName: '/webhooks/stripe',
      ip: faker.internet.ipv4(),
      statusCode: faker.helpers.weightedArrayElement([
        { value: 200, weight: 85 },
        { value: 400, weight: 5 },
        { value: 401, weight: 3 },
        { value: 500, weight: 7 },
      ]),
      contentType: 'application/json',
      contentLength: JSON.stringify(body).length,
      queryParams: faker.datatype.boolean()
        ? { source: faker.helpers.arrayElement(['stripe', 'webhook', 'api']) }
        : undefined,
      headers: {
        'content-type': 'application/json',
        'stripe-signature': `t=${Math.floor(Date.now() / 1000)},v1=${faker.string.hexadecimal({ length: 64, prefix: '' })}`,
        'user-agent': 'Stripe/1.0 (+https://stripe.com/docs/webhooks)',
        'x-stripe-webhook-id': `whsec_${faker.string.alphanumeric(32)}`,
        accept: '*/*',
        host: faker.internet.domainName(),
      },
      body: JSON.stringify(body, null, 2),
      createdAt: faker.date.recent({ days: 30 }),
    }

    webhooksToInsert.push(webhook)
  }

  // Insere todos os webhooks de uma vez
  await db.insert(webhooks).values(webhooksToInsert)

  console.log(`✅ Successfully seeded ${webhooksToInsert.length} webhooks!`)
  console.log('\nEvent distribution:')

  const distribution = webhooksToInsert.reduce(
    (acc, webhook) => {
      const body = JSON.parse(webhook.body || '{}')
      const eventType = body.type || 'unknown'
      acc[eventType] = (acc[eventType] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  Object.entries(distribution)
    .sort(([, a], [, b]) => b - a)
    .forEach(([eventType, count]) => {
      console.log(`  ${eventType}: ${count}`)
    })

  process.exit(0)
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error)
  process.exit(1)
})
