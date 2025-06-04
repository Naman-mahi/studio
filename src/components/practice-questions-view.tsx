
"use client";

import { useState, type FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generatePracticeQuestions } from "@/app/(app)/practice-questions/actions";
import type { PracticeQuestionGeneratorOutput } from "@/ai/flows/practice-question-generator";
import toast from 'react-hot-toast';
import { LoadingIndicator } from "@/components/loading-indicator";

interface GeneratedQuestion {
  question: string;
  answer: string;
  explanation?: string;
}

interface PracticeQuestionsCache {
  subject: string;
  topic: string;
  numQuestions: number;
  generatedQuestions: GeneratedQuestion[];
}

const PRACTICE_QUESTIONS_CACHE_KEY = "practice-questions-cache";

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

export default function PracticeQuestionsView() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);

  useEffect(() => {
    try {
      const cachedData = localStorage.getItem(PRACTICE_QUESTIONS_CACHE_KEY);
      if (cachedData) {
        const parsedCache: PracticeQuestionsCache = JSON.parse(cachedData);
        setSubject(parsedCache.subject);
        if (rrbNTPCSubjectsAndTopics[parsedCache.subject]?.includes(parsedCache.topic)) {
          setTopic(parsedCache.topic);
        } else {
          setTopic(""); 
        }
        setNumQuestions(parsedCache.numQuestions);
        setGeneratedQuestions(parsedCache.generatedQuestions);
      }
    } catch (error) {
      console.error("Failed to load practice questions cache from localStorage", error);
    }
  }, []);

  useEffect(() => {
    const cacheData: PracticeQuestionsCache = { subject, topic, numQuestions, generatedQuestions };
    try {
      localStorage.setItem(PRACTICE_QUESTIONS_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Failed to save practice questions to localStorage", error);
    }
  }, [subject, topic, numQuestions, generatedQuestions]);

  const handleSubjectChange = (selectedSubject: string) => {
    setSubject(selectedSubject);
    setTopic(""); 
    setGeneratedQuestions([]); 
  };
  
  const handleTopicChange = (selectedTopic: string) => {
    setTopic(selectedTopic);
    setGeneratedQuestions([]); 
  };

  const handleNumQuestionsChange = (value: number) => {
    setNumQuestions(value);
    setGeneratedQuestions([]); 
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!subject) {
      toast.error("Please select a subject.");
      return;
    }
    if (!topic) {
      toast.error("Please select a topic.");
      return;
    }

    setIsLoading(true);

    try {
      const output: PracticeQuestionGeneratorOutput = await generatePracticeQuestions({
        topic,
        subject,
        numQuestions,
      });
      setGeneratedQuestions(output.questions);
      if (output.questions.length === 0) {
        toast("The AI couldn't generate questions for the given inputs. Try different topics or subjects.");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to generate questions.");
    } finally {
      setIsLoading(false);
    }
  };

  const availableTopics = subject ? rrbNTPCSubjectsAndTopics[subject] || [] : [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold">Practice Question Generator</h1>
      <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
        <CardHeader>
          <CardTitle className="font-headline">Generate Custom Quiz</CardTitle>
          <CardDescription>
            Select a subject, topic, and the number of questions you want to generate for your RRB NTPC 2025 practice. Your selections and generated questions are cached locally.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select value={subject} onValueChange={handleSubjectChange} disabled={isLoading} name="subject-select">
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
                <Select value={topic} onValueChange={handleTopicChange} disabled={isLoading || !subject || availableTopics.length === 0} name="topic-select">
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
              <div className="space-y-2">
                <Label htmlFor="numQuestions">Number of Questions</Label>
                <Input
                  id="numQuestions"
                  type="number"
                  min="1"
                  max="20"
                  value={numQuestions}
                  onChange={(e) => handleNumQuestionsChange(parseInt(e.target.value, 10))}
                  disabled={isLoading}
                  required
                  suppressHydrationWarning
                />
              </div>
            </div>
            <Button type="submit" disabled={isLoading || !subject || !topic} className="w-full md:w-auto shadow-md hover:shadow-lg">
              {isLoading ? <LoadingIndicator size={20} className="mr-2" /> : null}
              Generate Questions
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
         <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <LoadingIndicator size={48} />
            <p className="mt-4 text-muted-foreground">AI is generating questions, please wait...</p>
          </CardContent>
        </Card>
      )}

      {generatedQuestions.length > 0 && (
        <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
          <CardHeader>
            <CardTitle className="font-headline">Generated Questions for {topic} ({subject})</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {generatedQuestions.map((q, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="font-semibold hover:no-underline text-left">
                    Question {index + 1}: {q.question}
                  </AccordionTrigger>
                  <AccordionContent className="bg-muted/50 p-3 rounded-md shadow-inner">
                    <p className="font-medium text-primary mb-1">Answer: {q.answer}</p>
                    {q.explanation && (
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Explanation:</strong> {q.explanation}
                      </p>
                    )}
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
