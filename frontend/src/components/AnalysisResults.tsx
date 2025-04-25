import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
  Paper,
  Divider,
  Chip,
  Tooltip,
  LinearProgress,
  useTheme,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  alpha
} from '@mui/material';
import {
  SentimentSatisfiedAlt as HappyIcon,
  SentimentVeryDissatisfied as SadIcon,
  SentimentNeutral as NeutralIcon,
  Face as FaceIcon,
  Psychology as PsychologyIcon,
  ShowChart as ChartIcon,
  Timeline as TimelineIcon,
  Colorize as ColorizeIcon,
  ViewInAr as ViewInArIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Componentes com motion
const MotionBox = motion(Box);
const MotionCard = motion(Card);

// Interface para os resultados
interface AnalysisResultsProps {
  results: {
    landmarks?: Array<{x: number, y: number, z: number}>;
    distances?: {[key: string]: number};
    expressions?: {[key: string]: number};
    microexpressions?: {[key: string]: number};
    attributes?: {[key: string]: string};
    message?: string;
    [key: string]: any;
  };
}

// Componente para mostrar expressões como barras de progresso
const ExpressionBar: React.FC<{label: string; value: number; color: string}> = ({ label, value, color }) => {
  const percentage = Math.round(value * 100);
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2" fontWeight="bold">{percentage}%</Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={percentage} 
        sx={{ 
          height: 10, 
          borderRadius: 5,
          backgroundColor: 'rgba(0,0,0,0.05)',
          '& .MuiLinearProgress-bar': {
            borderRadius: 5,
            backgroundColor: color,
          }
        }} 
      />
    </Box>
  );
};

// Função para obter o ícone com base na expressão dominante
const getExpressionIcon = (expressions: {[key: string]: number}) => {
  if (!expressions || Object.keys(expressions).length === 0) return <NeutralIcon />;
  
  const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
  if (!sorted || sorted.length === 0) return <NeutralIcon />;
  
  const dominant = sorted[0][0].toLowerCase();
  
  if (dominant.includes('happy') || dominant.includes('joy')) {
    return <HappyIcon sx={{ color: '#4caf50' }} />;
  } else if (dominant.includes('sad') || dominant.includes('sorrow') || dominant.includes('anger')) {
    return <SadIcon sx={{ color: '#f44336' }} />;
  } else {
    return <NeutralIcon sx={{ color: '#ff9800' }} />;
  }
};

// Componente principal
const AnalysisResults: React.FC<AnalysisResultsProps> = ({ results }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const theme = useTheme();

  // Handle both expressions and microexpressions from API
  const expressionsData = results.expressions || results.microexpressions || {};

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  // Se houver uma mensagem de erro
  if (results.message) {
    return (
      <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
        <Typography variant="h6">Erro na Análise</Typography>
        <Typography>{results.message}</Typography>
      </Paper>
    );
  }

  // Expressões faciais e cores associadas
  const expressionColors = {
    happy: '#4caf50',
    joy: '#4caf50',
    sad: '#f44336',
    sorrow: '#f44336',
    angry: '#d32f2f',
    anger: '#d32f2f',
    surprise: '#ff9800',
    disgust: '#9c27b0',
    fear: '#651fff',
    neutral: '#607d8b',
    contempt: '#795548'
  };

  // Obter expressões ordenadas por intensidade
  const sortedExpressions = Object.entries(expressionsData)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => ({ 
      name: key.charAt(0).toUpperCase() + key.slice(1), 
      value, 
      color: (expressionColors as any)[key.toLowerCase()] || theme.palette.primary.main 
    }));

  // Encontrar a expressão dominante
  const dominantExpression = sortedExpressions.length > 0 ? sortedExpressions[0].name : 'Neutro';

  // Lista de guias
  const tabs = [
    { label: 'Expressões Faciais', icon: <FaceIcon /> },
    { label: 'Pontos Faciais', icon: <ViewInArIcon /> },
    { label: 'Medidas Faciais', icon: <ColorizeIcon /> },
    { label: 'Atributos', icon: <PsychologyIcon /> }
  ];

  const cardAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <MotionBox
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.5 }}
    >
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          fontWeight: 'bold',
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: theme.palette.primary.main
        }}
      >
        <TimelineIcon /> Resultados da Análise
      </Typography>

      <Card sx={{ mb: 3, overflow: 'visible' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabIndex} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                minHeight: 72,
                textTransform: 'none',
                fontWeight: 500,
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab 
                key={index} 
                icon={tab.icon} 
                label={tab.label} 
                iconPosition="start"
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 1, 
                }}
              />
            ))}
          </Tabs>
        </Box>

        <CardContent sx={{ p: 3 }}>
          {/* Tab 1: Expressões Faciais */}
          {tabIndex === 0 && (
            <MotionCard
              variants={cardAnimation}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.4 }}
            >
              <CardContent>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          <Avatar sx={{ bgcolor: 'primary.main', width: 30, height: 30 }}>
                            {getExpressionIcon(expressionsData)}
                          </Avatar>
                        }
                      >
                        <Avatar
                          sx={{
                            width: 100,
                            height: 100,
                            fontSize: 40,
                            background: 'linear-gradient(45deg, #4e4bec 30%, #6e6eff 90%)',
                          }}
                        >
                          <FaceIcon sx={{ fontSize: 50 }} />
                        </Avatar>
                      </Badge>
                      <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>
                        {dominantExpression}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Expressão dominante
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Intensidade das Expressões
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      {sortedExpressions.slice(0, 6).map((expression, index) => (
                        <ExpressionBar
                          key={index}
                          label={expression.name}
                          value={expression.value}
                          color={expression.color}
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </MotionCard>
          )}

          {/* Tab 2: Pontos Faciais */}
          {tabIndex === 1 && (
            <MotionCard
              variants={cardAnimation}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.4 }}
            >
              <CardContent>
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  {results.landmarks && results.landmarks.length > 0 ? (
                    <React.Fragment>
                      <Typography variant="h6" gutterBottom>
                        {results.landmarks.length} pontos faciais detectados
                      </Typography>
                      <Box 
                        sx={{ 
                          mt: 3, 
                          p: 2, 
                          border: '1px dashed',
                          borderColor: 'divider',
                          borderRadius: 2,
                          position: 'relative',
                          height: 300,
                          backgroundColor: 'rgba(0,0,0,0.02)'
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Visualização 3D dos pontos faciais estará disponível em breve.
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Os pontos faciais são coordenadas tridimensionais (x, y, z) que mapeiam características específicas do rosto.
                      </Typography>
                    </React.Fragment>
                  ) : (
                    <Typography color="text.secondary">
                      Nenhum ponto facial encontrado na análise.
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </MotionCard>
          )}

          {/* Tab 3: Medidas Faciais */}
          {tabIndex === 2 && (
            <MotionCard
              variants={cardAnimation}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.4 }}
            >
              <CardContent>
                {results.distances && Object.keys(results.distances).length > 0 ? (
                  <Grid container spacing={2}>
                    {Object.entries(results.distances).map(([key, value], index) => (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            p: 2, 
                            textAlign: 'center',
                            bgcolor: 'background.default',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2
                          }}
                        >
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {typeof value === 'number' ? value.toFixed(2) : value}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    Nenhuma medida facial encontrada na análise.
                  </Typography>
                )}
              </CardContent>
            </MotionCard>
          )}

          {/* Tab 4: Atributos */}
          {tabIndex === 3 && (
            <MotionCard
              variants={cardAnimation}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.4 }}
            >
              <CardContent>
                {results.attributes && Object.keys(results.attributes).length > 0 ? (
                  <List>
                    {Object.entries(results.attributes).map(([key, value], index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemIcon>
                            <Avatar sx={{ bgcolor: `hsl(${index * 40}, 70%, 60%)` }}>
                              <PsychologyIcon />
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography fontWeight="medium">
                                {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                              </Typography>
                            }
                            secondary={value}
                          />
                        </ListItem>
                        {index < Object.keys(results.attributes || {}).length - 1 && <Divider variant="inset" component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    Nenhum atributo encontrado na análise.
                  </Typography>
                )}
              </CardContent>
            </MotionCard>
          )}
        </CardContent>
      </Card>
    </MotionBox>
  );
};

export default AnalysisResults; 