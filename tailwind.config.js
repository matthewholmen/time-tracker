/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Share Tech Mono', 'Courier New', 'monospace'],
        'mono': ['Orbitron', 'Share Tech Mono', 'Consolas', 'monospace'],
        'cyber': ['Orbitron', 'monospace'],
        'digital': ['Iceland', 'Orbitron', 'monospace'],
      },
      colors: {
        // Matrix/Y2K Color Palette - TONED DOWN
        matrix: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Primary Matrix Green (toned down)
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        cyber: {
          cyan: '#0891b2',
          purple: '#c084fc',
          yellow: '#facc15',
          red: '#ef4444',
          blue: '#3b82f6',
        },
        terminal: {
          black: '#000000',
          dark: '#0f172a',
          gray: '#1e293b',
          medium: '#334155',
          light: '#64748b',
        },
        neon: {
          green: '#4ade80',
          cyan: '#22d3ee',
          purple: '#c084fc',
          yellow: '#facc15',
          orange: '#fb923c',
        }
      },
      backgroundImage: {
        // Matrix/Cyber gradients
        'gradient-matrix': 'linear-gradient(135deg, #000000 0%, #0f172a 50%, #1e293b 100%)',
        'gradient-cyber': 'linear-gradient(45deg, #22c55e, #0891b2, #c084fc)',
        'gradient-terminal': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        'gradient-neon-green': 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
        'gradient-neon-cyan': 'linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)',
        'gradient-neon-purple': 'linear-gradient(135deg, #c084fc 0%, #d8b4fe 100%)',
        // Matrix rain pattern
        'matrix-rain': 'repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(34, 197, 94, 0.02) 10px, rgba(34, 197, 94, 0.02) 20px)',
        // Circuit board pattern
        'circuit-pattern': 'radial-gradient(circle at 25% 25%, rgba(34, 197, 94, 0.05) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(8, 145, 178, 0.05) 0%, transparent 50%)',
      },
      boxShadow: {
        // Neon glow effects - TONED DOWN
        'neon-green': '0 0 10px rgba(34, 197, 94, 0.3), 0 0 20px rgba(34, 197, 94, 0.2)',
        'neon-cyan': '0 0 10px rgba(8, 145, 178, 0.3), 0 0 20px rgba(8, 145, 178, 0.2)',
        'neon-purple': '0 0 10px rgba(192, 132, 252, 0.3), 0 0 20px rgba(192, 132, 252, 0.2)',
        'terminal': '0 0 15px rgba(34, 197, 94, 0.25), inset 0 0 15px rgba(34, 197, 94, 0.05)',
        'cyber': '0 0 8px rgba(34, 197, 94, 0.2), 0 0 16px rgba(34, 197, 94, 0.1)',
        'digital': 'inset 0 0 10px rgba(34, 197, 94, 0.1), 0 0 10px rgba(34, 197, 94, 0.15)',
      },
      blur: {
        xs: '2px',
      },
      animation: {
        // Matrix/Cyber animations - OPTIONAL/SUBTLE
        'matrix-glow': 'matrix-glow 3s ease-in-out infinite',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        'matrix-glow': {
          '0%, 100%': { 
            textShadow: '0 0 3px #22c55e, 0 0 6px #22c55e',
          },
          '50%': { 
            textShadow: '0 0 5px #4ade80, 0 0 10px #4ade80',
          },
        },
        'neon-pulse': {
          '0%, 100%': { 
            boxShadow: '0 0 3px #22c55e, 0 0 6px #22c55e, inset 0 0 3px #22c55e',
          },
          '50%': { 
            boxShadow: '0 0 5px #4ade80, 0 0 10px #4ade80, inset 0 0 5px #4ade80',
          },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
