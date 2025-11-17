import { ref, push, get, update, remove, set } from "firebase/database";
import { db } from "@/lib/firebase";
import { Project } from "@/types";

export const projectService = {
  async createProject(userId: string, projectData: Omit<Project, "id" | "createdBy" | "createdAt">) {
    const projectsRef = ref(db, "projects");
    const newProjectRef = push(projectsRef);
    const projectId = newProjectRef.key;
    
    await set(newProjectRef, {
      ...projectData,
      id: projectId,
      createdBy: userId,
      createdAt: new Date().toISOString(),
    });
    
    return projectId;
  },

  async getProjects(userId: string): Promise<Project[]> {
    const projectsRef = ref(db, "projects");
    
    const snapshot = await get(projectsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const projects = Object.keys(data)
        .map(key => ({
          id: key,
          ...data[key],
        }))
        .filter(project =>
          Array.isArray(project.members) && project.members.includes(userId)
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
      return projects as Project[];
    }
    return [];
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
