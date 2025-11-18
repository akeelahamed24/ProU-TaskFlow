import React, { useState, useEffect, useRef } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { threadService } from "@/services/threadService";
import { Thread, Message, User } from "@/types";
import {
  MessageSquare,
  Plus,
  Users,
  Send,
  Search,
  MoreVertical,
  Settings,
  UserPlus,
  Trash2,
  Edit,
  Smile,
  Paperclip,
  Image as ImageIcon,
  Heart,
  ThumbsUp,
  X
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const Threads = () => {
  const { appUser, getAllUsers } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [messageSearchTerm, setMessageSearchTerm] = useState("");

  // Dialog states
  const [createThreadOpen, setCreateThreadOpen] = useState(false);
  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const [threadSettingsOpen, setThreadSettingsOpen] = useState(false);

  // Form states
  const [newThreadName, setNewThreadName] = useState("");
  const [newThreadDescription, setNewThreadDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Reaction states
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);

  // Message editing states
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  // Typing indicator
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log("Threads: Loading initial data for user:", appUser!.uid);

        const [userThreads, users, generalChat] = await Promise.all([
          threadService.getUserThreads(appUser!.uid),
          getAllUsers(),
          threadService.getOrCreateGeneralChat()
        ]);

        console.log("Threads: Loaded threads:", userThreads.length, "users:", users.length);

        // Ensure arrays are properly initialized
        const threadsWithArrays = userThreads.map(thread => ({
          ...thread,
          memberIds: thread.memberIds || [],
          members: thread.members || []
        }));

        const usersWithArrays = users.map(user => ({
          ...user,
          projectIds: user.projectIds || []
        }));

        // Ensure general chat is included and prioritized
        const allThreads = threadsWithArrays;
        const generalChatWithArrays = {
          ...generalChat,
          memberIds: generalChat.memberIds || [],
          members: generalChat.members || []
        };

        // Add general chat if not already in the list
        if (!allThreads.find(t => t.id === generalChat.id)) {
          allThreads.unshift(generalChatWithArrays); // Add to beginning
        }

        // Sort threads with General chat first
        const sortedThreads = allThreads.sort((a, b) => {
          if (a.name === "General") return -1;
          if (b.name === "General") return 1;
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });

        setThreads(sortedThreads);
        setAllUsers(usersWithArrays);

        // Auto-select general chat if no thread is selected
        if (!selectedThread && sortedThreads.length > 0) {
          const generalThread = sortedThreads.find(t => t.name === "General");
          if (generalThread) {
            setSelectedThread(generalThread);
          }
        }
      } catch (error) {
        console.error("Threads: Error loading threads:", error);
        toast({
          title: "Error",
          description: "Failed to load threads",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (appUser) {
      loadData();
    }
  }, [appUser, getAllUsers, toast, selectedThread]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!appUser) return;

    console.log("Threads: Subscribing to user threads for:", appUser.uid);

    const unsubscribeThreads = threadService.subscribeToUserThreads(appUser.uid, async (updatedThreads) => {
      console.log("Threads: Received thread updates:", updatedThreads.length);

      // Ensure arrays are properly initialized
      let threadsWithArrays = updatedThreads.map(thread => ({
        ...thread,
        memberIds: thread.memberIds || [],
        members: thread.members || []
      }));

      // Ensure general chat is included
      const generalChat = await threadService.getOrCreateGeneralChat();
      const generalChatWithArrays = {
        ...generalChat,
        memberIds: generalChat.memberIds || [],
        members: generalChat.members || []
      };

      // Add general chat if not already in the list
      if (!threadsWithArrays.find(t => t.id === generalChat.id)) {
        threadsWithArrays.unshift(generalChatWithArrays);
      }

      // Sort threads with General chat first
      const sortedThreads = threadsWithArrays.sort((a, b) => {
        if (a.name === "General") return -1;
        if (b.name === "General") return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });

      setThreads(sortedThreads);

      // Auto-select general chat if no thread is selected and general chat exists
      if (!selectedThread && sortedThreads.length > 0) {
        const generalThread = sortedThreads.find(t => t.name === "General");
        if (generalThread) {
          setSelectedThread(generalThread);
        }
      }
    });

    return () => {
      console.log("Threads: Unsubscribing from user threads");
      unsubscribeThreads();
    };
  }, [appUser, selectedThread]);

  // Subscribe to messages for selected thread
  useEffect(() => {
    if (!selectedThread) return;

    console.log("Threads: Subscribing to messages for thread:", selectedThread.id);

    const unsubscribeMessages = threadService.subscribeToThreadMessages(selectedThread.id, (updatedMessages) => {
      console.log("Threads: Received message updates:", updatedMessages.length);
      setMessages(updatedMessages);
    });

    return () => {
      console.log("Threads: Unsubscribing from thread messages");
      unsubscribeMessages();
    };
  }, [selectedThread]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Auto-scroll to bottom for new messages (but allow manual scrolling up)
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle scroll to detect if user is at bottom
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px tolerance
      setIsAtBottom(atBottom);
    }
  };

  // Auto-scroll only if user is at bottom
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isAtBottom]);

  // Show scroll to bottom button when not at bottom
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    setShowScrollButton(!isAtBottom && messages.length > 0);
  }, [isAtBottom, messages.length]);

  // Filter threads based on search
  const filteredThreads = threads.filter(thread =>
    thread.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (thread.description && thread.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateThread = async () => {
    if (!newThreadName.trim() || selectedMembers.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please provide a thread name and select at least one member",
        variant: "destructive"
      });
      return;
    }

    try {
      const memberIds = [appUser!.uid, ...selectedMembers];
      const members = allUsers.filter(user => memberIds.includes(user.uid));

      const newThread = await threadService.createThread({
        name: newThreadName.trim(),
        description: newThreadDescription.trim(),
        createdBy: appUser!.uid,
        memberIds,
        members,
        isActive: true,
      });

      setThreads(prev => [newThread, ...prev]);
      setSelectedThread(newThread);
      setCreateThreadOpen(false);
      setNewThreadName("");
      setNewThreadDescription("");
      setSelectedMembers([]);

      toast({
        title: "Thread Created",
        description: `Thread "${newThread.name}" has been created successfully`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create thread",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedThread) return;

    try {
      setIsTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      await threadService.sendMessage({
        threadId: selectedThread.id,
        senderId: appUser!.uid,
        sender: appUser!,
        content: newMessage.trim(),
        type: "text",
      });

      setNewMessage("");
      messageInputRef.current?.focus();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const handleMessageChange = (value: string) => {
    setNewMessage(value);

    // Handle typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000); // Stop showing typing after 2 seconds of inactivity
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    try {
      await threadService.addReaction(messageId, emoji, appUser!.uid);
      setShowReactionPicker(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add reaction",
        variant: "destructive"
      });
    }
  };

  const handleRemoveReaction = async (messageId: string, emoji: string) => {
    try {
      await threadService.removeReaction(messageId, emoji, appUser!.uid);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove reaction",
        variant: "destructive"
      });
    }
  };

  const reactionEmojis = [
    { emoji: "❤️", icon: Heart, name: "heart" },
    { emoji: "👍", icon: ThumbsUp, name: "thumbsup" },
    { emoji: "😄", icon: Smile, name: "smile" },
  ];

  const handleEditMessage = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditingContent(content);
  };

  const handleSaveEdit = async () => {
    if (!editingMessageId || !editingContent.trim()) return;

    try {
      await threadService.updateMessage(editingMessageId, { content: editingContent.trim() });
      setEditingMessageId(null);
      setEditingContent("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to edit message",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await threadService.deleteMessage(messageId);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete message",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent("");
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  // Group messages by user and time proximity
  const groupMessages = (messages: Message[]) => {
    const groups: Message[][] = [];
    let currentGroup: Message[] = [];

    messages.forEach((message, index) => {
      const prevMessage = messages[index - 1];

      // Start new group if different user or time gap > 5 minutes
      if (!prevMessage ||
          prevMessage.senderId !== message.senderId ||
          new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() > 5 * 60 * 1000) {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  };

  // Filter messages based on search term
  const filteredMessages = messageSearchTerm
    ? messages.filter(message =>
        message.content.toLowerCase().includes(messageSearchTerm.toLowerCase()) ||
        message.sender.name.toLowerCase().includes(messageSearchTerm.toLowerCase())
      )
    : messages;

  const groupedMessages = groupMessages(filteredMessages);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex w-full">
          <DashboardSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <main className="flex-1 p-6 lg:p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading threads...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex w-full">
        <DashboardSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 p-6 lg:p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Threads</h1>
                <p className="text-muted-foreground mt-1">
                  Communicate and collaborate with your team members
                </p>
              </div>
            </div>

            <div className="h-[calc(100vh-12rem)]">
              <div className="flex h-full gap-6">
                {/* Threads Sidebar */}
                <div className="w-80 flex flex-col">
                  <Card className="flex-1">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5" />
                          Threads
                        </CardTitle>
                        <Dialog open={createThreadOpen} onOpenChange={setCreateThreadOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create New Thread</DialogTitle>
                              <DialogDescription>
                                Create a new thread and add members to start chatting.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="thread-name">Thread Name</Label>
                                <Input
                                  id="thread-name"
                                  value={newThreadName}
                                  onChange={(e) => setNewThreadName(e.target.value)}
                                  placeholder="e.g., Project Alpha Discussion"
                                />
                              </div>
                              <div>
                                <Label htmlFor="thread-description">Description (Optional)</Label>
                                <Textarea
                                  id="thread-description"
                                  value={newThreadDescription}
                                  onChange={(e) => setNewThreadDescription(e.target.value)}
                                  placeholder="Brief description of the thread..."
                                />
                              </div>
                              <div>
                                <Label>Add Members</Label>
                                <div className="mt-2 max-h-48 overflow-y-auto border rounded-md p-2">
                                  {allUsers
                                    .filter(user => user.uid !== appUser!.uid)
                                    .map(user => (
                                      <div key={user.uid} className="flex items-center space-x-2 py-1">
                                        <input
                                          type="checkbox"
                                          id={`user-${user.uid}`}
                                          checked={selectedMembers.includes(user.uid)}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              setSelectedMembers(prev => [...prev, user.uid]);
                                            } else {
                                              setSelectedMembers(prev => prev.filter(id => id !== user.uid));
                                            }
                                          }}
                                        />
                                        <label htmlFor={`user-${user.uid}`} className="flex items-center gap-2 cursor-pointer">
                                          <Avatar className="h-6 w-6">
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                                          </Avatar>
                                          <span className="text-sm">{user.name}</span>
                                        </label>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={handleCreateThread} disabled={!newThreadName.trim()}>
                                Create Thread
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Search threads..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </CardHeader>

                    <CardContent className="p-0">
                      <ScrollArea className="h-[calc(100vh-16rem)]">
                        <div className="space-y-1 p-4">
                          {filteredThreads.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <p>No threads found</p>
                              <p className="text-sm">Create your first thread to get started</p>
                            </div>
                          ) : (
                            filteredThreads.map(thread => (
                              <div
                                key={thread.id}
                                className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                                  selectedThread?.id === thread.id ? "bg-muted" : ""
                                } ${thread.name === "General" ? "border-l-4 border-primary" : ""}`}
                                onClick={() => setSelectedThread(thread)}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-medium truncate">{thread.name}</h3>
                                      {thread.name === "General" && (
                                        <Badge variant="outline" className="text-xs px-1 py-0">
                                          Organization
                                        </Badge>
                                      )}
                                    </div>
                                    {thread.description && (
                                      <p className="text-sm text-muted-foreground truncate">
                                        {thread.description}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="flex -space-x-1">
                                        {thread.members.slice(0, 3).map(member => (
                                          <div key={member.uid} className="relative">
                                            <Avatar className="h-5 w-5 border-2 border-background">
                                              <AvatarImage src={member.avatar} />
                                              <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                                            </Avatar>
                                            {/* Online status indicator */}
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                                          </div>
                                        ))}
                                        {thread.members.length > 3 && (
                                          <div className="h-5 w-5 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                            <span className="text-xs text-muted-foreground">+{thread.members.length - 3}</span>
                                          </div>
                                        )}
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        {thread.messageCount} messages
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {thread.lastMessage && (
                                  <p className="text-xs text-muted-foreground mt-1 truncate">
                                    {thread.lastMessage.sender.name}: {thread.lastMessage.content}
                                  </p>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                  {selectedThread ? (
                    <Card className="flex-1 flex flex-col">
                      {/* Thread Header */}
                      <CardHeader className="border-b">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <MessageSquare className="h-5 w-5" />
                              {selectedThread.name}
                            </CardTitle>
                            {selectedThread.description && (
                              <CardDescription>{selectedThread.description}</CardDescription>
                            )}
                          </div>
                        <div className="flex items-center justify-between flex-1">
                          <div className="flex items-center gap-2">
                            {selectedThread.name === "General" ? (
                              <Badge variant="default">
                                <Users className="h-3 w-3 mr-1" />
                                Organization Chat
                              </Badge>
                            ) : (
                              <>
                                <Badge variant="secondary">
                                  <Users className="h-3 w-3 mr-1" />
                                  {selectedThread.members.length}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setAddMembersOpen(true)}
                                >
                                  <UserPlus className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setThreadSettingsOpen(true)}
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>

                          {/* Message search */}
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Search messages..."
                                value={messageSearchTerm}
                                onChange={(e) => setMessageSearchTerm(e.target.value)}
                                className="pl-8 w-48 h-8"
                              />
                              {messageSearchTerm && (
                                <button
                                  onClick={() => setMessageSearchTerm("")}
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        </div>
                      </CardHeader>

                      {/* Messages */}
                      <CardContent className="flex-1 p-0">
                        <ScrollArea className="h-[calc(100vh-20rem)]">
                          <div
                            ref={messagesContainerRef}
                            onScroll={handleScroll}
                            className="p-4 space-y-4 min-h-full"
                          >
                            {messages.length === 0 ? (
                              <div className="text-center py-12 text-muted-foreground">
                                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No messages yet</p>
                                <p className="text-sm">Start the conversation!</p>
                              </div>
                            ) : (
                              groupedMessages.map((group, groupIndex) => {
                                const isCurrentUser = group[0].senderId === appUser!.uid;
                                return (
                                  <div key={`group-${groupIndex}`} className={`flex gap-3 mb-4 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                                    {!isCurrentUser && (
                                      <div className="relative">
                                        <Avatar className="h-8 w-8 flex-shrink-0">
                                          <AvatarImage src={group[0].sender.avatar} />
                                          <AvatarFallback className="text-xs">{getInitials(group[0].sender.name)}</AvatarFallback>
                                        </Avatar>
                                        {/* Online status indicator */}
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                                      </div>
                                    )}
                                    <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
                                      {!isCurrentUser && (
                                        <div className="flex items-center gap-2 mb-1 px-3">
                                          <span className="font-medium text-sm">{group[0].sender.name}</span>
                                          <span className="text-xs text-muted-foreground">
                                            {formatMessageTime(group[0].createdAt)}
                                          </span>
                                        </div>
                                      )}
                                      <div className="space-y-1">
                                        {group.map((message, messageIndex) => (
                                          <div key={message.id} className="relative group">
                                            {editingMessageId === message.id ? (
                                              <div className={`px-3 py-2 rounded-2xl max-w-full ${
                                                isCurrentUser
                                                  ? 'bg-primary text-primary-foreground ml-auto'
                                                  : 'bg-muted'
                                              }`}>
                                                <div className="flex gap-2">
                                                  <input
                                                    value={editingContent}
                                                    onChange={(e) => setEditingContent(e.target.value)}
                                                    onKeyPress={(e) => {
                                                      if (e.key === 'Enter') handleSaveEdit();
                                                      if (e.key === 'Escape') handleCancelEdit();
                                                    }}
                                                    className="flex-1 bg-transparent border-none outline-none text-sm"
                                                    autoFocus
                                                  />
                                                  <button
                                                    onClick={handleSaveEdit}
                                                    className="text-xs opacity-70 hover:opacity-100"
                                                  >
                                                    Save
                                                  </button>
                                                  <button
                                                    onClick={handleCancelEdit}
                                                    className="text-xs opacity-70 hover:opacity-100"
                                                  >
                                                    Cancel
                                                  </button>
                                                </div>
                                              </div>
                                            ) : (
                                              <div
                                                className={`px-3 py-2 rounded-2xl max-w-full break-words cursor-pointer hover:opacity-90 transition-opacity ${
                                                  isCurrentUser
                                                    ? 'bg-primary text-primary-foreground ml-auto'
                                                    : 'bg-muted'
                                                }`}
                                                onDoubleClick={() => setShowReactionPicker(showReactionPicker === message.id ? null : message.id)}
                                              >
                                                <p className="text-sm">{message.content}</p>
                                                {message.isEdited && (
                                                  <span className="text-xs opacity-70 ml-2">(edited)</span>
                                                )}
                                                {isCurrentUser && messageIndex === group.length - 1 && (
                                                  <span className="text-xs opacity-70 ml-2">
                                                    {formatMessageTime(message.createdAt)}
                                                  </span>
                                                )}

                                                {/* Message actions */}
                                                <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-background border rounded-lg p-1 shadow-lg flex gap-1">
                                                  <button
                                                    onClick={() => setShowReactionPicker(showReactionPicker === message.id ? null : message.id)}
                                                    className="p-1 hover:bg-muted rounded text-xs"
                                                    title="Add reaction"
                                                  >
                                                    <Smile className="h-3 w-3" />
                                                  </button>
                                                  {message.senderId === appUser!.uid && (
                                                    <>
                                                      <button
                                                        onClick={() => handleEditMessage(message.id, message.content)}
                                                        className="p-1 hover:bg-muted rounded text-xs"
                                                        title="Edit message"
                                                      >
                                                        <Edit className="h-3 w-3" />
                                                      </button>
                                                      <button
                                                        onClick={() => handleDeleteMessage(message.id)}
                                                        className="p-1 hover:bg-muted rounded text-xs text-destructive"
                                                        title="Delete message"
                                                      >
                                                        <Trash2 className="h-3 w-3" />
                                                      </button>
                                                    </>
                                                  )}
                                                </div>
                                              </div>
                                            )}

                                            {/* Reaction picker */}
                                            {showReactionPicker === message.id && (
                                              <div className="absolute -top-12 left-0 bg-background border rounded-lg p-2 shadow-lg z-10">
                                                <div className="flex gap-1">
                                                  {reactionEmojis.map(({ emoji, icon: Icon, name }) => (
                                                    <button
                                                      key={name}
                                                      onClick={() => handleAddReaction(message.id, emoji)}
                                                      className="p-1 hover:bg-muted rounded transition-colors"
                                                      title={name}
                                                    >
                                                      <Icon className="h-4 w-4" />
                                                    </button>
                                                  ))}
                                                  <button
                                                    onClick={() => setShowReactionPicker(null)}
                                                    className="p-1 hover:bg-muted rounded transition-colors ml-1"
                                                  >
                                                    <X className="h-4 w-4" />
                                                  </button>
                                                </div>
                                              </div>
                                            )}

                                            {/* Message reactions */}
                                            {message.reactions && message.reactions.length > 0 && (
                                              <div className="flex flex-wrap gap-1 mt-1">
                                                {message.reactions.map((reaction) => (
                                                  <button
                                                    key={reaction.emoji}
                                                    onClick={() => {
                                                      if (reaction.userIds.includes(appUser!.uid)) {
                                                        handleRemoveReaction(message.id, reaction.emoji);
                                                      } else {
                                                        handleAddReaction(message.id, reaction.emoji);
                                                      }
                                                    }}
                                                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-colors ${
                                                      reaction.userIds.includes(appUser!.uid)
                                                        ? 'bg-primary/20 border-primary/30'
                                                        : 'bg-muted/50 border-muted hover:bg-muted'
                                                    }`}
                                                  >
                                                    <span>{reaction.emoji}</span>
                                                    <span className="text-xs">{reaction.count}</span>
                                                  </button>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                            <div ref={messagesEndRef} />
                          </div>

                          {/* Scroll to bottom button */}
                          {showScrollButton && (
                            <button
                              onClick={() => {
                                scrollToBottom();
                                setIsAtBottom(true);
                              }}
                              className="absolute bottom-4 right-4 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition-colors"
                              title="Scroll to bottom"
                            >
                              <Send className="h-4 w-4 rotate-[-90deg]" />
                            </button>
                          )}
                        </ScrollArea>
                      </CardContent>

                      {/* Typing Indicator */}
                      {isTyping && (
                        <div className="px-4 py-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                            <span>Someone is typing...</span>
                          </div>
                        </div>
                      )}

                      {/* Message Input */}
                      <div className="border-t p-4">
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <Input
                              ref={messageInputRef}
                              value={newMessage}
                              onChange={(e) => handleMessageChange(e.target.value)}
                              onKeyPress={handleKeyPress}
                              placeholder="Type a message..."
                              className="pr-12"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Paperclip className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Smile className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <Card className="flex-1 flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">Select a thread</h3>
                        <p>Choose a thread from the sidebar to start chatting</p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Threads;