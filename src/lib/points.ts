
'use client';

export const POINTS_STORAGE_KEY = 'prepPalAiUserPoints';

export function getUserPoints(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const storedPoints = localStorage.getItem(POINTS_STORAGE_KEY);
    return storedPoints ? parseInt(storedPoints, 10) : 0;
  } catch (error) {
    console.error("Error parsing points from localStorage:", error);
    return 0;
  }
}

export function addUserPoints(pointsToAdd: number): number {
  if (typeof window === 'undefined') return 0;
  let currentPoints = getUserPoints();
  currentPoints += pointsToAdd;
  localStorage.setItem(POINTS_STORAGE_KEY, String(currentPoints));
  // Dispatch a storage event so other components can react
  window.dispatchEvent(new StorageEvent('storage', { key: POINTS_STORAGE_KEY, newValue: String(currentPoints) }));
  return currentPoints;
}

export function resetUserPoints(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(POINTS_STORAGE_KEY, '0');
  window.dispatchEvent(new StorageEvent('storage', { key: POINTS_STORAGE_KEY, newValue: '0' }));
}
