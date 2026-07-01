import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defineConfig, type Plugin, type Connect } from 'vite';
import react from '@vitejs/plugin-react';
import type { ServerResponse } from 'node:http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUDIT_RUNNER_PATH = path.resolve(__dirname, 'src/core/audit-runner.ts');

function readJsonBody(req: Connect.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function auditApiPlugin(): Plugin {
  return {
    name: 'a11y-lab-audit-api',
    configureServer(server) {
      server.middlewares.use('/api/audit', (req, res, next) => {
        if (req.method !== 'POST') {
          next();
          return;
        }
        void (async () => {
          try {
            const { target } = await readJsonBody(req);
            if (typeof target !== 'string' || target.length === 0) {
              sendJson(res, 400, { error: 'A target URL is required.' });
              return;
            }
            const { runAudit } = await server.ssrLoadModule(AUDIT_RUNNER_PATH);
            const result = await runAudit(target);
            sendJson(res, 200, result);
          } catch (error) {
            sendJson(res, 500, { error: error instanceof Error ? error.message : 'Audit failed.' });
          }
        })();
      });
    },
  };
}

export default defineConfig({
  root: 'src/web',
  plugins: [react(), auditApiPlugin()],
  build: {
    outDir: '../../dist-web',
    emptyOutDir: true,
  },
});
