// Jasmine Theme Colors for Customer Connect Application
export const colors = {
  // Primary Colors - Jasmine Orange Theme
  primary: {
    main: '#FF6B35',       // Jasmine Orange
    light: '#FF8A5B',      // Light Orange
    dark: '#E55A2B',       // Dark Orange
    contrast: '#ffffff'    // White text
  },
  
  // Secondary Colors
  secondary: {
    main: '#6B7280',       // Gray
    light: '#9CA3AF',      // Light Gray
    dark: '#4B5563',       // Dark Gray
    contrast: '#ffffff'    // White text
  },
  
  // Success Colors
  success: {
    main: '#10B981',       // Green
    light: '#6EE7B7',      // Light Green
    dark: '#059669',       // Dark Green
    contrast: '#ffffff'    // White text
  },
  
  // Warning Colors
  warning: {
    main: '#F59E0B',       // Amber
    light: '#FCD34D',      // Light Amber
    dark: '#D97706',       // Dark Amber
    contrast: '#1F2937'    // Dark text
  },
  
  // Error Colors
  error: {
    main: '#EF4444',       // Red
    light: '#F87171',      // Light Red
    dark: '#DC2626',       // Dark Red
    contrast: '#ffffff'    // White text
  },
  
  // Neutral Colors
  neutral: {
    white: '#ffffff',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
    black: '#000000'
  },
  
  // Background Colors
  background: {
    default: '#F9FAFB',     // Very light gray
    paper: '#ffffff',       // White
    sidebar: '#FF6B35',     // Jasmine Orange
    header: '#ffffff'       // White
  },
  
  // Text Colors
  text: {
    primary: '#1F2937',     // Dark gray
    secondary: '#6B7280',   // Medium gray
    disabled: '#9CA3AF',    // Light gray
    inverse: '#ffffff'      // White
  },
  
  // Border Colors
  border: {
    light: '#E5E7EB',       // Light gray
    medium: '#D1D5DB',      // Medium gray
    dark: '#9CA3AF'         // Dark gray
  },
  
  // Status Colors
  status: {
    active: '#10B981',      // Green
    inactive: '#F59E0B',    // Amber
    offline: '#6B7280',     // Gray
    busy: '#F59E0B',        // Amber
    away: '#EF4444'         // Red
  },
  
  // Jasmine specific colors
  jasmine: {
    orange: '#FF6B35',
    lightOrange: '#FF8A5B',
    darkOrange: '#E55A2B',
    cream: '#FFF5F0',
    accent: '#4A5568'
  }
};

// CSS Custom Properties Generator
export const generateCSSVariables = () => {
  const cssVars = {};
  
  const addVars = (obj, prefix = '') => {
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (typeof value === 'object' && value !== null) {
        addVars(value, `${prefix}${key}-`);
      } else {
        cssVars[`--color-${prefix}${key}`] = value;
      }
    });
  };
  
  addVars(colors);
  return cssVars;
};

export default colors;