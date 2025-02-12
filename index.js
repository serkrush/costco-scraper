const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('https://www.costco.com/health-safety.html', { waitUntil: 'networkidle2' });

    await page.waitForSelector('.product-list');

    const products = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll('.thumbnail').forEach(product => {
        const name = product.querySelector('.description').innerText;
        const price = product.querySelector('.member-only') ? product.querySelector('.member-only').innerText : product.querySelector('.price')?.innerText || 'NoN';
        
        items.push({ name, price });
      });
      return items;
    });

    console.log(products);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
