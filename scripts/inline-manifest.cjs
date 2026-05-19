#!/usr/bin/env node
// Generates src/_manifest.js from docs/manifest.json
// Called by npm run build:js before terser
const fs = require('fs');
const path = require('path');

const manifestPath = path.resolve(__dirname, '..', 'docs', 'manifest.json');
const outPath = path.resolve(__dirname, '..', 'src', '_manifest.js');

const data = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
fs.writeFileSync(outPath, `const MANIFEST_DATA = ${JSON.stringify(data)};\n`);
