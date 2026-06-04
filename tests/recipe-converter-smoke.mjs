import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

function read(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function testRecipeCategoryRegistry() {
  const registry = JSON.parse(read('catalog.registry.json'));
  const config = JSON.parse(read('site.config.json'));
  const category = registry.categories.find((item) => item.slug === 'recipes');

  assert(category, 'catalog registry must include recipes category');
  assert(category.status === 'published', 'recipes category must be published');
  assert(category.path === 'recipes.html', 'recipes category must point to recipes.html');
  assert(category.primaryUtility === 'recipe-converter.html', 'recipe converter must be the primary utility');
  assert(category.items.length >= 2, 'recipes category must expose at least two pages');
  assert(category.items.some((item) => item.path === 'recipe-measures-table.html' && item.nav), 'measures table must be nav-visible');
  assert(config.categories.some((item) => item.slug === 'recipes'), 'site config must include recipes category');
}

function testRecipePages() {
  for (const page of ['recipes.html', 'recipe-converter.html', 'recipe-measures-table.html']) {
    assert(existsSync(join(root, page)), `${page} must exist`);
    const html = read(page);
    assert(html.includes('Кулинарные калькуляторы'), `${page} must link the recipe category`);
    assert(html.includes('recipe-converter.html'), `${page} must link to the recipe converter`);
    assert(html.includes('recipe-measures-table.html'), `${page} must link to the measures table`);
  }

  const hub = read('recipes.html');
  const measures = read('recipe-measures-table.html');
  const converter = read('recipe-converter.html');
  assert(hub.includes('class="ad-slot"'), 'recipes hub must include an ad slot');
  assert(measures.includes('class="ad-slot"'), 'measures landing must include an ad slot');
  assert(measures.includes('"@type": "FAQPage"'), 'measures table must include FAQ structured data');
  assert(converter.includes('Стакан можно считать как 250 мл'), 'converter hero must explain glass ambiguity');
  assert(/столов\w+\s+ложк\w+\s+15 мл|столовая 15 мл/i.test(converter), 'converter copy must expose 15 ml tablespoon standard');
}

function testRecipeConverterLogicContracts() {
  const js = read('js/recipe-converter.js');

  assert(js.includes('var FACETED_CUP_ML = 200;'), 'converter must support 200 ml faceted glass');
  assert(js.includes('var TBSP_ML = 15;'), 'converter must use 15 ml tablespoon standard');
  assert(js.includes("id: 'cup200'"), 'unit list must expose cup200');
  assert(js.includes("fromU: 'cup200'"), 'quick presets must include a 200 ml glass scenario');
  assert(js.includes('function gramsForVolume'), 'reference table must derive values from density and volume');
  assert(js.includes('parseAmountText'), 'parser must centralize amount parsing');
  assert(js.includes("replace(',', '.')"), 'parser must support decimal comma amounts');
  assert(js.includes('mixed = normalized.match'), 'parser must support mixed fractions');
  assert(js.includes('sort(function (a, b) { return b.length - a.length; })'), 'unit resolver must prefer longer unit phrases');
  assert(js.includes('scaleUnitOptions(ingredient.unit)'), 'scaler rows must preserve selected units after render');
  assert(js.includes('Не удалось найти строки вида'), 'parser must show a useful empty result');

  const numberPattern = Function(`return ${js.match(/var numberPattern = ([^;]+);/)[1]}`)();
  const unitPattern = Function(`return ${js.match(/var unitPattern = ([^;]+);/)[1]}`)();
  const recipeLinePattern = new RegExp(numberPattern + '\\s*' + unitPattern + '\\s+(.+)', 'i');
  for (const line of ['300 г муки', '1,5 стакана молока', '1/2 стакана сахара', '2 ст. ложки масла', '1 ч. ложка соли']) {
    assert(recipeLinePattern.test(line), `parser regex must match Russian recipe line: ${line}`);
  }
}

testRecipeCategoryRegistry();
testRecipePages();
testRecipeConverterLogicContracts();
console.log('recipe converter smoke passed');
