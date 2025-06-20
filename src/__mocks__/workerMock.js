class Worker {
  constructor(stringUrl) {
    this.url = stringUrl;
    this.onmessage = null;
    this.onmessageerror = null;
    this.onerror = null;
  }

  postMessage(data) {
    if (this.url.includes('audioAnalyzer.worker')) {
      // Mock da análise de áudio
      if (this.onmessage) {
        this.onmessage({
          data: {
            type: 'result',
            data: {
              pitch: 440,
              clarity: 85,
              volume: 75,
              isSilence: false,
              snr: 15
            }
          }
        });
      }
    } else if (this.url.includes('timbreAnalyzer.worker')) {
      // Mock da análise de timbre
      if (this.onmessage) {
        this.onmessage({
          data: {
            type: 'result',
            data: {
              spectralCentroid: 2000,
              spectralFlatness: 0.5,
              spectralRolloff: 4000,
              harmonicRatio: 0.8
            }
          }
        });
      }
    }
  }

  terminate() {
    // Cleanup mock
  }
}

module.exports = { Worker }; 