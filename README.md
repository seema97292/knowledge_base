# Knowledge Base Platform

A full-stack knowledge base platform built with MongoDB, Express.js, React, and Node.js (MERN stack). This application allows users to create, manage, and collaborate on documents with features like authentication, search, privacy controls, and version history.

### Test Credentials
- **Email**: john@example.com
- **Password**: password123
- **Admin Email**: admin@example.com
- **Admin Password**: admin123

## 📁 Project Structure

```
knowledge-base-platform/
├── backend/
│   ├── config/
│   │   └── database.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── documentController.ts
│   │   └── versionController.ts
│   ├── middleware/
│   │   └── auth.ts
│   ├── models/
│   │   ├── User.ts
│   │   └── Document.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── documents.ts
│   │   └── versions.ts
│   ├── utils/
│   │   ├── generateToken.ts
│   │   └── sendEmail.ts
│   ├── public/ (React build files)
│   ├── scripts/
│   │   └── seedDatabase.ts
│   ├── .env
│   ├── package.json
│   └── server.ts
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── documents/
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   ├── hooks/
│   │   │   └── useAuth.tsx
│   │   ├── lib/
│   │   │   └── api.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.ts (v16 or higher)
- MongoDB (local or cloud instance)
- npm

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/seema97292/knowledge_base
   cd knowledge-base-platform/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5101
   MONGODB_URI=mongodb://localhost:27017/knowledge-base
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

4. **Seed the database (optional)**
   ```bash
   node scripts/seedDatabase.ts
   ```

5. **Start the backend server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
