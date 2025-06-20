import React, { useState, useEffect } from 'react';
import { Box, Typography, LinearProgress, Button, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { PlayArrow as PlayIcon, Pause as PauseIcon, SkipNext as NextIcon, 
         TipsAndUpdates as TipIcon, Stars as BenefitIcon } from '@mui/icons-material';
import { VocalExercise } from '../../data/vocalExercises';
import { theme } from '../../utils/theme';
import { ExerciseAnimation } from './ExerciseAnimation';

interface ExerciseGuideProps {
  exercise: VocalExercise;
  onComplete: () => void;
}

export const ExerciseGuide: React.FC<ExerciseGuideProps> = ({ exercise, onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTips, setShowTips] = useState(true);

  const currentStep = exercise.steps[currentStepIndex];

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isPlaying && currentStep) {
      const startTime = Date.now();
      const duration = currentStep.duration * 1000; // Convert to milliseconds

      timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = (elapsed / duration) * 100;

        if (newProgress >= 100) {
          clearInterval(timer);
          if (currentStepIndex < exercise.steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
            setProgress(0);
          } else {
            setIsPlaying(false);
            onComplete();
          }
        } else {
          setProgress(newProgress);
        }
      }, 100);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, currentStep, currentStepIndex, exercise.steps.length, onComplete]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentStepIndex < exercise.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onComplete();
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, bgcolor: theme.palette.background.paper }}>
        <Typography variant="h4" gutterBottom>
          {exercise.title}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          {exercise.description}
        </Typography>

        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom>
            Passo {currentStepIndex + 1} de {exercise.steps.length}
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            {currentStep?.instruction}
          </Typography>

          {currentStep?.animation && (
            <Box sx={{ my: 3 }}>
              <ExerciseAnimation 
                type={currentStep.animation}
                isPlaying={isPlaying}
              />
            </Box>
          )}

          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 10, 
              borderRadius: 5,
              bgcolor: theme.palette.grey[200],
              '& .MuiLinearProgress-bar': {
                bgcolor: theme.palette.primary.main,
              }
            }} 
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              startIcon={isPlaying ? <PauseIcon /> : <PlayIcon />}
              onClick={handlePlayPause}
              sx={{ minWidth: 120 }}
            >
              {isPlaying ? 'Pausar' : 'Iniciar'}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<NextIcon />}
              onClick={handleNext}
              disabled={isPlaying}
            >
              Próximo
            </Button>
          </Box>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Button 
            variant="text" 
            onClick={() => setShowTips(!showTips)}
            sx={{ mb: 2 }}
          >
            {showTips ? 'Ocultar Dicas' : 'Mostrar Dicas'}
          </Button>

          {showTips && (
            <Box>
              <List>
                {exercise.tips.map((tip, index) => (
                  <ListItem key={`tip-${index}`}>
                    <ListItemIcon>
                      <TipIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={tip} />
                  </ListItem>
                ))}
                
                {exercise.benefits.map((benefit, index) => (
                  <ListItem key={`benefit-${index}`}>
                    <ListItemIcon>
                      <BenefitIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText primary={benefit} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}; 