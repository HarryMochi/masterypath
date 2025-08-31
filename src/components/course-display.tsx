"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import type { Course, Step } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { StepContent } from './step-content';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { MessageCircle } from 'lucide-react';
import { AskAiSheet } from './ask-ai-sheet';
import type { AskStepQuestionOutput } from '@/ai/flows/ask-step-question';

interface CourseDisplayProps {
  course: Course;
  onUpdateStep: (courseId: string, stepNumber: number, newStepData: Partial<Step>) => void;
  onGenerateStepContent: (course: Course, step: Step) => Promise<void>;
  onAskQuestion: (course: Course, step: Step, question: string) => Promise<AskStepQuestionOutput>;
}

export default function CourseDisplay({ course, onUpdateStep, onGenerateStepContent, onAskQuestion }: CourseDisplayProps) {
  const [activeStepNumber, setActiveStepNumber] = useState<string | undefined>(undefined);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [stepForSheet, setStepForSheet] = useState<Step | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);


  const completedSteps = useMemo(() => course.steps.filter(step => step.completed).length, [course.steps]);
  const progressPercentage = (completedSteps / course.steps.length) * 100;

  const handleAccordionChange = async (value: string | undefined) => {
    setActiveStepNumber(value);
    if (value) {
      const stepNumber = parseInt(value, 10);
      const step = course.steps.find(s => s.stepNumber === stepNumber);
      if (step && !step.content) {
        setIsLoadingContent(true);
        await onGenerateStepContent(course, step);
        setIsLoadingContent(false);
      }
    }
  };

  const handleCheckedChange = (stepNumber: number, checked: boolean) => {
    onUpdateStep(course.id, stepNumber, { completed: checked });
  };

  const handleAskAiClick = (e: React.MouseEvent, step: Step) => {
    e.stopPropagation();
    setStepForSheet(step);
    setSheetOpen(true);
  };
  
  const activeStep = useMemo(() => {
    if(!activeStepNumber) return undefined;
    return course.steps.find(s => s.stepNumber === parseInt(activeStepNumber, 10));
  }, [course.steps, activeStepNumber]);

  return (
    <>
      <div className="w-full h-full max-w-4xl mx-auto flex flex-col">
        <header className="mb-6">
          <h1 className="font-headline text-4xl font-bold mb-2">{course.topic}</h1>
          <div className="flex items-center gap-4">
            <Progress value={progressPercentage} className="w-full h-3" />
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              {completedSteps} / {course.steps.length} steps
            </span>
          </div>
        </header>
        
        <div className="flex-1 min-h-0">
           <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
            <Accordion 
              type="single" 
              collapsible 
              className="w-full"
              value={activeStepNumber}
              onValueChange={handleAccordionChange}
            >
              {course.steps.map(step => (
                <AccordionItem value={step.stepNumber.toString()} key={step.stepNumber} className="group">
                  <div className="flex items-center gap-4 w-full">
                    <div className="flex items-center gap-4 pl-4 py-4">
                      <Checkbox
                        id={`step-${step.stepNumber}`}
                        checked={step.completed}
                        onCheckedChange={(checked) => handleCheckedChange(step.stepNumber, !!checked)}
                      />
                    </div>
                    <AccordionTrigger className="flex-1 py-4 pr-4">
                      <span className="text-left flex-1">
                        Step {step.stepNumber}: {step.title}
                      </span>
                    </AccordionTrigger>
                    <div className="pr-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={(e) => handleAskAiClick(e, step)}
                        disabled={!step.content}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <AccordionContent>
                    <StepContent 
                      isLoading={isLoadingContent && activeStep?.stepNumber === step.stepNumber}
                      content={step.content}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        </div>
      </div>
      {stepForSheet && (
        <AskAiSheet
          open={isSheetOpen}
          onOpenChange={setSheetOpen}
          course={course}
          step={stepForSheet}
          onAskQuestion={onAskQuestion}
        />
      )}
    </>
  );
}
