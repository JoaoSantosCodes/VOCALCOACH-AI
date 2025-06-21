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
import { motion, AnimatePresence } from 'framer-motion';
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Alert severity="error" data-testid="error-message">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <AnimatePresence>
        {!isLoading && stats && progressData && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            data-testid="dashboard-content"
          >
            {/* Header */}
            <Box
              component={motion.div}
              variants={itemVariants}
              sx={{ mb: 6 }}
            >
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
                  component={motion.div}
                  variants={itemVariants}
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
                component={motion.div}
                variants={itemVariants}
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
                component={motion.div}
                variants={itemVariants}
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
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default Dashboard; 