import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { roleService, RoleWithUserCount } from "@/services/roleService";
import { UserRole, RoleConfig, USER_ROLES } from "@/types";
import { Plus, Edit2, Trash2, Users, UserCog, Shield, Settings, Search, Filter, LogOut } from "lucide-react";

interface NewRoleForm {
  value: string;
  label: string;
  description: string;
  color: string;
}

interface EditRoleForm {
  label: string;
  description: string;
  color: string;
}

const ADMIN_COLORS = [
  "bg-red-500", "bg-red-600", "bg-red-700",
  "bg-gray-600", "bg-gray-700", "bg-gray-800",
  "bg-purple-600", "bg-purple-700",
  "bg-indigo-600", "bg-indigo-700",
  "bg-pink-600", "bg-pink-700"
];

const generateRoleId = (label: string): string => {
  return label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
};

const Admin = () => {
  const { appUser, isAdmin, getAllUsers, updateUserRole, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<RoleWithUserCount[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  
  // Dialog states
  const [addRoleOpen, setAddRoleOpen] = useState(false);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [assignRoleOpen, setAssignRoleOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleWithUserCount | null>(null);
  
  // Form states
  const [newRoleForm, setNewRoleForm] = useState<NewRoleForm>({
    value: "",
    label: "",
    description: "",
    color: ADMIN_COLORS[0]
  });
  
  const [editRoleForm, setEditRoleForm] = useState<EditRoleForm>({
    label: "",
    description: "",
    color: ""
  });
  
  const [assignRoleForm, setAssignRoleForm] = useState({
    userId: "",
    role: ""
  });

  // Redirect if not admin
  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, loading, navigate]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load roles and users using the role service
        const [allRoles, allUsers] = await Promise.all([
          roleService.getAllRoles(),
          roleService.getAllUsers()
        ]);

        setRoles(allRoles);
        setUsers(allUsers);
      } catch (error) {
        console.error("Error loading admin data:", error);
        toast({
          title: "Error",
          description: "Failed to load admin data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, toast]);

  // Filter roles based on search and filter
  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === "all" || role.value === filterRole;
    return matchesSearch && matchesFilter;
  });

  // Filter users based on search and filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  // Handle add role
  const handleAddRole = async () => {
    try {
      // Validate form
      if (!newRoleForm.label.trim() || !newRoleForm.description.trim()) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      // Optimistic update
      const tempRole: RoleWithUserCount = {
        value: generateRoleId(newRoleForm.label) as UserRole,
        label: newRoleForm.label.trim(),
        description: newRoleForm.description.trim(),
        color: newRoleForm.color,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userCount: 0,
        users: []
      };

      setRoles(prev => [...prev, tempRole]);
      
      // Use role service to create the role
      await roleService.createRole({
        label: newRoleForm.label.trim(),
        description: newRoleForm.description.trim(),
        color: newRoleForm.color
      });

      // Reset form and close dialog
      setNewRoleForm({
        value: "",
        label: "",
        description: "",
        color: ADMIN_COLORS[0]
      });
      setAddRoleOpen(false);

      toast({
        title: "Role Added",
        description: `Role "${tempRole.label}" has been added successfully`
      });
    } catch (error: any) {
      // Revert optimistic update
      setRoles(roles);
      toast({
        title: "Error",
        description: error.message || "Failed to add role",
        variant: "destructive"
      });
    }
  };

  // Handle edit role
  const handleEditRole = async () => {
    try {
      if (!selectedRole) return;

      // Validate form
      if (!editRoleForm.label.trim() || !editRoleForm.description.trim()) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      const roleValue = selectedRole.value;
      const originalRole = selectedRole;

      // Optimistic update
      const updatedRoles = roles.map(role =>
        role.value === roleValue
          ? { ...role,
              label: editRoleForm.label.trim(),
              description: editRoleForm.description.trim(),
              color: editRoleForm.color,
              updatedAt: new Date().toISOString()
            }
          : role
      );
      setRoles(updatedRoles);

      // Use role service to update the role
      await roleService.updateRole(roleValue, {
        label: editRoleForm.label.trim(),
        description: editRoleForm.description.trim(),
        color: editRoleForm.color
      });

      setEditRoleOpen(false);
      setSelectedRole(null);

      toast({
        title: "Role Updated",
        description: `Role "${editRoleForm.label}" has been updated successfully`
      });
    } catch (error: any) {
      // Revert optimistic update
      setRoles(roles);
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive"
      });
    }
  };

  // Handle delete role
  const handleDeleteRole = async (roleValue: string) => {
    try {
      const role = roles.find(r => r.value === roleValue);
      if (!role) return;

      // Optimistic update
      setRoles(prev => prev.filter(r => r.value !== roleValue));

      // Use role service to delete the role
      await roleService.deleteRole(roleValue as UserRole);

      toast({
        title: "Role Deleted",
        description: `Role "${role.label}" has been deleted successfully`
      });
    } catch (error: any) {
      // Revert optimistic update
      setRoles(roles);
      toast({
        title: "Error",
        description: error.message || "Failed to delete role",
        variant: "destructive"
      });
    }
  };

  // Handle assign role to user
  const handleAssignRole = async () => {
    try {
      if (!assignRoleForm.userId || !assignRoleForm.role) {
        toast({
          title: "Validation Error",
          description: "Please select both a user and a role",
          variant: "destructive"
        });
        return;
      }

      const user = users.find(u => u.uid === assignRoleForm.userId);
      const newRole = roles.find(r => r.value === assignRoleForm.role);

      if (!user || !newRole) {
        toast({
          title: "Invalid Selection",
          description: "Please select a valid user and role",
          variant: "destructive"
        });
        return;
      }

      const oldRole = user.role;

      // Optimistic update
      setUsers(prev => prev.map(u =>
        u.uid === assignRoleForm.userId ? { ...u, role: assignRoleForm.role as UserRole } : u
      ));

      // Update role user counts optimistically
      setRoles(prev => prev.map(role => {
        if (role.value === oldRole) {
          return { ...role, userCount: Math.max(0, (role.userCount || 0) - 1) };
        }
        if (role.value === assignRoleForm.role) {
          return { ...role, userCount: (role.userCount || 0) + 1 };
        }
        return role;
      }));

      // Use role service to update user role
      await roleService.updateUserRole(assignRoleForm.userId, assignRoleForm.role as UserRole);

      setAssignRoleForm({ userId: "", role: "" });
      setAssignRoleOpen(false);

      toast({
        title: "Role Assigned",
        description: `Role "${newRole.label}" has been assigned to ${user.name}`
      });
    } catch (error: any) {
      // Revert optimistic update
      setUsers(users);
      setRoles(roles);
      toast({
        title: "Error",
        description: error.message || "Failed to assign role",
        variant: "destructive"
      });
    }
  };

  // Open edit dialog
  const openEditDialog = (role: RoleWithUserCount) => {
    setSelectedRole(role);
    setEditRoleForm({
      label: role.label,
      description: role.description,
      color: role.color
    });
    setEditRoleOpen(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage roles, users, and system configuration
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>

          <Dialog open={assignRoleOpen} onOpenChange={setAssignRoleOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserCog className="h-4 w-4 mr-2" />
                Assign Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Role to User</DialogTitle>
                <DialogDescription>
                  Select a user and assign them a new role.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="user-select">User</Label>
                  <Select value={assignRoleForm.userId} onValueChange={(value) => 
                    setAssignRoleForm(prev => ({ ...prev, userId: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users
                        .filter(user => user.uid !== appUser?.uid) // Can't assign to yourself
                        .map(user => (
                          <SelectItem key={user.uid} value={user.uid}>
                            <div className="flex items-center gap-2">
                              <span>{user.name}</span>
                              <span className="text-muted-foreground">({user.email})</span>
                              <Badge variant="secondary" className="ml-auto">
                                {roles.find(r => r.value === user.role)?.label || user.role}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="role-select">New Role</Label>
                  <Select value={assignRoleForm.role} onValueChange={(value) => 
                    setAssignRoleForm(prev => ({ ...prev, role: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${role.color}`} />
                            <span>{role.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAssignRole} disabled={!assignRoleForm.userId || !assignRoleForm.role}>
                  Assign Role
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={addRoleOpen} onOpenChange={setAddRoleOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Role</DialogTitle>
                <DialogDescription>
                  Create a new role with custom permissions and settings.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="role-label">Role Label</Label>
                  <Input
                    id="role-label"
                    value={newRoleForm.label}
                    onChange={(e) => setNewRoleForm(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="e.g., Senior Backend Developer"
                  />
                </div>
                <div>
                  <Label htmlFor="role-description">Description</Label>
                  <Textarea
                    id="role-description"
                    value={newRoleForm.description}
                    onChange={(e) => setNewRoleForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the responsibilities and permissions for this role..."
                  />
                </div>
                <div>
                  <Label htmlFor="role-color">Color</Label>
                  <Select value={newRoleForm.color} onValueChange={(value) => 
                    setNewRoleForm(prev => ({ ...prev, color: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ADMIN_COLORS.map((color, index) => (
                        <SelectItem key={index} value={color}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full ${color}`} />
                            <span>Color {index + 1}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddRole} disabled={!newRoleForm.label.trim() || !newRoleForm.description.trim()}>
                  Add Role
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search roles and users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-48">
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map(role => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Role Management
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
        </TabsList>

        {/* Roles Tab */}
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Role Configuration</CardTitle>
              <CardDescription>
                Manage all system roles and their configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.map((role) => (
                    <TableRow key={role.value}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${role.color}`} />
                          {role.label}
                        </div>
                      </TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {role.userCount || 0} users
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className={`inline-block w-4 h-4 rounded-full ${role.color}`} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(role)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" disabled={role.value === "admin"}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Role</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the "{role.label}" role? This action cannot be undone.
                                  {role.userCount && role.userCount > 0 && (
                                    <span className="block mt-2 text-destructive">
                                      This role has {role.userCount} user(s) assigned to it. Please reassign users first.
                                    </span>
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteRole(role.value)}
                                  disabled={role.userCount && role.userCount > 0}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage all system users and their roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className={roles.find(r => r.value === user.role)?.color?.replace("bg-", "bg-opacity-20 bg-") + " text-foreground"}
                        >
                          {roles.find(r => r.value === user.role)?.label || user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAssignRoleForm({ userId: user.uid, role: "" });
                            setAssignRoleOpen(true);
                          }}
                        >
                          Change Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Role Dialog */}
      <Dialog open={editRoleOpen} onOpenChange={setEditRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update the role configuration and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-role-label">Role Label</Label>
              <Input
                id="edit-role-label"
                value={editRoleForm.label}
                onChange={(e) => setEditRoleForm(prev => ({ ...prev, label: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-role-description">Description</Label>
              <Textarea
                id="edit-role-description"
                value={editRoleForm.description}
                onChange={(e) => setEditRoleForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-role-color">Color</Label>
              <Select value={editRoleForm.color} onValueChange={(value) => 
                setEditRoleForm(prev => ({ ...prev, color: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ADMIN_COLORS.map((color, index) => (
                    <SelectItem key={index} value={color}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${color}`} />
                        <span>Color {index + 1}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditRole} disabled={!editRoleForm.label.trim() || !editRoleForm.description.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;