import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    root: 'src',
    base: '/asesor-financiero-personal/',
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
