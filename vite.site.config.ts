import { defineConfig } from 'vite';

// Public no-code site, deployed to GitHub Pages. Relative base so it works
// at ukadike.github.io/accessible-by-design-prototyping/ and in local preview.
export default defineConfig({
  root: 'src/site',
  base: './',
  build: {
    outDir: '../../dist-site',
    emptyOutDir: true,
  },
});
