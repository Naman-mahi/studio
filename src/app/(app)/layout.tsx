
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
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { navItems } from '@/config/site';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeToggleButton } from '@/components/theme-toggle-button'; // Added import

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen">
        <Sidebar className="border-r">
          <SidebarHeader className="p-4">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="w-8 h-8 text-primary" />
              <h1 className="text-xl font-headline font-semibold">NTPC Prep Ace</h1>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <ScrollArea className="h-[calc(100vh-4rem)]"> {/* Adjust height based on header */}
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
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
            <div className="flex-1">
              {/* Can add breadcrumbs or page title here */}
            </div>
            <ThemeToggleButton /> {/* Added theme toggle button */}
          </header>
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
