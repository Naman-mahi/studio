
"use client";

import { useState, type FormEvent, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { generateQuizQuestions } from "@/app/(app)/ai-quiz-generator/actions";
import type { QuizQuestionGeneratorInput, QuizQuestionGeneratorOutput } from '@/ai/flows/practice-question-generator';
import toast from 'react-hot-toast';
import { LoadingIndicator } from "@/components/loading-indicator";
import { getStoredLanguage } from "./settings-view";
import { ArrowLeft, ArrowRight, CheckCircle, HelpCircle, ListChecks, RotateCcw, XCircle, FileText, Sparkles } from "lucide-react";

interface GeneratedQuestion {
  question: string;
  options: string[];
  answer: string; // Correct answer text
  explanation?: string;
}

interface UserQuizAttempt {
  questionIndex: number;
  selectedOption: string | null;
  isCorrect?: boolean; // Populated after submission
}

interface QuizConfig {
  subject: string;
  topic: string;
  numQuestions: number;
  difficulty: "Easy" | "Medium" | "Hard";
}

interface AiQuizGeneratorCache {
  config: QuizConfig | null;
  generatedQuestions: GeneratedQuestion[] | null;
  userSelectedAnswers: Array<string | null> | null; // For in-progress quiz
  lastQuizResults: { // For last submitted quiz
    questions: GeneratedQuestion[];
    userAnswers: Array<string | null>;
    score: number;
  } | null;
  languageAtGeneration: string | null; // Store language when quiz was generated
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
    subject: "", topic: "", numQuestions: 5, difficulty: "Medium",
  });
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [userSelectedAnswers, setUserSelectedAnswers] = useState<Array<string | null>>([]);
  const [lastQuizResults, setLastQuizResults] = useState<AiQuizGeneratorCache['lastQuizResults']>(null);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [languageAtGeneration, setLanguageAtGeneration] = useState<string | null>(null);


  useEffect(() => {
    const initialLang = getStoredLanguage();
    setCurrentLanguage(initialLang);
    try {
      const cachedDataString = localStorage.getItem(AI_QUIZ_GENERATOR_CACHE_KEY);
      if (cachedDataString) {
        const parsedCache: AiQuizGeneratorCache = JSON.parse(cachedDataString);
        if (parsedCache.config) setQuizConfig(parsedCache.config);
        if (parsedCache.generatedQuestions && parsedCache.languageAtGeneration === initialLang) {
          setGeneratedQuestions(parsedCache.generatedQuestions);
          setLanguageAtGeneration(parsedCache.languageAtGeneration);
          if (parsedCache.userSelectedAnswers) {
             setUserSelectedAnswers(parsedCache.userSelectedAnswers);
             // If there are generated questions and potentially some answers, user might have been taking a quiz
             if (parsedCache.generatedQuestions.length > 0 && !parsedCache.lastQuizResults) {
                 setQuizState("taking");
                 // Find first unanswered question or default to 0
                 const firstUnanswered = parsedCache.userSelectedAnswers.findIndex(ans => ans === null);
                 setCurrentQuestionIndex(firstUnanswered !== -1 ? firstUnanswered : 0);
             }
          }
        }
        if (parsedCache.lastQuizResults && parsedCache.languageAtGeneration === initialLang) {
          setLastQuizResults(parsedCache.lastQuizResults);
          setQuizState("results"); // If there are past results for this config/lang, show them
        }
      }
    } catch (error) {
      console.error("Failed to load quiz cache from localStorage", error);
      localStorage.removeItem(AI_QUIZ_GENERATOR_CACHE_KEY); // Clear corrupted cache
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const newLang = getStoredLanguage();
      if (newLang !== currentLanguage) {
        setCurrentLanguage(newLang);
        // If language changes, and it's different from language at generation, reset to config
        if (languageAtGeneration && newLang !== languageAtGeneration) {
            resetQuizStateToConfiguring();
            toast.info("Language changed. Please regenerate the quiz for the new language.");
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const lang = getStoredLanguage();
      if (lang !== currentLanguage) {
         setCurrentLanguage(lang);
         if (languageAtGeneration && lang !== languageAtGeneration) {
            resetQuizStateToConfiguring();
            toast.info("Language changed. Please regenerate the quiz for the new language.");
        }
      }
    }, 1000);

    // Save to cache
    const cacheData: AiQuizGeneratorCache = { 
        config: quizConfig, 
        generatedQuestions, 
        userSelectedAnswers: quizState === "taking" ? userSelectedAnswers : null, 
        lastQuizResults: quizState === "results" ? lastQuizResults : null,
        languageAtGeneration
    };
    localStorage.setItem(AI_QUIZ_GENERATOR_CACHE_KEY, JSON.stringify(cacheData));
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [quizConfig, generatedQuestions, userSelectedAnswers, lastQuizResults, quizState, currentLanguage, languageAtGeneration]);

  const resetQuizStateToConfiguring = () => {
    setQuizState("configuring");
    setGeneratedQuestions([]);
    setUserSelectedAnswers([]);
    setLastQuizResults(null);
    setCurrentQuestionIndex(0);
    setLanguageAtGeneration(null);
    // Keep quizConfig as is, or reset parts of it if desired
  };

  const handleConfigChange = (field: keyof QuizConfig, value: any) => {
    setQuizConfig(prev => ({ ...prev, [field]: value }));
    // Reset relevant state if config changes, prompting re-generation
    if (quizState !== "configuring") {
        resetQuizStateToConfiguring();
    }
  };

  const handleSubmitConfig = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!quizConfig.subject) {
      toast.error("Please select a subject."); return;
    }
    if (!quizConfig.topic) {
      toast.error("Please select a topic."); return;
    }

    setIsLoading(true);
    setQuizState("generating");
    resetQuizStateToConfiguring(); // Clear previous quiz data before generating new

    try {
      const lang = getStoredLanguage();
      const output: QuizQuestionGeneratorOutput = await generateQuizQuestions({
        ...quizConfig,
        language: lang,
      });
      if (output.questions && output.questions.length > 0) {
        setGeneratedQuestions(output.questions);
        setUserSelectedAnswers(Array(output.questions.length).fill(null));
        setCurrentQuestionIndex(0);
        setLanguageAtGeneration(lang); // Store language used for this quiz
        setQuizState("taking");
      } else {
        toast("The AI couldn't generate questions for the given inputs. Try different topics or subjects.", { duration: 4000 });
        resetQuizStateToConfiguring();
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to generate questions.");
      resetQuizStateToConfiguring();
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOptionSelect = (option: string) => {
    setUserSelectedAnswers(prev => {
        const newAnswers = [...prev];
        newAnswers[currentQuestionIndex] = option;
        return newAnswers;
    });
  };

  const navigateQuestion = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentQuestionIndex < generatedQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
    } else if (direction === 'prev' && currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    const results = generatedQuestions.map((q, index) => {
        const userAnswer = userSelectedAnswers[index];
        const isCorrect = userAnswer === q.answer;
        if (isCorrect) score++;
        return { ...q, userAnswer, isCorrect };
    });
    setLastQuizResults({ questions: results, userAnswers: userSelectedAnswers, score });
    setQuizState("results");
  };

  const availableTopics = useMemo(() => {
    return quizConfig.subject ? rrbNTPCSubjectsAndTopics[quizConfig.subject] || [] : [];
  }, [quizConfig.subject]);
  
  const renderConfiguration = () => (
    <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
      <CardHeader>
        <CardTitle className="font-headline">Configure Your AI Quiz</CardTitle>
        <CardDescription>
          Select subject, topic, number of questions (5-10), and difficulty. AI responses will attempt to use your preferred language.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmitConfig} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={quizConfig.subject} onValueChange={(val) => handleConfigChange("subject", val)} disabled={isLoading} name="subject-select">
                <SelectTrigger id="subject" suppressHydrationWarning><SelectValue placeholder="Select Subject" /></SelectTrigger>
                <SelectContent>{subjectOptions.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Select value={quizConfig.topic} onValueChange={(val) => handleConfigChange("topic", val)} disabled={isLoading || !quizConfig.subject || availableTopics.length === 0} name="topic-select">
                <SelectTrigger id="topic" suppressHydrationWarning><SelectValue placeholder="Select Topic" /></SelectTrigger>
                <SelectContent>{availableTopics.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label htmlFor="numQuestions">Number of Questions</Label>
              <Select value={String(quizConfig.numQuestions)} onValueChange={(val) => handleConfigChange("numQuestions", parseInt(val,10))} disabled={isLoading} name="numQuestions-select">
                <SelectTrigger id="numQuestions" suppressHydrationWarning><SelectValue placeholder="Select number" /></SelectTrigger>
                <SelectContent>{[5,6,7,8,9,10].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={quizConfig.difficulty} onValueChange={(val) => handleConfigChange("difficulty", val as QuizConfig["difficulty"])} disabled={isLoading} name="difficulty-select">
                <SelectTrigger id="difficulty" suppressHydrationWarning><SelectValue placeholder="Select Difficulty" /></SelectTrigger>
                <SelectContent>{difficultyOptions.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={isLoading || !quizConfig.subject || !quizConfig.topic} className="w-full md:w-auto shadow-md hover:shadow-lg">
            {isLoading ? <LoadingIndicator size={20} className="mr-2" /> : <Sparkles className="mr-2 h-5 w-5"/>}
            Generate Quiz
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderQuizTaking = () => {
    if (generatedQuestions.length === 0) return null;
    const currentQ = generatedQuestions[currentQuestionIndex];
    if (!currentQ) return null;

    return (
      <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
        <CardHeader>
          <CardTitle className="font-headline">Quiz: Question {currentQuestionIndex + 1} of {generatedQuestions.length}</CardTitle>
          <CardDescription>{quizConfig.topic} ({quizConfig.subject}) - Difficulty: {quizConfig.difficulty}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg font-semibold whitespace-pre-wrap">{currentQ.question}</p>
          <RadioGroup
            value={userSelectedAnswers[currentQuestionIndex] || ""}
            onValueChange={handleOptionSelect}
            className="space-y-2"
          >
            {currentQ.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-muted/50 transition-colors">
                <RadioGroupItem value={option} id={`q${currentQuestionIndex}-opt${index}`} />
                <Label htmlFor={`q${currentQuestionIndex}-opt${index}`} className="cursor-pointer flex-1 text-sm">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Button variant="outline" onClick={() => resetQuizStateToConfiguring()} className="shadow-sm hover:shadow-md">
            <RotateCcw className="mr-2 h-4 w-4" /> New Quiz Config
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigateQuestion('prev')} disabled={currentQuestionIndex === 0} className="shadow-sm hover:shadow-md">
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            {currentQuestionIndex < generatedQuestions.length - 1 ? (
              <Button onClick={() => navigateQuestion('next')} className="shadow-md hover:shadow-lg">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmitQuiz} className="shadow-md hover:shadow-lg bg-green-600 hover:bg-green-700 text-white">
                Submit Quiz <CheckCircle className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    );
  };

  const renderResults = () => {
    if (!lastQuizResults) return null;
    const { questions: resultQuestions, score } = lastQuizResults;

    return (
      <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
        <CardHeader>
          <CardTitle className="font-headline">Quiz Results</CardTitle>
          <CardDescription>You scored {score} out of {resultQuestions.length}! ({((score / resultQuestions.length) * 100).toFixed(0)}%)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 text-lg">Review Your Answers:</h3>
            <Accordion type="single" collapsible className="w-full">
              {resultQuestions.map((q, index) => (
                <AccordionItem value={`item-${index}`} key={index} className="mb-2 last:mb-0">
                  <AccordionTrigger 
                    className={`font-semibold hover:no-underline text-left p-3 rounded-md transition-colors ${
                      q.isCorrect ? 'bg-green-100 dark:bg-green-900/50 hover:bg-green-200 dark:hover:bg-green-800/60' : 'bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                        <span className="flex-1">Question {index + 1}: <span className="font-normal italic">"{q.question.substring(0, 50)}{q.question.length > 50 ? '...' : ''}"</span></span>
                        {q.isCorrect ? <CheckCircle className="ml-2 h-5 w-5 text-green-600 dark:text-green-400"/> : <XCircle className="ml-2 h-5 w-5 text-red-600 dark:text-red-400"/>}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="bg-muted/30 dark:bg-muted/20 p-4 rounded-b-md shadow-inner mt-0 border-x border-b">
                    <p className="text-sm mb-2 whitespace-pre-wrap"><strong>Your Question:</strong> {q.question}</p>
                    <div className="space-y-1 mb-3">
                        <strong>Options:</strong>
                        {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className={`text-sm pl-4 p-1 rounded ${
                                opt === q.answer ? 'font-semibold text-green-700 dark:text-green-300' : ''
                            } ${
                                opt === q.userAnswer && opt !== q.answer ? 'text-red-700 dark:text-red-300 line-through' : ''
                            } ${
                                opt === q.userAnswer && opt === q.answer ? 'bg-green-200 dark:bg-green-800/50' : ''
                            }`}>
                                {opt === q.answer && <CheckCircle className="inline h-4 w-4 mr-1 text-green-600 dark:text-green-400" />}
                                {opt === q.userAnswer && opt !== q.answer && <XCircle className="inline h-4 w-4 mr-1 text-red-600 dark:text-red-400" />}
                                {opt}
                                {opt === q.userAnswer && <span className="text-xs italic"> (Your answer)</span>}
                            </div>
                        ))}
                    </div>
                    {q.userAnswer !== q.answer && q.userAnswer && (
                        <p className="text-sm mb-2"><strong>Your Answer:</strong> <span className="text-red-600 dark:text-red-400">{q.userAnswer}</span></p>
                    )}
                    <p className="text-sm font-semibold text-primary mb-1">Correct Answer: {q.answer}</p>
                    {q.explanation && (
                      <p className="text-xs text-muted-foreground mt-1">
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
          <Button onClick={() => resetQuizStateToConfiguring()} className="w-full md:w-auto shadow-md hover:shadow-lg">
            <RotateCcw className="mr-2 h-4 w-4" /> Start New Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
         <ListChecks className="h-8 w-8 text-primary" />
         <h1 className="text-3xl font-headline font-bold">AI Quiz Generator</h1>
      </div>
     
      {quizState === "generating" && (
        <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
          <CardHeader className="items-center">
            <CardTitle className="font-headline">AI is Crafting Your Quiz!</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <LoadingIndicator size={48} />
            <p className="mt-4 text-muted-foreground">Please wait while the questions are being generated...</p>
            <p className="text-xs text-muted-foreground mt-1">(This may take a few moments)</p>
          </CardContent>
        </Card>
      )}

      {quizState === "configuring" && renderConfiguration()}
      {quizState === "taking" && renderQuizTaking()}
      {quizState === "results" && renderResults()}
    </div>
  );
}

