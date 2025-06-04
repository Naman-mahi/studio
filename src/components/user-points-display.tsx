
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getUserPoints, POINTS_STORAGE_KEY } from '@/lib/points';
import { Trophy } from 'lucide-react';

export default function UserPointsDisplay() {
  const [totalPoints, setTotalPoints] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const updatePoints = () => {
      setTotalPoints(getUserPoints());
    };

    updatePoints(); // Initial fetch

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === POINTS_STORAGE_KEY) {
        updatePoints();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isClient]);

  if (!isClient) {
    return (
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-xl">
            <Trophy className="text-yellow-500 w-6 h-6" /> Your Total Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading points...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-xl md:text-2xl">
          <Trophy className="text-yellow-500 w-6 h-6 md:w-7 md:h-7" /> Your Total Points
        </CardTitle>
        <CardDescription>Earn points by completing quizzes and daily goals!</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold text-primary text-center py-4">
          {totalPoints}
        </p>
      </CardContent>
    </Card>
  );
}
