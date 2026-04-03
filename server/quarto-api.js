import express from 'express';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json({ limit: '10mb' }));

app.post('/api/render', async (req, res) => {
  const { content } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'No content provided' });
  }

  const tempDir = '/tmp/quarto-render';
  const inputFile = path.join(tempDir, 'input.qmd');
  const outputFile = path.join(tempDir, 'output.html');

  try {
    fs.mkdirSync(tempDir, { recursive: true });
    fs.writeFileSync(inputFile, content);

    execSync(`quarto render ${inputFile} --to html --output ${outputFile}`, {
      cwd: tempDir,
      stdio: 'pipe'
    });

    const html = fs.readFileSync(outputFile, 'utf-8');
    
    fs.rmSync(tempDir, { recursive: true, force: true });

    res.json({ html });
  } catch (error) {
    console.error('Quarto render error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Quarto API server running on http://localhost:${PORT}`);
});
