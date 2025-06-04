
"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { askGeneralQuestion } from "@/app/(app)/ai-qa-chat/actions";
import { useToast } from "@/hooks/use-toast";
import { Send, User, Bot } from "lucide-react";
import { LoadingIndicator } from "@/components/loading-indicator";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const AI_QA_CHAT_MESSAGES_KEY = "ai-qa-chat-messages";

export default function AiQaChatView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const cachedMessages = localStorage.getItem(AI_QA_CHAT_MESSAGES_KEY);
      if (cachedMessages) {
        setMessages(JSON.parse(cachedMessages));
      }
    } catch (error) {
      console.error("Failed to load messages from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(AI_QA_CHAT_MESSAGES_KEY, JSON.stringify(messages));
      } catch (error) {
        console.error("Failed to save messages to localStorage", error);
        toast({ title: "Cache Error", description: "Could not save chat history locally.", variant: "destructive" });
      }
    }
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, toast]);
  
  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const previousMessagesForAI = messages.map(m => ({ role: m.role, content: m.content }));
      const aiResponse = await askGeneralQuestion({
        question: userMessage.content,
        previousMessages: previousMessagesForAI.slice(-10), // Send last 10 messages for context
      });
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse.answer,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to get response from AI.", variant: "destructive" });
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
      <h1 className="text-3xl font-headline font-bold mb-6">AI Q&A Chat</h1>
      <Card className="flex-grow flex flex-col shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Ask the AI Assistant</CardTitle>
          <CardDescription>Get direct answers to your questions about RRB NTPC topics or general knowledge. Chat history is saved locally.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col p-0">
          <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end gap-2 ${
                    message.role === "user" ? "justify-end" : ""
                  }`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                      <AvatarFallback><Bot size={18}/></AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg p-3 text-sm whitespace-pre-wrap shadow ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {message.content}
                  </div>
                  {message.role === "user" && (
                     <Avatar className="h-8 w-8 bg-accent text-accent-foreground">
                       <AvatarFallback><User size={18}/></AvatarFallback>
                     </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-end gap-2">
                   <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                      <AvatarFallback><Bot size={18}/></AvatarFallback>
                    </Avatar>
                  <div className="max-w-[70%] rounded-lg p-3 text-sm bg-muted text-muted-foreground shadow">
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
              <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
