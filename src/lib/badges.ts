
'use client';

import * as React from 'react'; // Ensure React is imported
import toast from 'react-hot-toast';
import { Award, Compass, Flame, Gem, Layers, Sigma, Sparkles, Star, Trophy, CheckCircle } from 'lucide-react';
import type { UserStats } from './user-stats';
import { getUserStats } from './user-stats';
import { getUserPoints } from './points';
import type { StudyStreakData } from '@/components/study-streak-tracker';

export const EARNED_BADGES_KEY = 'prepPalAiEarnedBadges';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: 'Quiz' | 'Streak' | 'Points' | 'Feature Usage';
  criteria: (stats: UserStats, points: number, streakData?: StudyStreakData | null) => boolean;
}

export interface EarnedBadge {
  badgeId: string;
  earnedAt: string; // ISO string timestamp
}

// Helper to get streak data from localStorage
function getStudyStreakData(): StudyStreakData | null {
  if (typeof window === 'undefined') return null;
  const STREAK_DATA_KEY = 'studyStreakData';
  try {
    const data = localStorage.getItem(STREAK_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}


export const badgeDefinitions: BadgeDefinition[] = [
  // Quiz Badges
  { id: 'quiz_novice', name: 'Quiz Novice', description: 'Complete your first quiz.', icon: Award, category: 'Quiz', criteria: (stats) => stats.totalQuizzesCompleted >= 1 },
  { id: 'quiz_adept', name: 'Quiz Adept', description: 'Complete 5 quizzes.', icon: Star, category: 'Quiz', criteria: (stats) => stats.totalQuizzesCompleted >= 5 },
  { id: 'quiz_master', name: 'Quiz Master', description: 'Complete 10 quizzes.', icon: Trophy, category: 'Quiz', criteria: (stats) => stats.totalQuizzesCompleted >= 10 },
  // Streak Badges
  { id: 'streak_starter_3', name: 'Streak Starter', description: 'Achieve a 3-day study streak.', icon: Flame, category: 'Streak', criteria: (_, __, streak) => !!streak && streak.currentStreak >= 3 },
  { id: 'streak_keeper_7', name: 'Streak Keeper', description: 'Achieve a 7-day study streak.', icon: Sparkles, category: 'Streak', criteria: (_, __, streak) => !!streak && streak.currentStreak >= 7 },
  // Points Badges
  { id: 'points_earner_250', name: 'Points Earner', description: 'Earn 250 total points.', icon: Sigma, category: 'Points', criteria: (_, points) => points >= 250 },
  { id: 'points_collector_1000', name: 'Points Collector', description: 'Earn 1000 total points.', icon: Gem, category: 'Points', criteria: (_, points) => points >= 1000 },
  // Feature Usage Badges
  { id: 'topic_explorer_3', name: 'Topic Explorer', description: 'Complete quizzes on 3 unique topics.', icon: Compass, category: 'Feature Usage', criteria: (stats) => stats.uniqueQuizTopicsCompleted.length >= 3 },
  { id: 'flashcard_fan_3', name: 'Flashcard Fan', description: 'Generate 3 flashcard sets.', icon: Layers, category: 'Feature Usage', criteria: (stats) => stats.totalFlashcardSetsGenerated >= 3 },
  { id: 'all_rounder_1', name: 'PrepPal All-Rounder', description: 'Use 3 different AI features (e.g., Quiz, Flashcards, Solver).', icon: CheckCircle, category: 'Feature Usage', criteria: (stats) => stats.totalQuizzesCompleted > 0 && stats.totalFlashcardSetsGenerated > 0 /* Placeholder: Add more conditions as features are used */},
];


export function getEarnedBadges(): EarnedBadge[] {
  if (typeof window === 'undefined') return [];
  try {
    const storedBadges = localStorage.getItem(EARNED_BADGES_KEY);
    return storedBadges ? JSON.parse(storedBadges) : [];
  } catch (error) {
    console.error("Error parsing earned badges from localStorage:", error);
    return [];
  }
}

function awardBadge(badgeId: string): EarnedBadge[] {
  const currentBadges = getEarnedBadges();
  if (currentBadges.some(b => b.badgeId === badgeId)) {
    return currentBadges; // Already earned
  }

  const newBadge: EarnedBadge = { badgeId, earnedAt: new Date().toISOString() };
  const updatedBadges = [...currentBadges, newBadge];

  try {
    localStorage.setItem(EARNED_BADGES_KEY, JSON.stringify(updatedBadges));
    const badgeDef = badgeDefinitions.find(b => b.id === badgeId);
    if (badgeDef) {
      const BadgeIconComponent = badgeDef.icon; // Assign to capitalized variable
      toast.success(`Badge Unlocked: ${badgeDef.name}!`, {
        icon: React.createElement(BadgeIconComponent, { className: "text-yellow-500" }),
        duration: 4000,
      });
    }
  } catch (error) {
    console.error("Error saving earned badges to localStorage:", error);
  }
  // Dispatch a storage event so other components (if any listening to badges) can react
  window.dispatchEvent(new StorageEvent('storage', { key: EARNED_BADGES_KEY, newValue: JSON.stringify(updatedBadges) }));
  return updatedBadges;
}

export function checkAndAwardBadges() {
  if (typeof window === 'undefined') return;

  const stats = getUserStats();
  const points = getUserPoints();
  const streakData = getStudyStreakData(); 

  const earnedBadges = getEarnedBadges();

  badgeDefinitions.forEach(badgeDef => {
    if (!earnedBadges.some(eb => eb.badgeId === badgeDef.id)) { 
      if (badgeDef.criteria(stats, points, streakData)) {
        awardBadge(badgeDef.id);
      }
    }
  });
}

export function resetEarnedBadges(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(EARNED_BADGES_KEY, JSON.stringify([]));
  window.dispatchEvent(new StorageEvent('storage', { key: EARNED_BADGES_KEY, newValue: JSON.stringify([]) }));
}
