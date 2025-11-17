export interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  projectId: string;
  assigneeId?: string;
  assignee?: { id: string; name: string; avatar: string };
  dueDate: string;
  comments?: any[];
  attachments?: number;
  subtasks?: { id: string; title: string; completed: boolean }[];
  createdBy?: string;
  createdAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  tasksCount: {
    todo: number;
    inProgress: number;
    done: number;
  };
  members: string[];
  createdBy: string;
  createdAt: string;
  progress?: number;
  nextDueDate?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  projectIds: string[];
  addedAt: string;
}
