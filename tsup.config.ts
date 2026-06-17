import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  treeshake: true,
  // Consumers provide these — never bundle them into the library.
  external: ['react', 'react-dom', '@puckeditor/core'],
});
