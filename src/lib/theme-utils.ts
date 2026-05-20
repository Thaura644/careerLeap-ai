
export const fixDarkModeContrast = () => {
  const root = document.documentElement;
  
  if (root.classList.contains('dark')) {
    // Ensure better contrast for dark mode
    root.style.setProperty('--foreground', '210 40% 98%');
    root.style.setProperty('--card-foreground', '210 40% 98%');
    root.style.setProperty('--primary-foreground', '210 40% 98%');
    root.style.setProperty('--secondary-foreground', '210 40% 98%');
    root.style.setProperty('--accent-foreground', '210 40% 98%');
    root.style.setProperty('--destructive-foreground', '210 40% 98%');
    
    // Make sure background is dark enough
    root.style.setProperty('--background', '222.2 84% 4.9%');
    root.style.setProperty('--card', '222.2 84% 4.9%');
    
    // Enhance muted colors
    root.style.setProperty('--muted', '217.2 32.6% 17.5%');
    root.style.setProperty('--muted-foreground', '215 20.2% 75.1%');
  } else {
    // Reset to default light mode values if needed
    root.style.removeProperty('--foreground');
    root.style.removeProperty('--card-foreground');
    root.style.removeProperty('--primary-foreground');
    root.style.removeProperty('--secondary-foreground');
    root.style.removeProperty('--accent-foreground');
    root.style.removeProperty('--destructive-foreground');
    root.style.removeProperty('--background');
    root.style.removeProperty('--card');
    root.style.removeProperty('--muted');
    root.style.removeProperty('--muted-foreground');
  }
};
