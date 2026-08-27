// Entry point for cPanel's Node.js App Manager (Passenger), which runs a
// specific JS file directly rather than an npm script. Passenger sets
// PORT automatically — this just wires Next's production handler to a
// plain Node HTTP server on that port.
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const port = process.env.PORT || 3002
const app = next({ dev: false })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on port ${port}`)
  })
})
