
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getEarnedBadges, badgeDefinitions, type EarnedBadge, type BadgeDefinition, EARNED_BADGES_KEY } from '@/lib/badges';
import { ShieldCheck, HelpCircle } from 'lucide-react'; // Default/fallback icon

export default function UserBadgesDisplay() {
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const updateBadges = () => {
      setEarnedBadges(getEarnedBadges());
    };

    updateBadges(); // Initial fetch

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === EARNED_BADGES_KEY) {
        updateBadges();
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
            <ShieldCheck className="text-green-500 w-6 h-6" /> My Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading badges...</p>
        </CardContent>
      </Card>
    );
  }

  const displayedBadges = badgeDefinitions.filter(def => 
    earnedBadges.some(earned => earned.badgeId === def.id)
  ).sort((a,b) => {
    const aEarned = earnedBadges.find(eb => eb.badgeId === a.id)!;
    const bEarned = earnedBadges.find(eb => eb.badgeId === b.id)!;
    return new Date(aEarned.earnedAt).getTime() - new Date(bEarned.earnedAt).getTime();
  });


  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-xl md:text-2xl">
          <ShieldCheck className="text-green-500 w-6 h-6 md:w-7 md:h-7" /> My Badges
        </CardTitle>
        <CardDescription>Collect badges by completing challenges and reaching milestones!</CardDescription>
      </CardHeader>
      <CardContent>
        {displayedBadges.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No badges earned yet. Keep exploring!</p>
        ) : (
          <TooltipProvider>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              {displayedBadges.map((badgeDef) => {
                const IconComponent = badgeDef.icon || HelpCircle;
                return (
                  <Tooltip key={badgeDef.id}>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors cursor-help w-20 text-center">
                        <IconComponent className="w-8 h-8 text-primary mb-1" />
                        <span className="text-xs font-medium truncate w-full">{badgeDef.name}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-center">
                      <p className="font-semibold">{badgeDef.name}</p>
                      <p className="text-xs">{badgeDef.description}</p>
                      <p className="text-xs mt-1 text-muted-foreground">Category: {badgeDef.category}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
}
