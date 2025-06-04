// src/app/(app)/practice-questions/page.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

export default function DeprecatedPracticeQuestionsPage() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <Card className="max-w-lg mx-auto shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-center mb-3">
            <Lightbulb className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline text-center">Page Deprecated</CardTitle>
          <CardDescription className="text-center text-md">
            This Practice Questions section has been upgraded!
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6 text-muted-foreground">
            We've enhanced this feature and it's now available as the more interactive AI Quiz Generator.
          </p>
          <Button asChild size="lg" className="shadow-md hover:shadow-lg">
            <Link href="/ai-quiz-generator">
              Go to AI Quiz Generator
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
