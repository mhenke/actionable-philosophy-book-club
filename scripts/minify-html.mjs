import { readFileSync, writeFileSync } from 'fs';

const filePath = process.argv[2] || 'index.html';
let html = readFileSync(filePath, 'utf8');

// Minify inline <style> block: strip CSS comments, collapse whitespace, trim
html = html.replace(/<style>[\s\S]*?<\/style>/, match => {
    const css = match.replace('<style>', '').replace('</style>', '');
    const minified = css
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/[\r\n]+/g, ' ')
        .replace(/[ ]{2,}/g, ' ')
        .replace(/\s*([{}:;,])\s*/g, '$1')
        .replace(/;}/g, '}')
        .trim();
    return '<style>' + minified + '</style>';
});

writeFileSync(filePath, html);
