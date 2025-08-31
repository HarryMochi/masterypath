
"use client";

import type { Course } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { Plus, Trash2, LogOut, MoreHorizontal } from "lucide-react";
import Logo from "./logo";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarGroup,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "./ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import type { User } from "firebase/auth";

interface HistorySidebarProps {
  user: User;
  courses: Course[];
  activeCourseId: string | null;
  onSelectCourse: (id: string) => void;
  onCreateNew: () => void;
  onDeleteCourse: (id: string) => void;
  onLogout: () => void;
}

export default function HistorySidebar({
  user,
  courses,
  activeCourseId,
  onSelectCourse,
  onCreateNew,
  onDeleteCourse,
  onLogout,
}: HistorySidebarProps) {

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
        return names[0][0] + names[names.length - 1][0];
    }
    return name[0];
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href="/">
          <Logo />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <Button onClick={onCreateNew} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            New Course
          </Button>
        </SidebarGroup>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <SidebarMenu>
            {courses.map((course) => {
              const completedSteps = course.steps.filter(s => s.completed).length;
              const totalSteps = course.steps.length;

              return (
              <SidebarMenuItem key={course.id}>
                <SidebarMenuButton
                  isActive={activeCourseId === course.id}
                  onClick={() => onSelectCourse(course.id)}
                  className="justify-start text-left h-auto py-2"
                >
                  <div className="flex flex-col gap-1 w-full overflow-hidden">
                    <span className="font-medium truncate">{course.topic}</span>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {formatDistanceToNow(new Date(course.createdAt), { addSuffix: true })}
                      </span>
                      <span className="font-medium">
                        {completedSteps}/{totalSteps}
                      </span>
                    </div>
                  </div>
                </SidebarMenuButton>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <SidebarMenuAction showOnHover>
                      <Trash2 />
                    </SidebarMenuAction>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the course on "{course.topic}". This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDeleteCourse(course.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start items-center gap-2 p-2 h-auto">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? "User"} />
                        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start overflow-hidden group-data-[collapsible=icon]:hidden">
                        <span className="font-medium truncate text-sm">{user.displayName || "User"}</span>
                        <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                    </div>
                    <MoreHorizontal className="h-4 w-4 ml-auto group-data-[collapsible=icon]:hidden" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
                <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
