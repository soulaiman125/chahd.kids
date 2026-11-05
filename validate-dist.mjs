import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { runInNewContext } from 'node:vm';

const dist = resolve('dist');
const origin = 'https://local-build.invalid';
const problems = new Map();
const checked = new Set();

function listFiles(directory, prefix = '') {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = prefix + entry.name;
    return entry.isDirectory() ? listFiles(join(directory, entry.name), path + '/') : [path];
  });
}

const files = new Set(listFiles(dist));
const read = file => readFileSync(join(dist, file), 'utf8');

function check(reference, base, source, documentLink = false) {
  if (!reference || reference.startsWith('#')) return;
  const url = new URL(reference.replaceAll('&amp;', '&'), base);
  if (url.origin !== origin) return;

  const path = decodeURIComponent(url.pathname.slice(1));
  const candidates = documentLink
    ? [path, path + '.html', path.replace(/\/?$/, '/') + 'index.html', ...(path ? [] : ['index.html'])]
    : [path];
  const file = candidates.find(candidate => files.has(candidate));
  if (!file || statSync(join(dist, file)).size === 0) {
    const sources = problems.get(path) || new Set();
    sources.add(source);
    problems.set(path, sources);
    return;
  }
  checked.add(file);
}

function attributes(tag) {
  const values = {};
  for (const [, name, doubleQuoted, singleQuoted, bare] of tag.matchAll(
    /([^\s=<>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g
  )) {
    values[name.toLowerCase()] = doubleQuoted ?? singleQuoted ?? bare;
  }
  return values;
}

function checkCss(css, base, file) {
  for (const [, quoted, bare, imported] of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(
    /\burl\(\s*(?:["']([^"']*)["']|([^)\s]*))\s*\)|@import\s+["']([^"']+)["']/gi
  )) {
    check(quoted ?? bare ?? imported, base, file);
  }
}

const pages = [...files].filter(file => file.endsWith('.html'));
check('index.html', origin, 'Worker entry page');
for (const file of pages) {
  const html = read(file);
  const documentUrl = new URL(file, origin);
  const markup = html.replace(/<!--[\s\S]*?-->/g, '')
    .replace(/(<script\b[^>]*>)[\s\S]*?<\/script\s*>/gi, '$1</script>');
  const baseTag = markup.match(/<base\b[^>]*>/i);
  const base = new URL(baseTag ? attributes(baseTag[0]).href ?? '' : '', documentUrl);
  const canonicalTag = markup.match(/<link\b[^>]*\brel=["']canonical["'][^>]*>/i);
  const canonical = canonicalTag && attributes(canonicalTag[0]).href;
  const canonicalOrigin = canonical && new URL(canonical).origin;

  for (const [tag, name] of markup.matchAll(/<([a-z][\w:-]*)\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi)) {
    const kind = name.toLowerCase();
    const attrs = attributes(tag);
    for (const field of ['src', 'poster', 'data-photo']) check(attrs[field], base, file);
    if (['a', 'link', 'image', 'use'].includes(kind)) {
      check(attrs.href ?? attrs['xlink:href'], base, file, kind === 'a');
    }
    if (attrs.srcset && !attrs.srcset.startsWith('data:')) {
      for (const entry of attrs.srcset.split(',')) check(entry.trim().split(/\s+/)[0], base, file);
    }
    if (attrs.style) checkCss(attrs.style, base, file);
    if (kind === 'meta' && ['og:image', 'twitter:image'].includes(attrs.property ?? attrs.name) && attrs.content) {
      const url = new URL(attrs.content, base);
      if (url.origin === canonicalOrigin) check(url.pathname, base, file);
      else check(attrs.content, base, file);
    }
  }
  for (const [, css] of markup.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) checkCss(css, base, file);
}

for (const file of files) {
  if (file.endsWith('.css')) checkCss(read(file), new URL(file, origin), file);
}

const catalogue = { window: {} };
runInNewContext(read('products.js'), catalogue, { filename: 'dist/products.js' });
for (const product of catalogue.window.storeProducts) {
  for (const image of product.images ?? [`assets/${product.image}.svg`]) {
    check(image, origin, 'products.js');
  }
}

if (problems.size) {
  for (const [path, sources] of problems) {
    console.error('Missing or empty dist/' + path + ' referenced by ' + [...sources].slice(0, 3).join(', '));
  }
  process.exitCode = 1;
}
console.log('Checked ' + pages.length + ' HTML pages and ' + checked.size +
  ' unique local targets. ' + problems.size + ' missing or empty.');

