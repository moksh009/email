import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Container,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
  useTheme,
  alpha,
  Collapse,
  Tooltip,
  Stack,
  Divider,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import SubjectIcon from '@mui/icons-material/Subject';
import DescriptionIcon from '@mui/icons-material/Description';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import TemplateIcon from '@mui/icons-material/AutoAwesome';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import UploadIcon from '@mui/icons-material/Upload';
import PreviewIcon from '@mui/icons-material/Preview';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import AddIcon from '@mui/icons-material/Add';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { templates } from '../EmailTemplates/EmailTemplates';
import TemplatePreviewModal from '../EmailTemplates/TemplatePreviewModal';
import CreateTemplateDialog from '../EmailTemplates/CreateTemplateDialog';

function EmailForm({ onEmailGeneration, loading, selectedTemplate, onClose }) {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    subject: selectedTemplate?.subject || '',
    content: selectedTemplate?.content || '',
    attachments: []
  });
  
  const [recipients, setRecipients] = useState([]);
  const [newRecipient, setNewRecipient] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [trackingIds, setTrackingIds] = useState([]);
  const [sending, setSending] = useState(false);
  const [availableSenders, setAvailableSenders] = useState([]);
  const [selectedSenders, setSelectedSenders] = useState([]);
  const [createTemplateOpen, setCreateTemplateOpen] = useState(false);

  useEffect(() => {
    // Fetch available senders when component mounts
    fetch('http://localhost:3002/api/senders')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data)) {
          throw new Error('Invalid response format');
        }
        console.log('Received senders:', data);
        setAvailableSenders(data);
        // Select all senders by default
        setSelectedSenders(data.map(sender => sender.id));
      })
      .catch(error => {
        console.error('Error fetching senders:', error);
        toast.error('Failed to fetch email senders');
      });
  }, []);

  const handleSenderSelect = (senderId) => {
    setSelectedSenders(prev => {
      // If sender is already selected, remove it (unless it's the last one)
      if (prev.includes(senderId)) {
        const newSelection = prev.filter(id => id !== senderId);
        // Don't allow deselecting if it's the last selected sender
        return newSelection.length > 0 ? newSelection : prev;
      }
      // If sender is not selected, add it
      return [...prev, senderId];
    });
  };

  useEffect(() => {
    if (selectedTemplate) {
      setFormData(prev => ({
        ...prev,
        subject: selectedTemplate.subject || prev.subject,
        content: selectedTemplate.content || prev.content
      }));
    }
  }, [selectedTemplate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddRecipient = () => {
    if (newRecipient) {
      // Split by newlines and filter out empty lines
      const emailLines = newRecipient.split('\n').map(line => line.trim()).filter(line => line);
      
      const newRecipients = [];
      
      emailLines.forEach(line => {
        // Handle both formats: "email@domain.com" and "Name, email@domain.com"
        let email, name;
        
        if (line.includes(',') && line.split(',').length === 2) {
          // Format: "Name, email@domain.com"
          const parts = line.split(',').map(part => part.trim());
          name = parts[0];
          email = parts[1];
        } else {
          // Format: "email@domain.com" (email only)
          email = line;
          name = email.split('@')[0]; // Use email prefix as name for personalization
        }
        
        // Basic email validation
        if (email && email.includes('@') && email.includes('.')) {
          // Check if this email is not already added
          if (!recipients.some(r => r.email === email) && !newRecipients.some(r => r.email === email)) {
            newRecipients.push({ 
              email: email, 
              name: name || email.split('@')[0]
            });
          }
        }
      });
      
      if (newRecipients.length > 0) {
        setRecipients([...recipients, ...newRecipients]);
        toast.success(`Added ${newRecipients.length} recipient(s)`);
      } else {
        toast.warning('No valid emails found. Please check the format.');
      }
      
      setNewRecipient('');
    }
  };

  const handleRemoveRecipient = (recipientToRemove) => {
    setRecipients(recipients.filter((recipient) => recipient.email !== recipientToRemove.email));
  };

  const handleCsvUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
        const nameIndex = headers.indexOf('name');
        const emailIndex = headers.indexOf('email');
        
        if (emailIndex === -1) {
          toast.error('CSV file must contain "email" column');
          return;
        }

        let skippedCount = 0;
        const recipients = lines.slice(1).map(line => {
          const values = line.split(',').map(value => value.trim());
          const fullName = nameIndex !== -1 ? values[nameIndex] : '';
          const email = values[emailIndex];
          
          // Validate email
          if (email && email.includes('@')) {
            return {
              name: fullName ? fullName.split(',')[0].trim() : email.split('@')[0],
              email: email
            };
          }
          skippedCount++;
          return null;
        }).filter(Boolean);

        setRecipients(prev => {
          const uniqueRecipients = [...prev];
          recipients.forEach(newRecipient => {
            if (!uniqueRecipients.some(existing => existing.email === newRecipient.email)) {
              uniqueRecipients.push(newRecipient);
            }
          });
          return uniqueRecipients;
        });

        if (skippedCount > 0) {
          toast.warning(`${skippedCount} entries were skipped due to invalid email format`);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleAttachmentUpload = (event) => {
    const files = Array.from(event.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleRemoveAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;

    try {
      setSending(true);

      if (!selectedSenders || selectedSenders.length === 0) {
        throw new Error('Please select at least one sender email');
      }

      if (recipients.length === 0) {
        throw new Error('Please add at least one recipient');
      }

      // Generate emails for each recipient
      const generatedEmails = recipients.map((recipient, index) => {
        // Replace placeholders while preserving line breaks
        const personalizedContent = formData.content
          .replace(/{{name}}/g, recipient.name || '')
          .replace(/{{first_name}}/g, recipient.name?.split(' ')[0] || '')
          .replace(/{{sender_name}}/g, 'Your Name')
          .replace(/{{company_name}}/g, 'Your Company');

        const personalizedSubject = formData.subject
          .replace(/{{name}}/g, recipient.name || '')
          .replace(/{{first_name}}/g, recipient.name?.split(' ')[0] || '')
          .replace(/{{sender_name}}/g, 'Your Name')
          .replace(/{{company_name}}/g, 'Your Company');

        return {
          id: `${Date.now()}-${index}`,
          to: recipient.email,
          subject: personalizedSubject,
          content: personalizedContent,
          attachments: attachments,
          status: 'generated',
          selectedSenders: selectedSenders,
          createdAt: new Date().toISOString()
        };
      });

      onEmailGeneration(generatedEmails);
      toast.success('Emails generated successfully!');
    } catch (error) {
      console.error('Error generating emails:', error);
      toast.error(error.message || 'Failed to generate emails');
    } finally {
      setSending(false);
    }
  };

  const handleSendEmail = async (emailData) => {
    try {
      const formData = new FormData();
      formData.append('to', emailData.to);
      formData.append('subject', emailData.subject);
      formData.append('content', emailData.content);
      formData.append('selectedSenders', JSON.stringify(emailData.selectedSenders));

      console.log('Sending email with data:', {
        to: emailData.to,
        subject: emailData.subject,
        selectedSenders: emailData.selectedSenders
      });

      // Add attachments if any
      if (emailData.attachments?.length > 0) {
        emailData.attachments.forEach(file => {
          formData.append('attachments', file);
        });
      }

      const response = await fetch('http://localhost:3002/api/send-email', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }

      const result = await response.json();
      console.log('Email sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  };

  const handlePreview = (template) => {
    setShowPreview(true);
    setFormData({
      subject: template.subject,
      content: template.content
    });
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  const handleTemplateSelect = (template) => {
    setFormData({
      subject: template.subject,
      content: template.content
    });
  };

  const handleCreateTemplate = (newTemplate) => {
    setFormData({
      ...formData,
      subject: newTemplate.subject,
      content: newTemplate.content
    });
    toast.success('Template created successfully!');
  };

  return (
    <Box sx={{ width: '100%' }}>
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Paper 
            elevation={3}
            sx={{
              p: 0,
              overflow: 'hidden',
              bgcolor: 'background.paper',
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                p: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 2,
                }}
              >
                <EmailIcon /> Compose Email
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Select a Template
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateTemplateOpen(true)}
                    sx={{ borderRadius: 2 }}
                  >
                    Create Template
                  </Button>
                </Stack>
                <Grid container spacing={3}>
                  {templates.map((template, index) => (
                    <Grid item xs={12} sm={6} md={4} key={template.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <Card
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            overflow: 'hidden',
                            borderRadius: 2,
                            cursor: 'pointer',
                            '&:hover': {
                              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                            },
                            transition: 'all 0.3s ease-in-out',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '4px',
                              background: template.color || '#2196f3',
                              opacity: 1,
                              transition: 'opacity 0.3s ease-in-out',
                            }
                          }}
                        >
                          <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                            <Box 
                              sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                mb: 2
                              }}
                            >
                              <Typography 
                                variant="h6" 
                                component="div" 
                                sx={{ 
                                  fontWeight: 600,
                                  color: 'text.primary',
                                  transition: 'color 0.3s ease-in-out'
                                }}
                              >
                                {template.name}
                              </Typography>
                            </Box>
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              sx={{ 
                                mb: 2,
                                opacity: 0.9,
                                minHeight: '3em',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {template.subject}
                            </Typography>
                            <Chip 
                              label="AI Template" 
                              size="small" 
                              sx={{ 
                                bgcolor: `${template.color || '#2196f3'}15`,
                                color: template.color || '#2196f3',
                                fontWeight: 500,
                              }} 
                            />
                          </CardContent>
                          <CardActions sx={{ p: 2, pt: 0 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<PreviewIcon />}
                              onClick={() => handlePreview(template)}
                              sx={{
                                borderColor: template.color || '#2196f3',
                                color: template.color || '#2196f3',
                                '&:hover': {
                                  borderColor: template.color || '#2196f3',
                                  bgcolor: alpha(template.color || '#2196f3', 0.1),
                                },
                              }}
                            >
                              Preview
                            </Button>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<ContentCopyIcon />}
                              onClick={() => handleTemplateSelect(template)}
                              sx={{
                                ml: 'auto',
                                bgcolor: template.color || '#2196f3',
                                '&:hover': {
                                  bgcolor: template.color || '#2196f3',
                                  filter: 'brightness(0.9)',
                                }
                              }}
                            >
                              Use Template
                            </Button>
                          </CardActions>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                    Recipients
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      placeholder="Enter recipients (one per line):&#10;email@example.com&#10;Name, email@example.com&#10;another@email.com&#10;&#10;Note: Name is optional - just email works fine!"
                      value={newRecipient}
                      onChange={(e) => setNewRecipient(e.target.value)}
                      multiline
                      rows={8}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'background.paper',
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<PersonAddIcon />}
                      onClick={handleAddRecipient}
                      size="small"
                    >
                      Add Recipients
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<UploadIcon />}
                      component="label"
                      size="small"
                    >
                      Upload CSV
                      <input
                        type="file"
                        hidden
                        accept=".csv"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleCsvUpload(e);
                            e.target.value = '';
                          }
                        }}
                      />
                    </Button>
                  </Box>
                  {recipients.length > 0 && (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        bgcolor: 'rgba(0, 0, 0, 0.05)',
                        boxShadow: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle2" color="text.primary">
                          Added Recipients ({recipients.length})
                        </Typography>
                        {recipients.length > 0 && (
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => setRecipients([])}
                          >
                            Clear All
                          </Button>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {recipients.map((recipient, index) => (
                          <Chip
                            key={index}
                            label={recipient.email}
                            onDelete={() => handleRemoveRecipient(recipient)}
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.2),
                              },
                              '& .MuiChip-deleteIcon': {
                                color: theme.palette.primary.main,
                                '&:hover': {
                                  color: theme.palette.error.main,
                                },
                              },
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>

                <Divider />

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Select Sender Email(s)
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {availableSenders.map((sender) => (
                      <Chip
                        key={sender.id}
                        label={sender.email}
                        onClick={() => handleSenderSelect(sender.id)}
                        color={selectedSenders.includes(sender.id) ? "primary" : "default"}
                        variant={selectedSenders.includes(sender.id) ? "filled" : "outlined"}
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Stack>
                </Box>

                <TextField
                  fullWidth
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: <SubjectIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={6}
                  placeholder="Use {{name}}, {{first_name}}, {{sender_name}}, {{company_name}} for personalization"
                  InputProps={{
                    startAdornment: <DescriptionIcon sx={{ mr: 1, mt: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                <Box>
                  <input
                    type="file"
                    multiple
                    onChange={handleAttachmentUpload}
                    style={{ display: 'none' }}
                    id="file-input"
                  />
                  <label htmlFor="file-input">
                    <Button
                      component="span"
                      variant="outlined"
                      startIcon={<AttachFileIcon />}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.2s',
                      }}
                    >
                      Attach Files
                    </Button>
                  </label>

                  {attachments.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}>
                        Attachments ({attachments.length})
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {attachments.map((file, index) => (
                          <Chip
                            key={index}
                            label={file.name}
                            onDelete={() => handleRemoveAttachment(index)}
                            size="small"
                            variant="outlined"
                            sx={{
                              m: 0.5,
                              borderRadius: 1,
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<TemplateIcon />}
                    disabled={sending || !recipients.length || !formData.subject || !formData.content || selectedSenders.length === 0}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: 2,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4,
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    {sending ? 'Generating...' : 'Generate Emails'}
                  </Button>
                </Box>
              </Stack>
            </Box>
          </Paper>
        </motion.div>
      </AnimatePresence>
      <TemplatePreviewModal
        open={showPreview}
        onClose={handleClosePreview}
        template={formData}
      />
      <CreateTemplateDialog
        open={createTemplateOpen}
        onClose={() => setCreateTemplateOpen(false)}
        onSave={handleCreateTemplate}
        templates={templates}
      />
      {trackingIds.length > 0 && (
        <Box sx={{ mt: 2, borderTop: 1, pt: 2, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Track Sent Emails
          </Typography>
          {trackingIds.map((track, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                {track.to}
              </Typography>
              <Button
                startIcon={<TrackChangesIcon />}
                onClick={() => handleTrackEmail(track.id)}
                variant="outlined"
                size="small"
              >
                Track
              </Button>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default EmailForm;