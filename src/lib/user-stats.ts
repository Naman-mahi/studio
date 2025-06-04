
'use client';

export const USER_STATS_KEY = 'prepPalAiUserStats';

export interface UserStats {
  totalQuizzesCompleted: number;
  uniqueQuizTopicsCompleted: string[];
  totalFlashcardSetsGenerated: number;
}

const initialUserStats: UserStats = {
  totalQuizzesCompleted: 0,
  uniqueQuizTopicsCompleted: [],
  totalFlashcardSetsGenerated: 0,
};

export function getUserStats(): UserStats {
  if (typeof window === 'undefined') return { ...initialUserStats };
  try {
    const storedStats = localStorage.getItem(USER_STATS_KEY);
    if (storedStats) {
      const parsed = JSON.parse(storedStats);
      return {
        ...initialUserStats,
        ...parsed,
        uniqueQuizTopicsCompleted: Array.isArray(parsed.uniqueQuizTopicsCompleted) ? parsed.uniqueQuizTopicsCompleted : [],
      };
    }
    return { ...initialUserStats };
  } catch (error) {
    console.error("Error parsing user stats from localStorage:", error);
    return { ...initialUserStats };
  }
}

export function updateUserStats(
  action: {
    quizCompleted?: boolean;
    topic?: string; // For tracking unique topics
    subject?: string; // Could be used for more granular stats later
    flashcardSetGenerated?: boolean;
  }
): UserStats {
  if (typeof window === 'undefined') return { ...initialUserStats };
  
  let currentStats = getUserStats();

  if (action.quizCompleted) {
    currentStats.totalQuizzesCompleted = (currentStats.totalQuizzesCompleted || 0) + 1;
    if (action.topic && !currentStats.uniqueQuizTopicsCompleted.includes(action.topic)) {
      currentStats.uniqueQuizTopicsCompleted.push(action.topic);
    }
  }

  if (action.flashcardSetGenerated) {
    currentStats.totalFlashcardSetsGenerated = (currentStats.totalFlashcardSetsGenerated || 0) + 1;
  }

  try {
    localStorage.setItem(USER_STATS_KEY, JSON.stringify(currentStats));
  } catch (error) {
    console.error("Error saving user stats to localStorage:", error);
  }
  // Dispatch a storage event so other components (if any listening to stats) can react
  window.dispatchEvent(new StorageEvent('storage', { key: USER_STATS_KEY, newValue: JSON.stringify(currentStats) }));
  return currentStats;
}

export function resetUserStats(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_STATS_KEY, JSON.stringify(initialUserStats));
  window.dispatchEvent(new StorageEvent('storage', { key: USER_STATS_KEY, newValue: JSON.stringify(initialUserStats) }));
}
