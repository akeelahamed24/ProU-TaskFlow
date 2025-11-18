import { Home, FolderKanban, Calendar, Users, Settings, MessageSquare, LogOut, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { title: "Dashboard", icon: Home, href: "/dashboard" },
  { title: "Projects", icon: FolderKanban, href: "/projects" },
  { title: "Calendar", icon: Calendar, href: "/calendar" },
  { title: "Team", icon: Users, href: "/team" },
  { title: "Threads", icon: MessageSquare, href: "/threads" },
  { title: "Settings", icon: Settings, href: "/settings" },
];

export function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const { user, appUser, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/login");
      onClose(); // Close sidebar on mobile after logout
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const userInitials = user?.email?.substring(0, 2).toUpperCase() || "U";
  const displayName = user?.displayName || appUser?.name || "User";
  const displayEmail = user?.email || appUser?.email || "";

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 border-r border-border bg-card transition-transform duration-200 ease-in-out lg:sticky lg:translate-x-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto">
          <nav className="flex flex-col gap-1 p-4">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:shadow-sm"
                activeClassName="bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-sm"
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.title}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer with User Info and Sign Out */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 px-2 py-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.photoURL || appUser?.avatar || undefined} alt={displayName} />
              <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {displayName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {displayEmail}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:shadow-sm mt-2"
          >
            <LogOut className="h-4.5 w-4.5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}