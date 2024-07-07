import http from 'http';
import fs from 'fs';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import randomUseragent from 'random-useragent';
import cheerio from 'cheerio';

// Initialize Puppeteer with Stealth Plugin
puppeteer.use(StealthPlugin());

// Function to generate views
export async function generateViews(searchUrl, number) {
  console.log('started');
  
  for (let i = 0; i < number; i++) {
    const browser = await puppeteer.launch({
      headless: true, // Ensure headless mode is true
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
      ]
    });
    const page = await browser.newPage();

    const userAgent = randomUseragent.getRandom();
    await page.setUserAgent(userAgent);

    await page.goto(searchUrl, { timeout: 6000000 });

    const html = await page.content();
    const $ = cheerio.load(html);

    for (let j = 0; j < 2; j++) {
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });
      await new Promise(r => setTimeout(r, 2000));
    }
    console.log('done');

    await browser.close();
  }
}

// Create HTTP server
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    fs.readFile('index.html', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>Internal Server Error</h1>');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  } else if (req.method === 'POST' && req.url === '/generateViews') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      const formData = new URLSearchParams(body);
      const url = formData.get('url');
      const number = parseInt(formData.get('number'), 10);
      try {
        await generateViews(url, number);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Views generated successfully!');
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error generating views: ' + error.message);
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>Not Found</h1>');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
