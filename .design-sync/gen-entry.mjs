// Generate src/ds-entry.ts (bundle barrel) + componentSrcMap from the repo's
// existing export barrels. Value PascalCase exports only.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(process.argv[2] ?? '.');
const barrels = [];
for (const sec of readdirSync(join(ROOT, 'src/sections'))) {
  const p = join(ROOT, 'src/sections', sec, 'components/index.ts');
  if (existsSync(p)) barrels.push({ group: sec, dir: `src/sections/${sec}/components`, file: p });
}
barrels.push({ group: 'shell', dir: 'src/shell/components', file: join(ROOT, 'src/shell/components/index.ts') });

const srcMap = {};
const nameToGroup = {};
const collisions = [];
const barrelSpecs = [];

for (const b of barrels) {
  const txt = readFileSync(b.file, 'utf8');
  barrelSpecs.push(b.dir.replace(/^src\//, './'));
  // strip block comments
  const clean = txt.replace(/\/\*[\s\S]*?\*\//g, '');
  const lineRe = /export\s+(type\s+)?\{([^}]*)\}\s+from\s+['"]\.\/([^'"]+)['"]/g;
  let m;
  while ((m = lineRe.exec(clean))) {
    const isType = !!m[1];
    if (isType) continue;
    const file = m[3];
    for (const raw of m[2].split(',')) {
      let spec = raw.trim();
      if (!spec) continue;
      // handle `default as Name` and `X as Y`
      let name;
      const asMatch = spec.match(/(?:[\w$]+)\s+as\s+([\w$]+)/);
      if (asMatch) name = asMatch[1];
      else name = spec;
      name = name.trim();
      if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) continue; // PascalCase components only
      const tsx = join(b.dir, `${file}.tsx`);
      const tsxAbs = join(ROOT, tsx);
      if (!existsSync(tsxAbs)) { console.error(`MISSING FILE for ${name}: ${tsx}`); continue; }
      if (srcMap[name]) collisions.push(name);
      srcMap[name] = tsx;
      nameToGroup[name] = b.group;
    }
  }
}

// Barrel entry content
const entry = barrelSpecs.map((s) => `export * from '${s}';`).join('\n') + '\n';
writeFileSync(join(ROOT, 'src/ds-entry.ts'), entry);

console.log('components:', Object.keys(srcMap).length);
console.log('collisions:', collisions.length ? collisions : 'none');
console.log('by group:');
const g = {};
for (const [n, gr] of Object.entries(nameToGroup)) (g[gr] ??= []).push(n);
for (const [gr, ns] of Object.entries(g)) console.log(`  ${gr}: ${ns.length}`);
writeFileSync(process.argv[3] ?? 'srcmap.json', JSON.stringify(srcMap, null, 2));
console.log('wrote srcmap + src/ds-entry.ts');
