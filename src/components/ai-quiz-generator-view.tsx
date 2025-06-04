
"use client";

import { useState, type FormEvent, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { generateQuizQuestions } from "@/app/(app)/ai-quiz-generator/actions";
import type { QuizQuestionGeneratorInput, QuizQuestionGeneratorOutput } from '@/ai/flows/practice-question-generator';
import toast from 'react-hot-toast';
import { LoadingIndicator } from "@/components/loading-indicator";
import { getStoredLanguage } from "./settings-view";
import { addUserPoints } from "@/lib/points";
import { checkAndAwardBadges, updateUserStats } from "@/lib/badges";
import { ArrowLeft, ArrowRight, CheckCircle, HelpCircle, ListChecks, RotateCcw, XCircle, FileText, Sparkles, BarChart3, Award } from "lucide-react";

interface GeneratedQuestion {
  question: string;
  options: string[];
  answer: string; // Correct answer text
  explanation?: string;
  explanationStyle?: "Standard" | "Simple" | "Detailed" | "Analogy";
}

interface QuizConfig {
  subject: string;
  topic: string;
  numQuestions: number;
  difficulty: "Easy" | "Medium" | "Hard";
  explanationStyle: "Standard" | "Simple" | "Detailed" | "Analogy";
}

interface LastQuizResults {
    questions: Array<GeneratedQuestion & { userAnswer: string | null; isCorrect: boolean | undefined }>;
    userAnswers: Array<string | null>;
    score: number;
    quizConfig: QuizConfig;
    pointsEarned: number;
}

interface AiQuizGeneratorCache {
  config: QuizConfig | null;
  generatedQuestions: GeneratedQuestion[] | null;
  userSelectedAnswers: Array<string | null> | null;
  lastQuizResults: LastQuizResults | null;
  languageAtGeneration: string | null;
}

// For Advanced Performance Analytics - Iteration 1
interface QuizAttempt {
  id: string;
  timestamp: string;
  quizConfig: QuizConfig;
  score: number;
  totalQuestions: number;
  accuracy: number;
  questions: Array<GeneratedQuestion & { userAnswer: string | null; isCorrect: boolean | undefined }>;
  language: string;
}

const AI_QUIZ_GENERATOR_CACHE_KEY = "ai-quiz-generator-cache";
const QUIZ_HISTORY_KEY = "ai-quiz-history"; // For Advanced Performance Analytics

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
const explanationStyleOptions: Array<QuizConfig["explanationStyle"]> = ["Standard", "Simple", "Detailed", "Analogy"];

type QuizState = "configuring" | "generating" | "taking" | "results";

export default function AiQuizGeneratorView() {
  const [isLoading, setIsLoading] = useState(false);
  const [quizState, setQuizState] = useState<QuizState>("configuring");
  
  const [quizConfig, setQuizConfig] = useState<QuizConfig>({
    subject: "", topic: "", numQuestions: 5, difficulty: "Medium", explanationStyle: "Standard",
  });
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [userSelectedAnswers, setUserSelectedAnswers] = useState<Array<string | null>>([]);
  const [lastQuizResults, setLastQuizResults] = useState<LastQuizResults | null>(null);
  
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
        
        if (parsedCache.languageAtGeneration === initialLang) {
            setLanguageAtGeneration(parsedCache.languageAtGeneration);
            if (parsedCache.generatedQuestions) {
                setGeneratedQuestions(parsedCache.generatedQuestions);
            }
            if (parsedCache.userSelectedAnswers && parsedCache.generatedQuestions && parsedCache.generatedQuestions.length > 0) {
                setUserSelectedAnswers(parsedCache.userSelectedAnswers);
                if (!parsedCache.lastQuizResults) { 
                    setQuizState("taking");
                    const firstUnanswered = parsedCache.userSelectedAnswers.findIndex(ans => ans === null);
                    setCurrentQuestionIndex(firstUnanswered !== -1 ? firstUnanswered : 0);
                }
            }
            if (parsedCache.lastQuizResults) {
                setLastQuizResults(parsedCache.lastQuizResults);
                if (parsedCache.config && parsedCache.lastQuizResults.quizConfig && 
                    parsedCache.lastQuizResults.quizConfig.topic === parsedCache.config.topic &&
                    parsedCache.lastQuizResults.quizConfig.subject === parsedCache.config.subject &&
                    parsedCache.lastQuizResults.quizConfig.difficulty === parsedCache.config.difficulty &&
                    parsedCache.lastQuizResults.quizConfig.numQuestions === parsedCache.config.numQuestions &&
                    parsedCache.lastQuizResults.quizConfig.explanationStyle === parsedCache.config.explanationStyle
                ) {
                    setQuizState("results");
                } else {
                    setLastQuizResults(null); 
                }
            }
        } else {
            resetQuizStateToConfiguring(true); 
        }
      }
    } catch (error) {
      console.error("Failed to load quiz cache from localStorage", error);
      localStorage.removeItem(AI_QUIZ_GENERATOR_CACHE_KEY);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const newLang = getStoredLanguage();
      if (newLang !== currentLanguage) {
        setCurrentLanguage(newLang);
        if (languageAtGeneration && newLang !== languageAtGeneration) {
            resetQuizStateToConfiguring(true);
            toast.info("Language changed. Please regenerate the quiz for the new language, or switch back to the previous language to see cached results.");
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const lang = getStoredLanguage();
      if (lang !== currentLanguage) {
         setCurrentLanguage(lang);
         if (languageAtGeneration && lang !== languageAtGeneration) {
            resetQuizStateToConfiguring(true);
            toast.info("Language changed. Please regenerate the quiz for the new language, or switch back to see cached results.");
        }
      }
    }, 1000);

    const cacheData: AiQuizGeneratorCache = { 
        config: quizConfig, 
        generatedQuestions: quizState === "configuring" ? null : generatedQuestions, 
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

  const resetQuizStateToConfiguring = (keepConfig: boolean = false) => {
    setQuizState("configuring");
    setGeneratedQuestions([]);
    setUserSelectedAnswers([]);
    setLastQuizResults(null);
    setCurrentQuestionIndex(0);
    if (!keepConfig) {
        setQuizConfig(prev => ({...prev, subject: "", topic: ""}));
    }
  };

  const handleConfigChange = (field: keyof QuizConfig, value: any) => {
    const newConfig = { ...quizConfig, [field]: value };
    if (field === "subject") { 
        newConfig.topic = "";
    }
    setQuizConfig(newConfig);
    if (quizState !== "configuring") {
        resetQuizStateToConfiguring(true); 
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
    
    setGeneratedQuestions([]);
    setUserSelectedAnswers([]);
    setLastQuizResults(null);
    setCurrentQuestionIndex(0);
    
    try {
      const lang = getStoredLanguage();
      setLanguageAtGeneration(lang); 
      const output: QuizQuestionGeneratorOutput = await generateQuizQuestions({
        ...quizConfig,
        language: lang,
      });
      if (output.questions && output.questions.length > 0) {
        setGeneratedQuestions(output.questions);
        setUserSelectedAnswers(Array(output.questions.length).fill(null));
        setCurrentQuestionIndex(0);
        setQuizState("taking");
      } else {
        toast("The AI couldn't generate questions for the given inputs. Try different topics or subjects.", { duration: 4000 });
        resetQuizStateToConfiguring(true);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to generate questions.");
      resetQuizStateToConfiguring(true);
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
    const resultsQuestions = generatedQuestions.map((q, index) => {
        const userAnswer = userSelectedAnswers[index];
        const isCorrect = userAnswer === q.answer;
        if (isCorrect) score++;
        return { ...q, userAnswer, isCorrect };
    });
    const pointsEarned = score * 10;
    addUserPoints(pointsEarned);

    updateUserStats({
        quizCompleted: true,
        topic: quizConfig.topic,
        subject: quizConfig.subject
    });
    checkAndAwardBadges();

    const currentResults: LastQuizResults = { 
        questions: resultsQuestions, 
        userAnswers: userSelectedAnswers, 
        score,
        quizConfig: { ...quizConfig }, // Store a snapshot of the config for these results
        pointsEarned
    };
    setLastQuizResults(currentResults);
    setQuizState("results");

    // Store quiz attempt in history
    if (languageAtGeneration) {
        const newAttempt: QuizAttempt = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            quizConfig: { ...quizConfig },
            score: currentResults.score,
            totalQuestions: currentResults.questions.length,
            accuracy: currentResults.questions.length > 0 ? (currentResults.score / currentResults.questions.length) * 100 : 0,
            questions: currentResults.questions,
            language: languageAtGeneration,
        };

        try {
            const historyString = localStorage.getItem(QUIZ_HISTORY_KEY);
            const history: QuizAttempt[] = historyString ? JSON.parse(historyString) : [];
            history.push(newAttempt);
            // Optional: Limit history size, e.g., history.slice(-50)
            localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(history));
        } catch (error) {
            console.error("Failed to save quiz history:", error);
            toast.error("Could not save quiz attempt to history.");
        }
    }
  };

  const availableTopics = useMemo(() => {
    return quizConfig.subject ? rrbNTPCSubjectsAndTopics[quizConfig.subject] || [] : [];
  }, [quizConfig.subject]);
  
  const renderConfiguration = () => (
    <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
      <CardHeader>
        <CardTitle className="font-headline">Configure Your AI Quiz</CardTitle>
        <CardDescription>
          Select subject, topic, number of questions (5-10), difficulty, and explanation style. AI responses will attempt to use your preferred language. Cached results for the same configuration and language will be shown if available.
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
          <div className="grid md:grid-cols-3 gap-4">
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
            <div className="space-y-2">
                <Label htmlFor="explanationStyle">Explanation Style</Label>
                <Select value={quizConfig.explanationStyle} onValueChange={(val) => handleConfigChange("explanationStyle", val as QuizConfig["explanationStyle"])} disabled={isLoading} name="explanationStyle-select">
                    <SelectTrigger id="explanationStyle" suppressHydrationWarning><SelectValue placeholder="Select Style" /></SelectTrigger>
                    <SelectContent>{explanationStyleOptions.map((style) => (<SelectItem key={style} value={style}>{style}</SelectItem>))}</SelectContent>
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
          <CardDescription>{quizConfig.topic} ({quizConfig.subject}) - Difficulty: {quizConfig.difficulty} - Explanations: {quizConfig.explanationStyle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg font-semibold whitespace-pre-wrap">{currentQ.question}</p>
          <RadioGroup
            value={userSelectedAnswers[currentQuestionIndex] || ""}
            onValueChange={handleOptionSelect}
            className="space-y-2"
          >
            {currentQ.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted/50 transition-colors cursor-pointer shadow-sm">
                <RadioGroupItem value={option} id={`q${currentQuestionIndex}-opt${index}`} />
                <Label htmlFor={`q${currentQuestionIndex}-opt${index}`} className="cursor-pointer flex-1 text-sm font-normal">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Button variant="outline" onClick={() => resetQuizStateToConfiguring(true)} className="shadow-sm hover:shadow-md">
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
    const { questions: resultQuestions, score, quizConfig: resultsConfig, pointsEarned } = lastQuizResults;
    const accuracy = resultQuestions.length > 0 ? (score / resultQuestions.length) * 100 : 0;

    let difficultySuggestion = "";
    if (accuracy >= 80) {
      if (resultsConfig.difficulty === "Easy") difficultySuggestion = "Great job! Try 'Medium' difficulty next time for this topic.";
      else if (resultsConfig.difficulty === "Medium") difficultySuggestion = "Excellent! Challenge yourself with 'Hard' difficulty next.";
      else difficultySuggestion = "Fantastic score on 'Hard'! Keep up the great work.";
    } else if (accuracy < 40) {
      if (resultsConfig.difficulty === "Hard") difficultySuggestion = "Good effort! Try 'Medium' difficulty to solidify your understanding.";
      else if (resultsConfig.difficulty === "Medium") difficultySuggestion = "Keep practicing! Consider trying 'Easy' difficulty for this topic.";
      else difficultySuggestion = "Don't give up! Review the material and try 'Easy' again.";
    } else {
        difficultySuggestion = "Good progress! Keep practicing this topic to improve further.";
    }


    return (
      <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Quiz Results</CardTitle>
          <CardDescription>
            For quiz on {resultsConfig.topic} ({resultsConfig.subject}) - Difficulty: {resultsConfig.difficulty}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-muted/30 dark:bg-muted/20 shadow-md">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-lg">
                You scored <strong className="text-primary">{score}</strong> out of <strong className="text-primary">{resultQuestions.length}</strong> questions.
              </p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Accuracy:</span>
                  <span className="font-semibold text-primary">{accuracy.toFixed(0)}%</span>
                </div>
                <Progress value={accuracy} className="h-3 shadow-sm" />
              </div>
              {pointsEarned > 0 && (
                <p className="text-md text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Award className="h-5 w-5" /> Points Earned: +{pointsEarned}
                </p>
              )}
            </CardContent>
          </Card>

           {difficultySuggestion && (
             <Card className="bg-blue-50 dark:bg-blue-900/30 shadow-md">
                <CardHeader className="pb-2 pt-3">
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Next Steps
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <p className="text-sm text-blue-700 dark:text-blue-300">{difficultySuggestion}</p>
                </CardContent>
             </Card>
           )}
          
          <div>
            <h3 className="font-semibold mb-3 text-lg font-headline">Review Your Answers:</h3>
            <Accordion type="single" collapsible className="w-full">
              {resultQuestions.map((q, index) => (
                <AccordionItem value={`item-${index}`} key={index} className="mb-2 last:mb-0 border shadow-sm rounded-md overflow-hidden">
                  <AccordionTrigger 
                    className={`font-semibold hover:no-underline text-left p-3 rounded-t-md transition-colors ${
                      q.isCorrect ? 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200/70 dark:hover:bg-green-800/40' : 'bg-red-100 dark:bg-red-900/30 hover:bg-red-200/70 dark:hover:bg-red-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                        <span className="flex-1 text-sm">Question {index + 1}: <span className="font-normal italic">"{q.question.substring(0, 50)}{q.question.length > 50 ? '...' : ''}"</span></span>
                        {q.isCorrect ? <CheckCircle className="ml-2 h-5 w-5 text-green-600 dark:text-green-400"/> : <XCircle className="ml-2 h-5 w-5 text-red-600 dark:text-red-400"/>}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="bg-card p-4 rounded-b-md mt-0 border-t">
                    <p className="text-sm mb-2 whitespace-pre-wrap"><strong>Your Question:</strong> {q.question}</p>
                    <div className="space-y-1 mb-3">
                        <strong>Options:</strong>
                        {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className={`text-xs md:text-sm pl-4 p-1.5 rounded-md my-1 ${
                                opt === q.answer ? 'font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50' : ''
                            } ${
                                opt === q.userAnswer && opt !== q.answer ? 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/50 line-through' : ''
                            } ${
                                opt === q.userAnswer && opt === q.answer ? '' : (opt !== q.answer && opt !== q.userAnswer ? 'bg-muted/30 dark:bg-muted/20' : '')
                            }`}>
                                {opt === q.answer && <CheckCircle className="inline h-4 w-4 mr-1 text-green-600 dark:text-green-400" />}
                                {opt === q.userAnswer && opt !== q.answer && <XCircle className="inline h-4 w-4 mr-1 text-red-600 dark:text-red-400" />}
                                {! (opt === q.answer) && ! (opt === q.userAnswer && opt !== q.answer) && <span className="inline-block w-4 mr-1"></span>}
                                {opt}
                                {opt === q.userAnswer && <span className="text-xs italic ml-1"> (Your answer)</span>}
                            </div>
                        ))}
                    </div>
                    {q.userAnswer !== q.answer && q.userAnswer && (
                        <p className="text-sm mb-2"><strong>Your Answer:</strong> <span className="text-red-600 dark:text-red-400">{q.userAnswer}</span></p>
                    )}
                    <p className="text-sm font-semibold text-primary mb-1">Correct Answer: {q.answer}</p>
                    {q.explanation && (
                      <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted/40 dark:bg-muted/30 rounded-md">
                        <strong>Explanation (Style: {q.explanationStyle || resultsConfig.explanationStyle || "Standard"}):</strong> {q.explanation}
                      </p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => resetQuizStateToConfiguring(true)} className="w-full md:w-auto shadow-md hover:shadow-lg">
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
            <CardTitle className="font-headline text-xl">AI is Crafting Your Quiz!</CardTitle>
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

