import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
  Rating,
  Stack,
  useMediaQuery,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  Mic as MicIcon,
  MusicNote as MusicNoteIcon,
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  PlayArrow as PlayArrowIcon,
  GraphicEq as GraphicEqIcon,
  Headphones as HeadphonesIcon,
} from '@mui/icons-material';
import Footer from '../components/Layout/Footer';
import LoginModal from '../components/Auth/LoginModal';
import { motion, AnimatePresence } from 'framer-motion';

const Home: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [activeFeature, setActiveFeature] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLoginClose = () => setIsLoginOpen(false);
  const handleLoginOpen = () => setIsLoginOpen(true);

  const menuItems = [
    { text: 'Dashboard', path: '/dashboard', icon: <AssessmentIcon /> },
    { text: 'Praticar', path: '/practice', icon: <MicIcon /> },
    { text: 'Karaokê', path: '/karaoke', icon: <MusicNoteIcon /> },
    { text: 'Aprender', path: '/learn', icon: <SchoolIcon /> },
  ];

  const drawer = (
    <Box sx={{ p: 2 }}>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon sx={{ color: 'primary.main' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const features = [
    {
      title: 'Análise em Tempo Real',
      description: 'Receba feedback instantâneo sobre sua técnica vocal enquanto canta, com análise detalhada de afinação e timbre.',
    },
    {
      title: 'Exercícios Personalizados',
      description: 'Pratique com exercícios adaptados ao seu nível e objetivos, com progressão personalizada para seu desenvolvimento.',
    },
    {
      title: 'Acompanhamento Detalhado',
      description: 'Visualize seu progresso através de métricas detalhadas e receba recomendações para melhorar sua performance.',
    },
  ];

  const testimonials = [
    {
      name: 'Ana Silva',
      role: 'Estudante de Música',
      rating: 5,
      text: 'O VocalCoach AI me ajudou a melhorar minha técnica vocal de forma incrível!'
    },
    {
      name: 'Carlos Santos',
      role: 'Cantor Amador',
      rating: 5,
      text: 'Excelente ferramenta para praticar. O feedback em tempo real é muito útil.'
    },
    {
      name: 'Mariana Costa',
      role: 'Professora de Canto',
      rating: 5,
      text: 'Recomendo para todos os meus alunos. Ajuda muito no desenvolvimento vocal.'
    }
  ];

  const blogPosts = [
    {
      title: 'Como melhorar seu alcance vocal',
      date: '10 Ago 2023',
      image: '/blog/alcance-vocal.jpg',
      description: 'Dicas e exercícios para expandir sua extensão vocal com segurança.',
    },
    {
      title: 'Técnicas de respiração para cantores',
      date: '05 Ago 2023',
      image: '/blog/respiracao.jpg',
      description: 'Aprenda a controlar sua respiração e melhorar sua performance.',
    },
    {
      title: 'Os benefícios do aquecimento vocal',
      date: '01 Ago 2023',
      image: '/blog/aquecimento.jpg',
      description: 'Por que o aquecimento vocal é essencial antes de cantar.',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovering) {
        setActiveFeature((prev) => (prev + 1) % features.length);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isHovering]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const waveVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  const handleDemoClick = () => {
    navigate('/demo');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.gradients.primary,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background Elements */}
      <Box
        component={motion.div}
        animate={{
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        sx={{
          position: 'absolute',
          top: '-30%',
          right: '-20%',
          width: '60%',
          height: '60%',
          background: 'radial-gradient(circle, rgba(124, 77, 255, 0.2) 0%, rgba(124, 77, 255, 0) 70%)',
          filter: 'blur(60px)',
          zIndex: 0,
        }}
      />

      <Box
        component={motion.div}
        animate={{
          rotate: -360,
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        sx={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: '50%',
          height: '50%',
          background: 'radial-gradient(circle, rgba(101, 31, 255, 0.2) 0%, rgba(101, 31, 255, 0) 70%)',
          filter: 'blur(60px)',
          zIndex: 0,
        }}
      />

      {/* Main Content */}
      <Container
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        maxWidth="lg"
        sx={{
          mt: { xs: 8, md: 12 },
          mb: { xs: 4, md: 8 },
          px: { xs: 3, md: 4 },
          textAlign: 'center',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Stack spacing={8} alignItems="center">
          {/* Main Title with Wave Animation */}
          <Box component={motion.div} variants={itemVariants}>
            <Typography
              variant="h1"
              component={motion.h1}
              sx={{
                fontSize: {
                  xs: '2.5rem',
                  sm: '3.5rem',
                  md: '4.5rem'
                },
                background: theme.gradients.text,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                maxWidth: '800px',
                lineHeight: 1.2,
                mb: 2
              }}
            >
              Desenvolva Seu{' '}
              <Box
                component="span"
                sx={{
                  display: 'inline-block',
                  position: 'relative'
                }}
              >
                Potencial Vocal
                <Box
                  component="span"
                  sx={{
                    position: 'absolute',
                    right: '-1.5rem',
                    top: '-0.5rem',
                    fontSize: {
                      xs: '2rem',
                      sm: '3rem',
                      md: '4rem'
                    }
                  }}
                >
                  🎵
                </Box>
              </Box>
            </Typography>

            <Typography
              variant="h2"
              component={motion.h2}
              sx={{
                fontSize: {
                  xs: '1.25rem',
                  sm: '1.5rem',
                  md: '1.75rem'
                },
                color: 'text.secondary',
                maxWidth: '800px',
                mx: 'auto',
                px: 2,
                lineHeight: 1.5,
                mb: 4
              }}
            >
              Treine sua voz com feedback em tempo real usando
              <br />
              inteligência artificial avançada
            </Typography>
          </Box>

          {/* Interactive Feature Icons */}
          <Stack
            direction="row"
            spacing={3}
            justifyContent="center"
            component={motion.div}
            variants={itemVariants}
          >
            {[
              { icon: <MicIcon />, label: "Análise Vocal" },
              { icon: <GraphicEqIcon />, label: "Visualização" },
              { icon: <HeadphonesIcon />, label: "Treino" },
            ].map((item, index) => (
              <Tooltip key={index} title={item.label}>
                <IconButton
                  sx={{
                    width: 60,
                    height: 60,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.2)',
                      transform: 'translateY(-5px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {item.icon}
                </IconButton>
              </Tooltip>
            ))}
          </Stack>

          {/* CTA Buttons */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            component={motion.div}
            variants={itemVariants}
          >
            <Button
              variant="contained"
              size="large"
              onClick={handleLoginOpen}
              startIcon={<PlayArrowIcon />}
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                background: theme.gradients.button,
                borderRadius: '12px',
                boxShadow: theme.shadows[4],
                '&:hover': {
                  background: theme.gradients.buttonHover,
                  boxShadow: theme.shadows[8],
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Começar Agora
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<MusicNoteIcon />}
              onClick={handleDemoClick}
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                borderWidth: 2,
                color: 'white',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  borderColor: 'white',
                  background: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Ver Demonstração
            </Button>
          </Stack>

          {/* Animated Features */}
          <Box
            component={motion.div}
            variants={itemVariants}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            sx={{
              mt: { xs: 8, md: 12 },
              width: '100%',
              maxWidth: '900px',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Box
                  sx={{
                    p: 4,
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '24px',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transform: isHovering ? 'scale(1.02)' : 'scale(1)',
                    transition: 'transform 0.3s ease',
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                    }}
                  >
                    {features[activeFeature].title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      lineHeight: 1.6,
                    }}
                  >
                    {features[activeFeature].description}
                  </Typography>
                </Box>
              </motion.div>
            </AnimatePresence>

            {/* Feature Indicators */}
            <Stack
              direction="row"
              spacing={1}
              justifyContent="center"
              mt={2}
            >
              {features.map((_, index) => (
                <Box
                  key={index}
                  component={motion.div}
                  animate={{
                    scale: activeFeature === index ? 1.2 : 1,
                    opacity: activeFeature === index ? 1 : 0.5,
                  }}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                  }}
                  onClick={() => setActiveFeature(index)}
                />
              ))}
            </Stack>
          </Box>
        </Stack>
      </Container>

      {/* Features Section */}
      <Box sx={{ py: 8, backgroundColor: theme.palette.background.default }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <Box
                    sx={{
                      p: 4,
                      height: '100%',
                      borderRadius: 4,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                  >
                    <Box
                      sx={{
                        mb: 2,
                        color: theme.palette.primary.main,
                      }}
                    >
                      <MicIcon sx={{ fontSize: 40 }} />
                    </Box>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 8, backgroundColor: theme.palette.background.default }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            sx={{ mb: 6, color: theme.palette.text.primary }}
          >
            O que dizem nossos alunos
          </Typography>
          <Grid container spacing={3}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={itemVariants}
                >
                  <Card sx={{ height: '100%', p: 3 }}>
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <Avatar
                          sx={{
                            width: 56,
                            height: 56,
                            bgcolor: theme.palette.primary.main,
                          }}
                        >
                          {testimonial.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">{testimonial.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {testimonial.role}
                          </Typography>
                        </Box>
                      </Stack>
                      <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                        "{testimonial.text}"
                      </Typography>
                      <Rating value={testimonial.rating} readOnly />
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Blog Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          sx={{
            textAlign: 'center',
            mb: 6,
            fontSize: { xs: '2rem', sm: '2.5rem' },
            fontWeight: 600,
          }}
        >
          Blog e Recursos
        </Typography>
        <Grid container spacing={4}>
          {blogPosts.map((post, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                  },
                }}
              >
                <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                  <CardMedia
                    component="div"
                    sx={{
                      height: 200,
                      background: 'rgba(139, 92, 246, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MicIcon sx={{ fontSize: 60, color: '#8B5CF6', opacity: 0.5 }} />
                  </CardMedia>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                      p: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#fff',
                        fontWeight: 600,
                      }}
                    >
                      {post.title}
                    </Typography>
                  </Box>
                </Box>

                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      mb: 1,
                      display: 'block',
                    }}
                  >
                    {post.date}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 2,
                      color: 'text.secondary',
                    }}
                  >
                    {post.description}
                  </Typography>
                  <Button
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      color: '#8B5CF6',
                      textTransform: 'none',
                      '&:hover': {
                        background: 'rgba(139, 92, 246, 0.1)',
                      },
                    }}
                  >
                    Ler mais
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Footer />
      <LoginModal open={isLoginOpen} onClose={handleLoginClose} />
    </Box>
  );
};

export default Home; 