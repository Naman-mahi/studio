
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
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
import StudyStreakTracker from "@/components/study-streak-tracker"; 

const CACHE_KEYS = [
  "ai-qa-chat-messages",
  "chat-support-messages",
  "ai-solver-cached-input",
  "ai-solver-cached-result",
  "practice-questions-cache",
  "current-affairs-cache",
  "studyStreakData",
];

const featureCardColors = [
  "bg-sky-600 text-white",
  "bg-emerald-600 text-white",
  "bg-purple-600 text-white",
  "bg-rose-600 text-white",
  "bg-amber-500 text-black",
  "bg-teal-600 text-white",
];

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  linkHref: string;
  linkText: string;
  bgColorClass: string;
  titleForColorBox: string;
}

function FeatureCard({ icon: Icon, title, description, linkHref, linkText, bgColorClass, titleForColorBox }: FeatureCardProps) {
  return (
    <Card className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-xl md:text-2xl">
          <Icon className="text-accent w-6 h-6 md:w-7 md:h-7" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow p-6 pt-0">
        <div className={`h-40 rounded-md mb-4 flex items-center justify-center ${bgColorClass} shadow-md`}>
          <h3 className="text-xl font-semibold text-center px-2">{titleForColorBox}</h3>
        </div>
        <Button asChild className="w-full mt-auto shadow-md hover:shadow-lg transition-shadow">
          <Link href={linkHref}>{linkText}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

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
     window.location.reload(); 
  };

  const features = [
    { icon: Cpu, title: "AI Question Solver", description: "Upload question papers and get AI-powered solutions and answer keys.", linkHref: "/ai-solver", linkText: "Try AI Solver", titleForColorBox: "AI Solver" },
    { icon: ListChecks, title: "Targeted Practice", description: "Generate practice questions based on specific RRB NTPC topics and subjects.", linkHref: "/practice-questions", linkText: "Create Quiz", titleForColorBox: "Practice Quiz" },
    { icon: MessagesSquare, title: "Instant Chat Support", description: "Engage with our AI tutor for question clarification and discussion.", linkHref: "/chat-support", linkText: "Start Chatting", titleForColorBox: "AI Tutor Chat" },
    { icon: NotebookText, title: "Past Papers", description: "Review previous RRB NTPC exam papers to understand patterns.", linkHref: "/past-papers", linkText: "Explore Papers", titleForColorBox: "Past Papers" },
    { icon: MessageCircleQuestion, title: "AI Q&A Assistant", description: "Get quick answers to your general knowledge and exam-related queries.", linkHref: "/ai-qa-chat", linkText: "Ask AI", titleForColorBox: "AI Q&A" },
    { icon: Newspaper, title: "Current Affairs", description: "Stay updated with the latest current events relevant for your exams.", linkHref: "/current-affairs", linkText: "Get Updates", titleForColorBox: "Current Affairs" },
  ];


  return (
    <div className="space-y-8">
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
              <Button variant="outline" className="shrink-0 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive shadow-sm hover:shadow-md transition-shadow">
                <Trash2 className="mr-2 h-4 w-4" /> Clear Cached Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="shadow-xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently delete all cached data from this application in your browser,
                  including chat histories, saved inputs, generated content, and study streak progress. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearCache} className="bg-destructive hover:bg-destructive/90 shadow-md hover:shadow-lg">
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

      <StudyStreakTracker />

      <section>
        <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-6 text-foreground">Explore Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              linkHref={feature.linkHref}
              linkText={feature.linkText}
              bgColorClass={featureCardColors[index % featureCardColors.length]}
              titleForColorBox={feature.titleForColorBox}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

