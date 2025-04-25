import React, { useState } from 'react';
import {
  Box,
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  Paper,
  Typography,
  Divider,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Stack,
  useTheme,
  Fade,
  Fab,
  Tooltip
} from '@mui/material';
import {
  LightMode as LightIcon,
  DarkMode as DarkIcon,
  ArrowUpward as ArrowUpIcon,
  FaceRetouchingNatural as FaceIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import ImageUploader from './components/ImageUploader';
import AnalysisResults from './components/AnalysisResults';
import AlertMessage from './components/AlertMessage';
import AppDrawer from './components/AppDrawer';
import axios from 'axios';

// Define tema personalizado
const getTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: {
      main: '#4e4bec',
      light: '#7773ff',
      dark: '#3835b9',
    },
    secondary: {
      main: '#ff6b6b',
      light: '#ff9999',
      dark: '#cc5555',
    },
    background: {
      default: mode === 'light' ? '#f5f7fa' : '#121212',
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
          boxShadow: 'none',
          ':hover': {
            boxShadow: mode === 'light' ? '0 4px 8px rgba(0,0,0,0.1)' : '0 4px 8px rgba(255,255,255,0.1)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #4e4bec 30%, #6e6eff 90%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          overflow: 'hidden',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: mode === 'light' 
              ? '0 12px 20px rgba(0,0,0,0.15)'
              : '0 12px 20px rgba(0,0,0,0.5)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState<'light' | 'dark'>(prefersDarkMode ? 'dark' : 'light');
  const [file, setFile] = useState<File | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [alertInfo, setAlertInfo] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    type: 'info',
    title: '',
    message: ''
  });

  const theme = React.useMemo(() => getTheme(mode), [mode]);
  
  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleScroll = () => {
    if (window.scrollY > 300) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', uploadedFile);
    
    try {
      const response = await axios.post('http://localhost:5000/analyze-face', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setAnalysisResults(response.data);
      setIsLoading(false);
      
      // Notificação de sucesso
      setAlertInfo({
        type: 'success',
        title: 'Análise Concluída',
        message: 'A imagem foi analisada com sucesso!'
      });
      setAlertOpen(true);
    } catch (error) {
      console.error('Erro ao analisar a imagem:', error);
      const errorMessage = 'Ocorreu um erro ao analisar a imagem. Por favor, tente novamente.';
      setError(errorMessage);
      setIsLoading(false);
      
      // Notificação de erro
      setAlertInfo({
        type: 'error',
        title: 'Erro na Análise',
        message: errorMessage
      });
      setAlertOpen(true);
    }
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      <AppBar 
        position="sticky" 
        elevation={0}
        color="default"
        sx={{ 
          backdropFilter: 'blur(8px)',
          backgroundColor: theme.palette.mode === 'light' 
            ? 'rgba(255, 255, 255, 0.8)' 
            : 'rgba(30, 30, 30, 0.8)',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Toolbar>
          <IconButton 
            edge="start" 
            color="inherit" 
            aria-label="menu"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Stack 
            direction="row" 
            alignItems="center" 
            spacing={1} 
            sx={{ mr: 2 }}
          >
            <FaceIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h6" color="primary" fontWeight="bold">
              Mapeamento Facial
            </Typography>
          </Stack>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Tooltip title={`Mudar para modo ${mode === 'light' ? 'escuro' : 'claro'}`}>
            <IconButton onClick={toggleColorMode} color="inherit">
              {theme.palette.mode === 'dark' ? <LightIcon /> : <DarkIcon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      
      <AppDrawer 
        open={drawerOpen} 
        onClose={toggleDrawer} 
      />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            mb: 6,
            mt: 4
          }}
        >
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #4e4bec, #ff6b6b)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            Análise Facial Avançada
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ maxWidth: 600, mb: 3 }}
          >
            Faça o upload de uma imagem para detectar expressões faciais e realizar uma análise detalhada dos pontos de referência do rosto.
          </Typography>
          <Divider sx={{ width: '40%', mb: 6 }} />
        </Box>

        <Paper 
          elevation={4}
          sx={{ 
            p: { xs: 2, sm: 3, md: 4 }, 
            mb: 4, 
            borderRadius: 3,
            background: theme.palette.mode === 'light' 
              ? 'linear-gradient(to bottom, #ffffff, #f8f9fa)'
              : 'linear-gradient(to bottom, #1e1e1e, #171717)',
          }}
        >
          <ImageUploader 
            onUpload={handleImageUpload} 
            loading={isLoading}
            error={error || undefined}
          />
        </Paper>

        {analysisResults && (
          <Fade in={Boolean(analysisResults)} timeout={800}>
            <Box sx={{ mt: 4 }}>
              <AnalysisResults results={analysisResults} />
            </Box>
          </Fade>
        )}
      </Container>

      <AlertMessage
        type={alertInfo.type}
        title={alertInfo.title}
        message={alertInfo.message}
        open={alertOpen}
        onClose={handleCloseAlert}
        position={{ vertical: 'top', horizontal: 'right' }}
        duration={6000}
      />

      <Fade in={showScrollTop}>
        <Fab 
          color="primary" 
          size="small" 
          aria-label="scroll back to top"
          onClick={scrollToTop}
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16,
            zIndex: 1000
          }}
        >
          <ArrowUpIcon />
        </Fab>
      </Fade>
      
      <Box 
        component="footer" 
        sx={{ 
          py: 3, 
          px: 2, 
          mt: 'auto',
          backgroundColor: theme.palette.mode === 'light' 
            ? theme.palette.grey[100] 
            : theme.palette.grey[900],
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            Mapeamento Facial © {new Date().getFullYear()}
          </Typography>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App; 