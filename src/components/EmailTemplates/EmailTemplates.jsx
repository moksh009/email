import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  IconButton,
  Tooltip,
  Chip,
  CardActions,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { motion } from 'framer-motion';
import PreviewIcon from '@mui/icons-material/Preview';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TemplatePreviewModal from './TemplatePreviewModal';

// Initial templates (replaced with provided salon-focused emails)
const initialTemplates = [
  {
    id: 1,
    name: 'EMAIL #1',
    subject: 'Your competitor booked 28% more clients this month',
    content: `Your competitor is stealing customers\n\nNot with better prices. Not with fancy equipment but with faster replies\n\nwhile you're busy with clients, they're booking appointments 24/7 through AI\n\nOne salon owner said: "I went from losing 15 customers daily to zero missed bookings"\n\nTheir secret? \n\nAI handles WhatsApp, Instagram, bookings, reminders - everything\n\nWant to see how?\n\nReply "YES" for a quick demo`,
    color: '#2196f3'
  },
  {
    id: 2,
    name: 'EMAIL #2',
    subject: 'Why you are not seeing growth?',
    content: `Watched 3 salons lose a ₹5K booking yesterday\nCustomer messaged all 3 at 9 PM\n\nOnly 1 replied instantly. Guess who got paid?\n\nThe problem? \n\nYour team sleeps but AI doesn't\n\nOne salon automated their responses: → 60% less work for staff → 28% more bookings → Zero missed customers\n\nWant the same system for your salon?\n\nReply "DEMO"`,
    color: '#f50057'
  },
  {
    id: 3,
    name: 'EMAIL #3',
    subject: 'u lost 8 customers yesterday (here\'s why)',
    content: `Quick math:\n10 WhatsApp messages after 7 PM = 7-9 potential customers\n\n0 instant replies = 7-9 lost bookings\n\n₹2000 average booking × 8 = ₹16,000 gone\n\nThis happens daily.\n\nSolution? - AI \n\nOne salon owner: "Made ₹15k extra last month just from this bookings system"\n\nTheir AI books appointments, sends offers, handles everything automatically\n\nReady to stop losing money?\n\nReply "SETUP" for demo.`,
    color: '#00bcd4'
  },
  {
    id: 4,
    name: 'FOLLOW-UP #1 (for Email #1)',
    subject: 'did I say something wrong? 😔',
    content: `i sent you that competitor thing yesterday...\n\nbut silence\nDid I hit a nerve or something?\n\nLook, I get it nobody likes hearing their competitor is winning\n\nBut ignoring it won't make it go away\n\nYour customers are still messaging at night\nYour competitors are still booking them\n\nStill want that demo or nah?\n\nJust reply "YES" or "NO" won't bug you again.`,
    color: '#4caf50'
  },
  {
    id: 5,
    name: 'FOLLOW-UP #2 (for Email #2)',
    subject: 'left me on read... that hurts 💔',
    content: `Hi,\n\nGuess my ₹5K booking story didn't impress you?\n\nOr maybe you're one of those "I'll think about it" people? 😅\n\nHere's the thing while you're thinking, your competitors are doing\n\nThat salon I mentioned? They just booked 23 appointments yesterday\n\nAll automated All profit\nBut hey, if you're happy losing customers, I respect that\n\nLast chance reply "DEMO" or I'm moving to the next salon`,
    color: '#ff9800'
  },
  {
    id: 6,
    name: 'FOLLOW-UP #3 (for Email #3)',
    subject: '₹16,000 lost and still no reply? 😬',
    content: `I literally showed you the math yesterday:\n₹16,000 gone = Zero replies\n\nAnd you're still silent?\nAre you okay? \n\nLook, maybe you're busy. Maybe you don't care about extra money\n\nBut your customers are texting right now...\n\nAnd guess what? No one's replying\n\nRing ring... missed call and ignored message\n\nHow much money is enough to lose before you act?\n\nReply "HELP" if you want to stop the bleeding Or don't\n\nYour choice `,
    color: '#673ab7'
  }
];

// Export for other components (e.g., EmailForm) that render a simple list
export const templates = initialTemplates;

// Storage removed. Always use the provided initialTemplates set.

const EmailTemplates = ({ onTemplateSelect }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [localTemplates, setLocalTemplates] = useState(initialTemplates);

  const handleSelectTemplate = (template) => {
    onTemplateSelect(template);
  };

  const handlePreview = (template, event) => {
    event.stopPropagation();
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
  };

  const filteredTemplates = localTemplates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
          fontWeight: 700,
          background: 'linear-gradient(45deg, #2196f3 30%, #21CBF3 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Email Templates
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 2,
              '&:hover': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                }
              }
            }
          }}
          sx={{ mb: 3 }}
        />
      </Box>

      <Grid container spacing={3}>
        {filteredTemplates.map((template, index) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              style={{ height: '100%' }}
              whileHover={{ scale: 1.02 }}
            >
              <Card
                variant="outlined"
                onMouseEnter={() => setHoveredId(template.id)}
                onMouseLeave={() => setHoveredId(null)}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 2,
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  background: hoveredId === template.id 
                    ? `linear-gradient(145deg, ${template.color}05, ${template.color}15)`
                    : 'background.paper',
                  '&:hover': {
                    boxShadow: `0 8px 32px ${template.color}25`,
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${template.color}, ${template.color}aa)`,
                    opacity: hoveredId === template.id ? 1 : 0.7,
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
                        color: hoveredId === template.id ? template.color : 'text.primary',
                        transition: 'color 0.3s ease-in-out',
                        fontSize: '1.1rem'
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
                      overflow: 'hidden',
                      lineHeight: 1.6
                    }}
                  >
                    {template.subject}
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
                        bgcolor: 'background.default',
                        color: 'text.secondary',
                        fontWeight: 500,
                        borderRadius: '6px',
                      }} 
                    />
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PreviewIcon />}
                    onClick={(e) => handlePreview(template, e)}
                    sx={{
                      borderColor: template.color,
                      color: template.color,
                      borderRadius: '8px',
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: template.color,
                        backgroundColor: `${template.color}10`,
                      }
                    }}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => handleSelectTemplate(template)}
                    sx={{
                      ml: 'auto',
                      bgcolor: template.color,
                      borderRadius: '8px',
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: template.color,
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
      <TemplatePreviewModal
        open={previewOpen}
        onClose={handleClosePreview}
        template={selectedTemplate}
      />
    </Box>
  );
};

export default EmailTemplates;
