# Knowledge Base Backend

A TypeScript-based backend for a knowledge base platform similar to Confluence.

## Features

- **Authentication & Authorization**: JWT-based authentication with password reset functionality
- **Document Management**: Create, read, update, and delete documents with rich content support
- **Version Control**: Track document versions and compare changes
- **Collaboration**: Share documents with specific users and manage permissions
- **Search**: Full-text search across documents
- **Real-time Updates**: Support for real-time collaborative editing

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer for password reset emails
- **Development**: ts-node-dev for hot reloading

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone git clone https://github.com/seema97292/knowledge_base
cd knowledge-base/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5101
MONGODB_URI=mongodb://localhost:27017/knowledge-base
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRE=30d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:3000
```

## Development

Start the development server with hot reloading:
```bash
npm run dev
```

Build the TypeScript code:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

Run linting:
```bash
npm run lint
```

Fix linting issues:
```bash
npm run lint:fix
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Documents
- `GET /api/documents` - Get all accessible documents
- `GET /api/documents/search?q=query` - Search documents
- `GET /api/documents/:id` - Get specific document
- `POST /api/documents` - Create new document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `PUT /api/documents/:id/visibility` - Update document visibility
- `POST /api/documents/:id/share` - Share document with user
- `DELETE /api/documents/:id/share/:userId` - Remove user access

### Versions
- `GET /api/documents/:id/versions` - Get document version history
- `GET /api/documents/:id/versions/:versionId` - Get specific version
- `GET /api/documents/:id/versions/:versionId/diff` - Compare versions

## Project Structure

```
src/
├── config/
│   └── database.ts          # Database connection configuration
├── controllers/
│   ├── authController.ts    # Authentication logic
│   ├── documentController.ts # Document management logic
│   └── versionController.ts # Version control logic
├── middleware/
│   └── auth.ts              # Authentication middleware
├── models/
│   ├── User.ts              # User model
│   └── Document.ts          # Document model
├── routes/
│   ├── auth.ts              # Authentication routes
│   ├── documents.ts         # Document routes
│   └── versions.ts          # Version routes
├── types/
│   └── index.ts             # TypeScript type definitions
├── utils/
│   ├── generateToken.ts     # JWT token utility
│   └── sendEmail.ts         # Email utility
└── server.ts                # Main application entry point
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5101` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/knowledge-base` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | JWT expiration time | `30d` |
| `EMAIL_HOST` | SMTP server host | Required |
| `EMAIL_PORT` | SMTP server port | `587` |
| `EMAIL_USER` | SMTP username | Required |
| `EMAIL_PASS` | SMTP password/app password | Required |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:3000` |

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Ensure all tests pass: `npm test`
5. Commit your changes: `git commit -am 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Create a Pull Request


