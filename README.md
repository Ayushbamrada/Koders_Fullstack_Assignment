# 🚀 Koders Fullstack Assignment  
## 🗂 Real-Time Task Management Platform

A production-ready full-stack task management system built using modern web technologies.

---

## 🌐 Live Deployment

### 🔹 Frontend (Vercel)
https://koders-frontend-five.vercel.app/login

### 🔹 Backend (Render)
https://koders-backend-ussk.onrender.com/api/health

---

## 🏗 Tech Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- Socket.IO Client
- Axios

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Socket.IO
- CORS

### Database
- MongoDB Atlas (Cloud Database)

### Deployment
- Frontend → Vercel
- Backend → Render
- Database → MongoDB Atlas

---

## ✨ Features

- 🔐 JWT Authentication (Login/Register)
- 👥 Role-Based Access (Admin / Manager / User)
- 📋 Kanban Task Board (Drag & Drop)
- ⚡ Real-Time Updates using Socket.IO
- 📄 Pagination Support
- 🗑 Soft Delete Tasks
- 👤 Admin User Management
- 🐳 Dockerized Local Setup
- ☁ Cloud Deployment (Production Ready)

---

## 📦 Local Development Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Ayushbamrada/Koders_Fullstack_Assignment.git
cd Koders_Fullstack_Assignment


2️⃣ Environment Variables
Backend (.env)
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
3️⃣ Run With Docker
docker compose up --build

Frontend → http://localhost:3000

Backend → http://localhost:5000

🏛 Architecture Overview
Vercel (Frontend)
        ↓
Render (Backend API + Socket)
        ↓
MongoDB Atlas (Cloud DB)


👨Author

Ayush Bamrada