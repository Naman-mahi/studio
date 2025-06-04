
"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { questionClarificationChat } from "@/app/(app)/chat-support/actions";
import toast from 'react-hot-toast';
import { Send, User, Bot, Bookmark } from "lucide-react"; // Added Bookmark
import { LoadingIndicator } from "@/components/loading-indicator";
import { getStoredLanguage } from "./settings-view";
import { getBookmarks, addBookmark, removeBookmark, isMessageBookmarked, findBookmarkId, type BookmarkedMessage } from "@/lib/bookmarks";


interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const CHAT_SUPPORT_MESSAGES_KEY = "chat-support-messages";
const CHAT_SOURCE = "Chat Support (General)";

export default function ChatSupportView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [bookmarks, setBookmarks] = useState<BookmarkedMessage[]>([]);

  useEffect(() => {
    setCurrentLanguage(getStoredLanguage());
    setBookmarks(getBookmarks());
    try {
      const cachedMessages = localStorage.getItem(CHAT_SUPPORT_MESSAGES_KEY);
      if (cachedMessages) {
        setMessages(JSON.parse(cachedMessages));
      }
    } catch (error) {
      console.error("Failed to load messages from localStorage", error);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentLanguage(getStoredLanguage());
      setBookmarks(getBookmarks());
    };
    window.addEventListener('storage', handleStorageChange);
     const interval = setInterval(() => {
        const lang = getStoredLanguage();
        if (lang !== currentLanguage) {
            setCurrentLanguage(lang);
        }
        const currentStoredBookmarks = getBookmarks();
        if (JSON.stringify(currentStoredBookmarks) !== JSON.stringify(bookmarks)) {
            setBookmarks(currentStoredBookmarks);
        }
    }, 1000);

    if (messages.length > 0) {
      try {
        localStorage.setItem(CHAT_SUPPORT_MESSAGES_KEY, JSON.stringify(messages));
      } catch (error) {
        console.error("Failed to save messages to localStorage", error);
        toast.error("Could not save chat history locally.");
      }
    }
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
     return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(interval);
    }
  }, [messages, currentLanguage, bookmarks]);
  
  const handleToggleBookmark = (message: Message) => {
    if (message.role !== 'assistant') return;
    const alreadyBookmarkedId = findBookmarkId(message.id, CHAT_SOURCE);
    if (alreadyBookmarkedId) {
      setBookmarks(removeBookmark(alreadyBookmarkedId));
      toast.success("Bookmark removed");
    } else {
      setBookmarks(addBookmark(message, messages, CHAT_SOURCE));
      toast.success("Message bookmarked!");
    }
  };

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const previousMessagesForAI = updatedMessages.map(m => ({ role: m.role, content: m.content }));
      const lang = getStoredLanguage();
      const aiResponse = await questionClarificationChat({
        question: userMessage.content,
        previousMessages: previousMessagesForAI.slice(-10), 
        language: lang,
      });
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse.answer,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (e: any) {
      toast.error(e.message || "Failed to get response from AI.");
       const assistantErrorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I couldn't process your request at the moment.",
      };
      setMessages((prev) => [...prev, assistantErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col">
      <h1 className="text-3xl font-headline font-bold mb-6">General AI Chat Support</h1>
      <Card className="flex-grow flex flex-col shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
        <CardHeader>
          <CardTitle className="font-headline">Chat with General AI Tutor</CardTitle>
          <CardDescription>Ask general questions about RRB NTPC topics, clarify doubts, or discuss problems. Chat history is saved locally. AI responses will attempt to use your preferred language setting. You can bookmark helpful AI responses.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col p-0">
          <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end gap-2 group ${
                    message.role === "user" ? "justify-end" : ""
                  }`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground shadow-sm">
                      <AvatarFallback><Bot size={18}/></AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg p-3 text-sm shadow-md whitespace-pre-wrap ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {message.content}
                  </div>
                  {message.role === "user" && (
                     <Avatar className="h-8 w-8 bg-accent text-accent-foreground shadow-sm">
                       <AvatarFallback><User size={18}/></AvatarFallback>
                     </Avatar>
                  )}
                  {message.role === "assistant" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 p-1 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleToggleBookmark(message)}
                      title={isMessageBookmarked(message.id, CHAT_SOURCE) ? "Remove bookmark" : "Bookmark message"}
                    >
                      <Bookmark className={`h-4 w-4 ${isMessageBookmarked(message.id, CHAT_SOURCE) ? 'fill-yellow-400 text-yellow-500' : ''}`} />
                    </Button>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-end gap-2">
                   <Avatar className="h-8 w-8 bg-primary text-primary-foreground shadow-sm">
                      <AvatarFallback><Bot size={18}/></AvatarFallback>
                    </Avatar>
                  <div className="max-w-[70%] rounded-lg p-3 text-sm bg-muted text-muted-foreground shadow-md">
                    <LoadingIndicator size={20} />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                disabled={isLoading}
                className="flex-grow"
                suppressHydrationWarning
              />
              <Button type="submit" disabled={isLoading || !input.trim()} size="icon" className="shadow-md hover:shadow-lg">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
