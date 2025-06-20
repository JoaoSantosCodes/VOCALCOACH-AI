import React from 'react';
import {
  Box,
  Container,
  Grid,
  Link,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  YouTube,
} from '@mui/icons-material';

const Footer: React.FC = () => {
  const theme = useTheme();

  const footerLinks = {
    sobre: [
      { title: 'Nossa História', href: '/sobre/historia' },
      { title: 'Time', href: '/sobre/time' },
      { title: 'Carreiras', href: '/sobre/carreiras' },
      { title: 'Blog', href: '/blog' },
    ],
    recursos: [
      { title: 'Exercícios', href: '/exercicios' },
      { title: 'Tutoriais', href: '/tutoriais' },
      { title: 'FAQ', href: '/faq' },
      { title: 'Suporte', href: '/suporte' },
    ],
    legal: [
      { title: 'Termos de Uso', href: '/legal/termos' },
      { title: 'Privacidade', href: '/legal/privacidade' },
      { title: 'Cookies', href: '/legal/cookies' },
    ],
  };

  const socialLinks = [
    { Icon: Facebook, href: 'https://facebook.com/vocalcoach' },
    { Icon: Twitter, href: 'https://twitter.com/vocalcoach' },
    { Icon: Instagram, href: 'https://instagram.com/vocalcoach' },
    { Icon: YouTube, href: 'https://youtube.com/vocalcoach' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        background: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 700,
                mb: 2,
              }}
            >
              VocalCoach AI
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                mb: 3,
                maxWidth: 300,
              }}
            >
              Transforme sua voz e alcance seu potencial máximo com nossa
              tecnologia de IA avançada.
            </Typography>
            <Stack direction="row" spacing={2}>
              {socialLinks.map(({ Icon, href }, index) => (
                <Link
                  key={index}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': {
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  <Icon />
                </Link>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} md={8}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={4}>
                <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
                  Sobre
                </Typography>
                <Stack spacing={1}>
                  {footerLinks.sobre.map((link) => (
                    <Link
                      key={link.title}
                      href={link.href}
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        textDecoration: 'none',
                        '&:hover': {
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      {link.title}
                    </Link>
                  ))}
                </Stack>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
                  Recursos
                </Typography>
                <Stack spacing={1}>
                  {footerLinks.recursos.map((link) => (
                    <Link
                      key={link.title}
                      href={link.href}
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        textDecoration: 'none',
                        '&:hover': {
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      {link.title}
                    </Link>
                  ))}
                </Stack>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
                  Legal
                </Typography>
                <Stack spacing={1}>
                  {footerLinks.legal.map((link) => (
                    <Link
                      key={link.title}
                      href={link.href}
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        textDecoration: 'none',
                        '&:hover': {
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      {link.title}
                    </Link>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Typography
          variant="body2"
          align="center"
          sx={{
            mt: 6,
            color: 'rgba(255, 255, 255, 0.5)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            pt: 3,
          }}
        >
          © {new Date().getFullYear()} VocalCoach AI. Todos os direitos reservados.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 