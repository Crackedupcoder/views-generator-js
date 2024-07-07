// import { generateViews } from './app2.js'; // Assuming generateViews is defined in generateViews.js
import http from 'http';
import fs from 'fs';

// const puppeteer = require('puppeteer');
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import randomUseragent from "random-useragent";
import cheerio from "cheerio";
import { randomDelay } from "random-delay";


// Create HTTP server
const server = http.createServer((req, res) => {
  // Serve index.html for the root path
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
  }
  // Handle form submission
  else if (req.method === 'POST' && req.url === '/generateViews') {
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
  }
  // Handle other routes
  else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>Not Found</h1>');
  }
});


const searchUrl = `https://sportsbuddy.ng/2024/03/27/video-fiery-exchange-cristiano-ronaldo-unleashes-fury-as-shock-defeat-shatters-portugals-unbeaten-streak/`;


export async function generateViews(searchUrl,number) {
    console.log('started')
  for (let i = 0; i < number; i++) {
    console.log
  puppeteer.use(StealthPlugin());
  const browser = await puppeteer.launch({ headless: false }); // Launch Puppeteer in non-headless mode for debugging
  const page = await browser.newPage();

  
  const userAgent = randomUseragent.getRandom();

  await page.setUserAgent(userAgent);

  // Increase navigation timeout
  await page.goto(searchUrl
    , { timeout: 6000000 }
    );

  // Wait for some time to simulate human-like behavior
  // await page.waitForTimeout(randomDelay());

  const html = await page.content();
  const $ = cheerio.load(html);

  // Simulate multiple views
  for (let i = 0; i < 2; i++) {
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight); // Scroll down the page
    });
     // Wait for some time to simulate reading the post
     await new Promise(r => setTimeout(r, 2000));
  }
console.log('done')
  // Close the browser
  await browser.close();
}
}

// generateViews(searchUrl,5).catch(error => console.error(error));

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
