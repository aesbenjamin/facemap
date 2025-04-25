import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  IconButton,
  Card,
  CardContent,
  useTheme,
  alpha
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  DeleteOutline as DeleteIcon,
  PhotoCamera as PhotoIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';

const MotionBox = motion(Box);

interface ImageUploaderProps {
  onUpload: (file: File) => void;
  loading: boolean;
  error?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onUpload,
  loading,
  error
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      onUpload(file);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxSize: 5242880, // 5MB
    multiple: false
  });

  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleManualUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      onUpload(file);
    }
  };

  return (
    <Box>
      <Card 
        elevation={0}
        sx={{ 
          backgroundColor: 'transparent',
          border: 'none',
          overflow: 'visible'
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {!previewUrl ? (
            <MotionBox
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Paper
                {...getRootProps()}
                elevation={0}
                sx={{
                  border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
                  borderRadius: 3,
                  backgroundColor: isDragActive 
                    ? alpha(theme.palette.primary.main, 0.05)
                    : theme.palette.background.default,
                  p: 5,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              >
                <input {...getInputProps()} />
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  accept="image/*"
                />
                <UploadIcon color="primary" sx={{ fontSize: 60, mb: 2, opacity: 0.8 }} />
                
                <Typography variant="h6" gutterBottom color="primary" fontWeight="medium">
                  {isDragActive ? 'Solte a imagem aqui' : 'Arraste e solte uma imagem aqui'}
                </Typography>
                
                <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
                  ou
                </Typography>
                
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<PhotoIcon />}
                  onClick={handleManualUpload}
                  sx={{ px: 3 }}
                >
                  Selecionar Imagem
                </Button>
                
                <Typography variant="caption" display="block" sx={{ mt: 2, opacity: 0.7 }}>
                  Formatos suportados: JPG, JPEG, PNG (max 5MB)
                </Typography>
              </Paper>
            </MotionBox>
          ) : (
            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              sx={{ 
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 3,
                boxShadow: 3
              }}
            >
              <Box 
                sx={{ 
                  position: 'relative',
                  height: 300,
                  backgroundImage: `url(${previewUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: 3,
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    p: 1
                  }}
                >
                  <IconButton
                    onClick={handleReset}
                    sx={{ 
                      bgcolor: 'rgba(0,0,0,0.3)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.5)',
                      }
                    }}
                    size="small"
                    disabled={loading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                
                {loading && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(0,0,0,0.4)',
                      borderRadius: 3,
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
                      <Typography color="white" variant="subtitle1">
                        Analisando imagem...
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </MotionBox>
          )}
          
          {error && (
            <MotionBox
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              sx={{ mt: 2 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: 'error.light',
                  color: 'error.dark',
                  borderRadius: 2
                }}
              >
                <Typography variant="body2">
                  {error}
                </Typography>
              </Paper>
            </MotionBox>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ImageUploader; 