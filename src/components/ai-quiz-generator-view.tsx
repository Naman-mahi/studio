
"use client";

import { useState, type FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateQuizQuestions } from "@/app/(app)/ai-quiz-generator/actions";
import type { QuizQuestionGeneratorOutput } from '@/ai/flows/practice-question-generator';
import toast from 'react-hot-toast';
import { LoadingIndicator } from "@/components/loading-indicator";
import { getStoredLanguage } from "./settings-view";
import { ArrowLeft, ArrowRight, CheckCircle, HelpCircle, ListChecks, RotateCcw, XCircle } from "lucide-react";

interface GeneratedQuestion {
  question: string;
  answer: string;
  explanation?: string;
}

interface UserAnswer {
  questionIndex: number;
  isCorrect: boolean | null; // null if not yet assessed
}

interface QuizConfig {
  subject: string;
  topic: string;
  numQuestions: number;
  difficulty: "Easy" | "Medium" | "Hard";
}

interface AiQuizGeneratorCache {
  config: QuizConfig;
  generatedQuestions: GeneratedQuestion[];
}

const AI_QUIZ_GENERATOR_CACHE_KEY = "ai-quiz-generator-cache";

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
const difficultyOptions: Array<QuizConfig["difficulty"]> = ["Easy", "Medium", "Hard"];

type QuizState = "configuring" | "generating" | "taking" | "results";

export default function AiQuizGeneratorView() {
  const [isLoading, setIsLoading] = useState(false);
  const [quizState, setQuizState] = useState<QuizState>("configuring");
  const [quizConfig, setQuizConfig] = useState<QuizConfig>({
    subject: "",
    topic: "",
    numQuestions: 5,
    difficulty: "Medium",
  });
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    setCurrentLanguage(getStoredLanguage());
    try {
      const cachedData = localStorage.getItem(AI_QUIZ_GENERATOR_CACHE_KEY);
      if (cachedData) {
        const parsedCache: AiQuizGeneratorCache = JSON.parse(cachedData);
        setQuizConfig(parsedCache.config);
        // setGeneratedQuestions(parsedCache.generatedQuestions); // Don't load questions, let user re-generate
      }
    } catch (error) {
      console.error("Failed to load quiz config from localStorage", error);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentLanguage(getStoredLanguage());
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const lang = getStoredLanguage();
      if (lang !== currentLanguage) {
        setCurrentLanguage(lang);
        // If language changes, it's better to reset to config to avoid language mismatch in quiz
        setQuizState("configuring");
        setGeneratedQuestions([]);
        setUserAnswers([]);
      }
    }, 1000);

    const cacheData: AiQuizGeneratorCache = { config: quizConfig, generatedQuestions };
    try {
      localStorage.setItem(AI_QUIZ_GENERATOR_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Failed to save quiz config to localStorage", error);
    }
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [quizConfig, generatedQuestions, currentLanguage]);

  const handleConfigChange = (field: keyof QuizConfig, value: any) => {
    setQuizConfig(prev => ({ ...prev, [field]: value }));
    setGeneratedQuestions([]);
    setUserAnswers([]);
    setQuizState("configuring");
  };

  const handleSubmitConfig = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!quizConfig.subject) {
      toast.error("Please select a subject.");
      return;
    }
    if (!quizConfig.topic) {
      toast.error("Please select a topic.");
      return;
    }

    setIsLoading(true);
    setQuizState("generating");
    setGeneratedQuestions([]);
    setUserAnswers([]);

    try {
      const lang = getStoredLanguage();
      const output: QuizQuestionGeneratorOutput = await generateQuizQuestions({
        ...quizConfig,
        language: lang,
      });
      if (output.questions.length > 0) {
        setGeneratedQuestions(output.questions);
        setUserAnswers(output.questions.map((_, index) => ({ questionIndex: index, isCorrect: null })));
        setCurrentQuestionIndex(0);
        setShowAnswer(false);
        setQuizState("taking");
      } else {
        toast("The AI couldn't generate questions for the given inputs. Try different topics or subjects.", { duration: 4000 });
        setQuizState("configuring");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to generate questions.");
      setQuizState("configuring");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerAssessment = (isCorrect: boolean) => {
    setUserAnswers(prev =>
      prev.map((ans, idx) =>
        idx === currentQuestionIndex ? { ...ans, isCorrect } : ans
      )
    );
    setShowAnswer(false); // Hide answer and move to next automatically
    if (currentQuestionIndex < generatedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuizState("results");
    }
  };

  const handleNextQuestion = () => {
    // This is called if user skips assessment
    if (userAnswers[currentQuestionIndex].isCorrect === null) {
        // Mark as skipped/incorrect if no assessment made
         setUserAnswers(prev =>
            prev.map((ans, idx) =>
                idx === currentQuestionIndex ? { ...ans, isCorrect: false } : ans // or a 'skipped' state
            )
        );
    }
    setShowAnswer(false);
    if (currentQuestionIndex < generatedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuizState("results");
    }
  };


  const availableTopics = quizConfig.subject ? rrbNTPCSubjectsAndTopics[quizConfig.subject] || [] : [];
  const score = userAnswers.filter(ans => ans.isCorrect === true).length;

  const renderConfiguration = () => (
    <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
      <CardHeader>
        <CardTitle className="font-headline">Configure Your AI Quiz</CardTitle>
        <CardDescription>
          Select subject, topic, number of questions (5-10), and difficulty. AI responses will attempt to use your preferred language setting.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmitConfig} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={quizConfig.subject}
                onValueChange={(val) => handleConfigChange("subject", val)}
                disabled={isLoading}
                name="subject-select"
              >
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
              <Select
                value={quizConfig.topic}
                onValueChange={(val) => handleConfigChange("topic", val)}
                disabled={isLoading || !quizConfig.subject || availableTopics.length === 0}
                name="topic-select"
              >
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
          <div className="grid md:grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label htmlFor="numQuestions">Number of Questions</Label>
              <Select
                value={String(quizConfig.numQuestions)}
                onValueChange={(val) => handleConfigChange("numQuestions", parseInt(val,10))}
                disabled={isLoading}
                name="numQuestions-select"
              >
                <SelectTrigger id="numQuestions" suppressHydrationWarning>
                   <SelectValue placeholder="Select number" />
                </SelectTrigger>
                <SelectContent>
                  {[5,6,7,8,9,10].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={quizConfig.difficulty}
                onValueChange={(val) => handleConfigChange("difficulty", val)}
                disabled={isLoading}
                name="difficulty-select"
              >
                <SelectTrigger id="difficulty" suppressHydrationWarning>
                  <SelectValue placeholder="Select Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficultyOptions.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={isLoading || !quizConfig.subject || !quizConfig.topic} className="w-full md:w-auto shadow-md hover:shadow-lg">
            {isLoading ? <LoadingIndicator size={20} className="mr-2" /> : null}
            Generate Quiz
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderQuizTaking = () => {
    const currentQ = generatedQuestions[currentQuestionIndex];
    if (!currentQ) return null;

    return (
      <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
        <CardHeader>
          <CardTitle className="font-headline">Quiz in Progress: Question {currentQuestionIndex + 1} of {generatedQuestions.length}</CardTitle>
          <CardDescription>{quizConfig.topic} ({quizConfig.subject}) - Difficulty: {quizConfig.difficulty}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg font-semibold whitespace-pre-wrap">{currentQ.question}</p>
          {!showAnswer && (
            <Button onClick={() => setShowAnswer(true)} className="shadow-md hover:shadow-lg">
              <HelpCircle className="mr-2 h-5 w-5" /> Reveal Answer
            </Button>
          )}
          {showAnswer && (
            <div className="space-y-3 p-4 bg-muted rounded-md shadow-inner animate-in fade-in-0 duration-300">
              <p><strong className="text-primary">Answer:</strong> <span className="whitespace-pre-wrap">{currentQ.answer}</span></p>
              {currentQ.explanation && <p><strong>Explanation:</strong> <span className="whitespace-pre-wrap">{currentQ.explanation}</span></p>}
              <div className="flex gap-2 mt-3">
                <Button onClick={() => handleAnswerAssessment(true)} variant="default" className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg">
                    <CheckCircle className="mr-2 h-5 w-5" /> I got it Correct
                </Button>
                <Button onClick={() => handleAnswerAssessment(false)} variant="destructive" className="shadow-md hover:shadow-lg">
                    <XCircle className="mr-2 h-5 w-5" /> I got it Incorrect
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setQuizState("configuring")} className="shadow-sm hover:shadow-md">
                <RotateCcw className="mr-2 h-4 w-4" /> New Quiz Config
            </Button>
            {userAnswers[currentQuestionIndex]?.isCorrect === null && showAnswer ? ( // Only show next if answer revealed but not assessed
                 <Button onClick={handleNextQuestion} disabled={!showAnswer} className="shadow-md hover:shadow-lg">
                    Skip Assessment & Next <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
            ) : null}
             {currentQuestionIndex === generatedQuestions.length - 1 && userAnswers[currentQuestionIndex]?.isCorrect !== null && (
                <Button onClick={() => setQuizState("results")} className="shadow-md hover:shadow-lg bg-blue-600 hover:bg-blue-700">
                    View Results <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            )}
        </CardFooter>
      </Card>
    );
  };

  const renderResults = () => (
    <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
      <CardHeader>
        <CardTitle className="font-headline">Quiz Results</CardTitle>
        <CardDescription>You scored {score} out of {generatedQuestions.length}!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-4xl font-bold text-primary">{((score / generatedQuestions.length) * 100).toFixed(0)}%</p>
          <p className="text-muted-foreground">({score} correct, {generatedQuestions.length - score} incorrect)</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Review Your Answers:</h3>
          <Accordion type="single" collapsible className="w-full">
            {generatedQuestions.map((q, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className={`font-semibold hover:no-underline text-left ${userAnswers[index]?.isCorrect === true ? 'text-green-600' : userAnswers[index]?.isCorrect === false ? 'text-red-600' : ''}`}>
                  Question {index + 1}: {q.question} {userAnswers[index]?.isCorrect === true ? <CheckCircle className="ml-2 h-5 w-5 text-green-500 inline"/> : userAnswers[index]?.isCorrect === false ? <XCircle className="ml-2 h-5 w-5 text-red-500 inline"/> : null}
                </AccordionTrigger>
                <AccordionContent className="bg-muted/50 p-3 rounded-md shadow-inner">
                  <p className="font-medium text-primary mb-1">Correct Answer: {q.answer}</p>
                  {q.explanation && (
                    <p className="text-sm text-muted-foreground mt-1">
                      <strong>Explanation:</strong> {q.explanation}
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => setQuizState("configuring")} className="w-full md:w-auto shadow-md hover:shadow-lg">
          <RotateCcw className="mr-2 h-4 w-4" /> Start New Quiz
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
         <ListChecks className="h-8 w-8 text-primary" />
         <h1 className="text-3xl font-headline font-bold">AI Quiz Generator</h1>
      </div>
     
      {quizState === "generating" && (
        <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <LoadingIndicator size={48} />
            <p className="mt-4 text-muted-foreground">AI is generating your quiz, please wait...</p>
          </CardContent>
        </Card>
      )}

      {quizState === "configuring" && renderConfiguration()}
      {quizState === "taking" && renderQuizTaking()}
      {quizState === "results" && renderResults()}
    </div>
  );
}
