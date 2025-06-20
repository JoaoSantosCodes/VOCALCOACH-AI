import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Slider,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  MusicNote as MusicNoteIcon,
} from '@mui/icons-material';

// Mock data - será substituído por dados reais do backend
const songList = [
  {
    id: 1,
    title: 'Evidências',
    artist: 'Chitãozinho & Xororó',
    difficulty: 'Médio',
    duration: '4:39',
  },
  {
    id: 2,
    title: 'Garçom',
    artist: 'Reginaldo Rossi',
    difficulty: 'Fácil',
    duration: '3:52',
  },
  {
    id: 3,
    title: 'Como Nossos Pais',
    artist: 'Elis Regina',
    difficulty: 'Difícil',
    duration: '4:22',
  },
  {
    id: 4,
    title: 'Sozinho',
    artist: 'Caetano Veloso',
    difficulty: 'Médio',
    duration: '3:45',
  },
];

const Karaoke: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedSong, setSelectedSong] = useState<number | null>(null);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (event: Event, newValue: number | number[]) => {
    setCurrentTime(newValue as number);
  };

  const handleSongSelect = (songId: number) => {
    setSelectedSong(songId);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h3" gutterBottom>
          Karaokê
        </Typography>
        <Typography color="text.secondary">
          Escolha uma música e cante com feedback em tempo real
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Lista de Músicas */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: '100%' }}>
            <List>
              {songList.map((song) => (
                <ListItem
                  key={song.id}
                  button
                  selected={selectedSong === song.id}
                  onClick={() => handleSongSelect(song.id)}
                >
                  <ListItemIcon>
                    <MusicNoteIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={song.title}
                    secondary={`${song.artist} • ${song.duration}`}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                    }}
                  >
                    {song.difficulty}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Player */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minHeight: 400,
            }}
          >
            {selectedSong ? (
              <>
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mb: 4,
                  }}
                >
                  <Typography variant="h4" gutterBottom>
                    {songList.find((s) => s.id === selectedSong)?.title}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {songList.find((s) => s.id === selectedSong)?.artist}
                  </Typography>
                </Box>

                <Box sx={{ width: '100%', mb: 4 }}>
                  <Slider
                    value={currentTime}
                    onChange={handleTimeChange}
                    min={0}
                    max={100}
                    sx={{ color: 'primary.main' }}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mt: 1,
                    }}
                  >
                    <Typography variant="caption">0:00</Typography>
                    <Typography variant="caption">
                      {songList.find((s) => s.id === selectedSong)?.duration}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <IconButton
                    size="large"
                    onClick={handlePlayPause}
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                    }}
                  >
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                  </IconButton>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                <MusicNoteIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
                <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                  Selecione uma música para começar
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Karaoke; 