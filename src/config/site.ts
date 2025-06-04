
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, NotebookText, Cpu, MessagesSquare, ListChecks, MessageCircleQuestion, Newspaper, GraduationCap, Settings } from 'lucide-react';

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
    title: 'AI Quiz Generator',
    href: '/ai-quiz-generator',
    icon: ListChecks,
  },
  {
    title: 'Topic AI Tutor',
    href: '/topic-ai-tutor',
    icon: GraduationCap,
  },
  {
    title: 'AI Q&A Chat',
    href: '/ai-qa-chat',
    icon: MessageCircleQuestion,
  },
  {
    title: 'Chat Support (General)',
    href: '/chat-support',
    icon: MessagesSquare,
  },
  {
    title: 'Current Affairs',
    href: '/current-affairs',
    icon: Newspaper,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

