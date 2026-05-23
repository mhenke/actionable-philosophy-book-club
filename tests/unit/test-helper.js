import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../../');

export function loadSource(filePath) {
  const absolutePath = path.resolve(PROJECT_ROOT, filePath);
  const code = fs.readFileSync(absolutePath, 'utf8');
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(code, context);
  return context.window;
}
