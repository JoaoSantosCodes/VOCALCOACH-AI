const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Thresholds em KB
const THRESHOLDS = {
  TOTAL_SIZE: 1000, // 1MB
  CHUNK_SIZE: 244,  // 244KB (máximo recomendado para mobile)
  INITIAL_SIZE: 500 // 500KB
};

// Lista de imports custosos conhecidos e suas alternativas
const EXPENSIVE_IMPORTS = {
  'moment': 'date-fns',
  'lodash': 'lodash-es',
  '@material-ui/icons': '@mui/icons-material',
  'chart.js': 'lightweight-charts',
};

// Configuração do webpack para análise
const config = {
  mode: 'production',
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: 'bundle-report.html',
      openAnalyzer: false,
      generateStatsFile: true,
      statsFilename: 'bundle-stats.json',
    }),
    new CompressionPlugin({
      test: /\.(js|css|html|svg)$/,
      algorithm: 'gzip',
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
          output: {
            comments: false,
          },
        },
      }),
    ],
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 25,
      minSize: 20000,
      cacheGroups: {
        default: false,
        vendors: false,
        framework: {
          name: 'framework',
          test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types)[\\/]/,
          priority: 40,
          enforce: true,
        },
        lib: {
          test(module) {
            return module.size() > 50000 && /node_modules[/\\]/.test(module.identifier());
          },
          name(module) {
            const hash = crypto.createHash('sha1');
            hash.update(module.identifier());
            return hash.digest('hex').slice(0, 8);
          },
          priority: 30,
          minChunks: 1,
          reuseExistingChunk: true,
        },
        commons: {
          name: 'commons',
          minChunks: 2,
          priority: 20,
        },
        shared: {
          name(module, chunks) {
            const hash = crypto
              .createHash('sha1')
              .update(chunks.reduce((acc, chunk) => acc + chunk.name, ''))
              .digest('hex');
            return hash.slice(0, 8);
          },
          priority: 10,
          minChunks: 2,
          reuseExistingChunk: true,
        },
      },
    },
  },
};

// Função para analisar o bundle
async function analyzeBundleSize() {
  console.log('🔍 Analisando tamanho do bundle...\n');

  // Criar build de produção
  await new Promise((resolve, reject) => {
    exec('npm run build', (error) => {
      if (error) reject(error);
      else resolve();
    });
  });

  // Ler stats do bundle
  const stats = JSON.parse(fs.readFileSync('bundle-stats.json', 'utf8'));
  const totalSize = stats.assets.reduce((acc, asset) => acc + asset.size, 0) / 1024; // KB

  console.log('📊 Análise do Bundle:\n');
  console.log(`Total Size: ${totalSize.toFixed(2)}KB`);

  // Verificar chunks grandes
  const largeChunks = stats.assets
    .filter(asset => asset.size > THRESHOLDS.CHUNK_SIZE * 1024)
    .map(asset => ({
      name: asset.name,
      size: (asset.size / 1024).toFixed(2),
    }));

  if (largeChunks.length > 0) {
    console.log('\n⚠️ Chunks grandes detectados:');
    largeChunks.forEach(chunk => {
      console.log(`- ${chunk.name}: ${chunk.size}KB`);
    });
  }

  // Verificar imports custosos
  console.log('\n🔍 Verificando imports custosos...');
  const sourceFiles = await findSourceFiles('src');
  const expensiveImportsFound = [];

  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf8');
    for (const [expensive, alternative] of Object.entries(EXPENSIVE_IMPORTS)) {
      if (content.includes(`from '${expensive}'`)) {
        expensiveImportsFound.push({
          file: file.replace(process.cwd(), ''),
          import: expensive,
          alternative,
        });
      }
    }
  }

  if (expensiveImportsFound.length > 0) {
    console.log('\n⚠️ Imports custosos encontrados:');
    expensiveImportsFound.forEach(({ file, import: imp, alternative }) => {
      console.log(`- ${file}: substituir '${imp}' por '${alternative}'`);
    });
  }

  // Gerar recomendações
  console.log('\n📝 Recomendações:');

  if (totalSize > THRESHOLDS.TOTAL_SIZE) {
    console.log('1. Reduzir tamanho total do bundle:');
    console.log('   - Implementar code splitting');
    console.log('   - Usar dynamic imports');
    console.log('   - Remover dependências não utilizadas');
  }

  if (largeChunks.length > 0) {
    console.log('2. Otimizar chunks grandes:');
    console.log('   - Dividir componentes grandes');
    console.log('   - Usar lazy loading');
    console.log('   - Implementar virtualização para listas');
  }

  if (expensiveImportsFound.length > 0) {
    console.log('3. Substituir imports custosos:');
    console.log('   - Usar alternativas mais leves');
    console.log('   - Implementar tree-shaking');
    console.log('   - Criar componentes próprios quando possível');
  }

  // Verificar se passou nos thresholds
  const passed = totalSize <= THRESHOLDS.TOTAL_SIZE &&
                largeChunks.length === 0 &&
                expensiveImportsFound.length === 0;

  if (passed) {
    console.log('\n✅ Bundle está otimizado!');
  } else {
    console.log('\n❌ Bundle precisa de otimizações!');
    process.exit(1);
  }
}

// Função auxiliar para encontrar arquivos fonte
async function findSourceFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findSourceFiles(fullPath));
    } else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

// Executar análise
analyzeBundleSize().catch(error => {
  console.error('❌ Erro durante análise:', error);
  process.exit(1);
}); 