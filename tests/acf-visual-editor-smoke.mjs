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

const generator = read('js/acf-generator.js');
const production = read('js/acf-production-renderer.js');

function assertIncludes(source, needle, message) {
  assert(source.includes(needle), message || `missing ${needle}`);
}

function testFallbackVisualEditorTypography() {
  for (const key of ['title', 'label', 'value', 'button', 'faq']) {
    assertIncludes(generator, `${key}: {`, `fallback visual editor must define ${key} element defaults`);
  }

  for (const expected of [
    "renderElementStyleControl('title', 'fontWeight', 'Толщина'",
    "renderElementStyleControl('title', 'lineHeight', 'Интерлиньяж'",
    "renderElementStyleControl('label', 'fontWeight', 'Толщина'",
    "renderElementStyleControl('label', 'letterSpacing', 'Трекинг'",
    "renderElementStyleControl('value', 'fontSize', 'Размер'",
    "renderElementStyleControl('value', 'fontWeight', 'Толщина'",
    "renderElementStyleControl('button', 'fontSize', 'Размер'",
    "renderElementStyleControl('button', 'fontWeight', 'Толщина'",
    "renderElementStyleControl('faq', 'questionFontSize', 'Вопрос размер'",
    "renderElementStyleControl('faq', 'questionFontWeight', 'Вопрос вес'",
    "renderElementStyleControl('faq', 'answerFontSize', 'Ответ размер'",
    "renderElementStyleControl('faq', 'answerLineHeight', 'Ответ строки'"
  ]) {
    assertIncludes(generator, expected, `fallback visual editor must expose control: ${expected}`);
  }

  for (const css of [
    'font-weight:\' + e.title.fontWeight',
    'line-height:\' + cssLineHeight(e.title.lineHeight',
    'letter-spacing:\' + cssPx(e.label.letterSpacing',
    'font-size:\' + cssPx(e.value.fontSize',
    'font-weight:\' + e.value.fontWeight',
    'font-size:\' + cssPx(e.button.fontSize',
    'font-weight:\' + e.button.fontWeight',
    'font-size:\' + cssPx(e.faq.questionFontSize',
    'font-weight:\' + e.faq.questionFontWeight',
    'font-size:\' + cssPx(e.faq.answerFontSize',
    'line-height:\' + cssLineHeight(e.faq.answerLineHeight'
  ]) {
    assertIncludes(generator, css, `fallback preview CSS must apply ${css}`);
  }
}

function testProductionEditorTypography() {
  for (const expected of [
    "lead: { color: '#475569', fontSize: '19', fontWeight: '400'",
    "button: { bgColor: '#111827', textColor: '#ffffff', radius: '10', paddingX: '20', height: '46', fontSize: '15', fontWeight: '700'",
    "answer: { textColor: '#475569', fontSize: '15', lineHeight: '165'",
    "['fontWeight', 'Насыщенность', 'number']",
    "['lineHeight', 'Интерлиньяж', 'number', '%']",
    "'.zifra-acf-btn { background: ' + cssRaw(button.bgColor, '#111827') + '; color: ' + cssRaw(button.textColor, '#fff') + '; min-height: ' + cssPx(button.height, 46) + '; padding: 0 ' + cssPx(button.paddingX, 20) + '; border-radius: ' + cssPx(button.radius, 10) + '; font-size: ' + cssPx(button.fontSize, 15) + '; font-weight: ' + cssRaw(button.fontWeight, '700')",
    "'.zifra-acf-lead { color: ' + cssRaw(lead.color, '#475569') + '; font-size: ' + cssPx(lead.fontSize, 19) + '; font-weight: ' + cssRaw(lead.fontWeight, '400')",
    "'.zifra-acf-faq-answer { color: ' + cssRaw(answer.textColor, '#475569') + '; font-size: ' + cssPx(answer.fontSize, 15) + '; line-height: ' + cssPercent(answer.lineHeight, 165)"
  ]) {
    assertIncludes(production, expected, `production visual editor must expose/apply ${expected}`);
  }
}

function testVisualEditorAuditExists() {
  const audit = read('docs/visual-editor-audit.md');
  for (const phrase of [
    'Размер и толщина шрифта',
    'fallback visual editor',
    'production renderer',
    'Что закрыто'
  ]) {
    assert(audit.includes(phrase), `visual editor audit must include: ${phrase}`);
  }
}

testFallbackVisualEditorTypography();
testProductionEditorTypography();
testVisualEditorAuditExists();
console.log('acf visual editor smoke passed');
