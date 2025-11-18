import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, isSameDay, parseISO } from "date-fns";
import { Clock, Flag, FolderKanban, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { taskService } from "@/services/taskService";
import { projectService } from "@/services/projectService";
import { calendarService } from "@/services/calendarService";
import { Task, Project, CalendarEvent } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function CalendarPage() {
  const { user, appUser } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    if (!appUser?.uid) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [userTasks, userProjects, userEvents] = await Promise.all([
          taskService.getAllTasks(),
          projectService.getAllProjects(),
          calendarService.getAllEvents(),
        ]);
        setTasks(userTasks);
        setProjects(userProjects);
        setCalendarEvents(userEvents);
      } catch (error) {
        console.error("Error fetching calendar data:", error);
        toast({
          title: "Error",
          description: "Failed to load calendar data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [appUser?.uid, toast]);

  // Real-time listeners
  useEffect(() => {
    if (!appUser?.uid) return;

    const unsubscribeEvents = calendarService.subscribeToAllEvents((updatedEvents) => {
      setCalendarEvents(updatedEvents);
    });

    return () => {
      unsubscribeEvents();
    };
  }, [appUser?.uid]);

  // Get all events (tasks, project deadlines, calendar events) for a specific date
  const getEventsForDate = (date: Date) => {
    const taskEvents = tasks.filter((task) => isSameDay(parseISO(task.dueDate), date));
    const projectEvents = projects.filter((project) =>
      project.nextDueDate && isSameDay(parseISO(project.nextDueDate), date)
    );
    const calendarEventEvents = calendarEvents.filter((event) =>
      isSameDay(parseISO(event.startDate), date)
    );
    return { taskEvents, projectEvents, calendarEventEvents };
  };

  const { taskEvents: tasksOnSelectedDate, projectEvents: projectsOnSelectedDate, calendarEventEvents: calendarEventsOnSelectedDate } = getEventsForDate(selectedDate);

  // Get dates with events for calendar highlighting
  const datesWithEvents = new Set<string>();
  tasks.forEach((task) => datesWithEvents.add(task.dueDate));
  projects.forEach((project) => {
    if (project.nextDueDate) datesWithEvents.add(project.nextDueDate);
  });
  calendarEvents.forEach((event) => datesWithEvents.add(event.startDate.split('T')[0]));

  const hasEventsOnDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return datesWithEvents.has(dateStr);
  };

  const priorityColors = {
    low: "bg-priority-low text-priority-low-foreground",
    medium: "bg-priority-medium text-priority-medium-foreground",
    high: "bg-priority-high text-priority-high-foreground",
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex w-full">
        <DashboardSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 p-6 lg:p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Loading calendar...</div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
                <p className="text-muted-foreground mt-1">
                  View project timelines and task deadlines
                </p>
              </div>

            {/* Legend */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <span className="text-muted-foreground">Project Deadline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-priority-high" />
                    <span className="text-muted-foreground">High Priority Task</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-priority-medium" />
                    <span className="text-muted-foreground">Medium Priority Task</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-priority-low" />
                    <span className="text-muted-foreground">Low Priority Task</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-3 w-3" />
                    <span className="text-muted-foreground">Calendar Event</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {format(selectedDate, "MMMM d, yyyy")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Project Deadlines */}
                  {projectsOnSelectedDate.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <FolderKanban className="h-4 w-4" />
                        <span>Project Deadlines</span>
                      </div>
                      {projectsOnSelectedDate.map((project) => (
                        <div
                          key={project.id}
                          className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                        >
                          <div
                            className="h-10 w-1 rounded-full"
                            style={{ backgroundColor: project.color }}
                          />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-medium">{project.name}</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {project.description}
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-primary/10">
                                {project.progress}% Complete
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{project.tasksCount.inProgress} tasks in progress</span>
                              <span>{project.tasksCount.done} completed</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Task Deadlines */}
                  {tasksOnSelectedDate.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Flag className="h-4 w-4" />
                        <span>Task Deadlines</span>
                      </div>
                      {tasksOnSelectedDate.map((task) => {
                        const project = projects.find((p) => p.id === task.projectId);

                        return (
                          <div
                            key={task.id}
                            className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                          >
                            <div
                              className="h-10 w-1 rounded-full"
                              style={{ backgroundColor: project?.color }}
                            />
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h3 className="font-medium">{task.title}</h3>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {task.description}
                                  </p>
                                </div>
                                <Badge
                                  className={priorityColors[task.priority]}
                                >
                                  {task.priority}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage
                                      src={task.assignee?.avatar}
                                      alt={task.assignee?.name}
                                    />
                                    <AvatarFallback className="text-xs">
                                      {task.assignee?.name.substring(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-muted-foreground">
                                    {task.assignee?.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  <span>{project?.name}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Calendar Events */}
                  {calendarEventsOnSelectedDate.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Calendar Events</span>
                      </div>
                      {calendarEventsOnSelectedDate.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                        >
                          <div
                            className="h-10 w-1 rounded-full"
                            style={{ backgroundColor: event.color || '#6b7280' }}
                          />
                          <div className="flex-1 space-y-2">
                            <div>
                              <h3 className="font-medium">{event.title}</h3>
                              {event.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {event.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {event.allDay ? (
                                <span>All day</span>
                              ) : (
                                <span>
                                  {format(parseISO(event.startDate), "h:mm a")}
                                  {event.endDate && ` - ${format(parseISO(event.endDate), "h:mm a")}`}
                                </span>
                              )}
                              {event.location && (
                                <span>{event.location}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* No Events */}
                  {tasksOnSelectedDate.length === 0 && projectsOnSelectedDate.length === 0 && calendarEventsOnSelectedDate.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No events scheduled for this date
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Select Date</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    modifiers={{
                      hasEvents: (date) => hasEventsOnDate(date),
                    }}
                    modifiersClassNames={{
                      hasEvents: "bg-primary/20 font-bold",
                    }}
                    className="rounded-md border pointer-events-auto"
                  />
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-3 w-3 rounded-full bg-primary/20" />
                      <span className="text-muted-foreground">Has events</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Upcoming Project Deadlines */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <FolderKanban className="h-3.5 w-3.5" />
                      Projects
                    </h4>
                    {projects
                      .filter((p) => p.nextDueDate && new Date(p.nextDueDate) >= new Date())
                      .sort((a, b) => 
                        new Date(a.nextDueDate!).getTime() - new Date(b.nextDueDate!).getTime()
                      )
                      .slice(0, 3)
                      .map((project) => (
                        <div
                          key={project.id}
                          className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                          onClick={() => setSelectedDate(parseISO(project.nextDueDate!))}
                        >
                          <div
                            className="h-8 w-1 rounded-full flex-shrink-0"
                            style={{ backgroundColor: project.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {project.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(parseISO(project.nextDueDate!), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Upcoming Tasks */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Flag className="h-3.5 w-3.5" />
                      Tasks
                    </h4>
                    {tasks
                      .filter((task) => new Date(task.dueDate) >= new Date())
                      .sort((a, b) =>
                        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
                      )
                      .slice(0, 5)
                      .map((task) => {
                        const project = projects.find((p) => p.id === task.projectId);

                        return (
                          <div
                            key={task.id}
                            className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                            onClick={() => setSelectedDate(parseISO(task.dueDate))}
                          >
                            <div
                              className="h-8 w-1 rounded-full flex-shrink-0"
                              style={{ backgroundColor: project?.color }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {task.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(parseISO(task.dueDate), "MMM d, yyyy")}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn("text-xs", priorityColors[task.priority])}
                            >
                              {task.priority}
                            </Badge>
                          </div>
                        );
                      })}
                  </div>

                  {/* Upcoming Calendar Events */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      Events
                    </h4>
                    {calendarEvents
                      .filter((event) => new Date(event.startDate) >= new Date())
                      .sort((a, b) =>
                        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
                      )
                      .slice(0, 5)
                      .map((event) => (
                        <div
                          key={event.id}
                          className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                          onClick={() => setSelectedDate(parseISO(event.startDate))}
                        >
                          <div
                            className="h-8 w-1 rounded-full flex-shrink-0"
                            style={{ backgroundColor: event.color || '#6b7280' }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {event.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(parseISO(event.startDate), "MMM d, yyyy")}
                              {!event.allDay && ` at ${format(parseISO(event.startDate), "h:mm a")}`}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
