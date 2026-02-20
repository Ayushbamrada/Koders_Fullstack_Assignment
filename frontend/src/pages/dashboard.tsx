// import React, { useEffect, useState } from 'react';
// import { useAuth } from '@/context/AuthContext';
// import { useRouter } from 'next/router';
// import axios from 'axios';
// import TaskBoard from '@/components/TaskBoard';
// import { Task } from '@/types';
// import { io, Socket } from 'socket.io-client';

// interface UserType {
//   _id: string;
//   name: string;
//   email: string;
//   role: string;
// }

// export default function Dashboard() {
//   const { user } = useAuth();
//   const router = useRouter();

//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [users, setUsers] = useState<UserType[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [showModal, setShowModal] = useState(false);

//   const [newTask, setNewTask] = useState({
//     title: '',
//     description: '',
//     priority: 'medium',
//     assignee: ''
//   });

//   // 🔥 INITIAL LOAD
//   useEffect(() => {
//     if (!user) {
//       router.push('/login');
//       return;
//     }

//     const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
//       auth: { token: user.token }
//     });

//     setSocket(newSocket);

//     fetchTasks();

//     // Fetch users only for admin/manager
//     if (user.role === 'admin' || user.role === 'manager') {
//       fetchUsers();
//     }

//     return () => {
//       newSocket.close();
//     };
//   }, [user]);

//   // 🔥 SOCKET LISTENERS
//   useEffect(() => {
//     if (!socket) return;

//     socket.on('taskCreated', (newTask: Task) => {
//       setTasks(prev => [newTask, ...prev]);
//     });

//     socket.on('taskUpdated', (updatedTask: Task) => {
//       setTasks(prev =>
//         prev.map(task =>
//           task._id === updatedTask._id ? updatedTask : task
//         )
//       );
//     });

//     socket.on('taskDeleted', (taskId: string) => {
//       setTasks(prev => prev.filter(task => task._id !== taskId));
//     });

//     return () => {
//       socket.off('taskCreated');
//       socket.off('taskUpdated');
//       socket.off('taskDeleted');
//     };
//   }, [socket]);

//   // 🔥 FETCH TASKS
//   const fetchTasks = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(
//         `${process.env.NEXT_PUBLIC_API_URL}/tasks`,
//         {
//           headers: { Authorization: `Bearer ${user?.token}` }
//         }
//       );
//       setTasks(res.data.tasks);
//     } catch (error) {
//       console.error('Failed to fetch tasks:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🔥 FETCH USERS
//   const fetchUsers = async () => {
//   try {
//     const response = await axios.get(
//       `${process.env.NEXT_PUBLIC_API_URL}/users`,
//       {
//         headers: { Authorization: `Bearer ${user?.token}` }
//       }
//     );

//     setUsers(response.data.users || []);

//   } catch (error) {
//     console.error('Failed to fetch users:', error);
//     setUsers([]);
//   }
// };
//   // 🔥 CREATE TASK
//   const handleCreateTask = async () => {
//     try {
//       await axios.post(
//         `${process.env.NEXT_PUBLIC_API_URL}/tasks`,
//         {
//           ...newTask,
//           status: 'todo'
//         },
//         {
//           headers: { Authorization: `Bearer ${user?.token}` }
//         }
//       );

//       setShowModal(false);
//       setNewTask({
//         title: '',
//         description: '',
//         priority: 'medium',
//         assignee: ''
//       });

//       fetchTasks();
//     } catch (error) {
//       console.error('Failed to create task:', error);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p>Loading...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <div className="max-w-7xl mx-auto py-6 px-6">

//         {/* HEADER */}
//         <div className="flex justify-between items-center mb-6">
//           <div>
//             <h1 className="text-2xl font-bold">
//               Welcome, {user?.name}
//             </h1>
//             <p className="text-gray-600">Role: {user?.role}</p>
//           </div>

//           {(user?.role === 'admin' || user?.role === 'manager') && (
//             <button
//               onClick={() => setShowModal(true)}
//               className="bg-blue-600 text-white px-4 py-2 rounded"
//             >
//               + New Task
//             </button>
//           )}
//         </div>

//         {/* STATS */}
//         <div className="grid grid-cols-3 gap-4 mb-8">
//           <div className="bg-white p-4 rounded shadow">
//             Total Tasks: {tasks.length}
//           </div>
//           <div className="bg-white p-4 rounded shadow">
//             In Progress: {tasks.filter(t => t.status === 'in-progress').length}
//           </div>
//           <div className="bg-white p-4 rounded shadow">
//             Completed: {tasks.filter(t => t.status === 'done').length}
//           </div>
//         </div>

//         {/* TASK BOARD */}
//         <TaskBoard tasks={tasks} onTaskUpdate={fetchTasks} />

//         {/* 🔥 MODAL */}
//         {showModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
//             <div className="bg-white p-6 rounded w-96">
//               <h2 className="text-lg font-bold mb-4">Create Task</h2>

//               <input
//                 className="w-full border p-2 mb-2"
//                 placeholder="Title"
//                 value={newTask.title}
//                 onChange={e =>
//                   setNewTask({ ...newTask, title: e.target.value })
//                 }
//               />

//               <textarea
//                 className="w-full border p-2 mb-2"
//                 placeholder="Description"
//                 value={newTask.description}
//                 onChange={e =>
//                   setNewTask({ ...newTask, description: e.target.value })
//                 }
//               />

//               <select
//                 className="w-full border p-2 mb-4"
//                 value={newTask.assignee}
//                 onChange={e =>
//                   setNewTask({ ...newTask, assignee: e.target.value })
//                 }
//               >
//                 <option value="">Select Assignee</option>
//                 {users.map(u => (
//                   <option key={u._id} value={u._id}>
//                     {u.name} ({u.role})
//                   </option>
//                 ))}
//               </select>

//               <div className="flex justify-end gap-2">
//                 <button onClick={() => setShowModal(false)}>
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleCreateTask}
//                   className="bg-blue-600 text-white px-4 py-2 rounded"
//                 >
//                   Create
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }


import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import axios from 'axios';
import TaskBoard from '@/components/TaskBoard';
import { Task } from '@/types';
import { io, Socket } from 'socket.io-client';

interface UserType {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignee: ''
  });

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const newSocket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
      { auth: { token: user.token } }
    );

    setSocket(newSocket);
    fetchTasks();

    if (user.role === 'admin' || user.role === 'manager') {
      fetchUsers();
    }

    return () => {
      newSocket.close();
    };
  }, [user]);

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!socket) return;

    socket.on('taskCreated', (task: Task) => {
      setTasks(prev => [task, ...prev]);
    });

    socket.on('taskUpdated', (task: Task) => {
      setTasks(prev =>
        prev.map(t => (t._id === task._id ? task : t))
      );
    });

    socket.on('taskDeleted', (taskId: string) => {
      setTasks(prev => prev.filter(t => t._id !== taskId));
    });

    return () => {
      socket.off('taskCreated');
      socket.off('taskUpdated');
      socket.off('taskDeleted');
    };
  }, [socket]);

  /* ================= FETCH TASKS ================= */
  // const fetchTasks = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await axios.get(
  //       `${process.env.NEXT_PUBLIC_API_URL}/tasks`,
  //       {
  //         headers: { Authorization: `Bearer ${user?.token}` }
  //       }
  //     );

  //     setTasks(res.data.tasks || []);
  //   } catch (err) {
  //     console.error('Failed to fetch tasks:', err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);

const fetchTasks = async (page = 1) => {
  try {
    setLoading(true);

    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/tasks?page=${page}&limit=9`,
      {
        headers: { Authorization: `Bearer ${user?.token}` }
      }
    );

    setTasks(res.data.tasks || []);
    setTotalPages(res.data.totalPages || 1);
    setCurrentPage(res.data.currentPage || 1);

  } catch (err) {
    console.error('Failed to fetch tasks:', err);
  } finally {
    setLoading(false);
  }
};

  /* ================= FETCH USERS ================= */
  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/users`,
        {
          headers: { Authorization: `Bearer ${user?.token}` }
        }
      );

      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setUsers([]);
    }
  };

  /* ================= CREATE TASK ================= */
  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      alert('Title is required');
      return;
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks`,
        {
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          status: 'todo',
          // 🔥 Prevent empty string crash
          assignee: newTask.assignee ? newTask.assignee : undefined
        },
        {
          headers: { Authorization: `Bearer ${user?.token}` }
        }
      );

      setShowModal(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        assignee: ''
      });

      fetchTasks();
    } catch (err: any) {
      console.error('Create task error:', err.response?.data || err);
      alert(err.response?.data?.message || 'Failed to create task');
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome, {user?.name}
            </h1>
            <p className="text-gray-600">Role: {user?.role}</p>
          </div>

          {(user?.role === 'admin' || user?.role === 'manager') && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              + New Task
            </button>
          )}
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded shadow">
            Total: {tasks.length}
          </div>
          <div className="bg-white p-4 rounded shadow">
            In Progress: {tasks.filter(t => t.status === 'in-progress').length}
          </div>
          <div className="bg-white p-4 rounded shadow">
            Done: {tasks.filter(t => t.status === 'done').length}
          </div>
        </div>

        {/* BOARD */}
        <TaskBoard tasks={tasks} onTaskUpdate={fetchTasks} />

        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white p-6 rounded w-96">
              <h2 className="text-lg font-bold mb-4">Create Task</h2>

              <input
                className="w-full border p-2 mb-2"
                placeholder="Title"
                value={newTask.title}
                onChange={e =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
              />

              <textarea
                className="w-full border p-2 mb-2"
                placeholder="Description"
                value={newTask.description}
                onChange={e =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
              />

              {/* Assignee Dropdown */}
              <select
                className="w-full border p-2 mb-4"
                value={newTask.assignee}
                onChange={e =>
                  setNewTask({ ...newTask, assignee: e.target.value })
                }
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-2">
                <button onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button
                  onClick={handleCreateTask}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}