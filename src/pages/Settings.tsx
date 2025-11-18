import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { User, Upload, Calendar, Phone, Globe, Clock, Mail, Save } from "lucide-react";
import { USER_ROLES } from "@/types";
import { ref, update } from "firebase/database";
import { db } from "@/lib/firebase";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "hi", label: "Hindi" },
];

const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
  { value: "Europe/Paris", label: "Central European Time (CET)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
  { value: "Asia/Shanghai", label: "China Standard Time (CST)" },
  { value: "Asia/Kolkata", label: "India Standard Time (IST)" },
  { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" },
];

export default function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { appUser, updateUserRole } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    preferredLanguage: "en",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    avatar: "",
  });

  // Load user data
  useEffect(() => {
    if (appUser) {
      setFormData({
        name: appUser.name || "",
        email: appUser.email || "",
        phoneNumber: appUser.phoneNumber || "",
        dateOfBirth: appUser.dateOfBirth || "",
        preferredLanguage: appUser.preferredLanguage || "en",
        timezone: appUser.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        avatar: appUser.avatar || "",
      });
      setAvatarPreview(appUser.avatar || null);
    }
  }, [appUser]);

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        setFormData(prev => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!appUser) return;

    setLoading(true);
    try {
      // Update user profile in database
      const userRef = ref(db, `users/${appUser.uid}`);
      await update(userRef, {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        preferredLanguage: formData.preferredLanguage,
        timezone: formData.timezone,
        avatar: formData.avatar,
      });

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!appUser) {
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
              <p className="text-muted-foreground">Loading profile...</p>
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
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Profile Settings
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage your personal information and account preferences
              </p>
            </div>

            <div className="grid gap-8">
              {/* Profile Card */}
              <Card className="border-l-4 border-l-primary shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    Personal Information
                  </CardTitle>
                  <CardDescription className="text-base">
                    Update your personal details and profile information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Profile Picture Section */}
                  <div className="flex items-start gap-6 p-4 bg-muted/30 rounded-lg">
                    <div className="flex-shrink-0">
                      <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                        <AvatarImage src={avatarPreview || appUser.avatar} alt={appUser.name} />
                        <AvatarFallback className="text-xl font-semibold bg-primary/10">
                          {appUser.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="space-y-3 flex-1">
                      <div>
                        <h3 className="font-medium text-lg">Profile Photo</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          JPG, PNG or GIF. Maximum file size 2MB
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                          id="avatar-upload"
                        />
                        <Label htmlFor="avatar-upload" className="cursor-pointer">
                          <Button variant="outline" size="sm" className="gap-2">
                            <Upload className="h-4 w-4" />
                            Change Photo
                          </Button>
                        </Label>
                        {avatarPreview && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setAvatarPreview(null);
                              setFormData(prev => ({ ...prev, avatar: "" }));
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Basic Information Grid */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                        <User className="h-4 w-4 text-muted-foreground" />
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter your full name"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        disabled
                        className="h-11 bg-muted/50"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email address cannot be changed
                      </p>
                    </div>
                  </div>

                  {/* Contact Information Grid */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label htmlFor="phoneNumber" className="flex items-center gap-2 text-sm font-medium">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        Phone Number
                      </Label>
                      <Input
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="dateOfBirth" className="flex items-center gap-2 text-sm font-medium">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        Date of Birth
                      </Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                        className="h-11"
                      />
                    </div>
                  </div>

                  {/* Preferences Grid */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label htmlFor="preferredLanguage" className="flex items-center gap-2 text-sm font-medium">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        Preferred Language
                      </Label>
                      <Select
                        value={formData.preferredLanguage}
                        onValueChange={(value) => handleInputChange("preferredLanguage", value)}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="timezone" className="flex items-center gap-2 text-sm font-medium">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        Timezone
                      </Label>
                      <Select
                        value={formData.timezone}
                        onValueChange={(value) => handleInputChange("timezone", value)}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIMEZONES.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Information Card */}
              <Card className="bg-muted/20 border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Account Information</CardTitle>
                  <CardDescription>
                    Your account details and membership information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Account Role</Label>
                      <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                        <div className={`w-3 h-3 rounded-full ${
                          USER_ROLES.find(r => r.value === appUser.role)?.color || "bg-gray-400"
                        }`} />
                        <span className="font-medium">
                          {USER_ROLES.find(r => r.value === appUser.role)?.label || appUser.role}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Member Since</Label>
                      <div className="p-3 bg-background rounded-lg border">
                        <p className="font-medium">
                          {new Date(appUser.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Button */}
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={loading}
                  size="lg"
                  className="gap-2 px-8"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}