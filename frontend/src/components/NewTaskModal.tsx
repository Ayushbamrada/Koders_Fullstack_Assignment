import React, { useState } from 'react';

interface Props {
  users: any[];
  onSubmit: (data: any) => void;
  onClose: () => void;
}

export default function NewTaskModal({ users, onSubmit, onClose }: Props) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignee: ''
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96">
        <h2 className="text-lg font-bold mb-4">Create Task</h2>

        <input
          className="w-full border p-2 mb-2"
          placeholder="Title"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          className="w-full border p-2 mb-2"
          placeholder="Description"
          onChange={e => setForm({ ...form, description: e.target.value })}
        />

        <select
          className="w-full border p-2 mb-2"
          onChange={e => setForm({ ...form, assignee: e.target.value })}
        >
          <option value="">Select Assignee</option>
          {users.map(user => (
            <option key={user._id} value={user._id}>
              {user.name} ({user.role})
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => onSubmit(form)}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}