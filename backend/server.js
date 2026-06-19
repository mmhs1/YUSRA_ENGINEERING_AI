const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/api/v1/hello' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: "Hello World! Yusra Engineering Ai local dev loop is active." }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Development backend running on port ${PORT}`);
});
