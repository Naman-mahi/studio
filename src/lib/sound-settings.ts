
'use client';

export const USER_SOUND_MUTED_KEY = 'user-sound-muted';

export function isSoundMuted(): boolean {
  if (typeof window === 'undefined') return true; // Default to muted on server or if window is not available
  try {
    const muted = localStorage.getItem(USER_SOUND_MUTED_KEY);
    return muted === 'true';
  } catch (error) {
    console.error("Error reading sound mute state from localStorage:", error);
    return true; // Default to muted on error
  }
}

export function toggleSoundMuted(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const currentMuteState = isSoundMuted();
    const newMuteState = !currentMuteState;
    localStorage.setItem(USER_SOUND_MUTED_KEY, String(newMuteState));
    // Dispatch a storage event so other components can react if necessary
    window.dispatchEvent(new StorageEvent('storage', { key: USER_SOUND_MUTED_KEY, newValue: String(newMuteState) }));
    return newMuteState;
  } catch (error) {
    console.error("Error saving sound mute state to localStorage:", error);
    return true; // Default to muted on error
  }
}
