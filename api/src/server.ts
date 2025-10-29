import { fastify } from 'fastify'

const app = fastify()

app.listen({ port: 3333, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server is running on ${address}`)
})
