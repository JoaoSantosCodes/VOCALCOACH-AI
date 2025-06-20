import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Menu as MenuIcon,
  GraphicEq as GraphicEqIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import Logo from './Logo';
import LoginModal from '../Auth/LoginModal';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLoginClick = () => {
    setLoginModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    handleCloseUserMenu();
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isAuthenticated = localStorage.getItem('token') !== null;

  const menuItems = [
    { text: 'Dashboard', path: '/dashboard', icon: <GraphicEqIcon /> },
    { text: 'Practice', path: '/practice', icon: <GraphicEqIcon /> },
    { text: 'Karaoke', path: '/karaoke', icon: <GraphicEqIcon /> },
  ];

  return (
    <>
      <AppBar position="static" color="transparent" elevation={0}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Logo size="small" />
            
            {isMobile ? (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ ml: 'auto' }}
              >
                <MenuIcon />
              </IconButton>
            ) : (
              <>
                <Box sx={{ flexGrow: 1, display: 'flex', ml: 4 }}>
                  {isAuthenticated && menuItems.map((item) => (
                    <Button
                      key={item.text}
                      component={Link}
                      to={item.path}
                      sx={{ 
                        my: 2, 
                        color: 'text.primary', 
                        display: 'flex', 
                        alignItems: 'center',
                        mr: 2 
                      }}
                    >
                      {item.icon}
                      <Typography sx={{ ml: 1 }}>{item.text}</Typography>
                    </Button>
                  ))}
                </Box>

                <Box sx={{ flexGrow: 0 }}>
                  {isAuthenticated ? (
                    <>
                      <Tooltip title="Open settings">
                        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                          <Avatar alt="User Avatar" />
                        </IconButton>
                      </Tooltip>
                      <Menu
                        sx={{ mt: '45px' }}
                        id="menu-appbar"
                        anchorEl={anchorElUser}
                        anchorOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                        open={Boolean(anchorElUser)}
                        onClose={handleCloseUserMenu}
                      >
                        <MenuItem onClick={handleLogout}>
                          <Typography textAlign="center">Logout</Typography>
                        </MenuItem>
                      </Menu>
                    </>
                  ) : (
                    <Button
                      onClick={handleLoginClick}
                      sx={{
                        color: 'text.primary',
                        borderRadius: '20px',
                        px: 3,
                        border: '2px solid',
                        borderColor: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'primary.main',
                          color: 'white',
                        },
                      }}
                    >
                      Login
                    </Button>
                  )}
                </Box>
              </>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 240,
            backgroundColor: theme.palette.background.default,
          },
        }}
      >
        <Box sx={{ textAlign: 'right', p: 1 }}>
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List>
          {isAuthenticated ? (
            <>
              {menuItems.map((item) => (
                <ListItem 
                  button 
                  key={item.text}
                  component={Link}
                  to={item.path}
                  onClick={handleDrawerToggle}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
              <ListItem button onClick={handleLogout}>
                <ListItemText primary="Logout" />
              </ListItem>
            </>
          ) : (
            <ListItem button onClick={handleLoginClick}>
              <ListItemText primary="Login" />
            </ListItem>
          )}
        </List>
      </Drawer>

      <LoginModal
        open={isLoginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </>
  );
};

export default Navbar; 