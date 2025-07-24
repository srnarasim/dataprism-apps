// Test script to verify DataPrism engine initialization
console.log('Starting DataPrism engine test...');

async function testEngine() {
  try {
    // Import the CDN loader
    const { loadDataPrismDependencies } = await import('./src/utils/cdn-loader.ts');
    
    console.log('Loading DataPrism dependencies...');
    const deps = await loadDataPrismDependencies({
      coreBaseUrl: 'https://srnarasim.github.io/dataprism-core',
      pluginsBaseUrl: 'https://srnarasim.github.io/dataprism-plugins'
    });
    
    console.log('Dependencies loaded:', Object.keys(deps));
    
    const { DataPrismEngine } = deps.core;
    
    console.log('Creating engine instance...');
    const engine = new DataPrismEngine({
      maxMemoryMB: 512,
      enableWasmOptimizations: true,
      queryTimeoutMs: 30000,
      logLevel: 'debug',
      duckdb: {
        enableWasm: true,
        wasmPath: '/wasm/',
        wasmUrl: '/wasm/dataprism_core_bg.wasm',
        jsUrl: '/wasm/dataprism_core.js',
        maxMemoryMB: 256,
        enableOptimizations: true
      }
    });
    
    console.log('Initializing engine...');
    await engine.initialize();
    
    console.log('Testing simple query...');
    const result = await engine.query('SELECT 1 as test');
    console.log('✅ Query result:', result);
    
    console.log('✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testEngine();