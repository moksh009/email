// API configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Determine API URL based on environment
export const API_BASE_URL = (() => {
  // Check if we have a custom API URL from environment
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Development - use localhost
  if (isDevelopment) {
    return 'http://localhost:3002';
  }
  
  // Production - you'll need to update this to your actual server URL
  // For now, we'll use a placeholder that you need to replace
  return 'https://your-server-domain.herokuapp.com';
})();

// API endpoints
export const API_ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/api/health`,
  SENDERS: `${API_BASE_URL}/api/senders`,
  SEND_EMAIL: `${API_BASE_URL}/api/send-email`,
  SCHEDULE_EMAIL: `${API_BASE_URL}/api/schedule-email`,
  DELIVERABILITY_CHECK: `${API_BASE_URL}/api/deliverability-check`,
};

// Log API configuration in development
if (isDevelopment) {
  console.log('API Configuration:', {
    API_BASE_URL,
    ENVIRONMENT: isDevelopment ? 'development' : 'production',
    API_ENDPOINTS
  });
}
