// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dochi: {
          50: '#fdf2f8',    // Very light pink
          100: '#fce7f3',   // Light pink
          200: '#fbcfe8',   // Soft pink
          300: '#f9a8d4',   // Medium pink
          400: '#f472b6',   // Bright pink
          500: '#ec4899',   // Primary pink
          600: '#db2777',   // Dark pink
          700: '#be185d',   // Darker pink
          800: '#9d174d',   // Very dark pink
          900: '#831843',   // Deepest pink
        },
        
        pastel: {
          pink: '#FFE5F1',     // Light pink
          lavender: '#F0F0FF',  // Light lavender
          peach: '#FFF0EB',     // Light peach
          mint: '#E8F5E8',      // Light mint
          blue: '#E6FAFF',      // Light blue
          yellow: '#FFF9E6',    // Light yellow
          purple: '#F3E8FF',    // Light purple
        },
        
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        
        status: {
          success: '#10b981',   // Green
          warning: '#f59e0b',   // Orange
          error: '#ef4444',     // Red
          info: '#3b82f6',      // Blue
        },
        
        priority: {
          low: '#6366f1',       // Indigo
          medium: '#f59e0b',    // Orange
          high: '#ef4444',      // Red
          urgent: '#dc2626',    // Dark red
        }
      },

      // ==========================================
      // TYPOGRAPHY SYSTEM
      // ==========================================
      fontFamily: {
        // Primary font family
        sans: [
          'Inter', 
          'system-ui', 
          '-apple-system', 
          'BlinkMacSystemFont', 
          'Segoe UI', 
          'Roboto', 
          'sans-serif'
        ],
        
        // Display font for headings
        display: [
          'Cal Sans', 
          'Inter', 
          'system-ui', 
          'sans-serif'
        ],
        
        // Monospace for code
        mono: [
          'JetBrains Mono', 
          'Fira Code', 
          'Monaco', 
          'Cascadia Code', 
          'Roboto Mono', 
          'monospace'
        ],
      },

      // Custom font sizes with line heights
      fontSize: {
        // Tiny text
        'xs': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }],        // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],    // 14px
        
        // Body text
        'base': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],       // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '400' }],    // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '500' }],     // 20px
        
        // Headings
        '2xl': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],        // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '700' }],   // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '700' }],     // 36px
        '5xl': ['3rem', { lineHeight: '1', fontWeight: '800' }],             // 48px
        '6xl': ['3.75rem', { lineHeight: '1', fontWeight: '800' }],          // 60px
        '7xl': ['4.5rem', { lineHeight: '1', fontWeight: '900' }],           // 72px
        '8xl': ['6rem', { lineHeight: '1', fontWeight: '900' }],             // 96px
        '9xl': ['8rem', { lineHeight: '1', fontWeight: '900' }],             // 128px
      },

      // Font weights
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },

      // ==========================================
      // SPACING SYSTEM
      // ==========================================
      spacing: {
        '0.5': '0.125rem',   // 2px
        '1.5': '0.375rem',   // 6px
        '2.5': '0.625rem',   // 10px
        '3.5': '0.875rem',   // 14px
        '4.5': '1.125rem',   // 18px
        '5.5': '1.375rem',   // 22px
        '6.5': '1.625rem',   // 26px
        '7.5': '1.875rem',   // 30px
        '8.5': '2.125rem',   // 34px
        '9.5': '2.375rem',   // 38px
        '18': '4.5rem',      // 72px
        '88': '22rem',       // 352px
        '100': '25rem',      // 400px
        '104': '26rem',      // 416px
        '112': '28rem',      // 448px
        '128': '32rem',      // 512px
      },

      // ==========================================
      // BORDER RADIUS
      // ==========================================
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',    // 2px
        'DEFAULT': '0.25rem', // 4px
        'md': '0.375rem',    // 6px
        'lg': '0.5rem',      // 8px
        'xl': '0.75rem',     // 12px
        '2xl': '1rem',       // 16px
        '3xl': '1.5rem',     // 24px
        'full': '9999px',
      },

      // ==========================================
      // SHADOWS
      // ==========================================
      boxShadow: {
        // Soft shadows
        'soft-xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'soft-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'soft-md': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        
        // Colored shadows
        'pink': '0 4px 14px 0 rgba(236, 72, 153, 0.25)',
        'purple': '0 4px 14px 0 rgba(147, 51, 234, 0.25)',
        'blue': '0 4px 14px 0 rgba(59, 130, 246, 0.25)',
        
        // Inner shadows
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },

      // ==========================================
      // ANIMATIONS & TRANSITIONS
      // ==========================================
      animation: {
        // Custom animations
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-out': 'fadeOut 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-soft': 'bounceSoft 0.6s ease-in-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
          '40%, 43%': { transform: 'translate3d(0, -8px, 0)' },
          '70%': { transform: 'translate3d(0, -4px, 0)' },
          '90%': { transform: 'translate3d(0, -2px, 0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },

      // ==========================================
      // BREAKPOINTS (RESPONSIVE)
      // ==========================================
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      },

      // ==========================================
      // BACKDROP BLUR
      // ==========================================
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
    },
  },
  plugins: [
    // Add any additional plugins here
  ],
}