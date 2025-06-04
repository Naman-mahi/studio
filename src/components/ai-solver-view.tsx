
"use client";

import { useState, type FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { solveQuestionPaper } from "@/app/(app)/ai-solver/actions";
import type { SolveQuestionPaperOutput } from "@/ai/flows/ai-question-solver";
import toast from 'react-hot-toast';
import { LoadingIndicator } from "@/components/loading-indicator";
import { getStoredLanguage } from "./settings-view"; // Import language utility

const AI_SOLVER_CACHED_INPUT_KEY = "ai-solver-cached-input";
const AI_SOLVER_CACHED_RESULT_KEY = "ai-solver-cached-result";

export default function AiSolverView() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SolveQuestionPaperOutput | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState('en');


  useEffect(() => {
    setCurrentLanguage(getStoredLanguage());
    try {
      const cachedInput = localStorage.getItem(AI_SOLVER_CACHED_INPUT_KEY);
      const cachedResult = localStorage.getItem(AI_SOLVER_CACHED_RESULT_KEY);

      if (cachedInput) {
        setQuestionText(cachedInput);
      }
      if (cachedResult && cachedInput) { 
        setResult(JSON.parse(cachedResult));
      }
    } catch (error) {
      console.error("Failed to load AI solver cache from localStorage", error);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const newLang = getStoredLanguage();
      if (newLang !== currentLanguage) {
        setCurrentLanguage(newLang);
        setResult(null); // Clear result if language changes, as it might be in old language
        localStorage.removeItem(AI_SOLVER_CACHED_RESULT_KEY);
      }
    };
    window.addEventListener('storage', handleStorageChange);
     const interval = setInterval(() => {
        const lang = getStoredLanguage();
        if (lang !== currentLanguage) {
            setCurrentLanguage(lang);
            setResult(null); 
            localStorage.removeItem(AI_SOLVER_CACHED_RESULT_KEY);
        }
    }, 1000);


    if (questionText) {
      try {
        localStorage.setItem(AI_SOLVER_CACHED_INPUT_KEY, questionText);
      } catch (error) {
        console.error("Failed to save input to localStorage", error);
      }
    }
    if (result && questionText) { 
      try {
        localStorage.setItem(AI_SOLVER_CACHED_RESULT_KEY, JSON.stringify(result));
      } catch (error) {
        console.error("Failed to save result to localStorage", error);
      }
    }
     return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(interval);
    }
  }, [questionText, result, currentLanguage]);


  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setResult(null); 

    let paperContent = questionText;
    let isFileProcessing = false;
    const lang = getStoredLanguage();

    if (file) {
      isFileProcessing = true;
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          try {
            const base64Image = reader.result as string;
            const output = await solveQuestionPaper({ questionPaper: base64Image, language: lang });
            setResult(output);
            // localStorage.setItem(AI_SOLVER_CACHED_RESULT_KEY, JSON.stringify(output)); // Result will be cached by useEffect
            localStorage.removeItem(AI_SOLVER_CACHED_INPUT_KEY); 
          } catch (e: any) {
            toast.error(e.message || "Failed to process image.");
          } finally {
            setIsLoading(false);
          }
        };
        reader.onerror = () => {
          toast.error("Failed to read file.");
          setIsLoading(false);
        };
        return; 
      } else if (file.type === "text/plain") {
         paperContent = await file.text();
         setQuestionText(paperContent); 
      } else {
        toast.error("Unsupported file type. Please upload an image or a plain text file.");
        setIsLoading(false);
        return;
      }
    }
    
    if (!paperContent && !file) {
       toast.error("Please provide question paper content or upload a file.");
       setIsLoading(false);
       return;
    }

    if (!isFileProcessing || (file && file.type === "text/plain")) {
        try {
          const output = await solveQuestionPaper({ questionPaper: paperContent, language: lang });
          setResult(output);
          // localStorage.setItem(AI_SOLVER_CACHED_INPUT_KEY, paperContent); // Input cached by useEffect
          // localStorage.setItem(AI_SOLVER_CACHED_RESULT_KEY, JSON.stringify(output)); // Result cached by useEffect
        } catch (e: any) {
          toast.error(e.message || "An unexpected error occurred.");
        } finally {
          setIsLoading(false);
        }
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold">AI Question Solver</h1>
      <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
        <CardHeader>
          <CardTitle className="font-headline">Upload or Enter Question Paper</CardTitle>
          <CardDescription>
            Provide question paper content as text or upload an image/text file. The AI will generate solutions and an answer key. Your input and results are cached locally. AI responses will attempt to use your preferred language setting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text">Enter Text</TabsTrigger>
                <TabsTrigger value="file">Upload File</TabsTrigger>
              </TabsList>
              <TabsContent value="text" className="mt-4">
                <div className="space-y-2">
                  <Label htmlFor="questionText">Question Paper Text</Label>
                  <Textarea
                    id="questionText"
                    placeholder="Paste the content of the question paper here..."
                    rows={10}
                    value={questionText}
                    onChange={(e) => {
                        setQuestionText(e.target.value);
                        setFile(null);
                        if (Math.abs(e.target.value.length - (localStorage.getItem(AI_SOLVER_CACHED_INPUT_KEY)?.length || 0)) > 10) {
                            setResult(null);
                            localStorage.removeItem(AI_SOLVER_CACHED_RESULT_KEY);
                        }
                    }}
                    disabled={isLoading}
                  />
                </div>
              </TabsContent>
              <TabsContent value="file" className="mt-4">
                <div className="space-y-2">
                  <Label htmlFor="questionFile">Upload Image or Text File</Label>
                  <Input
                    id="questionFile"
                    type="file"
                    accept="image/*, .txt"
                    onChange={(e) => {
                        handleFileChange(e);
                        setQuestionText("");
                        setResult(null); 
                        localStorage.removeItem(AI_SOLVER_CACHED_INPUT_KEY);
                        localStorage.removeItem(AI_SOLVER_CACHED_RESULT_KEY);
                    }}
                    disabled={isLoading}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  {file && <p className="text-sm text-muted-foreground">Selected file: {file.name}</p>}
                </div>
              </TabsContent>
            </Tabs>
            <Button type="submit" disabled={isLoading || (!questionText.trim() && !file)} className="w-full md:w-auto shadow-md hover:shadow-lg">
              {isLoading ? <LoadingIndicator size={20} className="mr-2" /> : null}
              Solve Paper
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <LoadingIndicator size={48} />
            <p className="mt-4 text-muted-foreground">AI is solving the paper, please wait...</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
          <CardHeader>
            <CardTitle className="font-headline">Solutions and Answer Key</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2 font-headline">Solutions:</h3>
              <div className="p-4 bg-muted rounded-md whitespace-pre-wrap text-sm leading-relaxed shadow-inner">{result.solutions}</div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 font-headline">Answer Key:</h3>
              <div className="p-4 bg-muted rounded-md whitespace-pre-wrap text-sm leading-relaxed shadow-inner">{result.answerKey}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
