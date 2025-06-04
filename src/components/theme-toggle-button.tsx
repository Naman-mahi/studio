
"use client";

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { Skeleton } from '@/components/ui/skeleton';

export function ThemeToggleButton() {
  const { theme, toggleTheme, isThemeLoaded } = useTheme();

  if (!isThemeLoaded) {
    return <Skeleton className="h-10 w-10 rounded-md" />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      className="text-foreground hover:bg-accent hover:text-accent-foreground"
    >
      {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  );
}
