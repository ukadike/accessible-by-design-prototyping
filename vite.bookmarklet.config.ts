import { defineConfig } from 'vite';

// The bookmarklet payload must be a single self-contained classic script
// (axe-core bundled in), since it gets injected into arbitrary pages.
export default defineConfig({
  build: {
    outDir: 'dist-site',
    emptyOutDir: false,
    lib: {
      entry: 'src/site/bookmarklet.ts',
      formats: ['iife'],
      name: 'A11yLabBookmarklet',
      fileName: () => 'bookmarklet.js',
    },
  },
});
