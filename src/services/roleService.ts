import { ref, set, get, push, remove, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { UserRole, RoleConfig, USER_ROLES } from "@/types";
import { User } from "@/types";

export interface Role {
  value: UserRole;
  label: string;
  description: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoleWithUserCount extends Role {
  userCount: number;
  users: User[];
}

class RoleService {
  private readonly ROLES_PATH = "roles";
  private readonly USERS_PATH = "users";

  // Get all roles with user counts
  async getAllRoles(): Promise<RoleWithUserCount[]> {
    try {
      const rolesRef = ref(db, this.ROLES_PATH);
      const usersRef = ref(db, this.USERS_PATH);
      
      const [rolesSnapshot, usersSnapshot] = await Promise.all([
        get(rolesRef),
        get(usersRef)
      ]);

      let roles: RoleWithUserCount[] = [];
      
      // If there are custom roles in the database
      if (rolesSnapshot.exists()) {
        const rolesData = rolesSnapshot.val();
        roles = Object.keys(rolesData).map(key => ({
          ...rolesData[key],
          userCount: 0,
          users: []
        }));
      }

      // Merge with default roles
      const defaultRoles: RoleWithUserCount[] = USER_ROLES.map(role => ({
        ...role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userCount: 0,
        users: []
      }));

      // Combine and de-duplicate roles
      const allRoles = [...defaultRoles];
      roles.forEach(customRole => {
        const existingIndex = allRoles.findIndex(r => r.value === customRole.value);
        if (existingIndex === -1) {
          allRoles.push(customRole);
        } else {
          allRoles[existingIndex] = { ...allRoles[existingIndex], ...customRole };
        }
      });

      // Calculate user counts for each role
      if (usersSnapshot.exists()) {
        const usersData = usersSnapshot.val();
        const userList = Object.keys(usersData).map(uid => ({
          uid,
          ...usersData[uid]
        })) as User[];

        allRoles.forEach(role => {
          const roleUsers = userList.filter(user => user.role === role.value);
          role.userCount = roleUsers.length;
          role.users = roleUsers;
        });
      }

      return allRoles;
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw new Error("Failed to fetch roles");
    }
  }

  // Create a new role
  async createRole(roleData: Omit<Role, 'value' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    try {
      const roleId = this.generateRoleId(roleData.label);
      
      // Check if role already exists
      const existingRoles = await this.getAllRoles();
      if (existingRoles.some(role => role.value === roleId)) {
        throw new Error("A role with this name already exists");
      }

      const newRole: Role = {
        value: roleId as UserRole,
        ...roleData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const roleRef = ref(db, `${this.ROLES_PATH}/${roleId}`);
      await set(roleRef, newRole);

      return newRole;
    } catch (error) {
      console.error("Error creating role:", error);
      throw error instanceof Error ? error : new Error("Failed to create role");
    }
  }

  // Update an existing role
  async updateRole(roleId: UserRole, updates: Partial<Pick<Role, 'label' | 'description' | 'color'>>): Promise<Role> {
    try {
      const roleRef = ref(db, `${this.ROLES_PATH}/${roleId}`);
      const snapshot = await get(roleRef);
      
      if (!snapshot.exists()) {
        throw new Error("Role not found");
      }

      const currentRole = snapshot.val();
      const updatedRole: Role = {
        ...currentRole,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await update(roleRef, updatedRole);
      
      return updatedRole;
    } catch (error) {
      console.error("Error updating role:", error);
      throw error instanceof Error ? error : new Error("Failed to update role");
    }
  }

  // Delete a role
  async deleteRole(roleId: UserRole): Promise<void> {
    try {
      // Check if role has users assigned
      const roles = await this.getAllRoles();
      const role = roles.find(r => r.value === roleId);
      
      if (!role) {
        throw new Error("Role not found");
      }

      if (role.userCount > 0) {
        throw new Error("Cannot delete a role that has users assigned to it");
      }

      const roleRef = ref(db, `${this.ROLES_PATH}/${roleId}`);
      await remove(roleRef);
    } catch (error) {
      console.error("Error deleting role:", error);
      throw error instanceof Error ? error : new Error("Failed to delete role");
    }
  }

  // Get all users
  async getAllUsers(): Promise<User[]> {
    try {
      const usersRef = ref(db, this.USERS_PATH);
      const snapshot = await get(usersRef);
      
      if (!snapshot.exists()) {
        return [];
      }
      
      const usersData = snapshot.val();
      return Object.keys(usersData).map(uid => ({
        uid,
        ...usersData[uid],
      })) as User[];
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Failed to fetch users");
    }
  }

  // Update user role
  async updateUserRole(userId: string, newRole: UserRole): Promise<void> {
    try {
      const userRef = ref(db, `${this.USERS_PATH}/${userId}`);
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        throw new Error("User not found");
      }

      const currentUser = snapshot.val();
      await update(userRef, {
        ...currentUser,
        role: newRole,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error instanceof Error ? error : new Error("Failed to update user role");
    }
  }

  // Generate role ID from label
  private generateRoleId(label: string): string {
    return label
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "")
      .replace(/^_+|_+$/g, "");
  }

  // Check if role exists
  async roleExists(roleId: UserRole): Promise<boolean> {
    try {
      const roleRef = ref(db, `${this.ROLES_PATH}/${roleId}`);
      const snapshot = await get(roleRef);
      return snapshot.exists();
    } catch (error) {
      console.error("Error checking role existence:", error);
      return false;
    }
  }

  // Get role by ID
  async getRole(roleId: UserRole): Promise<RoleWithUserCount | null> {
    try {
      const roles = await this.getAllRoles();
      return roles.find(role => role.value === roleId) || null;
    } catch (error) {
      console.error("Error fetching role:", error);
      return null;
    }
  }

  // Get users by role
  async getUsersByRole(roleId: UserRole): Promise<User[]> {
    try {
      const users = await this.getAllUsers();
      return users.filter(user => user.role === roleId);
    } catch (error) {
      console.error("Error fetching users by role:", error);
      return [];
    }
  }

  // Bulk update user roles
  async bulkUpdateUserRoles(updates: Array<{ userId: string; role: UserRole }>): Promise<void> {
    try {
      const promises = updates.map(({ userId, role }) => 
        this.updateUserRole(userId, role)
      );
      await Promise.all(promises);
    } catch (error) {
      console.error("Error bulk updating user roles:", error);
      throw error instanceof Error ? error : new Error("Failed to bulk update user roles");
    }
  }

  // Search roles
  searchRoles(roles: RoleWithUserCount[], searchTerm: string): RoleWithUserCount[] {
    const term = searchTerm.toLowerCase();
    return roles.filter(role => 
      role.label.toLowerCase().includes(term) ||
      role.description.toLowerCase().includes(term)
    );
  }

  // Filter roles by user count
  filterRolesByUserCount(roles: RoleWithUserCount[], minUsers?: number, maxUsers?: number): RoleWithUserCount[] {
    return roles.filter(role => {
      const count = role.userCount;
      if (minUsers !== undefined && count < minUsers) return false;
      if (maxUsers !== undefined && count > maxUsers) return false;
      return true;
    });
  }

  // Get role statistics
  async getRoleStatistics(): Promise<{
    totalRoles: number;
    totalUsers: number;
    rolesWithUsers: number;
    rolesWithoutUsers: number;
    mostPopularRole: RoleWithUserCount | null;
    leastPopularRole: RoleWithUserCount | null;
  }> {
    try {
      const roles = await this.getAllRoles();
      const totalUsers = roles.reduce((sum, role) => sum + role.userCount, 0);
      const rolesWithUsers = roles.filter(role => role.userCount > 0).length;
      const rolesWithoutUsers = roles.filter(role => role.userCount === 0).length;
      
      const sortedByUsers = [...roles].sort((a, b) => b.userCount - a.userCount);
      
      return {
        totalRoles: roles.length,
        totalUsers,
        rolesWithUsers,
        rolesWithoutUsers,
        mostPopularRole: sortedByUsers[0] || null,
        leastPopularRole: sortedByUsers[sortedByUsers.length - 1] || null,
      };
    } catch (error) {
      console.error("Error getting role statistics:", error);
      throw new Error("Failed to get role statistics");
    }
  }
}

export const roleService = new RoleService();