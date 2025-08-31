import { Skeleton } from "@/components/ui/skeleton";
import { marked } from 'marked';
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface StepContentProps {
  isLoading: boolean;
  content?: string;
}

export function StepContent({ isLoading, content }: StepContentProps) {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    if (content) {
      const parsedHtml = marked.parse(content);
      setHtmlContent(parsedHtml as string);
    } else {
      setHtmlContent('');
    }
  }, [content]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center space-x-2 py-8">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Click a step to generate and view its content.
      </div>
    );
  }

  return (
    <div 
      className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed p-2 pl-4"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
