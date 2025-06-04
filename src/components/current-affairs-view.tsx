
"use client";

import { useState, type FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { generateCurrentAffairs } from "@/app/(app)/current-affairs/actions";
import type { CurrentAffairsGeneratorInput, CurrentAffairsGeneratorOutput } from '@/ai/flows/current-affairs-generator';
import { useToast } from "@/hooks/use-toast";
import { LoadingIndicator } from "@/components/loading-indicator";

const currentAffairsCategories = [
  "General",
  "National",
  "International",
  "Sports",
  "Science & Technology",
  "Economy",
  "Awards & Honors",
  "Summits & Conferences"
] as const;

interface CurrentAffairsCache {
  selectedCategory: CurrentAffairsGeneratorInput['category'];
  summary: string | null;
}

const CURRENT_AFFAIRS_CACHE_KEY = "current-affairs-cache";


export default function CurrentAffairsView() {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CurrentAffairsGeneratorInput['category']>('General');
  const { toast } = useToast();

  useEffect(() => {
    try {
      const cachedData = localStorage.getItem(CURRENT_AFFAIRS_CACHE_KEY);
      if (cachedData) {
        const parsedCache: CurrentAffairsCache = JSON.parse(cachedData);
        setSelectedCategory(parsedCache.selectedCategory || 'General');
        setSummary(parsedCache.summary);
      }
    } catch (error) {
      console.error("Failed to load current affairs cache from localStorage", error);
    }
  }, []);

  useEffect(() => {
    const cacheData: CurrentAffairsCache = { selectedCategory, summary };
    try {
      localStorage.setItem(CURRENT_AFFAIRS_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Failed to save current affairs to localStorage", error);
    }
  }, [selectedCategory, summary]);

  const handleCategoryChange = (value: CurrentAffairsGeneratorInput['category']) => {
    setSelectedCategory(value);
    setSummary(null); // Clear summary when category changes, will fetch new one on submit
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setSummary(null);

    try {
      const output: CurrentAffairsGeneratorOutput = await generateCurrentAffairs({
        category: selectedCategory,
      });
      setSummary(output.summary);
      if (!output.summary) {
        toast({ title: "No Summary Generated", description: "The AI couldn't generate current affairs for the selected category. Try a different one or try again later.", variant: "default" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to generate current affairs.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold">Current Affairs Digest</h1>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Get Recent Updates</CardTitle>
          <CardDescription>
            Select a category to get a summary of recent current affairs relevant for RRB NTPC 2025 exams. Your selection and results are cached locally.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={selectedCategory} 
                onValueChange={(value) => handleCategoryChange(value as CurrentAffairsGeneratorInput['category'])} 
                disabled={isLoading}
                name="category-select"
              >
                <SelectTrigger id="category" className="w-full md:w-[280px] shadow-sm" suppressHydrationWarning>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {currentAffairsCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? <LoadingIndicator size={20} className="mr-2" /> : null}
              Fetch Current Affairs
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
         <Card className="shadow-lg">
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <LoadingIndicator size={48} />
            <p className="mt-4 text-muted-foreground">AI is fetching current affairs, please wait...</p>
          </CardContent>
        </Card>
      )}

      {summary && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Current Affairs Summary: {selectedCategory}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-md whitespace-pre-wrap text-sm leading-relaxed shadow-inner">
              {summary}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
