/**
 * Checks that every external link used by the CV is still reachable.
 * Usage: npm run check-links
 *
 * - Broken links (4xx/5xx other than "bot blocked", network errors) fail the script.
 * - Sites that block automated requests (LinkedIn, Udemy...) are reported as warnings.
 */
const data = require('../src/data');

const TIMEOUT_MS = 15000;
const CONCURRENCY = 5;
const BLOCKED_STATUSES = new Set([401, 403, 405, 429, 999]);
const HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
};

function collectLinks() {
  const links = new Map();
  const add = (url, source) => {
    if (url && /^https?:/.test(url) && !links.has(url)) {
      links.set(url, source);
    }
  };
  data.facts.forEach((fact) => add(fact.url, `fact: ${fact.label}`));
  data.positions.forEach((position) => add(position.link, `experience: ${position.company}`));
  data.educations.forEach((education) => add(education.link, `education: ${education.school}`));
  data.courses.forEach((course) => add(course.url, `course: ${course.name}`));
  return [...links].map(([url, source]) => ({ url, source }));
}

async function request(url, method) {
  return fetch(url, {
    method,
    headers: HEADERS,
    redirect: 'follow',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}

async function check({ url, source }) {
  try {
    let response = await request(url, 'HEAD');
    if (!response.ok) {
      response = await request(url, 'GET');
    }
    if (response.ok) {
      return { url, source, level: 'ok', detail: response.status };
    }
    const level = BLOCKED_STATUSES.has(response.status) ? 'warn' : 'error';
    return { url, source, level, detail: response.status };
  } catch (error) {
    return { url, source, level: 'error', detail: error.cause?.code || error.message };
  }
}

async function main() {
  const queue = collectLinks();
  const results = [];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length > 0) {
      results.push(await check(queue.shift()));
    }
  });
  await Promise.all(workers);

  const icons = { ok: 'OK   ', warn: 'WARN ', error: 'ERROR' };
  results
    .sort((a, b) => a.source.localeCompare(b.source))
    .forEach((r) => console.log(`${icons[r.level]} ${r.detail}  ${r.url}  (${r.source})`));

  const count = (level) => results.filter((r) => r.level === level).length;
  console.log(
    `\n${results.length} links: ${count('ok')} ok, ${count('warn')} blocked/unverifiable, ${count('error')} broken`,
  );
  if (count('error') > 0) {
    process.exit(1);
  }
}

main();
