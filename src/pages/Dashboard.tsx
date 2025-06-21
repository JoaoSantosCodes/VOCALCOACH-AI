import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  useTheme,
  Alert,
} from '@mui/material';
import {
  Mic as MicIcon,
  Timer as TimerIcon,
  EmojiEvents as EmojiEventsIcon,
  GraphicEq as GraphicEqIcon,
} from '@mui/icons-material';
import { useSpring, useTrail, useTransition, animated, config } from '@react-spring/web';
import StatCard from '../components/Dashboard/StatCard';
import ProgressChart from '../components/Dashboard/ProgressChart';

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [progressData, setProgressData] = useState<any>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const [statsResponse, progressResponse] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/progress')
      ]);

      if (!statsResponse.ok || !progressResponse.ok) {
        throw new Error('Erro ao carregar dados');
      }

      const statsData = await statsResponse.json();
      const progressData = await progressResponse.json();

      setStats(statsData);
      setProgressData(progressData);
    } catch (err) {
      setError('Erro ao carregar dados');
      // Retry after 5 seconds
      setTimeout(fetchData, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statsData = stats ? [
    {
      icon: <MicIcon />,
      title: 'Sessões de Treino',
      value: stats.sessionsCount.toString(),
      trend: stats.trends.sessions,
      description: 'Total de sessões este mês',
    },
    {
      icon: <TimerIcon />,
      title: 'Tempo Total',
      value: `${stats.totalHours}h`,
      trend: stats.trends.hours,
      description: 'Horas de prática acumuladas',
    },
    {
      icon: <EmojiEventsIcon />,
      title: 'Pontuação',
      value: stats.score.toString(),
      trend: stats.trends.score,
      description: 'Sua pontuação atual',
    },
    {
      icon: <GraphicEqIcon />,
      title: 'Precisão',
      value: `${stats.accuracy}%`,
      trend: stats.trends.accuracy,
      description: 'Taxa de acerto nas notas',
    },
  ] : [];

  // Animação de fade in do container
  const containerSpring = useSpring({
    from: { opacity: 0 },
    to: { opacity: !isLoading && stats && progressData ? 1 : 0 },
    config: config.gentle,
  });

  // Animação de entrada dos itens em sequência
  const trails = useTrail(statsData.length + 3, {
    from: { y: 20, opacity: 0 },
    to: { y: 0, opacity: 1 },
    config: config.gentle,
    delay: 300,
  });

  // Animação de transição para mensagens de erro
  const errorTransition = useTransition(error, {
    from: { opacity: 0, y: -20 },
    enter: { opacity: 1, y: 0 },
    leave: { opacity: 0, y: -20 },
    config: config.gentle,
  });

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        {errorTransition((style, item) => 
          item && (
            <animated.div style={style}>
              <Alert severity="error" data-testid="error-message">
                {error}
              </Alert>
            </animated.div>
          )
        )}
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      {!isLoading && stats && progressData && (
        <animated.div style={containerSpring} data-testid="dashboard-content">
          {/* Header */}
          <Box sx={{ mb: 6 }} component={animated.div} style={trails[0]}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 2,
                background: theme.gradients.text,
                backgroundClip: 'text',
                textFillColor: 'transparent',
              }}
            >
              Olá, Músico!
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                maxWidth: 600,
              }}
            >
              Acompanhe seu progresso e continue evoluindo. Aqui está um resumo do seu desempenho:
            </Typography>
          </Box>

          {/* Stats Grid */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {statsData.map((stat, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={3}
                key={index}
                component={animated.div}
                style={trails[index + 1]}
              >
                <StatCard {...stat} />
              </Grid>
            ))}
          </Grid>

          {/* Charts */}
          <Grid container spacing={3}>
            <Grid
              item
              xs={12}
              md={8}
              component={animated.div}
              style={trails[statsData.length + 1]}
            >
              <ProgressChart
                data={progressData}
                title="Evolução do Desempenho"
                subtitle="Acompanhe sua evolução ao longo do tempo"
                data-testid="progress-chart"
              />
            </Grid>

            <Grid
              item
              xs={12}
              md={4}
              component={animated.div}
              style={trails[statsData.length + 2]}
            >
              <Box
                sx={{
                  p: 3,
                  height: '100%',
                  background: theme.gradients.glass,
                  backdropFilter: 'blur(10px)',
                  borderRadius: 4,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: theme.gradients.secondary,
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  },
                  '&:hover::before': {
                    opacity: 1,
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                  }}
                >
                  Dicas para Melhorar
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  • Pratique regularmente para manter seu streak
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1 }}>
                  • Complete os exercícios diários
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1 }}>
                  • Participe dos desafios da comunidade
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </animated.div>
      )}
    </Container>
  );
};

export default Dashboard; 