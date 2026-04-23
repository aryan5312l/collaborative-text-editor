Title
# Real-Time Collaborative Text Editor

Overview
A real-time collaborative text editor that allows multiple users to edit the same document simultaneously with live updates.

The project focuses on handling concurrent edits, synchronization, and maintaining consistency across clients using a basic Operational Transformation (OT) approach.

Features
- Real-time multi-user editing (Socket.IO)
- Conflict handling using version-based OT
- Live cursor tracking and user presence
- Role-based access control (read/write)
- Secure document sharing via link/email
- JWT authentication
- Debounced database persistence for performance

Tech Stack
Frontend:
- React.js

Backend:
- Node.js
- Express.js
- Socket.IO

Database:
- MongoDB

Other:
- JWT Authentication

How it Works
1. Each client sends operations (insert/delete) with a version number.
2. Server maintains the latest document state and operation history.
3. If a client is behind, incoming operations are transformed using OT before applying.
4. Server broadcasts transformed operations to all connected users.
5. Clients update their content in real-time.

Challenges & Learnings
- Handling concurrent edits without overwriting data
- Managing version synchronization between clients and server
- Dealing with race conditions in real-time systems
- Cursor synchronization across users
- Optimizing performance by avoiding database writes on every keystroke

Limitations
- OT implementation handles basic cases but not all edge cases
- Undo/Redo is not fully OT-safe
- Cursor synchronization can be improved further

Demo
![alt text](image.png)
![alt text](image-1.png)
![alt text](image-2.png)

Deployment
Live: https://collabxeditor.onrender.com

Installation
# Clone repo
git clone <repo-link>

# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev

Future Improvements
- Full OT edge-case handling
- CRDT-based synchronization (Yjs)
- OT-safe undo/redo
- Better cursor and selection handling
- Scalability improvements

