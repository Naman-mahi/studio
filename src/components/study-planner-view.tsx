
"use client";

import { useState, type FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateStudyPlan } from "@/app/(app)/study-planner/actions";
import type { StudyPlanGeneratorInput, StudyPlanGeneratorOutput } from '@/ai/flows/study-plan-generator';
import toast from 'react-hot-toast';
import { LoadingIndicator } from "@/components/loading-indicator";
import { getStoredLanguage } from "./settings-view";
import { CalendarCheck, ListChecks, Lightbulb, Sparkles, CheckSquare } from "lucide-react";

interface StudyPlannerCache {
  input: StudyPlanGeneratorInput;
  plan: StudyPlanGeneratorOutput | null;
  languageAtGeneration: string | null;
}

const STUDY_PLANNER_CACHE_KEY = "study-planner-cache";

export default function StudyPlannerView() {
  const [isLoading, setIsLoading] = useState(false);
  const [formInput, setFormInput] = useState<StudyPlanGeneratorInput>({
    targetExam: "RRB NTPC 2025",
    studyDurationMonths: 6,
    hoursPerWeek: 15,
    subjectsToFocus: [],
    language: 'en',
  });
  const [generatedPlan, setGeneratedPlan] = useState<StudyPlanGeneratorOutput | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [languageAtGeneration, setLanguageAtGeneration] = useState<string | null>(null);

  useEffect(() => {
    const initialLang = getStoredLanguage();
    setCurrentLanguage(initialLang);
    setFormInput(prev => ({ ...prev, language: initialLang }));

    try {
      const cachedDataString = localStorage.getItem(STUDY_PLANNER_CACHE_KEY);
      if (cachedDataString) {
        const parsedCache: StudyPlannerCache = JSON.parse(cachedDataString);
        setFormInput(prev => ({ ...prev, ...parsedCache.input, language: initialLang }));
        
        if (parsedCache.languageAtGeneration === initialLang && parsedCache.plan) {
          setGeneratedPlan(parsedCache.plan);
          setLanguageAtGeneration(parsedCache.languageAtGeneration);
        } else {
          setGeneratedPlan(null);
          setLanguageAtGeneration(null);
        }
      }
    } catch (error) {
      console.error("Failed to load study planner cache from localStorage", error);
      localStorage.removeItem(STUDY_PLANNER_CACHE_KEY);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const newLang = getStoredLanguage();
      if (newLang !== currentLanguage) {
        setCurrentLanguage(newLang);
        setFormInput(prev => ({ ...prev, language: newLang }));
        if (languageAtGeneration && newLang !== languageAtGeneration) {
            setGeneratedPlan(null); // Clear plan if language mismatches generation language
            toast.info("Language changed. Please regenerate the study plan for the new language.");
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const lang = getStoredLanguage();
      if (lang !== currentLanguage) {
         setCurrentLanguage(lang);
         setFormInput(prev => ({ ...prev, language: lang }));
         if (languageAtGeneration && lang !== languageAtGeneration) {
            setGeneratedPlan(null);
            toast.info("Language changed. Please regenerate the study plan for the new language.");
        }
      }
    }, 1000);

    const cacheData: StudyPlannerCache = { 
        input: formInput, 
        plan: generatedPlan,
        languageAtGeneration
    };
    localStorage.setItem(STUDY_PLANNER_CACHE_KEY, JSON.stringify(cacheData));
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [formInput, generatedPlan, currentLanguage, languageAtGeneration]);


  const handleInputChange = (field: keyof Omit<StudyPlanGeneratorInput, 'subjectsToFocus' | 'language'>, value: string | number | undefined) => {
    setFormInput(prev => ({ ...prev, [field]: value }));
    setGeneratedPlan(null); // Clear plan if input changes
  };

  const handleSubjectsChange = (value: string) => {
    const subjectsArray = value.split(',').map(s => s.trim()).filter(s => s);
    setFormInput(prev => ({ ...prev, subjectsToFocus: subjectsArray }));
    setGeneratedPlan(null);
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setGeneratedPlan(null);
    const lang = getStoredLanguage();
    setFormInput(prev => ({ ...prev, language: lang }));
    setLanguageAtGeneration(lang);

    try {
      const plan = await generateStudyPlan({ ...formInput, language: lang });
      if (plan && plan.weeklyBreakdown && plan.weeklyBreakdown.length > 0) {
        setGeneratedPlan(plan);
      } else {
        toast.error("AI could not generate a plan with the provided inputs. Try adjusting them.");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to generate study plan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CalendarCheck className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-headline font-bold">Personalized Study Planner</h1>
      </div>

      <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
        <CardHeader>
          <CardTitle className="font-headline">Create Your Study Roadmap</CardTitle>
          <CardDescription>
            Tell us about your goals, and our AI will generate a personalized study plan for your RRB NTPC preparation. 
            Your inputs and the last generated plan (for the current language) are saved locally.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="targetExam">Target Exam</Label>
                <Input 
                  id="targetExam" 
                  value={formInput.targetExam} 
                  onChange={e => handleInputChange('targetExam', e.target.value)} 
                  disabled={isLoading}
                  placeholder="e.g., RRB NTPC 2025"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studyDurationMonths">Study Duration (Months)</Label>
                 <Select 
                  value={String(formInput.studyDurationMonths || "not-specified")} 
                  onValueChange={val => handleInputChange('studyDurationMonths', val === "not-specified" ? undefined : parseInt(val))}
                  disabled={isLoading}
                >
                  <SelectTrigger id="studyDurationMonths"><SelectValue placeholder="Select duration" /></SelectTrigger>
                  <SelectContent>
                    {[3, 6, 9, 12].map(m => <SelectItem key={m} value={String(m)}>{m} months</SelectItem>)}
                    <SelectItem value="not-specified">Not specified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
               <div className="space-y-2">
                <Label htmlFor="hoursPerWeek">Study Hours per Week (Approx.)</Label>
                <Select 
                  value={String(formInput.hoursPerWeek || "not-specified")} 
                  onValueChange={val => handleInputChange('hoursPerWeek', val === "not-specified" ? undefined : parseInt(val))}
                  disabled={isLoading}
                >
                  <SelectTrigger id="hoursPerWeek"><SelectValue placeholder="Select hours" /></SelectTrigger>
                  <SelectContent>
                    {[5, 10, 15, 20, 25, 30].map(h => <SelectItem key={h} value={String(h)}>{h} hours</SelectItem>)}
                     <SelectItem value="not-specified">Not specified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subjectsToFocus">Subjects/Topics to Prioritize (Optional)</Label>
                <Textarea
                  id="subjectsToFocus"
                  value={(formInput.subjectsToFocus || []).join(', ')}
                  onChange={e => handleSubjectsChange(e.target.value)}
                  placeholder="e.g., Algebra, Indian History, Current Affairs (comma-separated)"
                  disabled={isLoading}
                  rows={2}
                />
                 <p className="text-xs text-muted-foreground">Separate multiple subjects/topics with a comma.</p>
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto shadow-md hover:shadow-lg">
              {isLoading ? <LoadingIndicator size={20} className="mr-2" /> : <Sparkles className="mr-2 h-5 w-5"/>}
              Generate Plan
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card className="shadow-lg">
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <LoadingIndicator size={48} />
            <p className="mt-4 text-muted-foreground">AI is crafting your personalized study plan...</p>
          </CardContent>
        </Card>
      )}

      {generatedPlan && (
        <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out mt-6">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary">{generatedPlan.planTitle}</CardTitle>
            <CardDescription className="text-md">{generatedPlan.overview}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-headline text-xl font-semibold mb-3 flex items-center gap-2">
                <ListChecks className="h-6 w-6 text-accent" />
                Study Breakdown
              </h3>
              <div className="space-y-4">
                {generatedPlan.weeklyBreakdown.map((item, index) => (
                  <Card key={index} className="bg-muted/30 dark:bg-muted/20 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="font-headline text-lg">{item.week}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div>
                        <strong className="text-foreground">Focus Areas:</strong>
                        <ul className="list-disc list-inside pl-2 text-muted-foreground">
                          {item.focusAreas.map((area, i) => <li key={i}>{area}</li>)}
                        </ul>
                      </div>
                      <div>
                        <strong className="text-foreground">Suggested Activities:</strong>
                         <ul className="list-disc list-inside pl-2 text-muted-foreground">
                          {item.suggestedActivities.map((activity, i) => <li key={i}>{activity}</li>)}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-headline text-xl font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-amber-500" />
                Tips for Success
              </h3>
              <ul className="list-inside space-y-2 text-sm text-muted-foreground">
                {generatedPlan.tipsForSuccess.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <CheckSquare size={18} className="mr-2 mt-0.5 text-green-500 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter>
             <Button onClick={() => {setGeneratedPlan(null); setIsLoading(false);}} variant="outline" className="shadow-sm hover:shadow-md">
                Create New Plan
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

