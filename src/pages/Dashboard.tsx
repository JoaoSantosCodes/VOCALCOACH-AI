import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  useTheme,
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

  useEffect(() => {
    // Simular carregamento de dados
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const statsData = [
    {
      icon: <MicIcon />,
      title: 'Sessões de Treino',
      value: '32',
      trend: { value: 12, isPositive: true },
      description: 'Total de sessões este mês',
    },
    {
      icon: <TimerIcon />,
      title: 'Tempo Total',
      value: '24h',
      trend: { value: 8, isPositive: true },
      description: 'Horas de prática acumuladas',
    },
    {
      icon: <EmojiEventsIcon />,
      title: 'Pontuação',
      value: '850',
      trend: { value: 15, isPositive: true },
      description: 'Sua pontuação atual',
    },
    {
      icon: <GraphicEqIcon />,
      title: 'Precisão',
      value: '92%',
      trend: { value: 5, isPositive: true },
      description: 'Taxa de acerto nas notas',
    },
  ];

  const progressData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Pontuação',
        data: [650, 700, 720, 780, 820, 850],
      },
      {
        label: 'Precisão',
        data: [75, 78, 82, 85, 88, 92],
      },
    ],
  };

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

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <AnimatePresence>
        {!isLoading && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
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
                      fontWeight: 600,
                      mb: 2,
                      color: 'white',
                    }}
                  >
                    Próximos Objetivos
                  </Typography>
                  <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    {[
                      'Alcançar 95% de precisão',
                      'Completar 40 sessões de treino',
                      'Atingir 1000 pontos',
                      'Praticar por 30 horas',
                    ].map((goal, index) => (
                      <Box
                        key={index}
                        component={motion.div}
                        whileHover={{ scale: 1.02, x: 10 }}
                        sx={{
                          p: 2,
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: theme.gradients.secondary,
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                        >
                          {goal}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
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