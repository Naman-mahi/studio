
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
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
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

export const USER_LANGUAGE_PREFERENCE_KEY = 'user-language-preference';
const AI_QUIZ_GENERATOR_CACHE_KEY = "ai-quiz-generator-cache";
const CURRENT_AFFAIRS_CACHE_KEY = "current-affairs-cache";
const AI_SOLVER_CACHED_INPUT_KEY = "ai-solver-cached-input";
const AI_SOLVER_CACHED_RESULT_KEY = "ai-solver-cached-result";
const CHAT_SUPPORT_MESSAGES_KEY = "chat-support-messages";
const AI_QA_CHAT_MESSAGES_KEY = "ai-qa-chat-messages";
const STREAK_DATA_KEY = 'studyStreakData';
const TOPIC_AI_TUTOR_SELECTION_KEY = "topic-ai-tutor-selection";
const TOPIC_AI_TUTOR_MESSAGES_KEY_PREFIX = "topic-ai-tutor-messages";
const STUDY_PLANNER_CACHE_KEY = "study-planner-cache";


const CACHE_KEYS_TO_CLEAR = [
  AI_QA_CHAT_MESSAGES_KEY,
  CHAT_SUPPORT_MESSAGES_KEY,
  AI_SOLVER_CACHED_INPUT_KEY,
  AI_SOLVER_CACHED_RESULT_KEY,
  AI_QUIZ_GENERATOR_CACHE_KEY,
  CURRENT_AFFAIRS_CACHE_KEY,
  STREAK_DATA_KEY,
  TOPIC_AI_TUTOR_SELECTION_KEY,
  USER_LANGUAGE_PREFERENCE_KEY,
  STUDY_PLANNER_CACHE_KEY,
];


export const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi (हिन्दी)' },
  { code: 'mr', name: 'Marathi (मराठी)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
];

export function getStoredLanguage(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(USER_LANGUAGE_PREFERENCE_KEY) || 'en';
  }
  return 'en';
}

export default function SettingsView() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [isClient, setIsClient] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setSelectedLanguage(getStoredLanguage());
  }, []);

  const handleLanguageChange = (newLanguage: string) => {
    setSelectedLanguage(newLanguage);
    localStorage.setItem(USER_LANGUAGE_PREFERENCE_KEY, newLanguage);
    toast.success(`AI language preference updated to ${supportedLanguages.find(l => l.code === newLanguage)?.name || newLanguage}.`);
    // Optionally, notify user that existing cached AI content in other languages might need regeneration
    // or that the page might need a refresh for some components to pick up the new language for new AI requests.
  };

  const handleClearCache = () => {
    try {
      let clearedCount = 0;
      CACHE_KEYS_TO_CLEAR.forEach(key => {
        if (localStorage.getItem(key) !== null) {
            localStorage.removeItem(key);
            clearedCount++;
        }
      });

      // Clear topic tutor messages which are stored with dynamic keys
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(TOPIC_AI_TUTOR_MESSAGES_KEY_PREFIX + "-")) {
          localStorage.removeItem(key);
          clearedCount++;
        }
      });
      
      if (clearedCount > 0) {
        toast.success("All locally stored application data has been cleared.");
      } else {
        toast.info("No cached data found to clear.");
      }
    } catch (error) {
      console.error("Failed to clear cache:", error);
      toast.error("Could not clear all cached data. Please try again.");
    }
    setIsAlertOpen(false);
    // Optionally, reload or notify user that some changes might require a refresh or re-interaction
    window.location.reload(); // Reload to ensure all components re-fetch or reset their state
  };


  if (!isClient) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-headline font-bold">Settings</h1>
        <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
          <CardHeader>
            <CardTitle className="font-headline">Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Loading settings...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold">Settings</h1>
      <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
        <CardHeader>
          <CardTitle className="font-headline">Language Preference for AI Content</CardTitle>
          <CardDescription>
            Choose your preferred language for AI-generated content like chat responses, explanations, and summaries.
            The main application UI will remain in English. The AI will attempt to use the selected language where possible.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language-select">Preferred Language</Label>
            <Select value={selectedLanguage} onValueChange={handleLanguageChange} name="language-select">
              <SelectTrigger id="language-select" className="w-full md:w-[280px] shadow-sm" suppressHydrationWarning>
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
           <p className="text-sm text-muted-foreground">
            Note: Language changes will apply to new AI interactions. Existing cached content may still be in the previous language until it's regenerated or cleared.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
        <CardHeader>
          <CardTitle className="font-headline">Manage Application Data</CardTitle>
          <CardDescription>
            Clear all locally cached data from this application in your browser. This includes chat histories, saved inputs, generated content, study streak progress, topic selections, and language preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="shadow-md hover:shadow-lg">
                <Trash2 className="mr-2 h-4 w-4" /> Clear All Cached Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="shadow-xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently delete all cached application data stored in your browser. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearCache} className="bg-destructive hover:bg-destructive/90 shadow-md hover:shadow-lg">
                  Yes, clear all data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
