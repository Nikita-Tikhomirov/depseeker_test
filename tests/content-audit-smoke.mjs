import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const reportPath = join(root, 'docs', 'seo-content-audit.md');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

execFileSync('python', ['tools/audit_content_quality.py'], {
  cwd: root,
  stdio: 'pipe',
  encoding: 'utf8'
});

assert(existsSync(reportPath), 'SEO content audit report must be generated');

const report = readFileSync(reportPath, 'utf8');
assert(report.includes('# SEO Content Audit'), 'report must have a stable title');
assert(report.includes('## Priority Queue'), 'report must include a priority queue');
assert(report.includes('## Thresholds'), 'report must document quality thresholds');
assert(report.includes('acf.html'), 'report must include ACF category page');
assert(report.includes('migx.html'), 'report must include MIGX category page');
assert(!/lorem ipsum|заглушк|тестовый текст/i.test(report), 'report must not contain placeholder copy');

console.log('content audit smoke passed');
