import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  GithubAuthProvider,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { ref, set, get } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import { User as AppUser, UserRole } from "@/types";
import { threadService } from "@/services/threadService";

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  isAdmin: boolean;
  signup: (email: string, password: string, name: string, role: UserRole, additionalData?: {
    phoneNumber?: string;
    dateOfBirth?: string;
    preferredLanguage?: string;
    timezone?: string;
    avatar?: string;
  }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  updateUserRole: (uid: string, role: UserRole) => Promise<void>;
  getAllUsers: () => Promise<AppUser[]>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const isAdmin = appUser?.role === "admin";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Fetch user profile from database
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
          const userData = snapshot.val();
          const appUserData: AppUser = {
            uid: user.uid,
            name: userData.name,
            email: userData.email,
            role: userData.role || "software_engineer", // Default role
            createdAt: userData.createdAt,
            avatar: userData.avatar,
            projectIds: userData.projectIds || [],
            isActive: userData.isActive !== false, // Default to active
            phoneNumber: userData.phoneNumber,
            dateOfBirth: userData.dateOfBirth,
            preferredLanguage: userData.preferredLanguage,
            timezone: userData.timezone,
          };
          setAppUser(appUserData);
        }
      } else {
        setAppUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string, name: string, role: UserRole, additionalData?: {
    phoneNumber?: string;
    dateOfBirth?: string;
    preferredLanguage?: string;
    timezone?: string;
    avatar?: string;
  }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Create user profile in Realtime Database
      const userRef = ref(db, `users/${userCredential.user.uid}`);
      const appUserData: AppUser = {
        uid: userCredential.user.uid,
        name,
        email,
        role,
        createdAt: new Date().toISOString(),
        isActive: true,
        projectIds: [],
        phoneNumber: additionalData?.phoneNumber,
        dateOfBirth: additionalData?.dateOfBirth,
        preferredLanguage: additionalData?.preferredLanguage,
        timezone: additionalData?.timezone,
        avatar: additionalData?.avatar,
      };

      await set(userRef, appUserData);

      // Add user to general chat
      try {
        await threadService.addUserToGeneralChat(userCredential.user.uid);
      } catch (error) {
        console.error("Failed to add user to general chat:", error);
        // Don't fail signup if this fails
      }

      toast({
        title: "Account created",
        description: "Your account has been created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      // Check if user is admin after successful login
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userRef = ref(db, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
          const userData = snapshot.val();
          if (userData.role === "admin") {
            toast({
              title: "Welcome back",
              description: "You have been logged in successfully.",
            });
            return;
          }
        }
      }
      
      toast({
        title: "Welcome back",
        description: "You have been logged in successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Check if user profile exists, if not create one
      const userRef = ref(db, `users/${userCredential.user.uid}`);
      const snapshot = await get(userRef);
      if (!snapshot.exists()) {
        const appUserData: AppUser = {
          uid: userCredential.user.uid,
          name: userCredential.user.displayName || "User",
          email: userCredential.user.email || "",
          role: "software_engineer", // Default role for Google signup
          createdAt: new Date().toISOString(),
          isActive: true,
          projectIds: [],
        };
        await set(userRef, appUserData);

        // Add user to general chat if newly created
        try {
          await threadService.addUserToGeneralChat(userCredential.user.uid);
        } catch (error) {
          console.error("Failed to add user to general chat:", error);
        }
      }

      toast({
        title: "Welcome",
        description: "You have been logged in with Google.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const loginWithGithub = async () => {
    try {
      const provider = new GithubAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Check if user profile exists, if not create one
      const userRef = ref(db, `users/${userCredential.user.uid}`);
      const snapshot = await get(userRef);
      if (!snapshot.exists()) {
        const appUserData: AppUser = {
          uid: userCredential.user.uid,
          name: userCredential.user.displayName || "User",
          email: userCredential.user.email || "",
          role: "software_engineer", // Default role for GitHub signup
          createdAt: new Date().toISOString(),
          isActive: true,
          projectIds: [],
        };
        await set(userRef, appUserData);

        // Add user to general chat if newly created
        try {
          await threadService.addUserToGeneralChat(userCredential.user.uid);
        } catch (error) {
          console.error("Failed to add user to general chat:", error);
        }
      }

      toast({
        title: "Welcome",
        description: "You have been logged in with GitHub.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateUserRole = async (uid: string, role: UserRole) => {
    try {
      const userRef = ref(db, `users/${uid}`);
      await set(userRef, {
        ...(appUser?.uid === uid ? {
          name: appUser.name,
          email: appUser.email,
          createdAt: appUser.createdAt,
          avatar: appUser.avatar,
          projectIds: appUser.projectIds,
          isActive: appUser.isActive,
        } : {}),
        role,
      });
      
      // Update current user if it's the same user
      if (appUser?.uid === uid) {
        setAppUser(prev => prev ? { ...prev, role } : null);
      }
      
      toast({
        title: "Role updated",
        description: "User role has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const getAllUsers = async (): Promise<AppUser[]> => {
    try {
      const usersRef = ref(db, "users");
      const snapshot = await get(usersRef);

      if (!snapshot.exists()) {
        return [];
      }

      const usersData = snapshot.val();
      const users = Object.keys(usersData).map(uid => ({
        uid,
        ...usersData[uid],
        projectIds: usersData[uid].projectIds || [], // Ensure projectIds is always an array
      })) as AppUser[];
      return users;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const value = {
    user,
    appUser,
    loading,
    isAdmin,
    signup,
    login,
    logout,
    loginWithGoogle,
    loginWithGithub,
    updateUserRole,
    getAllUsers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
