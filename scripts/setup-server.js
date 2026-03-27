const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

const PORT = 4000;
const ROOT_DIR = path.join(__dirname, '..');

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    // Serve setup.html
    fs.readFile(path.join(ROOT_DIR, 'setup.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading setup.html');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else if (req.method === 'POST' && req.url === '/run-setup') {
    // Run the generated script
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { script } = JSON.parse(body);
        if (!script) {
          res.writeHead(400);
          res.end('No script provided');
          return;
        }

        const tempScriptPath = path.join(ROOT_DIR, 'temp-setup.sh');
        fs.writeFileSync(tempScriptPath, script, { mode: 0o755 });

        res.writeHead(200, {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
          'X-Content-Type-Options': 'nosniff'
        });

        const child = spawn('bash', [tempScriptPath], {
          cwd: ROOT_DIR,
          env: { ...process.env, DEBIAN_FRONTEND: 'noninteractive' }
        });

        child.stdout.on('data', (data) => {
          res.write(data);
        });

        child.stderr.on('data', (data) => {
          res.write(data);
        });

        child.on('error', (err) => {
          res.write(`\n\nError spawning process: ${err.message}`);
        });

        child.on('close', (code) => {
          res.write(`\n\n============================================\n`);
          res.write(`  Setup finished with code ${code}\n`);
          res.write(`============================================\n`);
          res.end();
          
          // Cleanup
          try {
            fs.unlinkSync(tempScriptPath);
          } catch (e) {
            console.error('Failed to cleanup temp script:', e);
          }
        });
      } catch (err) {
        res.writeHead(500);
        res.end(`Error parsing request: ${err.message}`);
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n🚀 Trofos Setup Server running at: ${url}`);
  console.log(`Press Ctrl+C to stop the server.\n`);

  // Try to open the browser
  const openCmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${openCmd} ${url}`, (err) => {
    if (err) {
      console.log(`Please open ${url} manually in your browser.`);
    }
  });
});
