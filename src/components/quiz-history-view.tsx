
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import toast from "react-hot-toast";
import { BarChartHorizontalBig, Trash2, Eye, AlertTriangle } from "lucide-react";
import { format, parseISO } from 'date-fns';

const QUIZ_HISTORY_KEY = "ai-quiz-history"; // Defined in ai-quiz-generator-view

// Re-define or import QuizConfig and GeneratedQuestion types from ai-quiz-generator-view.tsx
// For simplicity here, let's define simplified versions.
interface QuizConfig {
  subject: string;
  topic: string;
  numQuestions: number;
  difficulty: "Easy" | "Medium" | "Hard";
  explanationStyle: "Standard" | "Simple" | "Detailed" | "Analogy";
}

interface GeneratedQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  explanationStyle?: "Standard" | "Simple" | "Detailed" | "Analogy";
  userAnswer: string | null;
  isCorrect: boolean | undefined;
}

interface QuizAttempt {
  id: string;
  timestamp: string;
  quizConfig: QuizConfig;
  score: number;
  totalQuestions: number;
  accuracy: number;
  questions: Array<GeneratedQuestion>;
  language: string;
}


export default function QuizHistoryView() {
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(null);


  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      loadQuizHistory();
    }
  }, []);

  const loadQuizHistory = () => {
    try {
      const storedHistory = localStorage.getItem(QUIZ_HISTORY_KEY);
      const historyArray = storedHistory ? JSON.parse(storedHistory) : [];
      // Sort by date, newest first
      historyArray.sort((a: QuizAttempt, b: QuizAttempt) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime());
      setQuizHistory(historyArray);
    } catch (error) {
      console.error("Error loading quiz history:", error);
      toast.error("Could not load quiz history.");
      setQuizHistory([]);
    }
  };

  const handleClearHistory = () => {
    try {
      localStorage.removeItem(QUIZ_HISTORY_KEY);
      setQuizHistory([]);
      toast.success("Quiz history cleared!");
    } catch (error) {
      console.error("Error clearing quiz history:", error);
      toast.error("Could not clear quiz history.");
    }
  };

  const handleViewDetails = (attempt: QuizAttempt) => {
    setSelectedAttempt(attempt);
  };

  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BarChartHorizontalBig className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-headline font-bold">Quiz Attempt History</h1>
        </div>
        <p className="text-muted-foreground">Loading quiz history...</p>
      </div>
    );
  }

  if (selectedAttempt) {
    return (
        <div className="space-y-6">
            <Button variant="outline" onClick={() => setSelectedAttempt(null)} className="mb-4 shadow-sm">
                <BarChartHorizontalBig className="mr-2 h-4 w-4" /> Back to History List
            </Button>
            <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
                <CardHeader>
                    <CardTitle className="font-headline text-xl md:text-2xl">
                        Quiz Details - {format(parseISO(selectedAttempt.timestamp), "MMM d, yyyy 'at' h:mm a")}
                    </CardTitle>
                    <CardDescription>
                        Topic: {selectedAttempt.quizConfig.topic} ({selectedAttempt.quizConfig.subject}) | Difficulty: {selectedAttempt.quizConfig.difficulty} | Score: {selectedAttempt.score}/{selectedAttempt.totalQuestions} ({selectedAttempt.accuracy.toFixed(0)}%)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <h3 className="font-semibold mb-3 text-lg">Questions & Answers:</h3>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {selectedAttempt.questions.map((q, index) => (
                            <Card key={index} className={`border-l-4 ${q.isCorrect ? 'border-green-500' : 'border-red-500'} bg-muted/20`}>
                                <CardHeader className="pb-2 pt-3">
                                    <CardTitle className="text-base font-medium">Question {index + 1}: <span className="font-normal">{q.question}</span></CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm space-y-1 pb-3">
                                    <p><strong>Your Answer:</strong> <span className={q.isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>{q.userAnswer || "Not Answered"}</span></p>
                                    {!q.isCorrect && <p><strong>Correct Answer:</strong> <span className="text-primary">{q.answer}</span></p>}
                                    {q.explanation && <p className="text-xs text-muted-foreground mt-1"><strong>Explanation:</strong> {q.explanation}</p>}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
            <BarChartHorizontalBig className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-headline font-bold">Quiz Attempt History</h1>
        </div>
        {quizHistory.length > 0 && (
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="shadow-md hover:shadow-lg">
                    <Trash2 className="mr-2 h-4 w-4" /> Clear All History
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/>Confirm Clear History</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete all your quiz attempt history? This action cannot be undone.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearHistory} className="bg-destructive hover:bg-destructive/90">
                        Yes, Clear History
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )}
      </div>

      {quizHistory.length === 0 ? (
        <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
          <CardContent className="pt-6 text-center">
            <BarChartHorizontalBig className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl font-semibold text-muted-foreground">No quiz history found.</p>
            <p className="text-sm text-muted-foreground">
              Complete some quizzes using the AI Quiz Generator to see your attempts here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
            <CardHeader>
                <CardTitle>Your Past Quizzes</CardTitle>
                <CardDescription>Review your performance in previously taken quizzes.</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Topic (Subject)</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-center">Accuracy</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {quizHistory.map((attempt) => (
                    <TableRow key={attempt.id}>
                    <TableCell>{format(parseISO(attempt.timestamp), "MMM d, yyyy HH:mm")}</TableCell>
                    <TableCell>{attempt.quizConfig.topic} <span className="text-xs text-muted-foreground">({attempt.quizConfig.subject})</span></TableCell>
                    <TableCell>{attempt.quizConfig.difficulty}</TableCell>
                    <TableCell className="text-center">{attempt.score}/{attempt.totalQuestions}</TableCell>
                    <TableCell className="text-center font-medium text-primary">{attempt.accuracy.toFixed(0)}%</TableCell>
                    <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(attempt)} className="shadow-sm hover:shadow-md">
                            <Eye className="mr-1 h-3.5 w-3.5"/> View
                        </Button>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
