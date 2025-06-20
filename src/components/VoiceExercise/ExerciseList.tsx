import React from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Button,
  Chip,
  useTheme
} from '@mui/material';
import { 
  Timer as TimerIcon,
  FitnessCenter as DifficultyIcon,
  Category as TypeIcon
} from '@mui/icons-material';
import { VocalExercise } from '../../data/vocalExercises';

interface ExerciseListProps {
  exercises: VocalExercise[];
  onSelectExercise: (exercise: VocalExercise) => void;
}

export const ExerciseList: React.FC<ExerciseListProps> = ({ exercises, onSelectExercise }) => {
  const theme = useTheme();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'iniciante':
        return theme.palette.success.main;
      case 'intermediário':
        return theme.palette.warning.main;
      case 'avançado':
        return theme.palette.error.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Exercícios Vocais
      </Typography>

      <Grid container spacing={3}>
        {exercises.map((exercise) => (
          <Grid item xs={12} sm={6} md={4} key={exercise.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {exercise.title}
                </Typography>

                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ mb: 2, minHeight: 60 }}
                >
                  {exercise.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip
                    icon={<DifficultyIcon />}
                    label={exercise.difficulty}
                    size="small"
                    sx={{ 
                      bgcolor: getDifficultyColor(exercise.difficulty),
                      color: 'white'
                    }}
                  />
                  
                  <Chip
                    icon={<TimerIcon />}
                    label={formatDuration(exercise.duration)}
                    size="small"
                    variant="outlined"
                  />
                  
                  <Chip
                    icon={<TypeIcon />}
                    label={exercise.type}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary">
                  {exercise.steps.length} passos
                </Typography>
              </CardContent>

              <CardActions>
                <Button 
                  size="small" 
                  variant="contained"
                  fullWidth
                  onClick={() => onSelectExercise(exercise)}
                  sx={{ 
                    textTransform: 'none',
                    borderRadius: 2
                  }}
                >
                  Começar Exercício
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}; 