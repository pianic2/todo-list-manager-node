const http = require("http");
const fs = require("fs");
const path = require("path");

const host = process.env.FRONTEND_HOST || "0.0.0.0";
const port = Number(process.env.FRONTEND_PORT || 3100);
const root = path.resolve(__dirname, "../frontend");

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "application/javascript; charset=utf-8",
};

function send(res, statusCode, body, contentType = "text/plain; charset=utf-8") {
  res.writeHead(statusCode, { "Content-Type": contentType });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const requestPath = req.url === "/" ? "/index.html" : req.url.split("?")[0];
  const decodedPath = decodeURIComponent(requestPath);
  const filePath = path.resolve(root, `.${path.normalize(decodedPath)}`);

  if (!filePath.startsWith(root)) {
    send(res, 403, "Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      send(res, 404, "Not found");
      return;
    }

    send(res, 200, data, contentTypes[path.extname(filePath)] || "application/octet-stream");
  });
});

server.listen(port, host, () => {
  console.log(`Frontend running on http://${host}:${port}`);
});
