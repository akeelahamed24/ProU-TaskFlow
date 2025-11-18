import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeroSection } from "@/components/ui/hero-section";
import Dialog02 from "@/components/ui/ruixen-tour";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  Users,
  Calendar,
  BarChart3,
  Shield,
  Zap,
  Code,
  Palette,
  Database,
  Globe,
  Smartphone,
  ArrowRight,
  Star,
  Rocket,
  Target,
  TrendingUp,
  HeartHandshake,
  Sparkles
} from "lucide-react";

const Landing = () => {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const tourShown = localStorage.getItem('tourShown');
    if (!tourShown) {
      const timer = setTimeout(() => setShowTour(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const features = [
    {
      icon: CheckCircle,
      title: "Advanced Task Management",
      description: "Track tasks across multiple statuses with intuitive drag-and-drop functionality and custom workflows.",
      gradient: "from-green-500/20 to-emerald-500/20",
      color: "text-green-600"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Assign specialized roles and streamline team workflows with real-time collaboration features.",
      gradient: "from-blue-500/20 to-cyan-500/20",
      color: "text-blue-600"
    },
    {
      icon: Calendar,
      title: "Project Planning",
      description: "Manage projects with smart deadlines, automated progress tracking, and comprehensive analytics.",
      gradient: "from-purple-500/20 to-pink-500/20",
      color: "text-purple-600"
    },
    {
      icon: Shield,
      title: "Role-Based Access",
      description: "Enterprise-grade security with granular permissions and secure role-based access control.",
      gradient: "from-red-500/20 to-orange-500/20",
      color: "text-red-600"
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Advanced analytics with customizable dashboards, performance metrics, and predictive insights.",
      gradient: "from-indigo-500/20 to-violet-500/20",
      color: "text-indigo-600"
    },
    {
      icon: Zap,
      title: "Boost Productivity",
      description: "AI-powered suggestions and streamlined interfaces designed to maximize team efficiency.",
      gradient: "from-yellow-500/20 to-amber-500/20",
      color: "text-yellow-600"
    }
  ];

  const techStack = [
    {
      category: "Frontend Excellence",
      icon: Code,
      technologies: [
        { name: "React 18", description: "Latest features with concurrent rendering and hooks" },
        { name: "TypeScript", description: "End-to-end type safety for robust development" },
        { name: "Tailwind CSS", description: "Utility-first CSS with custom design system" },
        { name: "Vite", description: "Lightning-fast build tool with hot module replacement" }
      ]
    },
    {
      category: "Backend & Database",
      icon: Database,
      technologies: [
        { name: "Firebase", description: "Secure authentication and real-time database" },
        { name: "React Query", description: "Advanced data synchronization and caching" },
        { name: "Cloud Functions", description: "Serverless backend operations" }
      ]
    },
    {
      category: "UI/UX Design",
      icon: Palette,
      technologies: [
        { name: "Radix UI", description: "Fully accessible, unstyled UI primitives" },
        { name: "Lucide React", description: "Beautiful, consistent icon library" },
        { name: "Framer Motion", description: "Smooth animations and interactions" }
      ]
    },
    {
      category: "Development Excellence",
      icon: Globe,
      technologies: [
        { name: "ESLint + Prettier", description: "Code quality and consistent formatting" },
        { name: "Responsive Design", description: "Mobile-first responsive architecture" },
        { name: "Component Architecture", description: "Modular, reusable component system" }
      ]
    }
  ];

  const stats = [
    { number: "99.9%", label: "Uptime Reliability", icon: Shield },
    { number: "2.5x", label: "Faster Delivery", icon: Zap },
    { number: "50%", label: "Time Saved", icon: TrendingUp },
    { number: "10k+", label: "Tasks Managed", icon: Target }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-emerald-950/10">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src="/logo.png" alt="TaskFlow Logo" className="h-16 w-auto transition-transform hover:scale-105" />
              <div className="absolute -top-1 -right-1">
                <div className="h-2 w-2 animate-ping rounded-full bg-green-500"></div>
                <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500"></div>
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              TaskFlow Pro
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowTour(true)}
              className="relative overflow-hidden ring-2 ring-primary/30 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:scale-105 group"
            >
              <Sparkles className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              View Credentials
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
            <Link to="/login">
              <Button variant="ghost" className="hover:bg-primary/5 transition-colors">
                Log In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300">
                Get Started Free
                <Rocket className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Kept as is per instructions */}
      <HeroSection
        badge={{
          text: "Professional Task Management",
          action: {
            text: "View Demo",
            href: "/dashboard",
          },
        }}
        title="Streamline Your Workflow with TaskFlow Pro"
        description="A comprehensive collaborative task management platform designed to help teams manage projects, track tasks across statuses, assign roles, and boost productivity through an intuitive interface."
        actions={[
          {
            text: "Get Started Free",
            href: "/register",
            variant: "default",
          },
          {
            text: "Sign In",
            href: "/login",
            variant: "secondary",
          },
        ]}
        image={{
          light: "/logo.gif",
          dark: "/logo.gif",
          alt: "TaskFlow Pro Dashboard Preview",
        }}
      />

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center group">
                <div className="relative inline-flex items-center justify-center mb-4">
                  <div className="absolute inset-0 bg-primary/10 rounded-full scale-150 group-hover:scale-100 transition-transform duration-300" />
                  <Icon className="h-8 w-8 text-primary relative z-10 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm font-semibold">
            <Sparkles className="mr-2 h-3 w-3" />
            Powerful Features
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Everything You Need to Succeed
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-muted-foreground leading-relaxed">
            TaskFlow Pro combines cutting-edge technology with intuitive design to deliver 
            a comprehensive project management experience that scales with your team.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="group relative overflow-hidden border-2 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:scale-105 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <CardHeader className="relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                      <Icon className={`h-7 w-7 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                      {feature.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-base leading-relaxed text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Enhanced Project Explanation Section */}
      <section className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <Badge className="mb-4 px-4 py-2 text-sm font-semibold bg-primary/20 text-primary border-primary/20">
                <Star className="mr-2 h-4 w-4" />
                Showcase Project
              </Badge>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Enterprise-Grade Task Management
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                A comprehensive demonstration of modern full-stack development practices, 
                featuring scalable architecture and professional-grade features.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <Card className="relative overflow-hidden border-2 hover:border-primary/30 transition-all duration-500 group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    Project Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 relative z-10">
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    TaskFlow Pro demonstrates enterprise-ready capabilities with advanced 
                    user management, real-time collaboration, and comprehensive analytics 
                    in a beautifully designed interface.
                  </p>
                  <div className="space-y-4">
                    {[
                      "Multi-step user registration with profile collection",
                      "Admin dashboard with complete CRUD operations",
                      "Real-time task tracking and project analytics",
                      "Responsive design with accessibility features",
                      "Role-based access control and permissions"
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 group/item">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-2 hover:border-primary/30 transition-all duration-500 group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                      <Code className="h-6 w-6 text-purple-600" />
                    </div>
                    Technical Excellence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 relative z-10">
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    Built with modern development practices and cutting-edge technologies 
                    to ensure scalability, maintainability, and exceptional user experience.
                  </p>
                  <div className="space-y-4">
                    {[
                      "Type-safe development with TypeScript",
                      "Component-based architecture with React",
                      "Modern UI with Tailwind CSS and Radix components",
                      "Firebase integration for auth and database",
                      "Performance-optimized with React Query"
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 group/item">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Tech Stack Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm font-semibold">
            <Code className="mr-2 h-3 w-3" />
            Technology Stack
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Built with Modern Excellence
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-muted-foreground leading-relaxed">
            Leveraging the latest tools and frameworks to deliver a robust, scalable, 
            and maintainable application with exceptional performance.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {techStack.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card key={index} className="group relative overflow-hidden border-2 hover:border-primary/30 transition-all duration-500 hover:shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-4 text-xl">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6 relative z-10">
                    {category.technologies.map((tech, techIndex) => (
                      <div 
                        key={techIndex} 
                        className="border-l-2 border-primary/30 pl-4 group/tech hover:border-primary/60 transition-all duration-300"
                      >
                        <h4 className="font-bold text-lg mb-1 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                          {tech.name}
                        </h4>
                        <p className="text-muted-foreground leading-relaxed group-hover/tech:text-foreground/80 transition-colors">
                          {tech.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="mx-auto max-w-3xl">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-semibold">
              <Rocket className="mr-2 h-4 w-4" />
              Get Started Today
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl mb-6">
              Ready to Transform Your Workflow?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-primary-foreground/90 mb-10 leading-relaxed">
              Join thousands of high-performing teams already using TaskFlow Pro 
              to manage their projects more effectively and deliver exceptional results.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link to="/register">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="w-full sm:w-auto px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
                >
                  Start Your Free Account
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto px-8 py-4 text-lg font-semibold border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary transition-all duration-300"
                >
                  Sign In to Your Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="border-t border-border/40 bg-background/50 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="TaskFlow Logo" className="h-8 w-auto opacity-80 hover:opacity-100 transition-opacity" />
              <div>
                <div className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  TaskFlow Pro
                </div>
                <span className="text-sm text-muted-foreground">
                  © 2024 Built for modern teams. Crafted with excellence.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <Link 
                to="/login" 
                className="hover:text-foreground transition-colors duration-300 hover:scale-105 transform"
              >
                Log In
              </Link>
              <Link 
                to="/register" 
                className="hover:text-foreground transition-colors duration-300 hover:scale-105 transform"
              >
                Sign Up
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTour(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                Credentials
              </Button>
            </div>
          </div>
        </div>
      </footer>

      <Dialog02
        open={showTour}
        onOpenChange={(open) => {
          setShowTour(open);
          if (!open) {
            localStorage.setItem('tourShown', 'true');
          }
        }}
      />
    </div>
  );
};

export default Landing;