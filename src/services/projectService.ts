import { ref, push, get, update, remove, set, query, orderByChild } from "firebase/database";
import { db } from "@/lib/firebase";
import { Project } from "@/types";

export const projectService = {
  async createProject(userId: string, projectData: Omit<Project, "id" | "createdBy" | "createdAt">) {
    const projectsRef = ref(db, "projects");
    const newProjectRef = push(projectsRef);
    const projectId = newProjectRef.key;

    const projectWithDefaults = {
      ...projectData,
      // Ensure tasksCount has all required properties
      tasksCount: {
        todo: projectData.tasksCount?.todo || 0,
        inProgress: projectData.tasksCount?.inProgress || 0,
        done: projectData.tasksCount?.done || 0,
      },
      // Ensure members is always an array
      members: Array.isArray(projectData.members) ? projectData.members : [userId],
      id: projectId,
      createdBy: userId,
      createdAt: new Date().toISOString(),
    };

    await set(newProjectRef, projectWithDefaults);

    return projectId;
  },

  async getAllProjects(): Promise<Project[]> {
    console.log("DEBUG: getAllProjects called");

    const projectsRef = ref(db, "projects");

    try {
      const snapshot = await get(projectsRef);
      console.log("DEBUG: Firebase snapshot exists:", snapshot.exists());

      if (!snapshot.exists()) {
        console.log("DEBUG: No projects data found in Firebase");
        return [];
      }

      const data = snapshot.val();
      console.log("DEBUG: Raw projects data from Firebase:", data);

      // Transform and validate projects
      const projects: Project[] = Object.keys(data)
        .map(key => {
          const projectData = data[key];

          // Validate and provide defaults for missing fields
          return {
            id: key,
            name: projectData.name || "Unnamed Project",
            description: projectData.description || "",
            color: projectData.color || "#6b7280",
            tasksCount: {
              todo: projectData.tasksCount?.todo || 0,
              inProgress: projectData.tasksCount?.inProgress || 0,
              done: projectData.tasksCount?.done || 0,
            },
            members: Array.isArray(projectData.members) ? projectData.members : [],
            createdBy: projectData.createdBy || "",
            createdAt: projectData.createdAt || new Date().toISOString(),
            nextDueDate: projectData.nextDueDate || null,
          };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      console.log("DEBUG: All validated projects:", projects);

      return projects;
    } catch (error) {
      console.error("DEBUG: Error fetching projects from Firebase:", error);
      return [];
    }
  },

  async verifyTaskCounts(projects: Project[]) {
    try {
      const tasksRef = ref(db, "tasks");
      const tasksSnapshot = await get(tasksRef);

      if (!tasksSnapshot.exists()) {
        console.log("DEBUG: No tasks found for verification");
        return;
      }

      const tasksData = tasksSnapshot.val();
      const allTasks = Object.keys(tasksData).map(key => ({
        id: key,
        ...tasksData[key],
      }));

      projects.forEach(project => {
        const projectTasks = allTasks.filter(task => task.projectId === project.id);
        const actualCounts = {
          todo: projectTasks.filter(task => task.status === 'todo').length,
          inProgress: projectTasks.filter(task => task.status === 'in-progress').length,
          done: projectTasks.filter(task => task.status === 'done').length,
        };

        console.log(`DEBUG: Project ${project.id} (${project.name}) - Stored counts:`, project.tasksCount, "- Actual counts:", actualCounts);

        // Update if counts are different
        if (
          project.tasksCount.todo !== actualCounts.todo ||
          project.tasksCount.inProgress !== actualCounts.inProgress ||
          project.tasksCount.done !== actualCounts.done
        ) {
          console.log(`DEBUG: Updating task counts for project ${project.id}`);
          this.updateProject(project.id, { tasksCount: actualCounts });
        }
      });
    } catch (error) {
      console.error("DEBUG: Error verifying task counts:", error);
    }
  },

  async updateProject(projectId: string, updates: Partial<Project>) {
    const projectRef = ref(db, `projects/${projectId}`);
    await update(projectRef, updates);
  },

  async deleteProject(projectId: string) {
    const projectRef = ref(db, `projects/${projectId}`);
    await remove(projectRef);
  },
};
