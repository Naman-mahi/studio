"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { generatePracticeQuestions } from "@/app/(app)/practice-questions/actions";
import type { PracticeQuestionGeneratorOutput } from "@/ai/flows/practice-question-generator";
import { useToast } from "@/hooks/use-toast";
import { LoadingIndicator } from "@/components/loading-indicator";

interface GeneratedQuestion {
  question: string;
  answer: string;
}

export default function PracticeQuestionsView() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setGeneratedQuestions([]);

    try {
      const output = await generatePracticeQuestions({
        topic,
        subject,
        numQuestions,
      });
      setGeneratedQuestions(output.questions);
       if (output.questions.length === 0) {
        toast({ title: "No Questions Generated", description: "The AI couldn't generate questions for the given inputs. Try different topics or subjects.", variant: "default" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to generate questions.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold">Practice Question Generator</h1>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Generate Custom Quiz</CardTitle>
          <CardDescription>
            Enter a topic, subject, and the number of questions you want to generate for your RRB NTPC practice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Algebra, Indian History"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Mathematics, General Awareness"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numQuestions">Number of Questions</Label>
                <Input
                  id="numQuestions"
                  type="number"
                  min="1"
                  max="20"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value, 10))}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? <LoadingIndicator size={20} className="mr-2" /> : null}
              Generate Questions
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
         <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <LoadingIndicator size={48} />
            <p className="mt-4 text-muted-foreground">AI is generating questions, please wait...</p>
          </CardContent>
        </Card>
      )}

      {generatedQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Generated Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {generatedQuestions.map((q, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="font-semibold hover:no-underline">
                    Question {index + 1}: {q.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="font-medium text-primary">Answer: {q.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
