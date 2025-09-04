import esbuild from 'esbuild';

async function build() {
  // CJS build → dist/cjs/*.cjs
  await esbuild.build({
    entryPoints: ['./src/**/*.ts'], // or glob like ["src/**/*.ts"]
    outdir: 'dist/cjs',
    format: 'cjs',
    platform: 'node',
    target: ['node18'],
    sourcemap: true,
    outExtension: { '.js': '.cjs' },
  });

  console.log('Build complete ✅');
}

build().catch(() => process.exit(1));
