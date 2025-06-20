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
import { useSpring, animated, useTransition } from '@react-spring/web';

const Home: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const handleLoginClose = () => setIsLoginOpen(false);
  const handleLoginOpen = () => setIsLoginOpen(true);

  const menuItems = [
    { text: 'Dashboard', path: '/dashboard', icon: <AssessmentIcon /> },
    { text: 'Praticar', path: '/practice', icon: <MicIcon /> },
    { text: 'Karaokê', path: '/karaoke', icon: <MusicNoteIcon /> },
    { text: 'Aprender', path: '/learn', icon: <SchoolIcon /> },
  ];

  const features = [
    {
      title: 'Análise em Tempo Real',
      description: 'Receba feedback instantâneo sobre sua técnica vocal enquanto canta, com análise detalhada de afinação e timbre.',
      icon: <MicIcon data-testid="mic-icon" />,
    },
    {
      title: 'Exercícios Personalizados',
      description: 'Pratique com exercícios adaptados ao seu nível e objetivos, com progressão personalizada para seu desenvolvimento.',
      icon: <GraphicEqIcon data-testid="graph-icon" />,
    },
    {
      title: 'Acompanhamento Detalhado',
      description: 'Visualize seu progresso através de métricas detalhadas e receba recomendações para melhorar sua performance.',
      icon: <HeadphonesIcon data-testid="headphones-icon" />,
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
    let interval: NodeJS.Timeout;
    
    if (!isHovering) {
      interval = setInterval(() => {
        setActiveFeature((prev) => (prev + 1) % features.length);
      }, 3000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isHovering, features.length]);

  // React Spring animations
  const fadeIn = useSpring({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    config: { duration: 800 }
  });

  const backgroundAnimation = useSpring({
    from: { rotate: 0 },
    to: { rotate: 360 },
    loop: true,
    config: { duration: 20000 }
  });

  const waveAnimation = useSpring({
    from: { y: 0 },
    to: { y: -10 },
    loop: { reverse: true },
    config: { duration: 2000 }
  });

  const featureTransition = useTransition(activeFeature, {
    from: { opacity: 0, transform: 'translate3d(0,40px,0)' },
    enter: { opacity: 1, transform: 'translate3d(0,0px,0)' },
    leave: { opacity: 0, transform: 'translate3d(0,-40px,0)' },
  });

  const handleStartClick = () => {
    navigate('/practice');
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
      <animated.div
        style={{
          ...backgroundAnimation,
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: '500px',
          height: '500px',
          background: alpha(theme.palette.primary.light, 0.1),
          borderRadius: '50%',
        }}
      />

      <Container maxWidth="lg" sx={{ mt: 8, position: 'relative', zIndex: 1 }}>
        <animated.div style={fadeIn}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 'bold',
                  mb: 2,
                  background: theme.gradients.text,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Desenvolva Seu Potencial Vocal
              </Typography>

              <Typography variant="h5" sx={{ mb: 4, color: 'text.secondary' }}>
                Treine sua voz com feedback em tempo real usando inteligência artificial
              </Typography>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleStartClick}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    background: theme.gradients.button,
                    '&:hover': {
                      background: theme.gradients.buttonHover,
                    },
                  }}
                >
                  Começar Agora
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleDemoClick}
                  sx={{ borderColor: 'primary.main', color: 'primary.main' }}
                >
                  Ver Demo
                </Button>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              {featureTransition((style, item) => (
                <animated.div style={style}>
                  <Card
                    sx={{
                      background: alpha(theme.palette.background.paper, 0.8),
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                    }}
                  >
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        {features[item].title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {features[item].description}
                      </Typography>
                    </CardContent>
                  </Card>
                </animated.div>
              ))}
            </Grid>
          </Grid>
        </animated.div>
      </Container>

      {/* Features Section */}
      <Box sx={{ py: 8, backgroundColor: theme.palette.background.default }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <animated.div
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
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Box>
                </animated.div>
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
                <animated.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
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
                </animated.div>
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