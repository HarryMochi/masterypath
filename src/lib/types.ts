export interface Step {
  stepNumber: number;
  title: string;
  content?: string;
  completed: boolean;
}

export interface Course {
  id: string;
  userId: string;
  topic: string;
  depth: 20 | 50 | 100;
  outline: string;
  steps: Step[];
  createdAt: string;
}

export type CourseData = Omit<Course, 'id'>;
