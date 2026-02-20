import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { Task } from '@/types';

interface TaskColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
  borderColor: string;
}

const TaskColumn: React.FC<TaskColumnProps> = ({ id, title, tasks, color, borderColor }) => {
  const { setNodeRef } = useDroppable({
    id: id
  });

  return (
    <div
      ref={setNodeRef}
      className={`${color} p-4 rounded-lg border-2 ${borderColor} min-h-[500px]`}
    >
      <h2 className="text-lg font-semibold mb-4 flex justify-between items-center">
        <span>{title}</span>
        <span className="bg-white px-2 py-1 rounded-full text-sm">
          {tasks.length}
        </span>
      </h2>
      
      <SortableContext
        items={tasks.map(t => t._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

export default TaskColumn;