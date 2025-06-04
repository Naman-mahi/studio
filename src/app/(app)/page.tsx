
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Cpu, ListChecks, MessagesSquare, NotebookText, MessageCircleQuestion, Newspaper, Settings, GraduationCap } from "lucide-react";
import StudyStreakTracker from "@/components/study-streak-tracker";

const featureCardColors = [
  "bg-sky-600 text-white",
  "bg-emerald-600 text-white",
  "bg-purple-600 text-white",
  "bg-rose-600 text-white",
  "bg-amber-500 text-black",
  "bg-teal-600 text-white",
  "bg-indigo-600 text-white",
  "bg-slate-600 text-white",
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
  const features = [
    { icon: ListChecks, title: "AI Quiz Generator", description: "Generate custom quizzes with varying difficulty based on specific RRB NTPC topics.", linkHref: "/ai-quiz-generator", linkText: "Create Quiz", titleForColorBox: "AI Quiz" },
    { icon: Cpu, title: "AI Question Solver", description: "Upload question papers and get AI-powered solutions and answer keys.", linkHref: "/ai-solver", linkText: "Try AI Solver", titleForColorBox: "AI Solver" },
    { icon: GraduationCap, title: "Topic AI Tutor", description: "Select a subject & topic for focused AI guidance and clarification.", linkHref: "/topic-ai-tutor", linkText: "Start Session", titleForColorBox: "Topic Tutor" },
    { icon: MessageCircleQuestion, title: "AI Q&A Assistant", description: "Get quick answers to your general knowledge and exam-related queries.", linkHref: "/ai-qa-chat", linkText: "Ask AI", titleForColorBox: "AI Q&A" },
    { icon: MessagesSquare, title: "Chat Support (General)", description: "Engage with our AI for general question clarification and discussion.", linkHref: "/chat-support", linkText: "Start Chatting", titleForColorBox: "General AI Chat" },
    { icon: NotebookText, title: "Past Papers", description: "Review previous RRB NTPC exam papers to understand patterns.", linkHref: "/past-papers", linkText: "Explore Papers", titleForColorBox: "Past Papers" },
    { icon: Newspaper, title: "Current Affairs", description: "Stay updated with the latest current events relevant for your exams.", linkHref: "/current-affairs", linkText: "Get Updates", titleForColorBox: "Current Affairs" },
    { icon: Settings, title: "Settings", description: "Customize your application experience, like AI language preference and clear cached data.", linkHref: "/settings", linkText: "Go to Settings", titleForColorBox: "Settings" },
  ];

  return (
    <div className="space-y-8">
      <section className="bg-card p-6 md:p-8 rounded-lg shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-2">Welcome to PrepPal AI!</h1>
            <p className="text-md md:text-lg text-muted-foreground mb-4 sm:mb-0">
              Your ultimate AI companion for exam preparation.
            </p>
          </div>
        </div>
         <p className="text-muted-foreground mb-6 text-sm">
          Set daily goals, access past papers, get AI-powered solutions,
          clarify doubts with our chat support, and generate practice questions tailored to your needs.
        </p>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <Button asChild size="lg" className="shadow-md hover:shadow-lg transition-shadow bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/ai-quiz-generator">Create Custom Quiz</Link>
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

