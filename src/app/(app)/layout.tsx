
"use client";

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { navItems } from '@/config/site';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { GlobalSearchDialog } from '@/components/global-search-dialog';
import { Search } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

function AppSidebarHeader() {
  const { state } = useSidebar();

  return (
    <SidebarHeader className="p-4">
      <Link href="/" className="flex items-center gap-2">
        <Logo className="w-8 h-8 text-primary shrink-0" />
        {state !== 'collapsed' && (
          <h1 className="text-xl font-headline font-semibold truncate">PrepPal AI</h1>
        )}
      </Link>
    </SidebarHeader>
  );
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const { toggleTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true); // Component has mounted on the client
  }, []);

  React.useEffect(() => {
    if (!mounted) return; // Don't attach listeners until mounted

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
      }
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'L') {
        event.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme, mounted]);

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen">
        <Sidebar className="border-r" collapsible="icon">
          <AppSidebarHeader />
          <SidebarContent>
            <ScrollArea className="h-[calc(100vh-4rem)]">
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                      tooltip={{ children: item.title, className: "font-body" }}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </ScrollArea>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
            {/* Left group: Contains the sidebar trigger */}
            <div className="flex items-center gap-2">
              {mounted ? <SidebarTrigger suppressHydrationWarning /> : <Skeleton className="h-7 w-7" />}
            </div>
            
            {/* Spacer: This div will grow to take up all available space in the middle */}
            <div className="flex-grow" />
            
            {/* Right group: Contains search and theme toggle buttons */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} aria-label="Open search">
                <Search className="h-5 w-5" />
              </Button>
              {mounted ? <ThemeToggleButton /> : <Skeleton className="h-10 w-10" />}
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
      <GlobalSearchDialog isOpen={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </SidebarProvider>
  );
}
