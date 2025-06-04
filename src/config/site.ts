import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, NotebookText, Cpu, MessagesSquare, ListChecks } from 'lucide-react';

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
};

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Past Papers',
    href: '/past-papers',
    icon: NotebookText,
  },
  {
    title: 'AI Solver',
    href: '/ai-solver',
    icon: Cpu,
  },
  {
    title: 'Chat Support',
    href: '/chat-support',
    icon: MessagesSquare,
  },
  {
    title: 'Practice Questions',
    href: '/practice-questions',
    icon: ListChecks,
  },
];
