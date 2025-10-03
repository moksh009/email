import React, { useState, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Container, Box, IconButton, Paper, useMediaQuery, CssBaseline } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

// Import components
import EmailForm from './components/EmailForm/EmailForm';
import EmailList from './components/EmailList/EmailList';
import EmailPreview from './components/EmailPreview/EmailPreview';
import EmailTemplates from './components/EmailTemplates/EmailTemplates';

const API_BASE_URL = 'http://localhost:3002';

const App = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState(prefersDarkMode ? 'dark' : 'light');
  const [generatedEmails, setGeneratedEmails] = useState([]);
  const [sendingEmails, setSendingEmails] = useState(new Set());
  const [schedulingEmails, setSchedulingEmails] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'light' ? '#2196f3' : '#90caf9',
            light: mode === 'light' ? '#64b5f6' : '#e3f2fd',
            dark: mode === 'light' ? '#1976d2' : '#42a5f5',
          },
          secondary: {
            main: mode === 'light' ? '#f50057' : '#f48fb1',
            light: mode === 'light' ? '#ff4081' : '#f8bbd0',
            dark: mode === 'light' ? '#c51162' : '#ec407a',
          },
          background: {
            default: mode === 'light' ? '#f5f5f5' : '#121212',
            paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                transition: 'all 0.3s ease-in-out',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                boxShadow: mode === 'light' 
                  ? '0 4px 6px rgba(0,0,0,0.1)' 
                  : '0 4px 6px rgba(0,0,0,0.3)',
              },
            },
          },
        },
        typography: {
          fontFamily: '"Poppins", "Roboto", "Arial", sans-serif',
          h1: {
            fontWeight: 600,
          },
          h2: {
            fontWeight: 600,
          },
          h3: {
            fontWeight: 600,
          },
        },
        shape: {
          borderRadius: 12,
        },
      }),
    [mode]
  );

  const handleEmailGeneration = (emails) => {
    if (!Array.isArray(emails)) {
      console.error('Expected an array of emails but received:', emails);
      return;
    }
    // Add unique IDs to each email
    const emailsWithIds = emails.map((email, index) => ({
      ...email,
      id: `email-${Date.now()}-${index}` // Ensure unique IDs
    }));
    setGeneratedEmails(emailsWithIds);
  };

  const handleDeleteEmail = (emailId) => {
    setGeneratedEmails(prevEmails => {
      const updatedEmails = prevEmails.filter(email => email.id !== emailId);
      return updatedEmails;
    });
    toast.success('Email deleted successfully');
  };

  const handleDeleteAllEmails = () => {
    setGeneratedEmails([]);
    toast.success('All emails deleted successfully');
  };

  const handleSendEmail = async (email, isScheduled = false, scheduledTime = null) => {
    try {
      if (isScheduled) {
        setSchedulingEmails(prev => {
          const next = new Set(prev);
          next.add(email.id);
          return next;
        });
      } else {
        setSendingEmails(prev => {
          const next = new Set(prev);
          next.add(email.id);
          return next;
        });
      }

      const formData = new FormData();
      formData.append('to', email.to);
      formData.append('subject', email.subject);
      formData.append('content', email.content);
      formData.append('selectedSenders', JSON.stringify(email.selectedSenders));

      if (email.attachments?.length > 0) {
        email.attachments.forEach(file => {
          formData.append('attachments', file);
        });
      }

      if (isScheduled && scheduledTime) {
        formData.append('scheduledTime', scheduledTime.toISOString());
      }

      // Determine endpoint based on whether it's scheduled or immediate
      const endpoint = `${API_BASE_URL}${isScheduled ? '/api/schedule-email' : '/api/send-email'}`;

      console.log('Sending email request:', {
        to: email.to,
        subject: email.subject,
        selectedSenders: email.selectedSenders,
        isScheduled,
        scheduledTime
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        let errorMessage = 'Failed to send email';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Email sent successfully:', result);
      
      // Update email status
      setGeneratedEmails(prevEmails =>
        prevEmails.map(e =>
          e.id === email.id
            ? { ...e, status: 'sent', sentAt: new Date().toISOString() }
            : e
        )
      );

      toast.success(isScheduled ? 'Email scheduled successfully!' : 'Email sent successfully!');
      
      // Remove from sending/scheduling set
      if (isScheduled) {
        setSchedulingEmails(prev => {
          const next = new Set(prev);
          next.delete(email.id);
          return next;
        });
      } else {
        setSendingEmails(prev => {
          const next = new Set(prev);
          next.delete(email.id);
          return next;
        });
      }

      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      
      // Update email status to error
      setGeneratedEmails(prevEmails =>
        prevEmails.map(e =>
          e.id === email.id
            ? { ...e, status: 'error', error: error.message }
            : e
        )
      );

      // Remove from sending/scheduling set
      if (isScheduled) {
        setSchedulingEmails(prev => {
          const next = new Set(prev);
          next.delete(email.id);
          return next;
        });
      } else {
        setSendingEmails(prev => {
          const next = new Set(prev);
          next.delete(email.id);
          return next;
        });
      }

      throw error;
    }
  };

  const handleBulkEmailSchedule = async (emails, scheduledTime) => {
    try {
      const promises = emails.map(email => handleSendEmail(email, true, scheduledTime));
      await Promise.all(promises);
      toast.success('Bulk email scheduling completed!');
    } catch (error) {
      console.error('Error in bulk scheduling:', error);
      toast.error('Some emails failed to schedule. Please check the list for details.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box
            sx={{
              minHeight: '100vh',
              bgcolor: 'background.default',
              color: 'text.primary',
              transition: 'all 0.3s ease-in-out',
              pb: 4,
            }}
          >
            <Container maxWidth="lg">
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2, pb: 2 }}>
                <IconButton
                  onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
                  color="inherit"
                  sx={{
                    bgcolor: 'background.paper',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Box>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    mb: 3,
                    bgcolor: 'background.paper',
                    width: '100%',
                  }}
                >
                  <EmailForm 
                    onEmailGeneration={handleEmailGeneration} 
                    loading={loading} 
                    onSelectTemplate={(template) => {
                      handleEmailGeneration([{
                        to: '',
                        subject: template.subject,
                        content: template.content,
                        selectedSenders: [],
                        attachments: []
                      }]);
                    }}
                  />
                </Paper>
              </motion.div>

              <Box sx={{ width: '100%' }}>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <EmailList
                    emails={generatedEmails}
                    onSendEmail={handleSendEmail}
                    onScheduleEmail={handleSendEmail}
                    onBulkSchedule={handleBulkEmailSchedule}
                    onDeleteEmail={handleDeleteEmail}
                    onDeleteAllEmails={handleDeleteAllEmails}
                    sendingEmails={sendingEmails}
                    schedulingEmails={schedulingEmails}
                  />
                </motion.div>
              </Box>
            </Container>
          </Box>
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={mode}
          />
        </motion.div>
      </AnimatePresence>
    </ThemeProvider>
  );
};

export default App;
