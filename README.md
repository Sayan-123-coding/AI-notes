# 📝 AI Notes App

A full-stack web application for creating, managing, and sharing notes with AI-powered summaries, dark/light mode, and advanced features.

![GitHub](https://img.shields.io/badge/GitHub-Sayan--123--coding-blue?logo=github)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

### 📋 Core Features

- ✅ **Create, Read, Update, Delete (CRUD)** notes with full markdown support
- ✅ **AI-Powered Summaries** - Auto-generate 150-character summaries using Groq API
- ✅ **Dark/Light Mode** - Toggle theme with persistent storage
- ✅ **Categories & Tags** - Organize notes by custom categories and tags
- ✅ **Archive Notes** - Archive notes and view separately
- ✅ **Favorites (Star)** - Mark important notes with a star icon
- ✅ **Share Notes** - Share notes with other users
- ✅ **PDF Export** - Export individual notes as PDF with metadata
- ✅ **Search Functionality** - Search notes by title and content

### 🎁 Premium Features

- ✅ **Password Reset** - Forgot password flow with email token validation
- ✅ **Search History** - Auto-save and quick-select previous searches (last 10)
- ✅ **Note Templates** - 6 pre-made templates (Daily Standup, Meeting Notes, Brainstorm, Project Plan, Book Notes, Homework)
- ✅ **Analytics Dashboard** - View usage statistics (Total Notes, This Week, Total Characters, Avg Length)
- ✅ **User Profile** - View account details and statistics
- ✅ **Rate Limiting** - API protection with rate limits

---

## 🛠 Tech Stack

### Frontend

- **React 19.2.4** - UI framework
- **Vite 8.0.8** - Build tool and dev server
- **TailwindCSS 4.2.2** - Styling
- **React Router 7.14.0** - Page routing
- **Lucide Icons** - Beautiful icons
- **React Hot Toast** - Notifications
- **jsPDF & html2canvas** - PDF export

### Backend

- **Node.js + Express 5.2.1** - REST API server
- **MongoDB 9.4.1** - Database with Mongoose ODM
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcryptjs** - Password hashing
- **Groq API** - AI-powered summaries
- **Dotenv** - Environment variable management

### Deployment

- **Railway** - Backend hosting
- **Vercel** - Frontend hosting

---

## 📦 Project Structure

```
ai-notes-app/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Auth logic (register, login, password reset)
│   │   ├── noteController.js     # Note CRUD operations
│   │   ├── categoryController.js # Category management
│   │   └── shareController.js    # Note sharing
│   ├── middleware/
│   │   ├── auth.js               # JWT middleware
│   │   └── validation.js         # Input validation
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Note.js               # Note schema
│   │   ├── Category.js           # Category schema
│   │   └── Share.js              # Share schema
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── noteRoutes.js         # Note endpoints
│   │   ├── categoryRoutes.js     # Category endpoints
│   │   └── shareRoutes.js        # Share endpoints
│   ├── .env                      # Environment variables (NOT committed)
│   ├── .env.example              # Template for env variables
│   ├── package.json
│   └── server.js                 # Express app entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── NoteForm.jsx              # Note creation form
│   │   │   ├── NoteList.jsx              # Display notes list
│   │   │   ├── ForgotPasswordModal.jsx   # Password reset modal
│   │   │   ├── NoteTemplatesModal.jsx    # Template selection
│   │   │   └── AnalyticsSection.jsx      # Usage statistics
│   │   ├── context/
│   │   │   └── AuthContext.jsx           # Auth state management
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Main notes dashboard
│   │   │   ├── Login.jsx         # Login page
│   │   │   ├── Register.jsx      # Registration page
│   │   │   ├── SharedNotes.jsx   # View shared notes
│   │   │   └── Profile.jsx       # User profile
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.development          # Dev API URL
│   ├── .env.production           # Production API URL
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── .gitignore                    # Git ignore rules
├── README.md                     # This file
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- MongoDB Atlas account (or local MongoDB)
- Groq API key (free tier available)
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Sayan-123-coding/AI-notes.git
   cd ai-notes-app
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**

   ```bash
   cd frontend
   npm install
   ```

4. **Environment Variables**

   **Backend** (`backend/.env`):

   ```env
   GROQ_API_KEY=your_groq_api_key_here
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   PORT=5000
   NODE_ENV=development
   ```

   **Frontend** (`frontend/.env.development`):

   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Start Development Servers**

   **Terminal 1 - Backend:**

   ```bash
   cd backend
   npm run dev
   ```

   **Terminal 2 - Frontend:**

   ```bash
   cd frontend
   npm run dev
   ```

   Frontend will be available at `http://localhost:5173` (or next available port)
   Backend API at `http://localhost:5000/api`

---

## 📖 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Notes

- `GET /api/notes` - Get all notes (protected)
- `POST /api/notes` - Create note (protected)
- `PUT /api/notes/:id` - Update note (protected)
- `DELETE /api/notes/:id` - Delete note (protected)
- `POST /api/notes/export` - Export notes as PDF (protected)

### Categories

- `GET /api/categories` - Get all categories (protected)
- `POST /api/categories` - Create category (protected)
- `DELETE /api/categories/:id` - Delete category (protected)

### Sharing

- `POST /api/shares` - Share note with user (protected)
- `GET /api/shares` - Get shared notes (protected)
- `DELETE /api/shares/:id` - Remove share (protected)

---

## 🔐 Authentication

The app uses **JWT (JSON Web Tokens)** for authentication:

- Access tokens valid for 7 days
- Passwords hashed with bcryptjs
- Reset tokens expire in 15 minutes
- Protected routes require valid JWT in Authorization header

---

## 📊 Environment Variables Reference

### Backend Required

| Variable       | Description                | Example                            |
| -------------- | -------------------------- | ---------------------------------- |
| `GROQ_API_KEY` | API key for AI summaries   | `gsk_xxx...`                       |
| `MONGO_URI`    | MongoDB connection string  | `mongodb+srv://user:pass@...`      |
| `JWT_SECRET`   | Secret key for JWT signing | `your_secret_key_32_chars_minimum` |
| `PORT`         | Server port                | `5000`                             |
| `NODE_ENV`     | Environment                | `development` or `production`      |

### Frontend Required

| Variable       | Description     | Example                     |
| -------------- | --------------- | --------------------------- |
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |

---

## 🧪 Testing the App

1. **Register** a new account
2. **Create** a note with markdown content
3. **View** the AI-generated summary
4. **Star** the note as favorite
5. **Search** for notes using the search bar
6. **Create** a note from templates
7. **View** analytics on profile
8. **Export** note as PDF
9. **Test** password reset on login page
10. **Toggle** dark/light mode

---

## 🚀 Deployment

### Deploy Backend to Railway

1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. Create new project → Connect GitHub
4. Select repository and `backend` folder
5. Add environment variables
6. Deploy (Railway auto-detects Node.js)

### Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Select `frontend` folder as root
4. Add `VITE_API_URL` environment variable (use Railway backend URL)
5. Deploy

### Environment Variables for Production

**Railway (Backend):**

```
GROQ_API_KEY=your_production_key
MONGO_URI=your_mongodb_uri
JWT_SECRET=generate_long_random_string_32_chars_min
NODE_ENV=production
PORT=3000 (Railroad assigns this automatically)
```

**Vercel (Frontend):**

```
VITE_API_URL=https://your-railway-backend.railway.app/api
```

---

## 🔒 Security Best Practices

- ✅ Never commit `.env` files (use `.gitignore`)
- ✅ Use strong JWT_SECRET in production (min 32 characters)
- ✅ Passwords are hashed with bcryptjs before storing
- ✅ API rate limiting prevents brute force attacks
- ✅ JWT tokens expire after 7 days
- ✅ Password reset tokens expire after 15 minutes
- ✅ Sensitive data (API keys) excluded from repository

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### MongoDB Connection Error

- Verify connection string in `.env`
- Check MongoDB Atlas network access allows your IP
- Ensure credentials are correct

### API Not Responding

- Check backend is running on correct port
- Verify `VITE_API_URL` in frontend env file
- Check browser console (F12) for CORS errors

### Blank Frontend

- Clear browser cache (Ctrl+Shift+Delete)
- Check `npm run dev` output for build errors
- Verify all dependencies installed: `npm install`

---

## 📞 Support

For issues, questions, or suggestions:

- Open an issue on [GitHub Issues](https://github.com/Sayan-123-coding/AI-notes/issues)
- Check existing documentation in `/docs`

---

## 🎉 Acknowledgments

- Groq API for AI-powered summaries
- MongoDB Atlas for database hosting
- TailwindCSS for beautiful styling
- React and Vite communities

---

**Built with ❤️ by Sayan**

Last Updated: April 14, 2026
