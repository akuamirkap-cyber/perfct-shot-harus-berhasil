import fs from 'node:fs';
import path from 'node:path';
import { build } from 'vite';

const rootDir = path.resolve(import.meta.dirname, '..');
const outDir = path.join(rootDir, 'crazygames-upload');

await build({
  root: rootDir,
  base: './',
  configFile: path.join(rootDir, 'vite.config.ts'),
  build: {
    outDir,
    emptyOutDir: true,
    copyPublicDir: false,
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 20_000,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});

const htmlPath = path.join(outDir, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Inline generated stylesheet(s)
html = html.replace(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/gi, (match, href) => {
  const cleanHref = href.replace(/^\.\//, '');
  const cssPath = path.join(outDir, cleanHref);
  if (!fs.existsSync(cssPath)) return match;
  const css = fs.readFileSync(cssPath, 'utf8').replace(/<\/style/gi, '<\\/style');
  return `<style>${css}</style>`;
});

// Remove modulepreload hints (everything is bundled into a single script)
html = html.replace(/<link\b[^>]*rel="modulepreload"[^>]*>\s*/gi, '');

// Extract and inline the bundled module script right before </body>
const scriptsToAppend = [];
html = html.replace(/<script\b[^>]*type="module"[^>]*src="([^"]+)"[^>]*><\/script>\s*/gi, (match, src) => {
  const cleanSrc = src.replace(/^\.\//, '');
  const jsPath = path.join(outDir, cleanSrc);
  if (!fs.existsSync(jsPath)) return match;
  const js = fs.readFileSync(jsPath, 'utf8').replace(/<\/script/gi, '<\\/script');
  scriptsToAppend.push(`<script type="module">\n${js}\n</script>`);
  return '';
});

if (scriptsToAppend.length > 0) {
  html = html.replace(/<\/body>/i, () => `${scriptsToAppend.join('\n')}\n  </body>`);
}

fs.writeFileSync(htmlPath, html, 'utf8');

// Remove assets/ folder so crazygames-upload contains ONLY the single index.html
const assetsDir = path.join(outDir, 'assets');
if (fs.existsSync(assetsDir)) {
  fs.rmSync(assetsDir, { recursive: true, force: true });
}

const sizeMB = (fs.statSync(htmlPath).size / (1024 * 1024)).toFixed(2);
console.log(`\n[CrazyGames] Single-file ready: ${path.relative(rootDir, htmlPath)} (${sizeMB} MB)`);
