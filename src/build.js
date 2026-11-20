const handlebars = require('handlebars');
const fs = require('fs-extra');
const path = require('path');
const markdownHelper = require('./utils/helpers/markdown');
const templateData = require('./metadata/metadata');
const getSlug = require('speakingurl');
const dayjs = require('dayjs');
const repoName = require('git-repo-name');
const username = require('git-username');
const buildPdf = require('./utils/pdf.js');

const srcDir = __dirname;
const outputDir = path.resolve(srcDir, '..', 'dist');

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

async function main() {
  // Clear dist dir
  fs.emptyDirSync(outputDir);

  // Copy assets
  fs.copySync(path.join(srcDir, 'assets'), outputDir);

  // Build HTML
  handlebars.registerHelper('markdown', markdownHelper);
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
