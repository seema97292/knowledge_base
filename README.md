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
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── documentController.ts
│   │   │   └── versionController.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   └── Document.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── documents.ts
│   │   │   └── versions.ts
│   │   ├── scripts/
│   │   │   └── seedDatabase.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── generateToken.ts
│   │   │   └── sendEmail.ts
│   │   └── server.ts
│   ├── .env
│   ├── .env.example
│   ├── jest.config.js
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── frontend/
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/
│   │   │   └── react.svg
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── ForgotPassword.tsx
│   │   │   │   ├── Login.tsx
│   │   │   │   └── Register.tsx
│   │   │   ├── documents/
│   │   │   │   ├── DocumentEditor.tsx
│   │   │   │   ├── DocumentList.tsx
│   │   │   │   └── DocumentView.tsx
│   │   │   ├── layout/
│   │   │   │   └── Header.tsx
│   │   │   ├── ui/ (shadcn/ui components)
│   │   │   └── ProtectedRoute.tsx
│   │   ├── hooks/
│   │   │   ├── use-mobile.ts
│   │   │   └── useAuth.tsx
│   │   ├── lib/
│   │   │   ├── api.tsx
│   │   │   └── utils.ts
│   │   ├── types/
│   │   │   ├── index.ts
│   │   │   └── jsx.d.ts
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── .env
│   ├── .env.example
│   ├── components.json
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
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

3. **Environment Configuration**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5101/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
