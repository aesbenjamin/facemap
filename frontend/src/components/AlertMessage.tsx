import React from 'react';
import { 
  Alert, 
  AlertTitle, 
  Snackbar, 
  IconButton,
  Stack,
  Typography,
  Grow
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const MotionAlert = motion(Alert);

interface AlertMessageProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  open: boolean;
  duration?: number;
  onClose: () => void;
  position?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  fullWidth?: boolean;
}

const AlertMessage: React.FC<AlertMessageProps> = ({
  type,
  title,
  message,
  open,
  duration = 5000,
  onClose,
  position = { vertical: 'top', horizontal: 'center' },
  fullWidth = false
}) => {
  // Para casos em que queremos exibir a mensagem no lugar, não como snackbar
  if (fullWidth) {
    return (
      <AnimatePresence>
        {open && (
          <MotionAlert
            severity={type}
            variant="filled"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={onClose}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
            sx={{ mb: 2 }}
          >
            {title && <AlertTitle>{title}</AlertTitle>}
            <Typography variant="body2">{message}</Typography>
          </MotionAlert>
        )}
      </AnimatePresence>
    );
  }

  // Default snackbar versão
  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={position}
      TransitionComponent={Grow}
    >
      <Alert 
        severity={type} 
        variant="filled"
        onClose={onClose}
        sx={{ 
          minWidth: 250, 
          boxShadow: 3,
          '& .MuiAlert-icon': {
            fontSize: '1.2rem'
          }
        }}
      >
        <Stack>
          {title && <AlertTitle sx={{ fontWeight: 'bold' }}>{title}</AlertTitle>}
          <Typography variant="body2">{message}</Typography>
        </Stack>
      </Alert>
    </Snackbar>
  );
};

export default AlertMessage; 