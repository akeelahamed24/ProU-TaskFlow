export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  color: string;
  members: number[];
  progress: number;
  tasksCount: {
    todo: number;
    inProgress: number;
    done: number;
  };
  nextDueDate?: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  projectId: number;
  assignee: number;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate: string;
  subtasks?: { id: number; title: string; completed: boolean }[];
  comments?: Comment[];
  attachments?: number;
}

export interface Comment {
  id: number;
  userId: number;
  content: string;
  timestamp: string;
}

export interface Activity {
  id: number;
  userId: number;
  action: string;
  taskId?: number;
  projectId?: number;
  timestamp: string;
}

export const users: User[] = [
  {
    id: 1,
    name: "Alex Chen",
    email: "alex@taskflow.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    role: "Project Manager",
  },
  {
    id: 2,
    name: "Sam Rodriguez",
    email: "sam@taskflow.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam",
    role: "Developer",
  },
  {
    id: 3,
    name: "Jordan Lee",
    email: "jordan@taskflow.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
    role: "Designer",
  },
  {
    id: 4,
    name: "Taylor Kim",
    email: "taylor@taskflow.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor",
    role: "Developer",
  },
];

export const projects: Project[] = [
  {
    id: 1,
    name: "Website Redesign",
    description: "Complete overhaul of company website with modern UI/UX",
    color: "#3B82F6",
    members: [1, 2, 3],
    progress: 65,
    tasksCount: { todo: 8, inProgress: 5, done: 12 },
    nextDueDate: "2025-11-20",
  },
  {
    id: 2,
    name: "Mobile App",
    description: "Native iOS and Android app development",
    color: "#10B981",
    members: [1, 2, 4],
    progress: 40,
    tasksCount: { todo: 15, inProgress: 8, done: 7 },
    nextDueDate: "2025-11-25",
  },
  {
    id: 3,
    name: "Marketing Campaign",
    description: "Q4 marketing initiatives and content creation",
    color: "#F59E0B",
    members: [1, 3],
    progress: 85,
    tasksCount: { todo: 2, inProgress: 3, done: 18 },
    nextDueDate: "2025-11-18",
  },
];

export const tasks: Task[] = [
  {
    id: 1,
    title: "Create wireframes for homepage",
    description: "Design initial wireframes for the new homepage layout",
    projectId: 1,
    assignee: 3,
    status: "done",
    priority: "high",
    dueDate: "2025-11-15",
    subtasks: [
      { id: 1, title: "Header section", completed: true },
      { id: 2, title: "Hero section", completed: true },
      { id: 3, title: "Features section", completed: true },
    ],
    attachments: 3,
  },
  {
    id: 2,
    title: "Develop homepage components",
    description: "Build React components for the homepage",
    projectId: 1,
    assignee: 2,
    status: "in_progress",
    priority: "high",
    dueDate: "2025-11-18",
    subtasks: [
      { id: 1, title: "Header component", completed: true },
      { id: 2, title: "Hero component", completed: true },
      { id: 3, title: "Features component", completed: false },
    ],
    attachments: 1,
  },
  {
    id: 3,
    title: "Set up authentication flow",
    description: "Implement user authentication with OAuth",
    projectId: 2,
    assignee: 4,
    status: "in_progress",
    priority: "high",
    dueDate: "2025-11-19",
    subtasks: [
      { id: 1, title: "Setup OAuth providers", completed: true },
      { id: 2, title: "Create login page", completed: false },
    ],
  },
  {
    id: 4,
    title: "Design app icons",
    description: "Create icon set for mobile app",
    projectId: 2,
    assignee: 3,
    status: "todo",
    priority: "medium",
    dueDate: "2025-11-22",
  },
  {
    id: 5,
    title: "Write blog post about product launch",
    description: "Draft and publish announcement blog post",
    projectId: 3,
    assignee: 1,
    status: "in_progress",
    priority: "medium",
    dueDate: "2025-11-17",
    attachments: 2,
  },
  {
    id: 6,
    title: "Database schema design",
    description: "Design and implement database schema for user data",
    projectId: 2,
    assignee: 2,
    status: "todo",
    priority: "high",
    dueDate: "2025-11-21",
  },
  {
    id: 7,
    title: "Create social media assets",
    description: "Design graphics for social media campaign",
    projectId: 3,
    assignee: 3,
    status: "done",
    priority: "medium",
    dueDate: "2025-11-14",
  },
  {
    id: 8,
    title: "Write API documentation",
    description: "Document all API endpoints and usage",
    projectId: 1,
    assignee: 2,
    status: "todo",
    priority: "low",
    dueDate: "2025-11-28",
  },
];

export const activities: Activity[] = [
  {
    id: 1,
    userId: 2,
    action: "completed task",
    taskId: 1,
    projectId: 1,
    timestamp: "2025-11-16T10:30:00Z",
  },
  {
    id: 2,
    userId: 3,
    action: "commented on",
    taskId: 2,
    projectId: 1,
    timestamp: "2025-11-16T09:15:00Z",
  },
  {
    id: 3,
    userId: 1,
    action: "created task",
    taskId: 6,
    projectId: 2,
    timestamp: "2025-11-16T08:45:00Z",
  },
  {
    id: 4,
    userId: 4,
    action: "updated status of",
    taskId: 3,
    projectId: 2,
    timestamp: "2025-11-15T16:20:00Z",
  },
  {
    id: 5,
    userId: 3,
    action: "uploaded file to",
    taskId: 5,
    projectId: 3,
    timestamp: "2025-11-15T14:10:00Z",
  },
];
