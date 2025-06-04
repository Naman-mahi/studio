
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Flame, Target, CheckCircle2 } from 'lucide-react';

const STREAK_DATA_KEY = 'studyStreakData';

interface StudyStreakData {
  currentStreak: number;
  lastCompletionDate: string | null; // YYYY-MM-DD
  dailyGoal: string;
  goalAchievedToday: boolean;
}

const defaultStreakData: StudyStreakData = {
  currentStreak: 0,
  lastCompletionDate: null,
  dailyGoal: '',
  goalAchievedToday: false,
};

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export default function StudyStreakTracker() {
  const [streakData, setStreakData] = useState<StudyStreakData>(defaultStreakData);
  const [currentGoalInput, setCurrentGoalInput] = useState('');
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true); // Ensure localStorage is only accessed on the client
  }, []);

  useEffect(() => {
    if (!isClient) return;

    try {
      const cachedData = localStorage.getItem(STREAK_DATA_KEY);
      let loadedData = cachedData ? JSON.parse(cachedData) : defaultStreakData;

      const today = getTodayDateString();
      // Reset goalAchievedToday if it's a new day
      if (loadedData.lastCompletionDate !== today && loadedData.goalAchievedToday) {
        loadedData = { ...loadedData, goalAchievedToday: false };
      }
      // If goal was set but not achieved on a previous day, and it's a new day, clear the old goal text
      // but preserve streak if lastCompletionDate implies it's still active
      if (loadedData.dailyGoal && loadedData.lastCompletionDate !== today && !loadedData.goalAchievedToday) {
        // Keep dailyGoal if it was just set today and not yet achieved
        // This scenario is covered by simply loading the data.
        // If it's a *new* day and the previous day's goal wasn't achieved, it's fine for it to persist
        // for the user to re-evaluate or achieve.
      }


      setStreakData(loadedData);
      setCurrentGoalInput(loadedData.dailyGoal || '');

    } catch (error) {
      console.error("Failed to load streak data from localStorage", error);
      setStreakData(defaultStreakData);
    }
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;
    try {
      localStorage.setItem(STREAK_DATA_KEY, JSON.stringify(streakData));
    } catch (error) {
      console.error("Failed to save streak data to localStorage", error);
    }
  }, [streakData, isClient]);

  const handleSetGoal = (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!currentGoalInput.trim()) {
        toast({ title: "Goal Empty", description: "Please enter a goal.", variant: "destructive"});
        return;
    }
    setStreakData(prev => ({ ...prev, dailyGoal: currentGoalInput.trim(), goalAchievedToday: false })); // Reset achieved status if goal changes
    toast({ title: "Goal Set!", description: `Your daily goal is: ${currentGoalInput.trim()}`});
  };

  const handleAchieveGoal = () => {
    if (!streakData.dailyGoal) {
      toast({ title: "No Goal Set", description: "Please set a daily goal first.", variant: "destructive" });
      return;
    }

    const today = getTodayDateString();
    let newStreak = streakData.currentStreak;

    if (streakData.lastCompletionDate === today && streakData.goalAchievedToday) {
        toast({ title: "Already Achieved", description: "You've already achieved your goal for today!", variant: "default" });
        return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    if (streakData.lastCompletionDate === yesterdayString) {
      newStreak++;
    } else if (streakData.lastCompletionDate !== today) {
      // If last completion wasn't yesterday or today, streak resets to 1
      newStreak = 1;
    } else {
       // If lastCompletionDate is today, but goalAchievedToday was false, it's the first achievement today
       // If streak was 0, it becomes 1. If >0 it implies it was from yesterday, so it just continues.
       // This case means they are marking it for the first time today
       if (newStreak === 0) newStreak = 1;
       // if newStreak > 0 and lastCompletionDate is also today, it means they marked it, then unmarked it (not possible with current UI), or changed goal
       // and are now re-marking it. Streak should continue.
    }
    
    setStreakData(prev => ({
      ...prev,
      currentStreak: newStreak,
      lastCompletionDate: today,
      goalAchievedToday: true,
    }));
    toast({ title: "Goal Achieved!", description: `Great job! Your streak is now ${newStreak}.`, className: "bg-green-500 text-white" });
  };
  
  if (!isClient) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-xl">
            <Target className="text-accent w-6 h-6" /> Daily Study Goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading goal tracker...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-xl md:text-2xl">
          <Target className="text-accent w-6 h-6 md:w-7 md:h-7" /> Daily Study Goal
        </CardTitle>
        {streakData.currentStreak > 0 && (
          <div className="flex items-center gap-2 text-lg md:text-xl font-semibold text-amber-500 pt-2">
            <Flame className="w-5 h-5 md:w-6 md:h-6" />
            Your Current Streak: {streakData.currentStreak} day{streakData.currentStreak > 1 ? 's' : ''}!
          </div>
        )}
         <CardDescription>Set a daily goal to stay motivated. Mark it complete to build your streak!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSetGoal} className="space-y-3">
          <div>
            <Label htmlFor="dailyGoal" className="text-base">What's your study goal for today?</Label>
            <Input
              id="dailyGoal"
              type="text"
              value={currentGoalInput}
              onChange={(e) => setCurrentGoalInput(e.target.value)}
              placeholder="e.g., Solve 20 math problems"
              className="mt-1 text-base"
              disabled={streakData.goalAchievedToday}
            />
          </div>
          <Button type="submit" className="w-full sm:w-auto" disabled={streakData.goalAchievedToday}>
            {streakData.dailyGoal && !streakData.goalAchievedToday ? "Update Goal" : "Set Goal"}
          </Button>
        </form>

        {streakData.dailyGoal && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-semibold text-lg mb-2">Today's Goal: <span className="font-normal text-primary">{streakData.dailyGoal}</span></h4>
            {streakData.goalAchievedToday ? (
              <div className="flex items-center gap-2 p-3 rounded-md bg-green-100 text-green-700 border border-green-300">
                <CheckCircle2 className="w-6 h-6" />
                <p className="font-medium">Goal achieved for today! Keep it up!</p>
              </div>
            ) : (
              <Button onClick={handleAchieveGoal} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle2 className="mr-2 h-5 w-5" /> Mark as Achieved
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
