import { ref, push, get, update, remove, set } from "firebase/database";
import { db } from "@/lib/firebase";
import { Task } from "@/types";

export const taskService = {
  async createTask(userId: string, taskData: Omit<Task, "id" | "createdBy" | "createdAt" | "comments" | "attachments" | "subtasks">) {
    const tasksRef = ref(db, "tasks");
    const newTaskRef = push(tasksRef);
    const taskId = newTaskRef.key;
    
    await set(newTaskRef, {
      ...taskData,
      id: taskId,
      createdBy: userId,
      createdAt: new Date().toISOString(),
    });
    
    return taskId;
  },

  async getTasks(projectId: string): Promise<Task[]> {
    const tasksRef = ref(db, "tasks");
    
    const snapshot = await get(tasksRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const tasks = Object.keys(data)
        .map(key => ({
          id: key,
          ...data[key],
        }))
        .filter(task => task.projectId === projectId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
      return tasks as Task[];
    }
    return [];
  },

  async updateTask(taskId: string, updates: Partial<Task>) {
    const taskRef = ref(db, `tasks/${taskId}`);
    await update(taskRef, updates);
  },

  async deleteTask(taskId: string) {
    const taskRef = ref(db, `tasks/${taskId}`);
    await remove(taskRef);
  },

  async updateTaskStatus(taskId: string, status: Task["status"]) {
    const taskRef = ref(db, `tasks/${taskId}`);
    await update(taskRef, { status });
  },
};
