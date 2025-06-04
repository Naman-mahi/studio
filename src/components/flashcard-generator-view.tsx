'use client';

import { useState, type FormEvent, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateFlashcards } from "@/app/(app)/flashcards/actions";
import type { FlashcardGeneratorInput, FlashcardGeneratorOutput } from '@/ai/flows/flashcard-generator';
import toast from 'react-hot-toast';
import { LoadingIndicator } from "@/components/loading-indicator";
import { getStoredLanguage } from "./settings-view";
import { Layers, Sparkles, RotateCcw, ArrowLeft, ArrowRight, Shuffle, FileText, Copy } from "lucide-react";

interface Flashcard {
  term: string;
  definition: string;
}

interface FlashcardConfig {
  subject: string;
  topic: string;
  numFlashcards: number;
}

interface FlashcardCache {
  config: FlashcardConfig | null;
  generatedFlashcards: Flashcard[] | null;
  languageAtGeneration: string | null;
}

const FLASHCARD_GENERATOR_CACHE_KEY = "flashcard-generator-cache";

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
const numFlashcardsOptions = [3, 5, 7, 10, 12, 15];

type FlashcardState = "configuring" | "generating" | "viewing";

export default function FlashcardGeneratorView() {
  const [isLoading, setIsLoading] = useState(false);
  const [flashcardUIState, setFlashcardUIState] = useState<FlashcardState>("configuring");
  
  const [config, setConfig] = useState<FlashcardConfig>({
    subject: "", topic: "", numFlashcards: 5,
  });
  const [generatedFlashcards, setGeneratedFlashcards] = useState<Flashcard[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [languageAtGeneration, setLanguageAtGeneration] = useState<string | null>(null);

  useEffect(() => {
    const initialLang = getStoredLanguage();
    setCurrentLanguage(initialLang);
    try {
      const cachedDataString = localStorage.getItem(FLASHCARD_GENERATOR_CACHE_KEY);
      if (cachedDataString) {
        const parsedCache: FlashcardCache = JSON.parse(cachedDataString);
        if (parsedCache.config) setConfig(parsedCache.config);
        
        if (parsedCache.languageAtGeneration === initialLang) {
            setLanguageAtGeneration(parsedCache.languageAtGeneration);
            if (parsedCache.generatedFlashcards && parsedCache.generatedFlashcards.length > 0) {
                setGeneratedFlashcards(parsedCache.generatedFlashcards);
                setCurrentFlashcardIndex(0);
                setIsFlipped(false);
                setFlashcardUIState("viewing");
            }
        } else {
            resetToConfiguring(true); // Language mismatch
        }
      }
    } catch (error) {
      console.error("Failed to load flashcard cache from localStorage", error);
      localStorage.removeItem(FLASHCARD_GENERATOR_CACHE_KEY);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const newLang = getStoredLanguage();
      if (newLang !== currentLanguage) {
        setCurrentLanguage(newLang);
        if (languageAtGeneration && newLang !== languageAtGeneration) {
            resetToConfiguring(true);
            toast.info("Language changed. Please regenerate flashcards for the new language.");
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const lang = getStoredLanguage();
      if (lang !== currentLanguage) {
         setCurrentLanguage(lang);
         if (languageAtGeneration && lang !== languageAtGeneration) {
            resetToConfiguring(true);
            toast.info("Language changed. Please regenerate flashcards for the new language.");
        }
      }
    }, 1000);

    const cacheData: FlashcardCache = { 
        config: config, 
        generatedFlashcards: flashcardUIState === "configuring" ? null : generatedFlashcards,
        languageAtGeneration
    };
    localStorage.setItem(FLASHCARD_GENERATOR_CACHE_KEY, JSON.stringify(cacheData));
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [config, generatedFlashcards, flashcardUIState, currentLanguage, languageAtGeneration]);

  const resetToConfiguring = (keepConfig: boolean = false) => {
    setFlashcardUIState("configuring");
    setGeneratedFlashcards([]);
    setCurrentFlashcardIndex(0);
    setIsFlipped(false);
    if (!keepConfig) {
        setConfig({ subject: "", topic: "", numFlashcards: 5 });
    }
  };

  const handleConfigChange = (field: keyof FlashcardConfig, value: any) => {
    const newConfig = { ...config, [field]: value };
    if (field === "subject") {
        newConfig.topic = "";
    }
    setConfig(newConfig);
    if (flashcardUIState !== "configuring") {
        resetToConfiguring(true);
    }
  };

  const handleSubmitConfig = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!config.subject) { toast.error("Please select a subject."); return; }
    if (!config.topic) { toast.error("Please select a topic."); return; }

    setIsLoading(true);
    setFlashcardUIState("generating");
    resetToConfiguring(true); // Clear old cards but keep config

    try {
      const lang = getStoredLanguage();
      setLanguageAtGeneration(lang);
      const output: FlashcardGeneratorOutput = await generateFlashcards({
        ...config,
        language: lang,
      });
      if (output.flashcards && output.flashcards.length > 0) {
        setGeneratedFlashcards(output.flashcards);
        setCurrentFlashcardIndex(0);
        setIsFlipped(false);
        setFlashcardUIState("viewing");
      } else {
        toast("AI couldn't generate flashcards. Try different inputs.", { duration: 4000 });
        resetToConfiguring(true);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to generate flashcards.");
      resetToConfiguring(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFlipCard = () => setIsFlipped(!isFlipped);

  const navigateFlashcard = (direction: 'next' | 'prev') => {
    setIsFlipped(false); // Always show term first on new card
    if (direction === 'next') {
        setCurrentFlashcardIndex(prev => (prev + 1) % generatedFlashcards.length);
    } else if (direction === 'prev') {
        setCurrentFlashcardIndex(prev => (prev - 1 + generatedFlashcards.length) % generatedFlashcards.length);
    }
  };
  
  const handleShuffle = useCallback(() => {
    setGeneratedFlashcards(prevCards => {
        const shuffled = [...prevCards];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    });
    setCurrentFlashcardIndex(0);
    setIsFlipped(false);
    toast.success("Flashcards shuffled!");
  }, []);


  const availableTopics = useMemo(() => {
    return config.subject ? rrbNTPCSubjectsAndTopics[config.subject] || [] : [];
  }, [config.subject]);
  
  const renderConfiguration = () => (
    <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
      <CardHeader>
        <CardTitle className="font-headline">Configure Your AI Flashcards</CardTitle>
        <CardDescription>
          Select subject, topic, and number of flashcards. AI will attempt to use your preferred language.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmitConfig} className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={config.subject} onValueChange={(val) => handleConfigChange("subject", val)} disabled={isLoading} name="subject-select">
                <SelectTrigger id="subject" suppressHydrationWarning><SelectValue placeholder="Select Subject" /></SelectTrigger>
                <SelectContent>{subjectOptions.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Select value={config.topic} onValueChange={(val) => handleConfigChange("topic", val)} disabled={isLoading || !config.subject || availableTopics.length === 0} name="topic-select">
                <SelectTrigger id="topic" suppressHydrationWarning><SelectValue placeholder="Select Topic" /></SelectTrigger>
                <SelectContent>{availableTopics.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="numFlashcards">Number of Flashcards</Label>
              <Select value={String(config.numFlashcards)} onValueChange={(val) => handleConfigChange("numFlashcards", parseInt(val,10))} disabled={isLoading} name="numFlashcards-select">
                <SelectTrigger id="numFlashcards" suppressHydrationWarning><SelectValue placeholder="Select number" /></SelectTrigger>
                <SelectContent>{numFlashcardsOptions.map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={isLoading || !config.subject || !config.topic} className="w-full md:w-auto shadow-md hover:shadow-lg">
            {isLoading ? <LoadingIndicator size={20} className="mr-2" /> : <Sparkles className="mr-2 h-5 w-5"/>}
            Generate Flashcards
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderFlashcardViewing = () => {
    if (generatedFlashcards.length === 0) return null;
    const currentCard = generatedFlashcards[currentFlashcardIndex];
    if (!currentCard) return null;

    return (
      <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="font-headline">Flashcard {currentFlashcardIndex + 1} of {generatedFlashcards.length}</CardTitle>
            <Button variant="outline" size="sm" onClick={handleShuffle} className="shadow-sm hover:shadow-md">
                <Shuffle className="mr-2 h-4 w-4"/> Shuffle
            </Button>
          </div>
          <CardDescription>{config.topic} ({config.subject})</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div 
            className={`relative w-full h-64 md:h-80 perspective group cursor-pointer shadow-xl rounded-lg border bg-card transition-all duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
            onClick={handleFlipCard}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') handleFlipCard();}}
            aria-label={`Flashcard. Front: ${currentCard.term}. Click or press space/enter to flip.`}
          >
            {/* Front of card */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center p-6 backface-hidden rounded-lg">
              <p className="text-xl md:text-2xl font-semibold text-center text-card-foreground whitespace-pre-wrap">{currentCard.term}</p>
            </div>
            {/* Back of card */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center p-6 bg-muted text-muted-foreground backface-hidden rotate-y-180 rounded-lg">
              <p className="text-md md:text-lg text-center whitespace-pre-wrap">{currentCard.definition}</p>
            </div>
          </div>
           <div className="text-center text-sm text-muted-foreground">(Click card to flip)</div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <Button variant="outline" onClick={() => resetToConfiguring(true)} className="w-full sm:w-auto shadow-sm hover:shadow-md">
            <RotateCcw className="mr-2 h-4 w-4" /> New Set
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={() => navigateFlashcard('prev')} className="flex-1 sm:flex-initial shadow-sm hover:shadow-md">
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <Button onClick={() => navigateFlashcard('next')} className="flex-1 sm:flex-initial shadow-md hover:shadow-lg">
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <style jsx global>{`
        .perspective { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
      <div className="flex items-center gap-2">
         <Copy className="h-8 w-8 text-primary" />
         <h1 className="text-3xl font-headline font-bold">AI Flashcard Generator</h1>
      </div>
     
      {flashcardUIState === "generating" && (
        <Card className="shadow-lg">
          <CardHeader className="items-center">
            <CardTitle className="font-headline text-xl">AI is Crafting Your Flashcards!</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <LoadingIndicator size={48} />
            <p className="mt-4 text-muted-foreground">Please wait while the flashcards are being generated...</p>
          </CardContent>
        </Card>
      )}

      {flashcardUIState === "configuring" && renderConfiguration()}
      {flashcardUIState === "viewing" && renderFlashcardViewing()}
    </div>
  );
}
