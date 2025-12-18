# Google Drive Clone

A full-stack application that replicates core Google Drive functionalities including authentication, file management, and file sharing with granular permissions.

## Tech Stack

- **Frontend & Backend**: Next.js 16 with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js with Google OAuth 2.0
- **File Storage**: AWS S3
- **Validation**: Zod
- **Package Manager**: Bun

## Features

- 🔐 Google OAuth 2.0 Authentication
- 📁 File Management (Upload, Delete, Rename)
- 🔍 File Search by Name
- 🤝 File Sharing with Granular Permissions (Read, Edit, Delete)
- ☁️ AWS S3 Storage Integration
- 🎨 Modern UI with Tailwind CSS

## Prerequisites

Before you begin, ensure you have the following installed:

- [Bun](https://bun.sh/) (v1.0 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v14 or higher)
- [Node.js](https://nodejs.org/) (v18 or higher) - for compatibility

You'll also need:

- Google Cloud Project with OAuth 2.0 credentials
- AWS Account with S3 bucket configured

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd google-drive-clone
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory (a template is already created):

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/google_drive_clone

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name
```

#### How to Get Credentials:

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret

**AWS S3:**
1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Create an S3 bucket
3. Create IAM user with S3 permissions
4. Generate access keys for the IAM user

**NextAuth Secret:**
```bash
openssl rand -base64 32
```

### 4. Database Setup

Create a PostgreSQL database:

```bash
createdb google_drive_clone
```

### 5. Run Database Migrations

```bash
# Generate migration files
bun run db:generate

# Apply migrations
bun run db:migrate

# Or push schema directly (for development)
bun run db:push
```

### 6. Start Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint
- `bun run db:generate` - Generate database migrations
- `bun run db:migrate` - Run database migrations
- `bun run db:push` - Push schema changes to database
- `bun run db:studio` - Open Drizzle Studio (database GUI)

## Project Structure

```
google-drive-clone/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication routes
│   │   └── files/        # File management routes
│   ├── dashboard/        # Dashboard pages
│   └── page.tsx          # Landing page
├── db/                    # Database configuration
│   ├── schema.ts         # Database schema
│   └── index.ts          # Database connection
├── lib/                   # Utility functions
│   ├── auth.ts           # NextAuth configuration
│   ├── s3.ts             # AWS S3 utilities
│   ├── permissions.ts    # Permission checking
│   ├── validators.ts     # Zod schemas
│   └── format.ts         # Formatting utilities
├── components/            # React components
├── drizzle/              # Database migrations
├── public/               # Static files
└── middleware.ts         # Next.js middleware
```

## Database Schema

### Users Table
- User authentication and profile information
- Linked to Google OAuth

### Files Table
- File metadata (name, size, type)
- S3 storage references
- Owner relationship

### File Shares Table
- File sharing relationships
- Permission levels (read, edit, delete)
- Shared by/with user tracking

## API Routes

### Authentication
- `POST /api/auth/signin` - Sign in with Google
- `POST /api/auth/signout` - Sign out

### File Management
- `POST /api/files` - Upload file
- `GET /api/files` - List user's files
- `GET /api/files?q=query` - Search files
- `PATCH /api/files/[fileId]` - Rename file
- `DELETE /api/files/[fileId]` - Delete file

### File Sharing
- `POST /api/files/[fileId]/share` - Share file
- `GET /api/files/[fileId]/share` - List shares
- `PATCH /api/files/[fileId]/share/[shareId]` - Update permission
- `DELETE /api/files/[fileId]/share/[shareId]` - Revoke access

## Development Workflow

1. **Planning Phase**: Review implementation plan
2. **Database Setup**: Create schema and run migrations
3. **Authentication**: Implement Google OAuth
4. **File Management**: Build upload, delete, rename features
5. **File Sharing**: Implement sharing with permissions
6. **Frontend**: Create UI components
7. **Testing**: Test all features

## Next Steps

After initial setup, you need to:

1. ✅ Commit the project structure
2. 📝 Implement database schema (`db/schema.ts`)
3. 🔐 Configure authentication (`lib/auth.ts`)
4. ☁️ Set up S3 utilities (`lib/s3.ts`)
5. 🛣️ Create API routes (`app/api/`)
6. 🎨 Build frontend components
7. 🧪 Test the application

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
