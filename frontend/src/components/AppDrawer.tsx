import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Typography,
  useTheme,
  Collapse,
  Tooltip
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  Home as HomeIcon,
  Upload as UploadIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Info as InfoIcon,
  ExpandLess,
  ExpandMore,
  FaceRetouchingNatural as FaceIcon,
  Face6 as Face6Icon,
  Psychology as PsychologyIcon,
  MenuBook as DocumentationIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

interface AppDrawerProps {
  open: boolean;
  onClose: () => void;
  width?: number;
}

const AppDrawer: React.FC<AppDrawerProps> = ({ 
  open, 
  onClose,
  width = 280
}) => {
  const theme = useTheme();
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  
  const handleFeaturesClick = () => {
    setFeaturesOpen(!featuresOpen);
  };
  
  const handleResourcesClick = () => {
    setResourcesOpen(!resourcesOpen);
  };
  
  const menuItems = [
    { 
      text: 'Início', 
      icon: <HomeIcon color="primary" />,
      onClick: onClose
    },
    { 
      text: 'Upload de Imagem', 
      icon: <UploadIcon color="primary" />,
      onClick: onClose
    },
    { 
      text: 'Histórico de Análises', 
      icon: <HistoryIcon color="primary" />,
      onClick: onClose
    },
  ];
  
  const featureItems = [
    { 
      text: 'Análise Facial', 
      icon: <FaceIcon style={{ color: theme.palette.primary.main }} />,
      onClick: onClose
    },
    { 
      text: 'Comparação Facial', 
      icon: <Face6Icon style={{ color: theme.palette.primary.main }} />,
      onClick: onClose
    },
    { 
      text: 'Análise de Expressões', 
      icon: <PsychologyIcon style={{ color: theme.palette.primary.main }} />,
      onClick: onClose
    },
  ];
  
  const resourceItems = [
    { 
      text: 'Documentação', 
      icon: <DocumentationIcon style={{ color: theme.palette.info.main }} />,
      onClick: onClose
    },
    { 
      text: 'Tutorial', 
      icon: <LightbulbIcon style={{ color: theme.palette.info.main }} />,
      onClick: onClose
    },
  ];
  
  const bottomItems = [
    { 
      text: 'Configurações', 
      icon: <SettingsIcon />,
      onClick: onClose
    },
    { 
      text: 'Ajuda', 
      icon: <HelpIcon />,
      onClick: onClose
    },
    { 
      text: 'Sobre', 
      icon: <InfoIcon />,
      onClick: onClose
    },
  ];

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: width,
          borderRight: `1px solid ${theme.palette.divider}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 2,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FaceIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
          <Typography 
            variant="h6" 
            color="primary" 
            fontWeight="bold"
          >
            Mapeamento Facial
          </Typography>
        </Box>
        <Tooltip title="Fechar">
          <IconButton onClick={onClose}>
            <ChevronLeftIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
        <List sx={{ py: 1 }}>
          {menuItems.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton onClick={item.onClick}>
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Typography variant="body1" fontWeight={500}>
                      {item.text}
                    </Typography>
                  } 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        
        <Divider sx={{ my: 1 }} />
        
        <List>
          <ListItemButton onClick={handleFeaturesClick}>
            <ListItemIcon>
              <MotionBox
                animate={{ rotate: featuresOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <InfoIcon color="primary" />
              </MotionBox>
            </ListItemIcon>
            <ListItemText 
              primary={
                <Typography variant="body1" fontWeight={500}>
                  Funcionalidades
                </Typography>
              } 
            />
            {featuresOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          
          <Collapse in={featuresOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {featureItems.map((item, index) => (
                <ListItemButton 
                  key={index} 
                  sx={{ pl: 4 }}
                  onClick={item.onClick}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="body2">
                        {item.text}
                      </Typography>
                    } 
                  />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
          
          <ListItemButton onClick={handleResourcesClick}>
            <ListItemIcon>
              <MotionBox
                animate={{ rotate: resourcesOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <HelpIcon color="info" />
              </MotionBox>
            </ListItemIcon>
            <ListItemText 
              primary={
                <Typography variant="body1" fontWeight={500}>
                  Recursos
                </Typography>
              } 
            />
            {resourcesOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          
          <Collapse in={resourcesOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {resourceItems.map((item, index) => (
                <ListItemButton 
                  key={index} 
                  sx={{ pl: 4 }}
                  onClick={item.onClick}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="body2">
                        {item.text}
                      </Typography>
                    } 
                  />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        </List>
      </Box>
      
      <Divider />
      <List>
        {bottomItems.map((item, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton onClick={item.onClick}>
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Typography variant="body2">
                    {item.text}
                  </Typography>
                } 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default AppDrawer; 