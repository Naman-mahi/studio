
'use client';

import { useCallback, useEffect, useState } from 'react';
import { isSoundMuted, USER_SOUND_MUTED_KEY } from '@/lib/sound-settings';

export type SoundType = 'click' | 'select' | 'toggle_on' | 'toggle_off' | 'notification_simple';

const soundFiles: Record<SoundType, string> = {
  click: '/sounds/click.mp3',
  select: '/sounds/select.mp3',
  toggle_on: '/sounds/toggle_on.mp3',
  toggle_off: '/sounds/toggle_off.mp3',
  notification_simple: '/sounds/notification_simple.mp3', // Example for future use
};

export function useSound() {
  // Local state to track mute status, updated by storage event or initial load
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    setMuted(isSoundMuted()); // Set initial state

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === USER_SOUND_MUTED_KEY) {
        setMuted(isSoundMuted());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const playSound = useCallback((soundType: SoundType) => {
    if (muted || typeof window === 'undefined') {
      return;
    }

    const soundPath = soundFiles[soundType];
    if (!soundPath) {
      console.warn(`Sound type "${soundType}" not defined.`);
      return;
    }

    try {
      const audio = new Audio(soundPath);
      audio.play().catch(e => console.error(`Error playing sound "${soundType}":`, e));
    } catch (error) {
      console.error(`Failed to create or play audio for "${soundType}":`, error);
    }
  }, [muted]); // Dependency on muted state

  return playSound;
}
