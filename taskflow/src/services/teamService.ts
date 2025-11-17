import { ref, push, get, update, remove, set } from "firebase/database";
import { db } from "@/lib/firebase";
import { TeamMember } from "@/types";

export const teamService = {
  async addTeamMember(memberData: Omit<TeamMember, "id" | "addedAt">) {
    const teamRef = ref(db, "team");
    const newMemberRef = push(teamRef);
    const memberId = newMemberRef.key;
    
    await set(newMemberRef, {
      ...memberData,
      id: memberId,
      addedAt: new Date().toISOString(),
    });
    
    return memberId;
  },

  async getTeamMembers(projectIds: string[]): Promise<TeamMember[]> {
    const teamRef = ref(db, "team");
    
    const snapshot = await get(teamRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      let members = Object.keys(data)
        .map(key => ({
          id: key,
          ...data[key],
        }));
        
      // Filter by projectIds if projectIds array is provided and not empty
      if (projectIds.length > 0) {
        members = members.filter(member =>
          Array.isArray(member.projectIds) &&
          member.projectIds.some((id: string) => projectIds.includes(id))
        );
      }
        
      return members as TeamMember[];
    }
    return [];
  },

  async updateTeamMember(memberId: string, updates: Partial<TeamMember>) {
    const memberRef = ref(db, `team/${memberId}`);
    await update(memberRef, updates);
  },

  async removeTeamMember(memberId: string) {
    const memberRef = ref(db, `team/${memberId}`);
    await remove(memberRef);
  },

  async getUserProfile(userId: string) {
    const userRef = ref(db, `users/${userId}`);
    
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return { id: snapshot.key, ...snapshot.val() };
    }
    return null;
  },
};
