const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 5174);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function resolveFilePath(urlPath) {
  const decodedPath = decodeURIComponent(urlPath.split("?")[0]);
  const safePath = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
  const requestedPath = path.join(root, safePath === "/" ? "index.html" : safePath);
  return requestedPath.startsWith(root) ? requestedPath : path.join(root, "index.html");
}

const server = http.createServer((request, response) => {
  const filePath = resolveFilePath(request.url || "/");
  const extension = path.extname(filePath);

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("404 - File not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[extension] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(content);
  });
});

let currentPort = Number(process.env.PORT || 5174);

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    currentPort++;
    server.listen(currentPort);
  } else {
    console.error(err);
  }
});

server.listen(currentPort, () => {
  console.log(`Anukampa website running at http://localhost:${currentPort}`);
});

