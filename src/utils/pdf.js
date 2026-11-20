const Puppeteer = require('puppeteer');
const { pathToFileURL } = require('url');

module.exports = async function buildPdf(inputFile, outputFile) {
  const browser = await Puppeteer.launch({
    // The sandbox is not available in most CI containers
    args: process.env.CI ? ['--no-sandbox', '--disable-setuid-sandbox'] : [],
  });
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(inputFile).href, {
      waitUntil: 'networkidle0',
    });
    await page.pdf({
      path: outputFile,
      format: 'A4',
      margin: {
        top: '2.54cm',
        right: '2.54cm',
        bottom: '2.54cm',
        left: '2.54cm',
      },
    });
  } finally {
    await browser.close();
  }
};
