import { ref, set, get, push, remove, update, onValue, off, query, orderByChild, limitToLast } from "firebase/database";
import { db } from "@/lib/firebase";
import { Thread, Message, MessageReaction, User } from "@/types";

class ThreadService {
  private readonly THREADS_PATH = "threads";
  private readonly MESSAGES_PATH = "messages";

  // Thread Management
  async createThread(threadData: Omit<Thread, 'id' | 'createdAt' | 'updatedAt' | 'messageCount' | 'lastMessage'>): Promise<Thread> {
    try {
      const threadRef = push(ref(db, this.THREADS_PATH));
      const threadId = threadRef.key!;

      const newThread: Thread = {
        id: threadId,
        ...threadData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0,
        isActive: true,
      };

      await set(threadRef, newThread);
      return newThread;
    } catch (error) {
      console.error("Error creating thread:", error);
      throw new Error("Failed to create thread");
    }
  }

  async getThread(threadId: string): Promise<Thread | null> {
    try {
      const threadRef = ref(db, `${this.THREADS_PATH}/${threadId}`);
      const snapshot = await get(threadRef);

      if (!snapshot.exists()) {
        return null;
      }

      return snapshot.val() as Thread;
    } catch (error) {
      console.error("Error fetching thread:", error);
      throw new Error("Failed to fetch thread");
    }
  }

  async getUserThreads(userId: string): Promise<Thread[]> {
    try {
      const threadsRef = ref(db, this.THREADS_PATH);
      const snapshot = await get(threadsRef);

      if (!snapshot.exists()) {
        return [];
      }

      const threads = Object.values(snapshot.val() as Record<string, Thread>)
        .filter(thread => thread.memberIds.includes(userId) && thread.isActive)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      return threads;
    } catch (error) {
      console.error("Error fetching user threads:", error);
      throw new Error("Failed to fetch threads");
    }
  }

  async updateThread(threadId: string, updates: Partial<Pick<Thread, 'name' | 'description' | 'memberIds' | 'members' | 'lastMessage' | 'messageCount'>>): Promise<void> {
    try {
      const threadRef = ref(db, `${this.THREADS_PATH}/${threadId}`);
      await update(threadRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating thread:", error);
      throw new Error("Failed to update thread");
    }
  }

  async addMemberToThread(threadId: string, userId: string): Promise<void> {
    try {
      const thread = await this.getThread(threadId);
      if (!thread) {
        throw new Error("Thread not found");
      }

      if (thread.memberIds.includes(userId)) {
        return; // User already in thread
      }

      const updatedMemberIds = [...thread.memberIds, userId];
      await this.updateThread(threadId, { memberIds: updatedMemberIds });
    } catch (error) {
      console.error("Error adding member to thread:", error);
      throw new Error("Failed to add member to thread");
    }
  }

  async removeMemberFromThread(threadId: string, userId: string): Promise<void> {
    try {
      const thread = await this.getThread(threadId);
      if (!thread) {
        throw new Error("Thread not found");
      }

      const updatedMemberIds = thread.memberIds.filter(id => id !== userId);
      await this.updateThread(threadId, { memberIds: updatedMemberIds });
    } catch (error) {
      console.error("Error removing member from thread:", error);
      throw new Error("Failed to remove member from thread");
    }
  }

  async deleteThread(threadId: string): Promise<void> {
    try {
      // Mark thread as inactive instead of deleting
      const threadRef = ref(db, `${this.THREADS_PATH}/${threadId}`);
      await update(threadRef, {
        isActive: false,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error deleting thread:", error);
      throw new Error("Failed to delete thread");
    }
  }

  // Message Management
  async sendMessage(messageData: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    try {
      const messageRef = push(ref(db, this.MESSAGES_PATH));
      const messageId = messageRef.key!;

      const newMessage: Message = {
        id: messageId,
        ...messageData,
        createdAt: new Date().toISOString(),
      };

      await set(messageRef, newMessage);

      // Update thread's last message and message count
      await this.updateThread(messageData.threadId, {
        lastMessage: newMessage,
        messageCount: await this.getMessageCount(messageData.threadId) + 1,
      });

      return newMessage;
    } catch (error) {
      console.error("Error sending message:", error);
      throw new Error("Failed to send message");
    }
  }

  async getThreadMessages(threadId: string, limit: number = 50): Promise<Message[]> {
    try {
      const messagesRef = query(
        ref(db, this.MESSAGES_PATH),
        orderByChild('threadId'),
        // Note: Firebase doesn't support complex queries in Realtime DB like this
        // We'll filter client-side for simplicity
      );

      const snapshot = await get(messagesRef);
      if (!snapshot.exists()) {
        return [];
      }

      const allMessages = Object.values(snapshot.val() as Record<string, Message>);
      const threadMessages = allMessages
        .filter(message => message.threadId === threadId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .slice(-limit); // Get last N messages

      return threadMessages;
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw new Error("Failed to fetch messages");
    }
  }

  async updateMessage(messageId: string, updates: Partial<Pick<Message, 'content' | 'isEdited'>>): Promise<void> {
    try {
      const messageRef = ref(db, `${this.MESSAGES_PATH}/${messageId}`);
      await update(messageRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
        isEdited: true,
      });
    } catch (error) {
      console.error("Error updating message:", error);
      throw new Error("Failed to update message");
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      const messageRef = ref(db, `${this.MESSAGES_PATH}/${messageId}`);
      await remove(messageRef);
    } catch (error) {
      console.error("Error deleting message:", error);
      throw new Error("Failed to delete message");
    }
  }

  async addReaction(messageId: string, emoji: string, userId: string): Promise<void> {
    try {
      const messageRef = ref(db, `${this.MESSAGES_PATH}/${messageId}`);
      const snapshot = await get(messageRef);

      if (!snapshot.exists()) {
        throw new Error("Message not found");
      }

      const message = snapshot.val() as Message;
      const reactions = message.reactions || [];

      const existingReaction = reactions.find(r => r.emoji === emoji);
      if (existingReaction) {
        if (!existingReaction.userIds.includes(userId)) {
          existingReaction.userIds.push(userId);
          existingReaction.count++;
        }
      } else {
        reactions.push({
          emoji,
          userIds: [userId],
          count: 1,
        });
      }

      await update(messageRef, { reactions });
    } catch (error) {
      console.error("Error adding reaction:", error);
      throw new Error("Failed to add reaction");
    }
  }

  async removeReaction(messageId: string, emoji: string, userId: string): Promise<void> {
    try {
      const messageRef = ref(db, `${this.MESSAGES_PATH}/${messageId}`);
      const snapshot = await get(messageRef);

      if (!snapshot.exists()) {
        throw new Error("Message not found");
      }

      const message = snapshot.val() as Message;
      const reactions = message.reactions || [];

      const reactionIndex = reactions.findIndex(r => r.emoji === emoji);
      if (reactionIndex !== -1) {
        const reaction = reactions[reactionIndex];
        reaction.userIds = reaction.userIds.filter(id => id !== userId);
        reaction.count--;

        if (reaction.count === 0) {
          reactions.splice(reactionIndex, 1);
        }
      }

      await update(messageRef, { reactions });
    } catch (error) {
      console.error("Error removing reaction:", error);
      throw new Error("Failed to remove reaction");
    }
  }

  // Real-time listeners
  subscribeToThreadMessages(threadId: string, callback: (messages: Message[]) => void): () => void {
    const messagesRef = ref(db, this.MESSAGES_PATH);

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const allMessages = Object.values(snapshot.val() as Record<string, Message>);
        const threadMessages = allMessages
          .filter(message => message.threadId === threadId)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        callback(threadMessages);
      } else {
        callback([]);
      }
    });

    return () => off(messagesRef, 'value', unsubscribe);
  }

  subscribeToUserThreads(userId: string, callback: (threads: Thread[]) => void): () => void {
    const threadsRef = ref(db, this.THREADS_PATH);

    const unsubscribe = onValue(threadsRef, (snapshot) => {
      if (snapshot.exists()) {
        const threads = Object.values(snapshot.val() as Record<string, Thread>)
          .filter(thread => thread.memberIds.includes(userId) && thread.isActive)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        callback(threads);
      } else {
        callback([]);
      }
    });

    return () => off(threadsRef, 'value', unsubscribe);
  }

  // Utility methods
  private async getMessageCount(threadId: string): Promise<number> {
    try {
      const messages = await this.getThreadMessages(threadId, 1000); // Get all messages
      return messages.length;
    } catch (error) {
      console.error("Error getting message count:", error);
      return 0;
    }
  }

  // Search and filtering
  async searchThreads(userId: string, searchTerm: string): Promise<Thread[]> {
    try {
      const userThreads = await this.getUserThreads(userId);
      const term = searchTerm.toLowerCase();

      return userThreads.filter(thread =>
        thread.name.toLowerCase().includes(term) ||
        (thread.description && thread.description.toLowerCase().includes(term))
      );
    } catch (error) {
      console.error("Error searching threads:", error);
      throw new Error("Failed to search threads");
    }
  }

  async getThreadMembers(threadId: string): Promise<User[]> {
    try {
      const thread = await this.getThread(threadId);
      return thread?.members || [];
    } catch (error) {
      console.error("Error fetching thread members:", error);
      throw new Error("Failed to fetch thread members");
    }
  }

  // General chat functionality
  async getOrCreateGeneralChat(): Promise<Thread> {
    try {
      // Check if general chat already exists
      const threadsRef = ref(db, this.THREADS_PATH);
      const snapshot = await get(threadsRef);

      if (snapshot.exists()) {
        const threads = Object.values(snapshot.val() as Record<string, Thread>);
        const generalChat = threads.find(thread =>
          thread.name === "General" && thread.isActive && thread.description === "Organization-wide chat for all members"
        );

        if (generalChat) {
          return generalChat;
        }
      }

      // Create general chat if it doesn't exist
      const usersRef = ref(db, "users");
      const usersSnapshot = await get(usersRef);

      let allUsers: User[] = [];
      if (usersSnapshot.exists()) {
        const usersData = usersSnapshot.val();
        allUsers = Object.keys(usersData).map(uid => ({
          uid,
          ...usersData[uid],
          projectIds: usersData[uid].projectIds || [],
        })) as User[];
      }

      const memberIds = allUsers.map(user => user.uid);
      const members = allUsers;

      const generalChatData = {
        name: "General",
        description: "Organization-wide chat for all members",
        createdBy: "system", // System created
        memberIds,
        members,
        isActive: true,
      };

      const newThread = await this.createThread(generalChatData);
      return newThread;
    } catch (error) {
      console.error("Error getting or creating general chat:", error);
      throw new Error("Failed to get or create general chat");
    }
  }

  async addUserToGeneralChat(userId: string): Promise<void> {
    try {
      const generalChat = await this.getOrCreateGeneralChat();

      if (!generalChat.memberIds.includes(userId)) {
        // Get user data
        const userRef = ref(db, `users/${userId}`);
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          const user: User = {
            uid: userId,
            ...userData,
            projectIds: userData.projectIds || [],
          };

          // Add user to thread
          const updatedMemberIds = [...generalChat.memberIds, userId];
          const updatedMembers = [...generalChat.members, user];

          await this.updateThread(generalChat.id, {
            memberIds: updatedMemberIds,
            members: updatedMembers,
          });

          // Send join notification message
          await this.sendMessage({
            threadId: generalChat.id,
            senderId: "system",
            sender: {
              uid: "system",
              name: "System",
              email: "system@taskflow.com",
              role: "admin",
              createdAt: new Date().toISOString(),
              isActive: true,
              projectIds: [],
            },
            content: `${user.name} has joined the chat`,
            type: "text",
          });
        }
      }
    } catch (error) {
      console.error("Error adding user to general chat:", error);
      throw new Error("Failed to add user to general chat");
    }
  }
}

export const threadService = new ThreadService();