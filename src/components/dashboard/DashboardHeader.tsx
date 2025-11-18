import { Bell, Search, Menu, LogOut, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { taskService } from "@/services/taskService";
import { projectService } from "@/services/projectService";
import { Task, Project } from "@/types";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { user, logout, appUser } = useAuth();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<{
    tasks: Task[];
    projects: Project[];
  }>({ tasks: [], projects: [] });
  const [isSearching, setIsSearching] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const userInitials = user?.email?.substring(0, 2).toUpperCase() || "U";

  // Search functionality
  useEffect(() => {
    const performSearch = async () => {
      if (!searchTerm.trim() || !appUser) {
        setSearchResults({ tasks: [], projects: [] });
        return;
      }

      setIsSearching(true);
      try {
        // Search tasks
        const allTasks = await taskService.getAllTasks();
        const filteredTasks = allTasks.filter(task =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Search projects
        const allProjects = await projectService.getAllProjects();
        const filteredProjects = allProjects.filter(project =>
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setSearchResults({
          tasks: filteredTasks.slice(0, 5), // Limit to 5 results
          projects: filteredProjects.slice(0, 5)
        });
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300); // Debounce search
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, appUser]);

  const handleSearchSelect = (item: Task | Project, type: 'task' | 'project') => {
    setSearchOpen(false);
    setSearchTerm("");

    if (type === 'task') {
      // Navigate to the project containing this task
      navigate(`/project/${(item as Task).projectId}`);
    } else {
      // Navigate to the project
      navigate(`/project/${(item as Project).id}`);
    }
  };

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "done":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "todo":
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "done":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "todo":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="TaskFlow Logo" className="h-16 w-auto" />
        </div>

        <div className="flex-1 flex items-center gap-4 max-w-md">
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search tasks, projects..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSearchOpen(e.target.value.length > 0);
                  }}
                  onFocus={() => searchTerm && setSearchOpen(true)}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command>
                <CommandList>
                  {isSearching ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Searching...
                    </div>
                  ) : searchResults.tasks.length === 0 && searchResults.projects.length === 0 ? (
                    <CommandEmpty>No results found.</CommandEmpty>
                  ) : (
                    <>
                      {searchResults.tasks.length > 0 && (
                        <CommandGroup heading="Tasks">
                          {searchResults.tasks.map((task) => (
                            <CommandItem
                              key={task.id}
                              onSelect={() => handleSearchSelect(task, 'task')}
                              className="flex items-center gap-3 p-3"
                            >
                              {getStatusIcon(task.status)}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{task.title}</div>
                                <div className="text-sm text-muted-foreground truncate">
                                  {task.description}
                                </div>
                              </div>
                              <Badge variant="outline" className={`text-xs ${getStatusColor(task.status)}`}>
                                {task.status.replace('_', ' ')}
                              </Badge>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                      {searchResults.projects.length > 0 && (
                        <CommandGroup heading="Projects">
                          {searchResults.projects.map((project) => (
                            <CommandItem
                              key={project.id}
                              onSelect={() => handleSearchSelect(project, 'project')}
                              className="flex items-center gap-3 p-3"
                            >
                              <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center">
                                <div
                                  className="w-2 h-2 rounded"
                                  style={{ backgroundColor: project.color }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{project.name}</div>
                                <div className="text-sm text-muted-foreground truncate">
                                  {project.description}
                                </div>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {project.tasksCount.todo + project.tasksCount.inProgress + project.tasksCount.done} tasks
                              </Badge>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.photoURL || appUser?.avatar || undefined} alt={user?.displayName || appUser?.name || "User"} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-popover" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoURL || appUser?.avatar || undefined} alt={user?.displayName || appUser?.name || "User"} />
                    <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.displayName || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
