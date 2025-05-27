// Project-specific gradient utility functions

export interface ProjectGradient {
  background: string;
  border: string;
  text: string;
  light: string; // For borders and accents
}

// Predefined gradients for projects 1-3, then loops
const projectGradients: ProjectGradient[] = [
  {
    // Gradient 1: Purple/Blue
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'linear-gradient(135deg, #667eea, #764ba2)',
    text: 'bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent',
    light: '#8b7fd4' // Lighter version for borders
  },
  {
    // Gradient 2: Blue/Cyan  
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    border: 'linear-gradient(135deg, #4facfe, #00f2fe)',
    text: 'bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent',
    light: '#42a5f5'
  },
  {
    // Gradient 3: Pink/Orange
    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    border: 'linear-gradient(135deg, #fa709a, #fee140)',
    text: 'bg-gradient-to-r from-pink-500 to-yellow-500 bg-clip-text text-transparent',
    light: '#fc8ba7'
  }
];

/**
 * Get the gradient for a project based on its position in the project list
 */
export const getProjectGradient = (projectIndex: number): ProjectGradient => {
  return projectGradients[projectIndex % projectGradients.length];
};

/**
 * Get gradient by project ID - finds the project in the list and returns its gradient
 */
export const getProjectGradientById = (projectId: string, projects: any[]): ProjectGradient => {
  const projectIndex = projects.findIndex(p => p.id === projectId);
  return getProjectGradient(projectIndex);
};

/**
 * Generate CSS custom properties for a gradient
 */
export const getGradientCSSProperties = (gradient: ProjectGradient) => ({
  '--project-gradient': gradient.background,
  '--project-border': gradient.border,
  '--project-light': gradient.light
});

/**
 * Get Tailwind classes for project gradient styling
 */
export const getProjectGradientClasses = (projectIndex: number) => {
  const gradientIndex = projectIndex % 3; // We have 3 gradients
  
  const gradientClasses = [
    {
      // Purple/Blue theme (Project 1)
      background: 'bg-gradient-project-1',
      border: 'border-purple-400',
      text: 'text-purple-600',
      light: 'bg-purple-100'
    },
    {
      // Blue/Cyan theme (Project 2)
      background: 'bg-gradient-project-2',
      border: 'border-blue-400',
      text: 'text-blue-600',
      light: 'bg-blue-100'
    },
    {
      // Pink/Orange theme (Project 3)
      background: 'bg-gradient-project-3',
      border: 'border-pink-400', 
      text: 'text-pink-600',
      light: 'bg-pink-100'
    }
  ];
  
  return gradientClasses[gradientIndex];
};
