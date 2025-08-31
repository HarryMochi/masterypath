
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Course, Step } from '@/lib/types';
import { getCoursesForUser, addCourse, updateCourse, deleteCourse as deleteCourseFromDb } from '@/lib/firestore';
import { generateCourseAction, generateStepContentAction, askQuestionAction } from '../actions';
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider } from '@/components/ui/sidebar';
import HistorySidebar from '@/components/history-sidebar';
import TopicSelection from '@/components/topic-selection';
import CourseDisplay from '@/components/course-display';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import MainLayout from '@/components/main-layout';

export default function LearnPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [isGeneratingCourse, setIsGeneratingCourse] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  const fetchCourses = useCallback(async () => {
    if (user) {
      const userCourses = await getCoursesForUser(user.uid);
      setCourses(userCourses);
    }
  }, [user]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const activeCourse = useMemo(() => {
    return courses.find(c => c.id === activeCourseId) || null;
  }, [courses, activeCourseId]);

  const handleGenerateCourse = async (topic: string, depth: 20 | 50 | 100) => {
    if (!user) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to create a course." });
        return;
    }
    setIsGeneratingCourse(true);
    try {
      const result = await generateCourseAction({ topic, depth: depth.toString() as '20' | '50' | '100' });
      const newCourseData = {
        topic,
        depth,
        outline: JSON.stringify(result.courseOutline, null, 2),
        steps: result.courseOutline.map(s => ({ stepNumber: s.step, title: s.title, completed: false })),
        createdAt: new Date().toISOString(),
        userId: user.uid,
      };
      const newCourseId = await addCourse(newCourseData);
      const newCourse: Course = { id: newCourseId, ...newCourseData };

      setCourses(prev => [newCourse, ...prev]);
      setActiveCourseId(newCourse.id);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error Generating Course",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsGeneratingCourse(false);
    }
  };

  const handleUpdateStep = async (courseId: string, stepNumber: number, newStepData: Partial<Step>) => {
    const courseToUpdate = courses.find(c => c.id === courseId);
    if (!courseToUpdate) return;
    
    const updatedSteps = courseToUpdate.steps.map(step =>
        step.stepNumber === stepNumber ? { ...step, ...newStepData } : step
    );
    const updatedCourse = { ...courseToUpdate, steps: updatedSteps };
    
    setCourses(prevCourses => prevCourses.map(c => c.id === courseId ? updatedCourse : c));

    try {
        await updateCourse(courseId, { steps: updatedSteps });
    } catch (error) {
        console.error("Error updating step in DB:", error);
        toast({ variant: "destructive", title: "Sync Error", description: "Failed to save changes."});
        // Optionally revert state
        setCourses(prevCourses => prevCourses.map(c => c.id === courseId ? courseToUpdate : c));
    }
  };
  
  const handleGenerateStepContent = async (course: Course, step: Step) => {
    try {
      const result = await generateStepContentAction({
        topic: course.topic,
        outline: course.outline,
        stepNumber: step.stepNumber,
        stepTitle: step.title,
      });
      if (result.content) {
        await handleUpdateStep(course.id, step.stepNumber, { content: result.content });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Not so fast!",
        description: "Lightly is still under construction, so wait a few minutes so all steps are processed.",
      });
    }
  };

  const handleAskQuestion = async (course: Course, step: Step, question: string) => {
    try {
        return await askQuestionAction({
            topic: course.topic,
            stepTitle: step.title,
            stepContent: step.content || '',
            question,
        });
    } catch (error) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Error Getting Answer",
            description: "Could not get an answer for this question. Please try again.",
        });
        return { answer: "Sorry, I couldn't process your question. Please try again." };
    }
  };

  const handleCreateNew = () => {
    setActiveCourseId(null);
  };

  const handleDeleteCourse = async (courseId: string) => {
    const originalCourses = courses;
    setCourses(prev => prev.filter(c => c.id !== courseId));
    if (activeCourseId === courseId) {
      setActiveCourseId(null);
    }

    try {
        await deleteCourseFromDb(courseId);
    } catch (error) {
        console.error("Error deleting course from DB:", error);
        toast({ variant: "destructive", title: "Deletion Failed", description: "Could not delete course from database."});
        setCourses(originalCourses); // Revert UI on failure
    }
  };

  if (loading || !isClient) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }
  
  if (!user) return null;

  return (
    <MainLayout>
        <SidebarProvider>
        <div className="flex min-h-screen w-full">
            <HistorySidebar
              user={user}
              courses={courses}
              activeCourseId={activeCourseId}
              onSelectCourse={setActiveCourseId}
              onCreateNew={handleCreateNew}
              onDeleteCourse={handleDeleteCourse}
              onLogout={logout}
            />
            <main className="flex-1 flex flex-col h-full items-center justify-center p-4 md:p-8">
                {activeCourse ? (
                <CourseDisplay
                    key={activeCourse.id}
                    course={activeCourse}
                    onUpdateStep={handleUpdateStep}
                    onGenerateStepContent={handleGenerateStepContent}
                    onAskQuestion={handleAskQuestion}
                />
                ) : (
                <TopicSelection
                    onGenerateCourse={handleGenerateCourse}
                    isGenerating={isGeneratingCourse}
                />
                )}
            </main>
        </div>
        </SidebarProvider>
    </MainLayout>
  );
}
