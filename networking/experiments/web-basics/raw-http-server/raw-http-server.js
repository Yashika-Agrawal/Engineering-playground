// networking/experiments/web-basics/raw-http-server.js
// A minimal HTTP server built on top of raw TCP sockets using Node's `net` module.

const net = require('node:net');

// 1. Create a TCP server
const server = net.createServer((socket) => {
  console.log('--- Client connected (TCP handshake completed) ---');

  // 2. Listen for incoming raw bytes from the browser
  socket.on('data', (chunk) => {
    console.log('>>> RAW REQUEST FROM BROWSER:');
    console.log(chunk.toString());

    // 3. Craft the raw HTTP response string by hand
    // Notice the exact structure:
    // Status line -> \r\n -> Header -> \r\n -> BLANK LINE (\r\n) -> Body
    const response =
      'HTTP/1.1 200 OK\r\n' +
      'Content-Type: text/html\r\n' +
      '\r\n' +
      '<h1>Hello from your raw HTTP server!</h1>\n' +
      '<p>You are seeing an HTTP response built manually string-by-string.</p>';

    // 4. Send bytes down the TCP socket and hang up (end)
    socket.write(response);
    socket.end();
  });

  socket.on('close', () => {
    console.log('--- Connection closed ---\n');
  });
});

// 5. Start listening on port 3000
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log('Open that URL in your browser and check what appears here!\n');
});
