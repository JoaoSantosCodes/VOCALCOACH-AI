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
  };
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

// Função para calcular o volume do buffer de áudio
function calculateVolume(buffer: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += Math.abs(buffer[i]);
  }
  return (sum / buffer.length) * 100;
}

// Função principal de análise
async function analyzeAudio(buffer: Float32Array, sampleRate: number): Promise<AudioAnalysisResult['data']> {
  await initializePitchDetector(buffer.length);

  // Analisa o pitch
  const [pitch, clarity] = pitchDetector.findPitch(buffer, sampleRate);
  
  // Calcula o volume
  const volume = calculateVolume(buffer);

  // Normaliza o pitch
  const normalizedPitch = pitch ? Math.min(100, (pitch / 1000) * 100) : 0;

  return {
    pitch: normalizedPitch,
    clarity: clarity * 100,
    volume
  };
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