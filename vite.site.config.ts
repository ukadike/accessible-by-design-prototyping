import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const site = (page: string) => path.resolve(__dirname, 'src/site', page);

// Public no-code site, deployed to GitHub Pages. Relative base so it works
// at ukadike.github.io/accessible-by-design-prototyping/ and in local preview.
export default defineConfig({
  root: 'src/site',
  base: './',
  build: {
    outDir: '../../dist-site',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: site('index.html'),
        'website-check': site('website-check.html'),
        'pdf-check': site('pdf-check.html'),
        'p5-check': site('p5-check.html'),
        about: site('about.html'),
      },
    },
  },
});
