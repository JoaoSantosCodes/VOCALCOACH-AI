/* eslint-disable no-restricted-globals */
// Interface para as mensagens do worker
interface AudioAnalyzerMessage {
  type: 'analyze';
  data: {
    buffer: Float32Array;
    sampleRate: number;
  };
}

interface AudioAnalysisResult {
  type: 'result';
  data: {
    pitch: number;
    clarity: number;
    volume: number;
    isSilence: boolean;
    snr: number; // Signal-to-Noise Ratio
  };
}

// Configurações
const CONFIG = {
  SILENCE_THRESHOLD: 0.01,
  MIN_PITCH: 50,    // Hz
  MAX_PITCH: 1500,  // Hz
  NOISE_FLOOR: 0.1,
  CACHE_SIZE: 10    // Número de frames para cache
};

// Cache para otimização
const analysisCache = new Map<string, AudioAnalysisResult['data']>();
let lastBufferHash = '';

// Função para calcular hash do buffer (versão simplificada e eficiente)
function calculateBufferHash(buffer: Float32Array): string {
  let hash = 0;
  for (let i = 0; i < buffer.length; i += 20) { // Amostragem para reduzir cálculos
    hash = ((hash << 5) - hash) + Math.floor(buffer[i] * 1000);
    hash = hash & hash; // Converte para 32bit int
  }
  return hash.toString();
}

// Importa a biblioteca Pitchy dinamicamente
let pitchyModule: any = null;
let pitchDetector: any = null;

// Função para inicializar o detector de pitch
async function initializePitchDetector(bufferSize: number) {
  if (!pitchyModule) {
    // Importa o módulo Pitchy
    pitchyModule = await import('pitchy');
    pitchDetector = pitchyModule.PitchDetector.forFloat32Array(bufferSize);
  }
}

// Função otimizada para calcular o volume do buffer de áudio com RMS
function calculateVolume(buffer: Float32Array): number {
  let sum = 0;
  const step = Math.max(1, Math.floor(buffer.length / 1000)); // Reduz amostragem para buffers grandes
  for (let i = 0; i < buffer.length; i += step) {
    sum += buffer[i] * buffer[i];
  }
  const rms = Math.sqrt(sum / (buffer.length / step));
  return Math.min(100, rms * 100);
}

// Função para detectar silêncio
function isSilence(buffer: Float32Array): boolean {
  const volume = calculateVolume(buffer);
  return volume < CONFIG.SILENCE_THRESHOLD * 100;
}

// Função para calcular SNR
function calculateSNR(buffer: Float32Array): number {
  let signal = 0;
  let noise = 0;
  
  // Assume os primeiros 100ms como ruído de fundo
  const noiseWindow = Math.min(buffer.length, Math.floor(buffer.length * 0.1));
  
  for (let i = 0; i < noiseWindow; i++) {
    noise += buffer[i] * buffer[i];
  }
  noise /= noiseWindow;
  
  for (let i = noiseWindow; i < buffer.length; i++) {
    signal += buffer[i] * buffer[i];
  }
  signal /= (buffer.length - noiseWindow);
  
  return signal > noise ? 10 * Math.log10(signal / noise) : 0;
}

// Função para normalizar o pitch
function normalizePitch(pitch: number): number {
  if (!pitch || pitch < CONFIG.MIN_PITCH || pitch > CONFIG.MAX_PITCH) {
    return 0;
  }
  
  // Normalização logarítmica para melhor distribuição
  const normalizedPitch = Math.log2(pitch / CONFIG.MIN_PITCH) / Math.log2(CONFIG.MAX_PITCH / CONFIG.MIN_PITCH);
  return Math.min(100, normalizedPitch * 100);
}

// Função principal de análise otimizada
async function analyzeAudio(buffer: Float32Array, sampleRate: number): Promise<AudioAnalysisResult['data']> {
  // Calcula hash do buffer atual
  const bufferHash = calculateBufferHash(buffer);
  
  // Verifica cache
  if (bufferHash === lastBufferHash && analysisCache.has(bufferHash)) {
    return analysisCache.get(bufferHash)!;
  }
  
  await initializePitchDetector(buffer.length);
  
  // Verifica silêncio primeiro (cálculo mais leve)
  const silence = isSilence(buffer);
  if (silence) {
    const result = {
      pitch: 0,
      clarity: 0,
      volume: 0,
      isSilence: true,
      snr: 0
    };
    
    // Atualiza cache
    updateCache(bufferHash, result);
    return result;
  }
  
  // Processamento em paralelo quando possível
  const [snr, volume] = await Promise.all([
    Promise.resolve(calculateSNR(buffer)),
    Promise.resolve(calculateVolume(buffer))
  ]);
  
  let pitch = 0;
  let clarity = 0;
  
  if (snr > 10) {
    [pitch, clarity] = pitchDetector.findPitch(buffer, sampleRate);
    pitch = normalizePitch(pitch);
    clarity *= 100;
  }
  
  const result = {
    pitch,
    clarity,
    volume,
    isSilence: false,
    snr
  };
  
  // Atualiza cache
  updateCache(bufferHash, result);
  return result;
}

// Função para gerenciar o cache
function updateCache(hash: string, result: AudioAnalysisResult['data']) {
  lastBufferHash = hash;
  analysisCache.set(hash, result);
  
  // Limita o tamanho do cache
  if (analysisCache.size > CONFIG.CACHE_SIZE) {
    const firstKey = analysisCache.keys().next().value;
    analysisCache.delete(firstKey);
  }
}

// Event listener para mensagens
self.addEventListener('message', async (e: MessageEvent<AudioAnalyzerMessage>) => {
  if (e.data.type === 'analyze') {
    const { buffer, sampleRate } = e.data.data;
    
    try {
      const result = await analyzeAudio(buffer, sampleRate);
      
      // Envia o resultado de volta
      self.postMessage({
        type: 'result',
        data: result
      });
    } catch (error) {
      // Envia erro de volta
      self.postMessage({
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

export {}; 