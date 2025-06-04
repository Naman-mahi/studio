
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
import { Trash2, AlertTriangle } from 'lucide-react';
import { POINTS_STORAGE_KEY, resetUserPoints } from '@/lib/points';
import { USER_STATS_KEY } from '@/lib/user-stats';
import { EARNED_BADGES_KEY } from '@/lib/badges';


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
const FLASHCARD_GENERATOR_CACHE_KEY = "flashcard-generator-cache";
const BOOKMARKS_KEY = 'prepPalAiBookmarks';
const QUIZ_HISTORY_KEY = "ai-quiz-history";


const ALL_CACHE_KEYS = [
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
  FLASHCARD_GENERATOR_CACHE_KEY,
  BOOKMARKS_KEY,
  POINTS_STORAGE_KEY,
  USER_STATS_KEY,
  EARNED_BADGES_KEY,
  QUIZ_HISTORY_KEY,
];

const CHAT_CACHE_KEYS = [AI_QA_CHAT_MESSAGES_KEY, CHAT_SUPPORT_MESSAGES_KEY, TOPIC_AI_TUTOR_SELECTION_KEY];
const QUIZ_FLASHCARD_KEYS = [AI_QUIZ_GENERATOR_CACHE_KEY, FLASHCARD_GENERATOR_CACHE_KEY, QUIZ_HISTORY_KEY];
const PLAN_SOLVER_KEYS = [STUDY_PLANNER_CACHE_KEY, AI_SOLVER_CACHED_INPUT_KEY, AI_SOLVER_CACHED_RESULT_KEY];
const STATS_BADGES_POINTS_KEYS = [USER_STATS_KEY, EARNED_BADGES_KEY, POINTS_STORAGE_KEY];


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

type AlertContextType = 'all' | 'chats' | 'quiz_flashcards' | 'plan_solver' | 'current_affairs' | 'bookmarks' | 'streak' | 'stats_badges_points' | null;

export default function SettingsView() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [isClient, setIsClient] = useState(false);
  const [alertContext, setAlertContext] = useState<AlertContextType>(null);

  useEffect(() => {
    setIsClient(true);
    setSelectedLanguage(getStoredLanguage());
  }, []);

  const handleLanguageChange = (newLanguage: string) => {
    setSelectedLanguage(newLanguage);
    localStorage.setItem(USER_LANGUAGE_PREFERENCE_KEY, newLanguage);
    toast.success(`AI language preference updated to ${supportedLanguages.find(l => l.code === newLanguage)?.name || newLanguage}. Page will reload to apply changes across all components.`);
    setTimeout(() => window.location.reload(), 1500);
  };
  
  const clearSpecificCache = (keysToClear: string[], clearTopicTutorMessages: boolean = false) => {
    let clearedCount = 0;
    keysToClear.forEach(key => {
        if (localStorage.getItem(key) !== null) {
            localStorage.removeItem(key);
            clearedCount++;
        }
    });

    if (clearTopicTutorMessages) {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(TOPIC_AI_TUTOR_MESSAGES_KEY_PREFIX + "-")) {
              localStorage.removeItem(key);
              clearedCount++;
            }
          });
    }
    return clearedCount;
  }

  const handleClearData = () => {
    if (!alertContext) return;

    let clearedCount = 0;
    let toastMessage = "";

    try {
      if (alertContext === 'all') {
        clearedCount = clearSpecificCache(ALL_CACHE_KEYS, true);
        // resetUserPoints(); // This is already part of ALL_CACHE_KEYS via POINTS_STORAGE_KEY
        toastMessage = "All locally stored application data has been cleared.";
      } else if (alertContext === 'chats') {
        clearedCount = clearSpecificCache(CHAT_CACHE_KEYS, true);
        toastMessage = "Chat histories and related topic selections cleared.";
      } else if (alertContext === 'quiz_flashcards') {
        clearedCount = clearSpecificCache(QUIZ_FLASHCARD_KEYS);
        toastMessage = "Quiz, flashcard, and quiz history data cleared.";
      } else if (alertContext === 'plan_solver') {
        clearedCount = clearSpecificCache(PLAN_SOLVER_KEYS);
        toastMessage = "Study plans and AI solver data cleared.";
      } else if (alertContext === 'current_affairs') {
        clearedCount = clearSpecificCache([CURRENT_AFFAIRS_CACHE_KEY]);
        toastMessage = "Current affairs cache cleared.";
      } else if (alertContext === 'bookmarks') {
        clearedCount = clearSpecificCache([BOOKMARKS_KEY]);
        toastMessage = "Bookmarks cleared.";
      } else if (alertContext === 'streak') {
        clearedCount = clearSpecificCache([STREAK_DATA_KEY]);
        toastMessage = "Study streak data cleared.";
      } else if (alertContext === 'stats_badges_points') {
        clearedCount = clearSpecificCache(STATS_BADGES_POINTS_KEYS);
        toastMessage = "User statistics, badges, and points cleared.";
      }


      if (clearedCount > 0) {
        toast.success(toastMessage);
      } else {
        toast.info("No relevant cached data found to clear for this category.");
      }
    } catch (error) {
      console.error("Failed to clear cache:", error);
      toast.error("Could not clear all requested cached data. Please try again.");
    }
    setAlertContext(null);
    if (alertContext === 'all' || alertContext === 'chats' || alertContext === 'stats_badges_points') { 
        window.location.reload();
    }
  };
  
  const openAlert = (context: AlertContextType) => setAlertContext(context);

  if (!isClient) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-headline font-bold">Settings</h1>
        <Card className="shadow-lg">
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
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold">Settings</h1>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Language Preference for AI Content</CardTitle>
          <CardDescription>
            Choose your preferred language for AI-generated content. The main UI remains in English.
            Changing this setting will reload the page.
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
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-destructive flex items-center gap-2"><AlertTriangle size={24}/>Manage Application Data</CardTitle>
          <CardDescription>
            Clear locally cached data from this application in your browser. These actions cannot be undone. Some actions may reload the page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Clear Specific Data</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" onClick={() => openAlert('chats')} className="justify-start text-left shadow-sm hover:shadow-md">
                    <Trash2 className="mr-2 h-4 w-4" /> Clear Chat Histories
                </Button>
                <Button variant="outline" onClick={() => openAlert('quiz_flashcards')} className="justify-start text-left shadow-sm hover:shadow-md">
                    <Trash2 className="mr-2 h-4 w-4" /> Clear Quiz, Flashcard &amp; History Data
                </Button>
                <Button variant="outline" onClick={() => openAlert('plan_solver')} className="justify-start text-left shadow-sm hover:shadow-md">
                    <Trash2 className="mr-2 h-4 w-4" /> Clear Study Plans &amp; Solver Data
                </Button>
                <Button variant="outline" onClick={() => openAlert('current_affairs')} className="justify-start text-left shadow-sm hover:shadow-md">
                    <Trash2 className="mr-2 h-4 w-4" /> Clear Current Affairs Cache
                </Button>
                 <Button variant="outline" onClick={() => openAlert('bookmarks')} className="justify-start text-left shadow-sm hover:shadow-md">
                    <Trash2 className="mr-2 h-4 w-4" /> Clear Bookmarks
                </Button>
                <Button variant="outline" onClick={() => openAlert('streak')} className="justify-start text-left shadow-sm hover:shadow-md">
                    <Trash2 className="mr-2 h-4 w-4" /> Clear Study Streak Data
                </Button>
                 <Button variant="outline" onClick={() => openAlert('stats_badges_points')} className="justify-start text-left shadow-sm hover:shadow-md">
                    <Trash2 className="mr-2 h-4 w-4" /> Clear Stats, Badges &amp; Points
                </Button>
            </div>
            <div className="pt-4 mt-4 border-t">
                 <h3 className="text-lg font-medium text-destructive">Clear All Data</h3>
                 <p className="text-sm text-muted-foreground mb-3">This will remove all application data, including points and language preferences, and reload the page.</p>
                <Button variant="destructive" onClick={() => openAlert('all')} className="shadow-md hover:shadow-lg">
                    <Trash2 className="mr-2 h-4 w-4" /> Clear All Cached Application Data
                </Button>
            </div>
        </CardContent>
      </Card>

      <AlertDialog open={alertContext !== null} onOpenChange={(isOpen) => !isOpen && setAlertContext(null)}>
        <AlertDialogContent className="shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {alertContext === 'all' && "This action will permanently delete ALL cached application data stored in your browser, including your points, stats, badges, and language preference. This cannot be undone. The page will reload after clearing."}
              {alertContext === 'chats' && "This will delete all chat histories and related topic selections. This cannot be undone."}
              {alertContext === 'quiz_flashcards' && "This will delete all cached quiz configurations, generated flashcards, and quiz attempt history. This cannot be undone."}
              {alertContext === 'plan_solver' && "This will delete all cached study plans and AI solver data. This cannot be undone."}
              {alertContext === 'current_affairs' && "This will delete the cached current affairs summary. This cannot be undone."}
              {alertContext === 'bookmarks' && "This will delete all your saved bookmarks. This cannot be undone."}
              {alertContext === 'streak' && "This will delete your study streak data. This cannot be undone."}
              {alertContext === 'stats_badges_points' && "This will delete your user statistics, earned badges, and total points. This cannot be undone. The page will reload."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAlertContext(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearData} className={`${alertContext === 'all' || alertContext === 'stats_badges_points' ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'} shadow-md hover:shadow-lg`}>
              Yes, clear data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    
