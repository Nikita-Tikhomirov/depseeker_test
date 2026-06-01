import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

function read(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function testRuntimeUsesSiteConfig() {
  const js = read('js/main.js');
  const config = JSON.parse(read('site.config.json'));

  assert(js.includes("fetch('site.config.json'"), 'main.js must load site.config.json');
  assert(js.includes('window.XMLHttpRequest'), 'main.js must keep an XMLHttpRequest fallback for config loading');
  assert(js.includes("String(config.mode || '').toLowerCase() === 'production'"), 'runtime features must be gated by production mode');
  assert(js.includes("config.adsEnabled === true"), 'runtime must read adsEnabled from config');
  assert(js.includes("document.body.classList.add('ads-enabled')"), 'runtime must enable ad slots through body.ads-enabled');
  assert(js.includes('config.yandexMetrikaId'), 'runtime must read yandexMetrikaId from config');
  assert(js.includes('https://mc.yandex.ru/metrika/tag.js'), 'runtime must know the Yandex Metrika loader URL');
  assert(js.includes('accurateTrackBounce: true'), 'runtime must initialize useful Metrika defaults');
  assert(js.includes('webvisor: false'), 'runtime must not enable Webvisor by default');
  assert(config.mode === 'local', 'current repo config must stay in local mode until a real domain is provided');
  assert(config.adsEnabled === false, 'ads must stay disabled in local mode');
  assert(config.yandexMetrikaId === '', 'Metrika ID must stay empty until the real counter is known');
}

testRuntimeUsesSiteConfig();
console.log('site runtime smoke passed');
