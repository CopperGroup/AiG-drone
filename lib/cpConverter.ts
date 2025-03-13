import puppeteer from 'puppeteer';
import { generateUniqueId } from './utils';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/93.0',
];

type Product = {
  id: string;
  name: string;
  images: string[];
  isAvailable: boolean;
  quantity: number;
  url: string;
  priceToShow: number;
  price: number;
  category: string;
  vendor: string;
  description: string;
  articleNumber: string;
  params: { name: string; value: string }[];
}

const randomDelay = (min: number, max: number) => new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));

async function humanLikeScroll(page: any) {
  const scrolls = Math.floor(Math.random() * 5) + 3; // Scroll 3-7 times
  for (let i = 0; i < scrolls; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * (Math.random() * 0.7 + 0.3)));
    await randomDelay(1000, 2500); // Pause between scrolls
  }
}

async function randomMouseMovements(page: any) {
  const mouse = page.mouse;
  const width = await page.evaluate(() => window.innerWidth);
  const height = await page.evaluate(() => window.innerHeight);

  for (let i = 0; i < 10; i++) {
    await mouse.move(Math.random() * width, Math.random() * height);
    await randomDelay(300, 800);
  }
}

export async function getProductsData(productUrls: string[]): Promise<Product[]> {
  const browser = await puppeteer.launch({
    headless: false, // More human-like behavior with visible browser
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Set random user agent
  await page.setUserAgent(USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]);
  await page.setViewport({ width: 1280, height: 800 });

  const products: Product[] = [];

  for (const productUrl of productUrls) {
    let retries = 3;
    while (retries > 0) {
      try {
        console.log(`Navigating to ${productUrl}`);
        await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });

        // Introduce human-like behavior
        // await randomMouseMovements(page);
        await humanLikeScroll(page);
        await randomDelay(200, 1000); // Simulate reading time

        // Extract product data
        const productData = await page.evaluate(() => {
          const name = document.querySelector('.title__font')?.textContent?.trim() || '';
          const images = Array.from(document.querySelectorAll('.main-slider__item img'))
            .map(img => img.getAttribute('src'))
            .filter(src => src) as string[];

          const isAvailable = document.querySelector('.status-label')?.textContent?.trim() === 'Є в наявності';
          const quantity = 1000;
          const url = window.location.href;
          const priceSmall = document.querySelector('.product-price__small')?.textContent?.replace(/\D/g, '');
          const priceBig = document.querySelector('.product-price__big')?.textContent?.replace(/\D/g, '');
          const price = priceSmall ? Number(priceSmall) : Number(priceBig);
          const priceToShow = Number(priceBig) || 0;
          const category = document.querySelector('.breadcrumbs li:last-child a')?.textContent?.trim() || '';
          const vendor = document.querySelector('.seller-title .text-inline')?.textContent?.trim() || '';
          const description = document.querySelector('.product-about__description-content')?.textContent?.trim() || '';
          const articleNumber =
            document.querySelector('.ms-auto.color-black-60')?.textContent?.replace('Код: ', '').trim() || '';

          // Extract characteristics (params)
          const params = Array.from(document.querySelectorAll('.mt-6 .item')).map(param => {
            const name = param.querySelector('.label span')?.textContent?.trim() || '';
            let value =
              param.querySelector('.value li a span')?.textContent?.trim() ||
              param.querySelector('.value li span')?.textContent?.trim() ||
              param.querySelector('.value li')?.childNodes[0]?.textContent?.trim() ||
              '';

            return name && value ? { name, value } : null;
          }).filter(Boolean);

          return {
            id: "",
            name,
            images,
            isAvailable: true,
            quantity,
            url,
            priceToShow,
            price,
            category,
            vendor,
            description,
            articleNumber,
            params
          };
        });

        products.push(productData);
        break; // Exit retry loop if successful
      } catch (error) {
        console.error(`Error scraping ${productUrl}, Retrying... (${3 - retries}/3)`, error);
        retries -= 1;

        if (retries === 0) {
          console.error(`Failed to scrape ${productUrl} after multiple attempts.`);
        } else {
          await randomDelay(5000, 10000); // Wait before retrying
        }
      }
    }
  }

  await browser.close();
  return products;
}
