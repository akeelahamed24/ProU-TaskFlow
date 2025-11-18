import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle2, Copy, User, Shield, LogIn } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Dialog02({ open, onOpenChange }: { open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [step, setStep] = useState(0);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const steps = [
    {
      title: "Welcome to TaskFlow Pro",
      description: "Get started with our collaborative task management platform in just a few steps.",
    },
    {
      title: "Choose Your Access Level",
      description: "We provide two demo accounts to explore different features of our platform.",
    },
    {
      title: "Regular User Account",
      description: "Experience the platform as a team member with task management capabilities.",
    },
    {
      title: "Admin Account",
      description: "Explore administrative features and platform management tools.",
    },
    {
      title: "Ready to Explore",
      description: "You're all set to start using TaskFlow Pro!",
    },
  ];

  const demoAccounts = [
    {
      role: "Regular User",
      email: "user@demo.com",
      password: "demo123",
      description: "Access the main platform with task management features",
      icon: User,
      features: ["Create and manage tasks", "Collaborate with team members", "Track project progress", "Update task status"]
    },
    {
      role: "Administrator",
      email: "admin@demo.com",
      password: "admin123",
      description: "Full access to admin portal and platform management",
      icon: Shield,
      features: ["User management", "Project administration", "Analytics dashboard", "System configuration"]
    }
  ];

  const copyToClipboard = (text: string, accountType: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(accountType);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setStep(0);
    }
    onOpenChange?.(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!open && (
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <LogIn className="w-4 h-4" />
            Quick Start Guide
          </Button>
        </DialogTrigger>
      )}

      <DialogContent
        className={cn(
          "max-w-4xl p-0 overflow-hidden rounded-xl border shadow-2xl",
          "bg-white text-black",
          "dark:bg-black dark:text-white dark:border-neutral-800",
          "data-[state=open]:animate-none data-[state=closed]:animate-none"
        )}
      >
        <div className="flex flex-col md:flex-row w-full h-full">
          {/* Sidebar */}
          <div className="w-full md:w-2/5 p-6 border-r border-gray-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="TaskFlow Logo"
                  className="w-12 h-12 rounded-xl border-2 border-gray-200 dark:border-neutral-800"
                />
                <div>
                  <h2 className="text-lg font-semibold">TaskFlow Pro</h2>
                  <p className="text-sm opacity-80">Quick Start Guide</p>
                </div>
              </div>
              <p className="text-sm opacity-80 mt-2">
                Follow this guide to quickly start exploring our task management platform.
              </p>
              <div className="flex flex-col gap-3 mt-6">
                {steps.map((s, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-all",
                      index === step
                        ? "bg-white dark:bg-neutral-800 shadow-sm border border-gray-200 dark:border-neutral-700 font-semibold"
                        : "opacity-70 hover:opacity-100 hover:bg-white/50 dark:hover:bg-neutral-800/50"
                    )}
                  >
                    {index < step ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium",
                        index === step 
                          ? "bg-blue-600 text-white" 
                          : "bg-gray-300 dark:bg-neutral-700 text-gray-600 dark:text-neutral-400"
                      )}>
                        {index + 1}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium block truncate">{s.title}</span>
                      <span className="text-xs opacity-70 block truncate">{s.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-3/5 p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <DialogHeader className="text-left">
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={steps[step].title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="text-2xl font-bold"
                  >
                    {steps[step].title}
                  </motion.h2>
                </AnimatePresence>

                <div className="min-h-[60px]">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={steps[step].description}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="text-gray-600 dark:text-gray-400 text-base leading-relaxed"
                    >
                      {steps[step].description}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </DialogHeader>

              {/* Step Content */}
              <div className="w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {step === 0 && (
                      <div className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Getting Started Options:</h3>
                          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" />
                              Create a new account from the Sign Up page
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" />
                              Use existing demo accounts (recommended for quick exploration)
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" />
                              Each account type provides different access levels
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {step === 1 && (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Choose between two demo accounts to explore different aspects of our platform:
                        </p>
                        <div className="grid gap-3">
                          {demoAccounts.map((account, index) => (
                            <div
                              key={index}
                              className="p-4 border border-gray-200 dark:border-neutral-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <account.icon className="w-5 h-5 text-blue-600" />
                                <h4 className="font-semibold">{account.role}</h4>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{account.description}</p>
                              <div className="space-y-2">
                                {account.features.slice(0, 2).map((feature, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-xs">
                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                    {feature}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(step === 2 || step === 3) && (
                      <div className="space-y-6">
                        <div className="bg-slate-50 dark:bg-neutral-900 p-4 rounded-lg border">
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {demoAccounts[step - 2].role} Credentials
                          </h3>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                              <div className="flex gap-2 mt-1">
                                <input
                                  type="text"
                                  readOnly
                                  value={demoAccounts[step - 2].email}
                                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded text-sm bg-white dark:bg-neutral-800"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(demoAccounts[step - 2].email, `${demoAccounts[step - 2].role}-email`)}
                                  className="flex items-center gap-1"
                                >
                                  <Copy className="w-3 h-3" />
                                  {copiedAccount === `${demoAccounts[step - 2].role}-email` ? "Copied!" : "Copy"}
                                </Button>
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                              <div className="flex gap-2 mt-1">
                                <input
                                  type="text"
                                  readOnly
                                  value={demoAccounts[step - 2].password}
                                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded text-sm bg-white dark:bg-neutral-800"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(demoAccounts[step - 2].password, `${demoAccounts[step - 2].role}-password`)}
                                  className="flex items-center gap-1"
                                >
                                  <Copy className="w-3 h-3" />
                                  {copiedAccount === `${demoAccounts[step - 2].role}-password` ? "Copied!" : "Copy"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">What you can do:</h4>
                          <div className="grid gap-2">
                            {demoAccounts[step - 2].features.map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 4 && (
                      <div className="space-y-4 text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-xl font-semibold">You're Ready to Explore!</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Use the credentials from the previous steps to log in and start exploring TaskFlow Pro.
                        </p>
                        <div className="bg-slate-50 dark:bg-neutral-900 p-4 rounded-lg border mt-4">
                          <p className="text-sm font-medium mb-2">Quick Tips:</p>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 text-left">
                            <li>• Regular user account takes you to the main platform</li>
                            <li>• Admin account provides access to the admin portal</li>
                            <li>• You can create new accounts anytime from the Sign Up page</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-200 dark:border-neutral-700">
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>

              {step < steps.length - 1 ? (
                <Button onClick={next} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {step === 0 ? "View Demo Accounts" : "Continue"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <DialogClose asChild>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    Start Exploring
                  </Button>
                </DialogClose>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}