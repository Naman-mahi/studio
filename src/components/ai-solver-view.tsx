"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { solveQuestionPaper } from "@/app/(app)/ai-solver/actions";
import type { SolveQuestionPaperOutput } from "@/ai/flows/ai-question-solver";
import { useToast } from "@/hooks/use-toast";
import { LoadingIndicator } from "@/components/loading-indicator";

export default function AiSolverView() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SolveQuestionPaperOutput | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setResult(null);

    let paperContent = questionText;

    if (file) {
      if (file.type.startsWith("image/")) {
        // Convert image to base64 data URI
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          try {
            const base64Image = reader.result as string;
            const output = await solveQuestionPaper({ questionPaper: base64Image });
            setResult(output);
          } catch (e: any) {
            toast({ title: "Error", description: e.message || "Failed to process image.", variant: "destructive" });
          } finally {
            setIsLoading(false);
          }
        };
        reader.onerror = () => {
          toast({ title: "Error", description: "Failed to read file.", variant: "destructive" });
          setIsLoading(false);
        };
        return; // Wait for FileReader
      } else if (file.type === "text/plain") {
         paperContent = await file.text();
      } else {
        toast({ title: "Error", description: "Unsupported file type. Please upload an image or a plain text file.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
    }
    
    if (!paperContent && !file) {
       toast({ title: "Error", description: "Please provide question paper content or upload a file.", variant: "destructive" });
       setIsLoading(false);
       return;
    }


    try {
      const output = await solveQuestionPaper({ questionPaper: paperContent });
      setResult(output);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold">AI Question Solver</h1>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Upload or Enter Question Paper</CardTitle>
          <CardDescription>
            Provide the question paper content as text or upload an image/text file. The AI will generate solutions and an answer key.
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
                    onChange={(e) => setQuestionText(e.target.value)}
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
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                  {file && <p className="text-sm text-muted-foreground">Selected file: {file.name}</p>}
                </div>
              </TabsContent>
            </Tabs>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? <LoadingIndicator size={20} className="mr-2" /> : null}
              Solve Paper
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <LoadingIndicator size={48} />
            <p className="mt-4 text-muted-foreground">AI is solving the paper, please wait...</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Solutions and Answer Key</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2 font-headline">Solutions:</h3>
              <div className="p-4 bg-muted rounded-md whitespace-pre-wrap">{result.solutions}</div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 font-headline">Answer Key:</h3>
              <div className="p-4 bg-muted rounded-md whitespace-pre-wrap">{result.answerKey}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
