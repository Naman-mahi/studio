
"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { askTopicTutor } from "@/app/(app)/topic-ai-tutor/actions";
import { useToast } from "@/hooks/use-toast";
import { Send, User, Bot, GraduationCap } from "lucide-react";
import { LoadingIndicator } from "@/components/loading-indicator";
import type { QuestionClarificationChatInput } from '@/ai/flows/question-clarification-chat';

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const TOPIC_AI_TUTOR_MESSAGES_KEY_PREFIX = "topic-ai-tutor-messages";
const TOPIC_AI_TUTOR_SELECTION_KEY = "topic-ai-tutor-selection";

const rrbNTPCSubjectsAndTopics: Record<string, string[]> = {
  "Mathematics": [
    "Number System", "Decimals", "Fractions", "LCM and HCF", "Ratio and Proportion",
    "Percentage", "Mensuration", "Time and Work", "Time and Distance",
    "Simple and Compound Interest", "Profit and Loss", "Elementary Algebra",
    "Geometry and Trigonometry", "Elementary Statistics"
  ],
  "General Intelligence and Reasoning": [
    "Analogies", "Completion of Number and Alphabetical Series", "Coding and Decoding",
    "Mathematical Operations", "Similarities and Differences", "Relationships",
    "Analytical Reasoning", "Syllogism", "Jumbling", "Venn Diagrams",
    "Puzzle", "Data Sufficiency", "Statement-Conclusion", "Statement-Courses of Action",
    "Decision Making", "Maps", "Interpretation of Graphs"
  ],
  "General Awareness": [
    "Current Events of National and International Importance", "Games and Sports",
    "Art and Culture of India", "Indian Literature", "Monuments and Places of India",
    "General Science and Life Science (up to 10th CBSE)",
    "History of India and Freedom Struggle", "Physical, Social and Economic Geography of India and World",
    "Indian Polity and Governance - Constitution and Political System",
    "General Scientific and Technological Developments including Space and Nuclear Program of India",
    "UN and Other important World Organizations", "Environmental Issues Concerning India and World at Large",
    "Basics of Computers and Computer Applications", "Common Abbreviations",
    "Transport Systems in India", "Indian Economy", "Famous Personalities of India and World",
    "Flagship Government Programs", "Flora and Fauna of India",
    "Important Government and Public Sector Organizations of India"
  ],
};
const subjectOptions = Object.keys(rrbNTPCSubjectsAndTopics);

interface TutorSelection {
  subject: string;
  topic: string;
}

export default function TopicAiTutorView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [isTopicSelected, setIsTopicSelected] = useState(false);

  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const getCacheKey = (currentSubject: string, currentTopic: string) => {
    if (!currentSubject || !currentTopic) return null;
    return `${TOPIC_AI_TUTOR_MESSAGES_KEY_PREFIX}-${currentSubject}-${currentTopic}`;
  };

  useEffect(() => {
    try {
      const cachedSelection = localStorage.getItem(TOPIC_AI_TUTOR_SELECTION_KEY);
      if (cachedSelection) {
        const { subject: cachedSubject, topic: cachedTopic }: TutorSelection = JSON.parse(cachedSelection);
        setSubject(cachedSubject);
        if (rrbNTPCSubjectsAndTopics[cachedSubject]?.includes(cachedTopic)) {
          setTopic(cachedTopic);
          setIsTopicSelected(true);
          const messageCacheKey = getCacheKey(cachedSubject, cachedTopic);
          if (messageCacheKey) {
            const cachedMessages = localStorage.getItem(messageCacheKey);
            if (cachedMessages) setMessages(JSON.parse(cachedMessages));
          }
        } else {
           localStorage.removeItem(TOPIC_AI_TUTOR_SELECTION_KEY); // clear invalid selection
        }
      }
    } catch (error) {
      console.error("Failed to load topic tutor selection/messages from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (isTopicSelected && subject && topic) {
      const selectionCache: TutorSelection = { subject, topic };
      localStorage.setItem(TOPIC_AI_TUTOR_SELECTION_KEY, JSON.stringify(selectionCache));
      
      const messageCacheKey = getCacheKey(subject, topic);
      if (messageCacheKey && messages.length > 0) {
        localStorage.setItem(messageCacheKey, JSON.stringify(messages));
      }
    }
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, subject, topic, isTopicSelected, toast]);

  const handleSubjectChange = (selectedSubject: string) => {
    setSubject(selectedSubject);
    setTopic("");
    setMessages([]);
    setIsTopicSelected(false);
    const messageCacheKey = getCacheKey(subject, topic); // old subject/topic
    if(messageCacheKey) localStorage.removeItem(messageCacheKey);
  };
  
  const handleTopicChange = (selectedTopic: string) => {
    setTopic(selectedTopic);
    setMessages([]);
    setIsTopicSelected(false);
     const messageCacheKey = getCacheKey(subject, topic); // old subject/topic
    if(messageCacheKey) localStorage.removeItem(messageCacheKey);
  };

  const handleStartChat = () => {
    if (!subject || !topic) {
      toast({ title: "Selection Incomplete", description: "Please select both subject and topic.", variant: "destructive" });
      return;
    }
    setIsTopicSelected(true);
    // Load messages if any for this new selection
    const messageCacheKey = getCacheKey(subject, topic);
    if (messageCacheKey) {
        const cachedMessages = localStorage.getItem(messageCacheKey);
        if (cachedMessages) setMessages(JSON.parse(cachedMessages));
        else setMessages([]);
    }
  };

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!input.trim() || !isTopicSelected) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const previousMessagesForAI = messages.map(m => ({ role: m.role, content: m.content }));
      const payload: QuestionClarificationChatInput = {
        question: userMessage.content,
        subject: subject,
        topic: topic,
        previousMessages: previousMessagesForAI.slice(-10),
      };
      const aiResponse = await askTopicTutor(payload);
      
      const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: aiResponse.answer };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to get response from AI.", variant: "destructive" });
      const assistantErrorMessage: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: "Sorry, I couldn't process your request." };
      setMessages((prev) => [...prev, assistantErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const availableTopics = subject ? rrbNTPCSubjectsAndTopics[subject] || [] : [];

  return (
    <div className="space-y-6 h-[calc(100vh-10rem)] flex flex-col">
      <h1 className="text-3xl font-headline font-bold">Topic AI Tutor</h1>
      
      {!isTopicSelected ? (
        <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
          <CardHeader>
            <CardTitle className="font-headline">Select Subject and Topic</CardTitle>
            <CardDescription>Choose a subject and topic to start a focused tutoring session.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select value={subject} onValueChange={handleSubjectChange} name="subject-select">
                  <SelectTrigger id="subject" suppressHydrationWarning>
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectOptions.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Select value={topic} onValueChange={handleTopicChange} disabled={!subject || availableTopics.length === 0} name="topic-select">
                  <SelectTrigger id="topic" suppressHydrationWarning>
                    <SelectValue placeholder="Select Topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTopics.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleStartChat} disabled={!subject || !topic} className="w-full md:w-auto shadow-md hover:shadow-lg">
              <GraduationCap className="mr-2 h-5 w-5" /> Start Tutor Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="flex-grow flex flex-col shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="font-headline">AI Tutor: {topic} ({subject})</CardTitle>
                    <CardDescription>Ask questions about {topic}. The AI will guide you.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                    setIsTopicSelected(false);
                    setMessages([]); // Clear messages when changing topic
                     const messageCacheKey = getCacheKey(subject, topic);
                     if(messageCacheKey) localStorage.removeItem(messageCacheKey);
                }}>
                    Change Topic
                </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col p-0">
            <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex items-end gap-2 ${message.role === "user" ? "justify-end" : ""}`}>
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8 bg-primary text-primary-foreground shadow-sm">
                        <AvatarFallback><Bot size={18}/></AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-[70%] rounded-lg p-3 text-sm shadow-md whitespace-pre-wrap ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {message.content}
                    </div>
                    {message.role === "user" && (
                       <Avatar className="h-8 w-8 bg-accent text-accent-foreground shadow-sm">
                         <AvatarFallback><User size={18}/></AvatarFallback>
                       </Avatar>
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
                  placeholder="Ask about the selected topic..."
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
      )}
    </div>
  );
}
