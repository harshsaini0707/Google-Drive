# Google Drive Clone

A full-stack cloud storage application with real-time collaboration features.

## Architecture

- Next.js 16 (App Router) with TypeScript
- PostgreSQL database with Drizzle ORM
- AWS S3 for file storage
- Socket.IO for real-time updates
- NextAuth v5 for Google OAuth authentication
- Tailwind CSS v4 for styling

## Features

### File Management
- Upload, download, rename, and delete files
- Organize files with search functionality
- Trash system with restore capability
- File size and type validation

### Sharing & Permissions
- Share files with specific users via email
- Granular permission levels: Read, Edit, Delete
- Real-time notifications when files are shared or modified
- View permission badges on shared files

### User Interface
- Dark theme dashboard with sidebar navigation
- Separate sections: My Files, Shared with me, Files I shared, Trash
- In-browser file viewer for images, PDFs, and videos
- Responsive design

### Real-Time Updates
- Live updates when files are shared, renamed, or deleted
- User-specific rooms for targeted notifications

## Database Schema

Three main tables:
- **users**: Google OAuth user profiles
- **files**: File metadata and S3 references
- **file_shares**: Sharing relationships with permissions (read/edit/delete)

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables in `.env.local`:
   ```
   AUTH_SECRET=
   AUTH_GOOGLE_ID=
   AUTH_GOOGLE_SECRET=
   DATABASE_URL=
   AWS_ACCESS_KEY_ID=
   AWS_SECRET_ACCESS_KEY=
   AWS_REGION=
   AWS_BUCKET_NAME=
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
   ```

3. Push database schema:
   ```
   npm run db:push
   ```

4. Run development servers (requires two terminals):
   ```
   npm run dev            # Next.js
   npm run dev:socket     # Socket.IO server
   ```

## Scripts

- `npm run dev` - Start Next.js development server
- `npm run dev:socket` - Start Socket.IO server
- `npm run build` - Build for production
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio

## Tech Stack

- Framework: Next.js 16.1
- Language: TypeScript
- Database: PostgreSQL (via Drizzle ORM)
- Storage: AWS S3
- Auth: NextAuth
- Real-time: Socket.IO 
- Styling: Tailwind CSS 4
- Icons: Lucide React
- Validation: Zod
