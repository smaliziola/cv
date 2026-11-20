const handlebars = require('handlebars');
const fs = require('fs-extra');
const path = require('path');
const markdownHelper = require('./utils/helpers/markdown');
const templateData = require('./data');
const getSlug = require('speakingurl');
const dayjs = require('dayjs');
const repoName = require('git-repo-name');
const username = require('git-username');
const buildPdf = require('./utils/pdf.js');

const srcDir = __dirname;
const outputDir = path.resolve(srcDir, '..', 'dist');
const modulesDir = path.resolve(srcDir, '..', 'node_modules');

/**
 * Third-party assets that are served from dist/ instead of a CDN.
 * Each entry is [source (relative to node_modules), destination (relative to dist/vendor)].
 */
const VENDOR_ASSETS = [
  ['bootstrap/dist/css/bootstrap.min.css', 'bootstrap/bootstrap.min.css'],
  ['@fortawesome/fontawesome-free/css/all.min.css', 'fontawesome/css/all.min.css'],
  [
    '@fortawesome/fontawesome-free/webfonts/fa-brands-400.woff2',
    'fontawesome/webfonts/fa-brands-400.woff2',
  ],
  [
    '@fortawesome/fontawesome-free/webfonts/fa-regular-400.woff2',
    'fontawesome/webfonts/fa-regular-400.woff2',
  ],
  [
    '@fortawesome/fontawesome-free/webfonts/fa-solid-900.woff2',
    'fontawesome/webfonts/fa-solid-900.woff2',
  ],
  [
    '@fontsource/montserrat/files/montserrat-latin-400-normal.woff2',
    'fonts/montserrat-latin-400-normal.woff2',
  ],
  [
    '@fontsource/montserrat/files/montserrat-latin-500-normal.woff2',
    'fonts/montserrat-latin-500-normal.woff2',
  ],
];

/**
 * Resolves the public base URL of the published CV.
 * Prefers the GitHub Actions environment, falls back to the git remote.
 */
function resolveBaseUrl() {
  const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/');
  if (owner && repo) {
    return `https://${owner}.github.io/${repo}`;
  }
  return `https://${username()}.github.io/${repoName.sync()}`;
}

function copyVendorAssets() {
  VENDOR_ASSETS.forEach(([from, to]) => {
    fs.copySync(path.join(modulesDir, from), path.join(outputDir, 'vendor', to));
  });
}

function registerPartials() {
  const partialsDir = path.join(srcDir, 'templates', 'partials');
  fs.readdirSync(partialsDir)
    .filter((file) => file.endsWith('.html'))
    .forEach((file) => {
      const name = path.basename(file, '.html');
      handlebars.registerPartial(name, fs.readFileSync(path.join(partialsDir, file), 'utf-8'));
    });
}

async function main() {
  // Clear dist dir
  fs.emptyDirSync(outputDir);

  // Copy assets
  fs.copySync(path.join(srcDir, 'assets'), outputDir);
  copyVendorAssets();

  // Build HTML
  handlebars.registerHelper('markdown', markdownHelper);
  registerPartials();
  const source = fs.readFileSync(path.join(srcDir, 'templates', 'index.html'), 'utf-8');
  const template = handlebars.compile(source);
  const pdfFileName = `${getSlug(templateData.name)}.pdf`;
  const now = dayjs();
  const html = template({
    ...templateData,
    baseUrl: resolveBaseUrl(),
    pdfFileName,
    updated: now.format('MMMM D, YYYY'),
    updatedIso: now.format('YYYY-MM-DD'),
  });

  const htmlFile = path.join(outputDir, 'index.html');
  fs.writeFileSync(htmlFile, html);

  // Build PDF
  await buildPdf(htmlFile, path.join(outputDir, pdfFileName));
}

main().catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});
