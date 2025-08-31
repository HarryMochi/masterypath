"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Logo from "./logo";

const formSchema = z.object({
  topic: z.string().min(2, {
    message: "Topic must be at least 2 characters.",
  }),
  depth: z.enum(["20", "50", "100"]),
});

type TopicFormValues = z.infer<typeof formSchema>;

interface TopicSelectionProps {
  onGenerateCourse: (topic: string, depth: 20 | 50 | 100) => Promise<void>;
  isGenerating: boolean;
}

export default function TopicSelection({ onGenerateCourse, isGenerating }: TopicSelectionProps) {
  const form = useForm<TopicFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      depth: "20",
    },
  });

  const onSubmit = (values: TopicFormValues) => {
    onGenerateCourse(values.topic, parseInt(values.depth) as 20 | 50 | 100);
  };

  return (
    <div className="w-full max-w-lg">
       <div className="flex justify-center mb-8">
         <Logo />
       </div>
      <Card className="shadow-2xl shadow-primary/10">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">What do you want to master today?</CardTitle>
          <CardDescription>Enter a topic and select the depth of your learning path. Duration to create a course: 1 minute</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., React, Python, Music Theory" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="depth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Learning Depth</FormLabel>
                    <FormControl>
                       <Tabs value={field.value} onValueChange={field.onChange} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="20">Overview</TabsTrigger>
                          <TabsTrigger value="50">Deep Dive</TabsTrigger>
                          <TabsTrigger value="100">Expert mastery</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isGenerating} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Start Learning"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
