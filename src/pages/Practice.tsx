import React, { useState } from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import { ExerciseList } from '../components/VoiceExercise/ExerciseList';
import { ExerciseGuide } from '../components/VoiceExercise/ExerciseGuide';
import { VocalExercise, vocalExercises } from '../data/vocalExercises';
import VoiceCapture from '../components/VoiceAnalysis/VoiceCapture';
import TimbreVisualizer from '../components/VoiceAnalysis/TimbreVisualizer';

const Practice: React.FC = () => {
  const [selectedExercise, setSelectedExercise] = useState<VocalExercise | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleExerciseComplete = () => {
    setShowAnalysis(true);
  };

  const handleBackToList = () => {
    setSelectedExercise(null);
    setShowAnalysis(false);
  };

  return (
    <Container maxWidth="lg">
      {!selectedExercise ? (
        <ExerciseList 
          exercises={vocalExercises}
          onSelectExercise={setSelectedExercise}
        />
      ) : (
        <Box>
          <Button 
            onClick={handleBackToList}
            sx={{ mb: 3 }}
          >
            ← Voltar para lista
          </Button>

          {showAnalysis ? (
            <Box>
              <Typography variant="h5" gutterBottom>
                Análise de Voz
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                <Box sx={{ flex: 1 }}>
                  <VoiceCapture />
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <TimbreVisualizer />
                </Box>
              </Box>
            </Box>
          ) : (
            <ExerciseGuide 
              exercise={selectedExercise}
              onComplete={handleExerciseComplete}
            />
          )}
        </Box>
      )}
    </Container>
  );
}; 

export default Practice; 