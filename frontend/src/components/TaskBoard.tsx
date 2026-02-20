import React, { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import TaskColumn from './TaskColumn';
import TaskCard from './TaskCard';
import { Task } from '@/types';

interface TaskBoardProps {
  tasks: Task[];
  onTaskUpdate: () => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onTaskUpdate }) => {
  const { user } = useAuth();
  const [columns, setColumns] = useState({
    todo: [] as Task[],
    'in-progress': [] as Task[],
    done: [] as Task[]
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // Group tasks by status
    const grouped = {
      todo: tasks.filter(task => task.status === 'todo'),
      'in-progress': tasks.filter(task => task.status === 'in-progress'),
      done: tasks.filter(task => task.status === 'done')
    };
    setColumns(grouped);
  }, [tasks]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find source and destination columns
    let sourceColumn: keyof typeof columns | null = null;
    let destColumn: keyof typeof columns | null = null;

    // Check if dragging over a column or another task
    const isOverColumn = ['todo', 'in-progress', 'done'].includes(overId);

    for (const [col, colTasks] of Object.entries(columns)) {
      if (colTasks.some(task => task._id === activeId)) {
        sourceColumn = col as keyof typeof columns;
      }
    }

    if (isOverColumn) {
      destColumn = overId as keyof typeof columns;
    } else {
      for (const [col, colTasks] of Object.entries(columns)) {
        if (colTasks.some(task => task._id === overId)) {
          destColumn = col as keyof typeof columns;
          break;
        }
      }
    }

    if (!sourceColumn || !destColumn) return;

    // Find the task
    const task = columns[sourceColumn].find(t => t._id === activeId);
    if (!task) return;

    // 🔒 CHECK PERMISSIONS: Users can only move their own tasks
    if (user?.role === 'user') {
      // Check if task is assigned to this user
      const taskAssigneeId = typeof task.assignee === 'object' ? task.assignee?._id : task.assignee;
      if (taskAssigneeId !== user._id) {
        alert('You can only move tasks assigned to you!');
        return;
      }
    }

    // If moving to different column
    if (sourceColumn !== destColumn) {
      // Update task status in backend
      try {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/tasks/${task._id}`,
          { status: destColumn },
          {
            headers: {
              Authorization: `Bearer ${user?.token}`
            }
          }
        );
        
        // Update local state
        const newColumns = { ...columns };
        newColumns[sourceColumn] = newColumns[sourceColumn].filter(t => t._id !== activeId);
        newColumns[destColumn] = [...newColumns[destColumn], { ...task, status: destColumn }];
        setColumns(newColumns);
        onTaskUpdate();
      } catch (error) {
        console.error('Failed to update task:', error);
        alert('Failed to update task. Please try again.');
      }
    } else {
      // Reorder within same column (only for admin/manager)
      if (user?.role === 'admin' || user?.role === 'manager') {
        const oldIndex = columns[sourceColumn].findIndex(t => t._id === activeId);
        const newIndex = columns[sourceColumn].findIndex(t => t._id === overId);
        
        const newTasks = arrayMove(columns[sourceColumn], oldIndex, newIndex);
        setColumns({
          ...columns,
          [sourceColumn]: newTasks
        });
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* Todo Column */}
        <TaskColumn
          id="todo"
          title="To Do"
          tasks={columns.todo}
          color="bg-gray-100"
          borderColor="border-gray-300"
        />

        {/* In Progress Column */}
        <TaskColumn
          id="in-progress"
          title="In Progress"
          tasks={columns['in-progress']}
          color="bg-blue-50"
          borderColor="border-blue-300"
        />

        {/* Done Column */}
        <TaskColumn
          id="done"
          title="Done"
          tasks={columns.done}
          color="bg-green-50"
          borderColor="border-green-300"
        />
      </div>
    </DndContext>
  );
};

export default TaskBoard;