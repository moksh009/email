import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  InputAdornment,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import CloseIcon from '@mui/icons-material/Close';
import ColorLensIcon from '@mui/icons-material/ColorLens';
// no imports from EmailTemplates to avoid circular dependencies

const colors = [
  { name: 'Blue', value: '#2196f3' },
  { name: 'Pink', value: '#f50057' },
  { name: 'Cyan', value: '#00bcd4' },
  { name: 'Green', value: '#4caf50' },
  { name: 'Orange', value: '#ff9800' },
  { name: 'Purple', value: '#9c27b0' },
  { name: 'Deep Purple', value: '#673ab7' },
  { name: 'Indigo', value: '#3f51b5' },
];

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link'],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'list', 'bullet',
  'link'
];

const CreateTemplateDialog = ({ open, onClose, onSave, templates }) => {
  const [templateData, setTemplateData] = useState({
    name: '',
    subject: '',
    content: '',
    color: '#2196f3',
  });

  const handleChange = (field) => (event) => {
    setTemplateData({
      ...templateData,
      [field]: event.target.value,
    });
  };

  const handleEditorChange = (content) => {
    setTemplateData({
      ...templateData,
      content: content,
    });
  };

  const handleSave = () => {
    const newTemplate = {
      ...templateData
    };
    onSave(newTemplate);
    onClose();
    setTemplateData({
      name: '',
      subject: '',
      content: '',
      color: '#2196f3',
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 3,
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box component="div">Create New Template</Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Template Name"
            fullWidth
            value={templateData.name}
            onChange={handleChange('name')}
            variant="outlined"
          />
          <TextField
            label="Subject"
            fullWidth
            value={templateData.subject}
            onChange={handleChange('subject')}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography color="textSecondary" component="span">{"{{name}}"}</Typography>
                </InputAdornment>
              ),
            }}
          />
          <FormControl fullWidth>
            <InputLabel>Template Color</InputLabel>
            <Select
              value={templateData.color}
              onChange={handleChange('color')}
              label="Template Color"
              startAdornment={
                <InputAdornment position="start">
                  <ColorLensIcon sx={{ color: templateData.color }} />
                </InputAdornment>
              }
            >
              {colors.map((color) => (
                <MenuItem key={color.value} value={color.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: color.value,
                      }}
                    />
                    {color.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ 
            '& .quill': { 
              height: '250px',
              '& .ql-editor': {
                minHeight: '200px'
              }
            }
          }}>
            <ReactQuill
              theme="snow"
              value={templateData.content}
              onChange={handleEditorChange}
              modules={modules}
              formats={formats}
              placeholder="Write your template content here..."
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={!templateData.name || !templateData.subject || !templateData.content}
        >
          Save Template
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTemplateDialog;
