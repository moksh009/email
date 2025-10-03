import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  IconButton,
  Divider,
  Button,
  Tooltip,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { motion, AnimatePresence } from 'framer-motion';

const TemplatePreviewModal = ({ open, onClose, template }) => {
  if (!template) return null;

  const handleClose = (event, reason) => {
    if (reason === 'backdropClick') {
      onClose();
    }
    onClose();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <AnimatePresence mode="wait">
      {open && (
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="md"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: 2,
              bgcolor: '#2A2A2A',
              color: 'white',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            },
            '& .MuiDialogContent-root': {
              bgcolor: '#2A2A2A',
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <Box
              sx={{
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: `linear-gradient(90deg, ${template.color}, ${template.color}aa)`,
                }
              }}
            >
              <DialogTitle
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 3,
                  color: 'white',
                }}
              >
                <Box>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 600,
                    mb: 1,
                    background: `linear-gradient(45deg, ${template.color}, ${template.color}aa)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    {template.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip 
                      label="AI Template" 
                      size="small" 
                      sx={{ 
                        bgcolor: `${template.color}15`,
                        color: template.color,
                        fontWeight: 500,
                        borderRadius: '6px',
                      }} 
                    />
                    <Chip 
                      label={`Template ${template.id}`} 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.7)',
                        fontWeight: 500,
                        borderRadius: '6px',
                      }} 
                    />
                  </Box>
                </Box>
                <IconButton
                  edge="end"
                  onClick={handleClose}
                  aria-label="close"
                  sx={{
                    color: 'white',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'rotate(90deg)',
                      color: template.color || '#2196f3',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
            </Box>
            
            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
            
            <DialogContent sx={{ p: 3 }}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Box sx={{ mb: 4 }}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.7)',
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    Subject
                    <Tooltip title="Copy Subject">
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(template.subject)}
                        sx={{
                          color: 'rgba(255,255,255,0.7)',
                          '&:hover': {
                            color: template.color,
                            backgroundColor: 'rgba(255,255,255,0.1)',
                          }
                        }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                    {template.subject}
                  </Typography>
                </Box>

                <Box>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.7)',
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    Content
                    <Tooltip title="Copy Content">
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(template.content)}
                        sx={{
                          color: 'rgba(255,255,255,0.7)',
                          '&:hover': {
                            color: template.color,
                            backgroundColor: 'rgba(255,255,255,0.1)',
                          }
                        }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Typography>
                  <Typography 
                    variant="body1" 
                    component="pre"
                    sx={{ 
                      color: 'white',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      fontFamily: 'inherit',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      p: 2,
                      borderRadius: 1,
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {template.content}
                  </Typography>
                </Box>
              </motion.div>
            </DialogContent>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default TemplatePreviewModal;
