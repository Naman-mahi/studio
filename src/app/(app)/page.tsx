
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Lightbulb, CheckCircle, Zap, Trash2, Newspaper, NotebookText, ListChecks, MessageCircleQuestion, MessagesSquare, Cpu } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import StudyStreakTracker from "@/components/study-streak-tracker"; // Import the new component

// Define keys for localStorage items
const CACHE_KEYS = [
  "ai-qa-chat-messages",
  "chat-support-messages",
  "ai-solver-cached-input",
  "ai-solver-cached-result",
  "practice-questions-cache",
  "current-affairs-cache",
  "studyStreakData", // Add the new key for streak data
];


export default function DashboardPage() {
  const { toast } = useToast();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleClearCache = () => {
    try {
      CACHE_KEYS.forEach(key => localStorage.removeItem(key));
      toast({
        title: "Cache Cleared",
        description: "All locally stored application data has been cleared.",
      });
    } catch (error) {
      console.error("Failed to clear cache:", error);
      toast({
        title: "Error Clearing Cache",
        description: "Could not clear all cached data. Please try again.",
        variant: "destructive",
      });
    }
    setIsAlertOpen(false);
     // Optionally, reload the page or specific components to reflect cleared state
     window.location.reload(); 
  };


  return (
    <div className="space-y-8"> {/* Increased spacing */}
      <section className="bg-card p-6 md:p-8 rounded-lg shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-2">Welcome to NTPC Prep Ace!</h1>
            <p className="text-md md:text-lg text-muted-foreground mb-4 sm:mb-0">
              Your ultimate companion for RRB NTPC 2025 exam preparation.
            </p>
          </div>
          <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="shrink-0 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Clear Cached Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently delete all cached data from this application in your browser,
                  including chat histories, saved inputs, generated content, and study streak progress. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearCache} className="bg-destructive hover:bg-destructive/90">
                  Yes, clear cache
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
         <p className="text-muted-foreground mb-6 text-sm">
          Set daily goals, access past papers, get AI-powered solutions,
          clarify doubts with our chat support, and generate practice questions tailored to your needs.
        </p>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <Button asChild size="lg" className="shadow-md hover:shadow-lg transition-shadow bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/practice-questions">Create Custom Quiz</Link>
          </Button>
           <Button asChild variant="secondary" size="lg" className="shadow-md hover:shadow-lg transition-shadow">
            <Link href="/current-affairs">Read Current Affairs</Link>
          </Button>
        </div>
      </section>

      {/* Study Streak Tracker Card */}
      <StudyStreakTracker />

      <section>
        <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-6 text-foreground">Explore Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline text-xl md:text-2xl">
                <Cpu className="text-accent w-6 h-6 md:w-7 md:h-7" />
                AI Question Solver
              </CardTitle>
              <CardDescription>Upload question papers and get AI-powered solutions and answer keys.</CardDescription>
            </CardHeader>
            <CardContent>
              <Image src="https://placehold.co/600x400.png" alt="AI Solver illustration" data-ai-hint="artificial intelligence technology" width={600} height={400} className="rounded-md mb-4 aspect-[3/2] object-cover" />
              <Button asChild className="w-full">
                <Link href="/ai-solver">Try AI Solver</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline text-xl md:text-2xl">
                <ListChecks className="text-accent w-6 h-6 md:w-7 md:h-7" />
                Targeted Practice
              </CardTitle>
              <CardDescription>Generate practice questions based on specific RRB NTPC topics and subjects.</CardDescription>
            </CardHeader>
            <CardContent>
              <Image src="https://placehold.co/600x400.png" alt="Practice questions illustration" data-ai-hint="study exam preparation" width={600} height={400} className="rounded-md mb-4 aspect-[3/2] object-cover" />
              <Button asChild className="w-full">
                <Link href="/practice-questions">Create Quiz</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline text-xl md:text-2xl">
                <MessagesSquare className="text-accent w-6 h-6 md:w-7 md:h-7" />
                Instant Chat Support
              </CardTitle>
              <CardDescription>Engage with our AI tutor for question clarification and discussion.</CardDescription>
            </CardHeader>
            <CardContent>
              <Image src="https://placehold.co/600x400.png" alt="Chat support illustration" data-ai-hint="communication support" width={600} height={400} className="rounded-md mb-4 aspect-[3/2] object-cover" />
              <Button asChild className="w-full">
                <Link href="/chat-support">Start Chatting</Link>
              </Button>
            </CardContent>
          </Card>

           <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline text-xl md:text-2xl">
                <NotebookText className="text-accent w-6 h-6 md:w-7 md:h-7" />
                Past Papers
              </CardTitle>
              <CardDescription>Review previous RRB NTPC exam papers to understand patterns.</CardDescription>
            </CardHeader>
            <CardContent>
              <Image src="https://placehold.co/600x400.png" alt="Past papers illustration" data-ai-hint="archive documents" width={600} height={400} className="rounded-md mb-4 aspect-[3/2] object-cover" />
              <Button asChild className="w-full">
                <Link href="/past-papers">Explore Papers</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline text-xl md:text-2xl">
                <MessageCircleQuestion className="text-accent w-6 h-6 md:w-7 md:h-7" />
                 AI Q&A Assistant
              </CardTitle>
              <CardDescription>Get quick answers to your general knowledge and exam-related queries.</CardDescription>
            </CardHeader>
            <CardContent>
              <Image src="https://placehold.co/600x400.png" alt="AI Q&A illustration" data-ai-hint="question answer" width={600} height={400} className="rounded-md mb-4 aspect-[3/2] object-cover" />
              <Button asChild className="w-full">
                <Link href="/ai-qa-chat">Ask AI</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline text-xl md:text-2xl">
                <Newspaper className="text-accent w-6 h-6 md:w-7 md:h-7" />
                Current Affairs
              </CardTitle>
              <CardDescription>Stay updated with the latest current events relevant for your exams.</CardDescription>
            </CardHeader>
            <CardContent>
              <Image src="https://placehold.co/600x400.png" alt="Current affairs illustration" data-ai-hint="news update" width={600} height={400} className="rounded-md mb-4 aspect-[3/2] object-cover" />
              <Button asChild className="w-full">
                <Link href="/current-affairs">Get Updates</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

