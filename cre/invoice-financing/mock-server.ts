import * as http from "node:http"

const PORT = 8787

const ROUTES: Record<string, object> = {
  "/compliance": { kyc: "pass", kyb: "pass", sanctions: "clear" },
  "/underwriting": { score: 82, approved: true, maxAdvanceUsdc: 40000 },
}

const server = http.createServer((req, res) => {
  const route = req.method === "POST" ? req.url ?? "" : null
  const body = route !== null ? ROUTES[route] : undefined

  if (body !== undefined) {
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify(body))
  } else {
    res.writeHead(404)
    res.end()
  }
})

server.listen(PORT, () => {
  console.log(`Mock server listening on :${PORT}`)
})
