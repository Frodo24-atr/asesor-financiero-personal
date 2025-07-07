import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const base = mode === 'production' ? '/asesor-financiero-personal/' : './';

  return {
    root: 'src',
    base,
    build: {
      outDir: '../dist',
      emptyOutDir: true,
      rollupOptions: {
        input: 'src/index.html',
      },
    },
    server: {
      port: 3000,
      open: true,
      hmr: {
        overlay: false,
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "sass:math";`,
        },
      },
    },
  };
});
