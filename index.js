const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const readline = require('readline');

puppeteer.use(StealthPlugin());

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

(async () => {
  const deliveryCode = await new Promise((resolve) => {
    rl.question('Enter city code: ', (answer) => {
      resolve(answer);
    });
  });

  const searchKeyword = await new Promise((resolve) => {
    rl.question('Enter a keyword to search: ', (answer) => {
      resolve(answer);
    });
  });

  rl.close();

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    await page.goto('https://www.costco.ca', { waitUntil: 'networkidle2', timeout: 60000 });

    await page.reload({ waitUntil: 'networkidle2' });

    const buttons = await page.$$('button[data-testid="Button_locationselector--submit"]');

    if (buttons.length >= 2) {
      const targetButton = buttons[1];
      await targetButton.click();
    } else {
      throw new Error('Second button not found');
    }

    await page.waitForSelector('#zipCode', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.type('#zipCode', deliveryCode);

    await page.waitForSelector('button[data-testid="deliverylocationform--submit"]', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.click('button[data-testid="deliverylocationform--submit"]');

    // await page.waitForNavigation({ waitUntil: 'networkidle2' });

    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.waitForSelector('input[placeholder="Search Costco"]', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.type('input[placeholder="Search Costco"]', searchKeyword);

    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.keyboard.press('Enter'); 
    await new Promise(resolve => setTimeout(resolve, 5000));

    await page.waitForSelector('.product-list', { timeout: 10000 });

    const products = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll('.thumbnail').forEach((product) => {
        const name = product.querySelector('.description').innerText;
        const price = product.querySelector('.member-only')
          ? product.querySelector('.member-only').innerText
          : product.querySelector('.price')?.innerText || 'NoN';
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
