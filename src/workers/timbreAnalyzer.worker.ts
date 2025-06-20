/* eslint-disable no-restricted-globals */

interface TimbreAnalyzerMessage {
  type: 'analyze';
  data: {
    buffer: Float32Array;
    sampleRate: number;
  };
}

interface TimbreFeatures {
  spectralCentroid: number;
  spectralFlatness: number;
  spectralRolloff: number;
  harmonicRatio: number;
}

// Função para calcular a FFT usando o algoritmo Cooley-Tukey
function calculateFFT(buffer: Float32Array): Float32Array {
  const n = buffer.length;
  
  // Garante que o tamanho é uma potência de 2
  if ((n & (n - 1)) !== 0) {
    throw new Error('FFT requires input length to be a power of 2');
  }
  
  // Cria arrays complexos para a FFT
  const real = new Float32Array(n);
  const imag = new Float32Array(n);
  
  // Copia os dados de entrada para o array real
  for (let i = 0; i < n; i++) {
    real[i] = buffer[i];
    imag[i] = 0;
  }
  
  // Aplica o algoritmo Cooley-Tukey
  function fft(realArr: Float32Array, imagArr: Float32Array, inverse: boolean = false): void {
    const n = realArr.length;
    
    // Caso base
    if (n === 1) return;
    
    // Divide os arrays em pares e ímpares
    const halfN = n >> 1;
    const realEven = new Float32Array(halfN);
    const imagEven = new Float32Array(halfN);
    const realOdd = new Float32Array(halfN);
    const imagOdd = new Float32Array(halfN);
    
    for (let i = 0; i < halfN; i++) {
      realEven[i] = realArr[i * 2];
      imagEven[i] = imagArr[i * 2];
      realOdd[i] = realArr[i * 2 + 1];
      imagOdd[i] = imagArr[i * 2 + 1];
    }
    
    // Recursivamente computa a FFT das partes pares e ímpares
    fft(realEven, imagEven, inverse);
    fft(realOdd, imagOdd, inverse);
    
    // Combina os resultados
    const angularSpeed = (inverse ? 2 : -2) * Math.PI / n;
    
    for (let k = 0; k < halfN; k++) {
      const angle = angularSpeed * k;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      
      const tReal = realOdd[k] * cos - imagOdd[k] * sin;
      const tImag = realOdd[k] * sin + imagOdd[k] * cos;
      
      realArr[k] = realEven[k] + tReal;
      imagArr[k] = imagEven[k] + tImag;
      
      realArr[k + halfN] = realEven[k] - tReal;
      imagArr[k + halfN] = imagEven[k] - tImag;
    }
  }
  
  // Aplica a FFT
  fft(real, imag);
  
  // Calcula as magnitudes
  const magnitudes = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    magnitudes[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);
  }
  
  return magnitudes;
}

// Função para calcular o centroide espectral
function calculateSpectralCentroid(fft: Float32Array, sampleRate: number): number {
  let weightedSum = 0;
  let sum = 0;
  
  for (let i = 0; i < fft.length / 2; i++) {
    const magnitude = Math.abs(fft[i]);
    const frequency = (i * sampleRate) / fft.length;
    weightedSum += magnitude * frequency;
    sum += magnitude;
  }
  
  return sum === 0 ? 0 : weightedSum / sum;
}

// Função para calcular a planicidade espectral
function calculateSpectralFlatness(fft: Float32Array): number {
  let geometricMean = 0;
  let arithmeticMean = 0;
  const magnitudes = fft.map(x => Math.abs(x));
  
  for (let i = 0; i < magnitudes.length / 2; i++) {
    if (magnitudes[i] > 0) {
      geometricMean += Math.log(magnitudes[i]);
    }
    arithmeticMean += magnitudes[i];
  }
  
  geometricMean = Math.exp(geometricMean / (magnitudes.length / 2));
  arithmeticMean = arithmeticMean / (magnitudes.length / 2);
  
  return arithmeticMean === 0 ? 0 : geometricMean / arithmeticMean;
}

// Função para calcular o rolloff espectral
function calculateSpectralRolloff(fft: Float32Array, sampleRate: number): number {
  const magnitudes = fft.map(x => Math.abs(x));
  const totalEnergy = magnitudes.reduce((sum, val) => sum + val, 0);
  let energySum = 0;
  
  for (let i = 0; i < magnitudes.length / 2; i++) {
    energySum += magnitudes[i];
    if (energySum >= 0.85 * totalEnergy) { // 85% da energia total
      return (i * sampleRate) / fft.length;
    }
  }
  
  return 0;
}

// Função para calcular a razão harmônica
function calculateHarmonicRatio(fft: Float32Array, fundamentalFreq: number, sampleRate: number): number {
  let harmonicEnergy = 0;
  let totalEnergy = 0;
  const binSize = sampleRate / fft.length;
  
  for (let i = 0; i < fft.length / 2; i++) {
    const frequency = i * binSize;
    const magnitude = Math.abs(fft[i]);
    totalEnergy += magnitude;
    
    // Verifica se a frequência está próxima de um harmônico
    for (let harmonic = 1; harmonic <= 5; harmonic++) {
      const harmonicFreq = fundamentalFreq * harmonic;
      if (Math.abs(frequency - harmonicFreq) < binSize) {
        harmonicEnergy += magnitude;
      }
    }
  }
  
  return totalEnergy === 0 ? 0 : harmonicEnergy / totalEnergy;
}

// Handler principal do worker
self.onmessage = (e: MessageEvent<TimbreAnalyzerMessage>) => {
  if (e.data.type === 'analyze') {
    const { buffer, sampleRate } = e.data.data;
    
    // Calcula a FFT
    const fft = calculateFFT(buffer);
    
    // Calcula as características do timbre
    const features: TimbreFeatures = {
      spectralCentroid: calculateSpectralCentroid(fft, sampleRate),
      spectralFlatness: calculateSpectralFlatness(fft),
      spectralRolloff: calculateSpectralRolloff(fft, sampleRate),
      harmonicRatio: calculateHarmonicRatio(fft, 440, sampleRate), // Assumindo 440Hz como frequência fundamental
    };
    
    // Envia os resultados de volta
    self.postMessage({
      type: 'result',
      data: features
    });
  }
};

export {}; 