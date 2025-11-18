import { ref, push, get, update, remove, set } from "firebase/database";
import { db } from "@/lib/firebase";
import { Task, Comment } from "@/types";

export const taskService = {
  async createTask(userId: string, taskData: Omit<Task, "id" | "createdBy" | "createdAt" | "comments" | "attachments" | "subtasks">) {
    const tasksRef = ref(db, "tasks");
    const newTaskRef = push(tasksRef);
    const taskId = newTaskRef.key;

    await set(newTaskRef, {
      ...taskData,
      id: taskId,
      createdBy: userId,
      assigneeId: taskData.assigneeId || userId, // Assign to creator if no assignee specified
      createdAt: new Date().toISOString(),
    });

    // Update project task counts
    await this.updateProjectTaskCounts(taskData.projectId);

    return taskId;
  },

  async getTasks(projectId: string): Promise<Task[]> {
    const tasksRef = ref(db, "tasks");

    const snapshot = await get(tasksRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      let tasks = Object.keys(data)
        .map(key => ({
          id: key,
          ...data[key],
        }))
        .filter(task => task.projectId === projectId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Populate assignee data
      const assigneeIds = [...new Set(tasks.map(task => task.assigneeId).filter(Boolean))];
      if (assigneeIds.length > 0) {
        const usersRef = ref(db, "users");
        const usersSnapshot = await get(usersRef);
        const usersData = usersSnapshot.exists() ? usersSnapshot.val() : {};

        tasks = tasks.map(task => {
          if (task.assigneeId && usersData[task.assigneeId]) {
            const user = usersData[task.assigneeId];
            return {
              ...task,
              assignee: {
                id: task.assigneeId,
                name: user.name || 'Unknown',
                avatar: user.avatar || '',
              },
            };
          }
          return task;
        });
      }

      return tasks as Task[];
    }
    return [];
  },

  async updateTask(taskId: string, updates: Partial<Task>) {
    const taskRef = ref(db, `tasks/${taskId}`);
    await update(taskRef, updates);
  },

  async deleteTask(taskId: string) {
    // First get the current task to know which project it belongs to
    const taskRef = ref(db, `tasks/${taskId}`);
    const taskSnapshot = await get(taskRef);

    if (taskSnapshot.exists()) {
      const taskData = taskSnapshot.val();
      await remove(taskRef);

      // Update project task counts
      await this.updateProjectTaskCounts(taskData.projectId);
    }
  },

  async updateProjectTaskCounts(projectId: string) {
    try {
      // Get all tasks for this project
      const tasks = await this.getTasks(projectId);

      // Calculate counts
      const counts = {
        todo: tasks.filter(task => task.status === 'todo').length,
        inProgress: tasks.filter(task => task.status === 'in-progress').length,
        done: tasks.filter(task => task.status === 'done').length,
      };

      // Update project with new counts
      const projectRef = ref(db, `projects/${projectId}`);
      await update(projectRef, { tasksCount: counts });

      console.log(`Updated task counts for project ${projectId}:`, counts);
    } catch (error) {
      console.error("Error updating project task counts:", error);
    }
  },

  async updateTaskStatus(taskId: string, status: Task["status"]) {
    // First get the current task to know which project it belongs to
    const taskRef = ref(db, `tasks/${taskId}`);
    const taskSnapshot = await get(taskRef);

    if (taskSnapshot.exists()) {
      const taskData = taskSnapshot.val();
      await update(taskRef, { status });

      // Update project task counts
      await this.updateProjectTaskCounts(taskData.projectId);
    }
  },

  async addComment(taskId: string, userId: string, content: string): Promise<void> {
    const taskRef = ref(db, `tasks/${taskId}`);
    const commentId = push(ref(db, `tasks/${taskId}/comments`)).key;

    const comment = {
      id: commentId,
      taskId,
      userId,
      content,
      createdAt: new Date().toISOString(),
    };

    // Get current task to append comment
    const taskSnapshot = await get(taskRef);
    if (taskSnapshot.exists()) {
      const taskData = taskSnapshot.val();
      const comments = taskData.comments || [];
      comments.push(comment);

      await update(taskRef, { comments });
    }
  },

  async getComments(taskId: string): Promise<Comment[]> {
    const commentsRef = ref(db, `tasks/${taskId}/comments`);
    const snapshot = await get(commentsRef);

    if (snapshot.exists()) {
      const commentsData = snapshot.val();
      const comments = Object.keys(commentsData).map(key => ({
        id: key,
        ...commentsData[key],
      }));

      // Populate user data for each comment
      const userIds = [...new Set(comments.map(comment => comment.userId))];
      if (userIds.length > 0) {
        const usersRef = ref(db, "users");
        const usersSnapshot = await get(usersRef);
        const usersData = usersSnapshot.exists() ? usersSnapshot.val() : {};

        return comments.map(comment => {
          const user = usersData[comment.userId];
          return {
            ...comment,
            user: user ? {
              uid: comment.userId,
              name: user.name || 'Unknown',
              email: user.email || '',
              role: user.role || 'user',
              avatar: user.avatar || '',
              isActive: user.isActive || true,
            } : {
              uid: comment.userId,
              name: 'Unknown',
              email: '',
              role: 'user',
              avatar: '',
              isActive: true,
            },
          };
        }) as Comment[];
      }

      return comments as Comment[];
    }

    return [];
  },

  async getAllTasks(): Promise<Task[]> {
    // Get all tasks
    const tasksRef = ref(db, "tasks");
    const tasksSnapshot = await get(tasksRef);

    if (!tasksSnapshot.exists()) {
      return [];
    }

    const tasksData = tasksSnapshot.val();
    let allTasks = Object.keys(tasksData)
      .map(key => ({
        id: key,
        ...tasksData[key],
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Populate assignee data
    const assigneeIds = [...new Set(allTasks.map(task => task.assigneeId).filter(Boolean))];
    if (assigneeIds.length > 0) {
      const usersRef = ref(db, "users");
      const usersSnapshot = await get(usersRef);
      const usersData = usersSnapshot.exists() ? usersSnapshot.val() : {};

      allTasks = allTasks.map(task => {
        if (task.assigneeId && usersData[task.assigneeId]) {
          const user = usersData[task.assigneeId];
          return {
            ...task,
            assignee: {
              id: task.assigneeId,
              name: user.name || 'Unknown',
              avatar: user.avatar || '',
            },
          };
        }
        return task;
      });
    }

    return allTasks as Task[];
  },
};
