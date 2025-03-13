import puppeteer from 'puppeteer-extra';
import fs from 'fs';
import path from 'path';


const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
  'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.101 Mobile Safari/537.36',
];

async function navigateWithRetries(page: any, url: string, retries: number = 5) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Attempt ${attempt}: Navigating to ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

      // Check for Cloudflare challenge
      const cloudflareChallenge = await page.$('.challenge-form, #challenge-stage');
      if (cloudflareChallenge) {
        console.log(`Cloudflare challenge detected. Retrying after 7s...`);
        await new Promise((resolve) => setTimeout(resolve, 7000));
        continue;
      }

      console.log(`Page loaded successfully.`);
      return;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

export async function scrapeProductLinks(url: string): Promise<string[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--user-agent=' + userAgents[Math.floor(Math.random() * userAgents.length)],
    ],
  });

  const page = await browser.newPage();
  const allLinks: string[] = [];

  // Set extra headers to mimic real browser behavior
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Upgrade-Insecure-Requests': '1',
  });

  // Navigate to initial page
  await navigateWithRetries(page, url);

  // Prepare directory for screenshots
  const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

  // Determine total pages
  const totalPages = await page.$$eval('.pagination__list .pagination__item a', (items) =>
    items.length ? parseInt(items[items.length - 1].textContent?.trim() || '1') : 1
  );

  console.log(`Total pages detected: ${totalPages}`);

  for (let i = 1; i <= Math.min(totalPages, 2); i++) {
    const pageUrl = `${url}?page=${i}`;
    console.log(`Navigating to page ${i}: ${pageUrl}`);

    await navigateWithRetries(page, pageUrl);

    // Capture a screenshot for debugging
    const screenshotPath = path.join(screenshotsDir, `page-${i}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved: ${screenshotPath}`);

    // Extract product links
    const links = await page.$$eval('.goods-tile__heading a[data-test="filter-link"]', (anchors) =>
      anchors.map((a) => (a as HTMLAnchorElement).href)
    );

    console.log(`Found ${links.length} product links on page ${i}`);
    allLinks.push(...links);

    // Randomized delay to mimic human behavior
    const delay = Math.floor(Math.random() * 3000) + 2000;
    console.log(`Waiting ${delay}ms before next page`);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  await browser.close();
  return allLinks;
}
