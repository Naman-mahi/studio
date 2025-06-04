import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Lightbulb, CheckCircle, Zap } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="bg-card p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-headline font-bold text-primary mb-4">Welcome to NTPC Prep Ace!</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Your ultimate companion for RRB NTPC exam preparation. Access past papers, get AI-powered solutions,
          clarify doubts with our chat support, and generate practice questions tailored to your needs.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/past-papers">Explore Past Papers</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/practice-questions">Generate Practice Questions</Link>
          </Button>
        </div>
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-md hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-2xl">
              <Lightbulb className="text-accent w-7 h-7" />
              AI Question Solver
            </CardTitle>
            <CardDescription>Upload question papers and get AI-powered solutions and answer keys.</CardDescription>
          </CardHeader>
          <CardContent>
            <Image src="https://placehold.co/600x400.png" alt="AI Solver illustration" data-ai-hint="artificial intelligence technology" width={600} height={400} className="rounded-md mb-4" />
            <Button asChild className="w-full">
              <Link href="/ai-solver">Try AI Solver</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-2xl">
              <CheckCircle className="text-accent w-7 h-7" />
              Targeted Practice
            </CardTitle>
            <CardDescription>Generate practice questions based on specific RRB NTPC topics and subjects.</CardDescription>
          </CardHeader>
          <CardContent>
            <Image src="https://placehold.co/600x400.png" alt="Practice questions illustration" data-ai-hint="study exam preparation" width={600} height={400} className="rounded-md mb-4" />
            <Button asChild className="w-full">
              <Link href="/practice-questions">Create Quiz</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-2xl">
              <Zap className="text-accent w-7 h-7" />
              Instant Chat Support
            </CardTitle>
            <CardDescription>Engage in a chat interface for question clarification and discussion with our AI tutor.</CardDescription>
          </CardHeader>
          <CardContent>
            <Image src="https://placehold.co/600x400.png" alt="Chat support illustration" data-ai-hint="communication support" width={600} height={400} className="rounded-md mb-4" />
            <Button asChild className="w-full">
              <Link href="/chat-support">Start Chatting</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
