
"use client";

import type { PastPaper, Question } from "@/data/past-papers";
import { pastPapersData } from "@/data/past-papers";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

export default function PastPapersView() {
  const [selectedPaper, setSelectedPaper] = useState<PastPaper | null>(null);

  if (selectedPaper) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setSelectedPaper(null)} className="mb-4 shadow-sm hover:shadow-md transition-shadow">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Papers
        </Button>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{selectedPaper.title}</CardTitle>
            <CardDescription>{selectedPaper.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold mb-2 text-lg font-headline">Questions:</h3>
            {selectedPaper.questions.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {selectedPaper.questions.map((q, index) => (
                  <AccordionItem value={`item-${index}`} key={q.id}>
                    <AccordionTrigger className="font-semibold hover:no-underline text-left">
                      Question {index + 1}: {q.text}
                    </AccordionTrigger>
                    <AccordionContent className="bg-muted/50 p-3 rounded-md shadow-inner">
                      <p className="font-medium text-primary mb-1">Answer: {q.answer}</p>
                      {q.explanation && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Explanation:</strong> {q.explanation}
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p>No questions available for this paper.</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold">Past Question Papers</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pastPapersData.map((paper) => (
          <Card key={paper.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="font-headline text-xl">{paper.title}</CardTitle>
              <CardDescription>{paper.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">Year: {paper.year}</p>
              <p className="text-sm text-muted-foreground">Questions: {paper.questions.length}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setSelectedPaper(paper)} className="w-full shadow-md hover:shadow-lg transition-shadow">
                View Paper
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
