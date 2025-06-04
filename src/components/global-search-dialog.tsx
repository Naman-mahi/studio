
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { navItems, type NavItem } from "@/config/site";
import Link from "next/link";
import { Search } from "lucide-react";

interface GlobalSearchDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function GlobalSearchDialog({ isOpen, onOpenChange }: GlobalSearchDialogProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filteredNavItems = React.useMemo(() => {
    if (!searchQuery) {
      return navItems;
    }
    return navItems.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  React.useEffect(() => {
    if (isOpen) {
      setSearchQuery(""); // Reset search query when dialog opens
      setSelectedIndex(0); // Reset selected index
      // Timeout to allow dialog to render before focusing
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen || filteredNavItems.length === 0) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredNavItems.length);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredNavItems.length) % filteredNavItems.length);
      } else if (event.key === "Enter") {
        event.preventDefault();
        const selectedItem = filteredNavItems[selectedIndex];
        if (selectedItem) {
          router.push(selectedItem.href);
          onOpenChange(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredNavItems, selectedIndex, router, onOpenChange]);


  const handleItemClick = (href: string) => {
    router.push(href);
    onOpenChange(false);
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg font-medium">
            <Search className="h-5 w-5" /> Global Search
          </DialogTitle>
          <DialogDescription>
            Quickly navigate to any section of the application. Use Arrow Keys and Enter to navigate.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 pt-0">
          <Input
            ref={inputRef}
            type="search"
            placeholder="Search features (e.g., Dashboard, AI Quiz)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0); // Reset selection on query change
            }}
            className="w-full h-12 text-base"
          />
        </div>
        {filteredNavItems.length > 0 && (
          <div className="max-h-[300px] overflow-y-auto px-6 pb-6 custom-scrollbar">
            <ul className="space-y-1">
              {filteredNavItems.map((item, index) => (
                <li key={item.href}>
                  <button
                    onClick={() => handleItemClick(item.href)}
                    onMouseMove={() => setSelectedIndex(index)}
                    className={`w-full text-left p-3 rounded-md flex items-center gap-3 transition-colors ${
                      selectedIndex === index
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="flex-grow">{item.title}</span>
                    {item.label && (
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
                        {item.label}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {searchQuery && filteredNavItems.length === 0 && (
          <p className="p-6 pt-0 text-sm text-muted-foreground text-center">No results found for &quot;{searchQuery}&quot;.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Basic custom scrollbar styling (optional, can be enhanced in globals.css)
const styles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: hsl(var(--muted) / 0.5);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: hsl(var(--border));
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: hsl(var(--accent));
  }
`;

if (typeof window !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
