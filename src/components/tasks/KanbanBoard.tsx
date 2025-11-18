import { Task } from "@/types";
import { TaskCard } from "./TaskCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
  CollisionDetection,
  pointerWithin,
  rectIntersection,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import React, { useState, useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useToast } from "@/hooks/use-toast";

// Define valid status transitions (only adjacent statuses)
const isValidStatusTransition = (fromStatus: Task["status"], toStatus: Task["status"]): boolean => {
  if (fromStatus === toStatus) return false; // No change needed

  const statusOrder = ["todo", "in-progress", "done"];
  const fromIndex = statusOrder.indexOf(fromStatus);
  const toIndex = statusOrder.indexOf(toStatus);

  // Only allow moving to adjacent columns (difference of 1)
  return Math.abs(fromIndex - toIndex) === 1;
};

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskStatusChange: (taskId: string, newStatus: Task["status"]) => void;
  onNewTask?: (status: Task["status"]) => void;
}

function SortableTaskCard({
  task,
  onClick,
  onStatusChange
}: {
  task: Task;
  onClick: () => void;
  onStatusChange?: (taskId: string, newStatus: Task["status"]) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.title}. Drag to move between columns.`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <TaskCard
        task={task}
        onClick={onClick}
        onStatusChange={onStatusChange}
        showStatusDropdown={true}
      />
    </div>
  );
}

function DroppableColumn({
  column,
  tasks,
  onTaskClick,
  onTaskStatusChange,
  onNewTask
}: {
  column: { id: string; title: string; status: Task["status"] };
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskStatusChange: (taskId: string, newStatus: Task["status"]) => void;
  onNewTask?: (status: Task["status"]) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const columnTasks = tasks.filter((task) => task.status === column.status);

  return (
    <Card key={column.id} className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle
            className="text-base font-semibold"
            role="heading"
            aria-level={2}
          >
            {column.title}
            <span
              className="ml-2 text-sm font-normal text-muted-foreground"
              aria-label={`${columnTasks.length} tasks`}
            >
              {columnTasks.length}
            </span>
          </CardTitle>
          {onNewTask && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onNewTask(column.status)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <SortableContext
        id={column.id}
        items={columnTasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <CardContent
          ref={setNodeRef}
          className={`flex-1 space-y-3 pt-0 min-h-[200px] transition-colors ${
            isOver ? "bg-green-50 border-green-200 border-2" : ""
          }`}
        >
          {columnTasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
              onStatusChange={onTaskStatusChange}
            />
          ))}
          {columnTasks.length === 0 && (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              Drop tasks here
            </div>
          )}
        </CardContent>
      </SortableContext>
    </Card>
  );
}

export function KanbanBoard({ tasks, onTaskClick, onTaskStatusChange, onNewTask }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>(tasks);
  const [pendingUpdates, setPendingUpdates] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Sync optimistic tasks with props
  React.useEffect(() => {
    setOptimisticTasks(tasks);
  }, [tasks]);

  // Cleanup cursor on unmount
  React.useEffect(() => {
    return () => {
      document.body.style.cursor = '';
    };
  }, []);

  // Handle task status change with optimistic updates
  const handleTaskStatusChange = useCallback(async (taskId: string, newStatus: Task["status"]) => {
    const originalTask = optimisticTasks.find(t => t.id === taskId);
    if (!originalTask || originalTask.status === newStatus) return;

    // Prevent rapid successive updates for the same task
    if (pendingUpdates.has(taskId)) {
      console.warn(`Ignoring rapid update for task ${taskId} - already pending`);
      return;
    }

    // Optimistic update
    setOptimisticTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
    setPendingUpdates(prev => new Set(prev).add(taskId));

    try {
      await onTaskStatusChange(taskId, newStatus);
      toast({
        title: "Task updated",
        description: `Task moved to ${newStatus.replace('_', ' ')}`,
      });
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, status: originalTask.status } : task
      ));
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPendingUpdates(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  }, [optimisticTasks, onTaskStatusChange, toast, pendingUpdates]);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Keyboard navigation support
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      // Could implement keyboard-based drag initiation here
      // For now, we'll rely on pointer/touch interactions
    }
  };

  const columns = [
    { id: "todo", title: "To Do", status: "todo" as const },
    { id: "in-progress", title: "In Progress", status: "in-progress" as const },
    { id: "done", title: "Done", status: "done" as const },
  ];

  // Custom collision detection that only allows valid status transitions
  const customCollisionDetection: CollisionDetection = (args) => {
    // If no active task, use default collision detection
    if (!activeTask) {
      return closestCorners(args);
    }

    // Get all collisions
    const collisions = closestCorners(args);

    // Filter to only allow collisions with valid drop zones
    return collisions.filter((collision) => {
      const droppableId = collision.id as string;
      const targetColumn = columns.find(col => col.id === droppableId);

      if (!targetColumn) return false;

      // Allow collision only if status transition is valid
      return isValidStatusTransition(activeTask.status, targetColumn.status);
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);

    // Add visual feedback for drag start
    document.body.style.cursor = 'grabbing';
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const taskId = active.id as string;
    const overId = over.id as string;

    // Find the task being dragged
    const draggedTask = optimisticTasks.find(task => task.id === taskId);
    if (!draggedTask) {
      setActiveTask(null);
      return;
    }

    // Check if dropped over a column (by checking if overId matches column id)
    const targetColumn = columns.find((col) => col.id === overId);
    if (targetColumn && draggedTask.status !== targetColumn.status) {
      // Validate that the status transition is allowed
      if (isValidStatusTransition(draggedTask.status, targetColumn.status)) {
        handleTaskStatusChange(taskId, targetColumn.status);
      } else {
        // Show error for invalid transition
        toast({
          title: "Invalid Move",
          description: `Cannot move task directly from ${draggedTask.status.replace('_', ' ')} to ${targetColumn.status.replace('_', ' ')}. Please move to adjacent status only.`,
          variant: "destructive",
        });
      }
    }

    setActiveTask(null);

    // Reset cursor
    document.body.style.cursor = '';
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((column) => (
          <DroppableColumn
            key={column.id}
            column={column}
            tasks={optimisticTasks}
            onTaskClick={onTaskClick}
            onTaskStatusChange={handleTaskStatusChange}
            onNewTask={onNewTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} onClick={() => {}} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
