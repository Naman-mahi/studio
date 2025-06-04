
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import toast from 'react-hot-toast';

export const USER_LANGUAGE_PREFERENCE_KEY = 'user-language-preference';

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

  useEffect(() => {
    setIsClient(true);
    setSelectedLanguage(getStoredLanguage());
  }, []);

  const handleLanguageChange = (newLanguage: string) => {
    setSelectedLanguage(newLanguage);
    localStorage.setItem(USER_LANGUAGE_PREFERENCE_KEY, newLanguage);
    toast.success(`AI language preference updated to ${supportedLanguages.find(l => l.code === newLanguage)?.name || newLanguage}.`);
     // Optionally, you might want to inform the user to refresh or that changes will apply to new AI interactions.
  };

  if (!isClient) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-headline font-bold">Settings</h1>
        <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
          <CardHeader>
            <CardTitle className="font-headline">Language Preference</CardTitle>
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
              <SelectTrigger id="language-select" className="w-full md:w-[280px]" suppressHydrationWarning>
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
    </div>
  );
}
