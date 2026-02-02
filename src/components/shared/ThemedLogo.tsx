import { useTheme } from '@/components/theme/ThemeProvider';
import logoLight from '@/assets/fincriss-logo-light.jpeg';
import logoDark from '@/assets/fincriss-logo-dark.jpeg';

interface ThemedLogoProps {
  className?: string;
  alt?: string;
}

export function ThemedLogo({ className = '', alt = 'FinCrisS' }: ThemedLogoProps) {
  const { theme } = useTheme();
  
  // Light theme uses light-background logo, dark theme uses dark-background logo
  const logoSrc = theme === 'light' ? logoLight : logoDark;
  
  return (
    <img
      src={logoSrc}
      alt={alt}
      className={className}
    />
  );
}
