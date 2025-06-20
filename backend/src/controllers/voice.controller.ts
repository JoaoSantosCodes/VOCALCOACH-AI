import { Request, Response } from 'express';
import { VoiceAnalysis } from '../models/VoiceAnalysis';

// Simulated voice analysis function (to be replaced with actual AI analysis)
const analyzeVoice = async (audioData: any) => {
  // This is a placeholder for the actual voice analysis logic
  return {
    pitch: Math.random() * 100,
    volume: Math.random() * 100,
    clarity: Math.random() * 100,
    rhythm: Math.random() * 100,
    breathControl: Math.random() * 100
  };
};

export const startAnalysis = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { audioData, duration } = req.body;

    // Perform voice analysis
    const metrics = await analyzeVoice(audioData);

    // Generate feedback based on metrics
    const feedback = {
      strengths: ['Good pitch control', 'Consistent rhythm'],
      improvements: ['Work on breath control', 'Improve volume consistency'],
      suggestions: ['Practice breathing exercises', 'Try singing with a metronome']
    };

    // Create new analysis record
    const analysis = new VoiceAnalysis({
      userId,
      duration,
      metrics,
      feedback
    });

    await analysis.save();

    res.status(201).json(analysis);
  } catch (error) {
    console.error('Voice analysis error:', error);
    res.status(500).json({ message: 'Error analyzing voice' });
  }
};

export const getAnalysisHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const analyses = await VoiceAnalysis.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(analyses);
  } catch (error) {
    console.error('Get analysis history error:', error);
    res.status(500).json({ message: 'Error fetching analysis history' });
  }
};

export const getAnalysisById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const analysis = await VoiceAnalysis.findById(id);

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    // Check if the analysis belongs to the requesting user
    if (analysis.userId.toString() !== (req as any).userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ message: 'Error fetching analysis' });
  }
}; 