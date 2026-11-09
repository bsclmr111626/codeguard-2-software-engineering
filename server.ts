import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '25mb' }));

// Helper to execute Python runner safely
function runPythonCommand(args: string[]): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonPath = 'python3';
    const scriptPath = path.resolve(__dirname, 'backend', 'runner.py');

    execFile(pythonPath, [scriptPath, ...args], { maxBuffer: 1024 * 1024 * 30 }, (error, stdout, stderr) => {
      if (error) {
        console.error('Python execution error:', error, stderr);
        return reject(new Error(stderr || error.message));
      }
      try {
        const parsed = JSON.parse(stdout);
        resolve(parsed);
      } catch (parseErr) {
        console.error('Failed to parse Python JSON output:', stdout);
        reject(parseErr);
      }
    });
  });
}

// API Route: Python 5-Stage SDLC Simulation + Matplotlib Chart
app.post('/api/python/simulate', async (req, res) => {
  try {
    const payload = JSON.stringify(req.body);
    const result = await runPythonCommand(['simulate', payload]);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API Route: Generate Matplotlib Grouped Bar Chart
app.post('/api/python/chart', async (req, res) => {
  try {
    const payload = JSON.stringify(req.body);
    const result = await runPythonCommand(['chart', payload]);
    res.json({ success: true, chart: result.chart });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API Route: Generate Matplotlib Polar/Radar Chart
app.post('/api/python/radar', async (req, res) => {
  try {
    const payload = JSON.stringify(req.body);
    const result = await runPythonCommand(['radar', payload]);
    res.json({ success: true, radar: result.radar });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API Route: Retrieve Python & Django Source Code for Pedagogical Review
app.get('/api/python/code', (req, res) => {
  try {
    const backendDir = path.resolve(__dirname, 'backend');
    const files = {
      models: fs.readFileSync(path.join(backendDir, 'simulator', 'models.py'), 'utf-8'),
      engine: fs.readFileSync(path.join(backendDir, 'simulator', 'engine.py'), 'utf-8'),
      charts: fs.readFileSync(path.join(backendDir, 'simulator', 'charts.py'), 'utf-8'),
      settings: fs.readFileSync(path.join(backendDir, 'codeguard', 'settings.py'), 'utf-8'),
    };
    res.json({ success: true, files });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`CodeGuard server running on http://localhost:${PORT}`);
  });
}

startServer();
