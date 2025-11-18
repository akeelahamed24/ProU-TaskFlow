// User Roles
export type UserRole =
  | "admin"
  | "senior_software_engineer"
  | "software_engineer"
  | "junior_software_engineer"
  | "tech_lead"
  | "engineering_manager"
  | "devops_engineer"
  | "qa_engineer"
  | "qa_lead"
  | "product_manager"
  | "ux_designer"
  | "marketing_designer"
  | "data_engineer";

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  avatar?: string;
  projectIds?: string[];
  isActive: boolean;
  phoneNumber?: string;
  dateOfBirth?: string;
  preferredLanguage?: string;
  timezone?: string;
}

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
  comments?: Comment[];
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
  role: UserRole;
  avatar?: string;
  projectIds: string[];
  addedAt: string;
}

export interface Thread {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  memberIds: string[];
  members: User[];
  lastMessage?: Message;
  messageCount: number;
  isActive: boolean;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  sender: User;
  content: string;
  type: "text" | "image" | "file";
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
  replyTo?: string;
  reactions?: MessageReaction[];
}

export interface MessageReaction {
  emoji: string;
  userIds: string[];
  count: number;
}

export interface Activity {
  id: string;
  userId: string;
  action: string;
  taskId?: string;
  projectId?: string;
  timestamp: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  user: User;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string; // ISO string
  endDate?: string; // ISO string, optional for all-day events
  allDay: boolean;
  userId: string; // creator
  attendees?: string[]; // user IDs
  color?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
  };
}

// Role configuration for display
export interface RoleConfig {
  value: UserRole;
  label: string;
  description: string;
  color: string;
}

export const USER_ROLES: RoleConfig[] = [
  { value: "senior_software_engineer", label: "Senior Software Engineer", description: "Handles complex technical implementation and mentoring", color: "bg-blue-600" },
  { value: "software_engineer", label: "Software Engineer", description: "Handles full-stack development tasks", color: "bg-blue-500" },
  { value: "junior_software_engineer", label: "Junior Software Engineer", description: "Handles basic development tasks with guidance", color: "bg-blue-400" },
  { value: "tech_lead", label: "Tech Lead", description: "Leads technical decisions and team coordination", color: "bg-red-500" },
  { value: "engineering_manager", label: "Engineering Manager", description: "Manages engineering teams and technical strategy", color: "bg-purple-600" },
  { value: "devops_engineer", label: "DevOps Engineer", description: "Handles deployment, infrastructure, and CI/CD", color: "bg-orange-500" },
  { value: "qa_engineer", label: "QA Engineer", description: "Handles testing and quality assurance", color: "bg-pink-500" },
  { value: "qa_lead", label: "QA Lead", description: "Leads quality assurance and testing teams", color: "bg-pink-600" },
  { value: "product_manager", label: "Product Manager", description: "Manages product roadmap and requirements", color: "bg-yellow-500" },
  { value: "ux_designer", label: "UX Designer", description: "Handles user experience and interface design", color: "bg-indigo-500" },
  { value: "marketing_designer", label: "Marketing Designer", description: "Creates marketing materials and brand assets", color: "bg-purple-500" },
  { value: "data_engineer", label: "Data Engineer", description: "Handles data pipeline and analytics infrastructure", color: "bg-green-600" },
];

// Admin role is excluded from signup - can only be assigned by existing admins
