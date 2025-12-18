# Project Structure

This document outlines the complete folder structure for the Google Drive Clone project.

## Directory Tree

```
google-drive-clone/
├── app/                          # Next.js App Directory
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts      # NextAuth API handler
│   │   └── files/
│   │       ├── route.ts          # Upload & list files
│   │       └── [fileId]/
│   │           ├── route.ts      # Delete & rename file
│   │           └── share/
│   │               ├── route.ts  # Create & list shares
│   │               └── [shareId]/
│   │                   └── route.ts  # Update & revoke share
│   ├── dashboard/
│   │   └── page.tsx              # Dashboard page
│   ├── layout.tsx                # Root layout (auto-generated)
│   ├── page.tsx                  # Landing page (auto-generated)
│   └── globals.css               # Global styles (auto-generated)
│
├── components/                   # React Components
│   ├── FileUpload.tsx           # File upload component
│   ├── FileList.tsx             # File list display
│   ├── FileCard.tsx             # Individual file card
│   ├── ShareModal.tsx           # File sharing modal
│   ├── RenameModal.tsx          # File rename modal
│   └── SearchBar.tsx            # Search functionality
│
├── db/                          # Database Configuration
│   ├── schema.ts                # Drizzle ORM schema
│   └── index.ts                 # Database connection
│
├── lib/                         # Utility Functions
│   ├── auth.ts                  # NextAuth configuration
│   ├── s3.ts                    # AWS S3 utilities
│   ├── validators.ts            # Zod validation schemas
│   ├── permissions.ts           # Permission checking
│   └── format.ts                # Formatting utilities
│
├── drizzle/                     # Database Migrations
│   └── (migration files)        # Auto-generated
│
├── public/                      # Static Assets
│   └── (images, icons, etc.)
│
├── .env.local                   # Environment variables (gitignored)
├── .gitignore                   # Git ignore rules
├── drizzle.config.ts           # Drizzle configuration
├── middleware.ts               # Next.js middleware
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── postcss.config.mjs          # PostCSS configuration
├── eslint.config.mjs           # ESLint configuration
└── README.md                   # Project documentation
```

## File Purposes

### Configuration Files
- **drizzle.config.ts**: Database migration configuration
- **middleware.ts**: Authentication and route protection
- **next.config.ts**: Next.js build and runtime configuration
- **tsconfig.json**: TypeScript compiler options
- **tailwind.config.ts**: Tailwind CSS customization

### Database Layer (`db/`)
- **schema.ts**: Database tables (users, files, file_shares)
- **index.ts**: Database connection using Drizzle ORM

### Utilities (`lib/`)
- **auth.ts**: NextAuth.js setup with Google OAuth
- **s3.ts**: AWS S3 file upload/download/delete functions
- **validators.ts**: Input validation with Zod
- **permissions.ts**: Check user permissions (read/edit/delete)
- **format.ts**: Format file sizes and dates

### API Routes (`app/api/`)
- **auth/[...nextauth]/route.ts**: Authentication endpoints
- **files/route.ts**: POST (upload), GET (list/search)
- **files/[fileId]/route.ts**: DELETE, PATCH (rename)
- **files/[fileId]/share/route.ts**: POST (share), GET (list shares)
- **files/[fileId]/share/[shareId]/route.ts**: PATCH (update), DELETE (revoke)

### Components (`components/`)
- **FileUpload.tsx**: Drag-and-drop file upload
- **FileList.tsx**: Display files in grid/list view
- **FileCard.tsx**: Individual file item
- **ShareModal.tsx**: Share file with permissions
- **RenameModal.tsx**: Rename file dialog
- **SearchBar.tsx**: Search files by name

### Pages (`app/`)
- **page.tsx**: Landing page with sign-in
- **dashboard/page.tsx**: Main dashboard with files
- **layout.tsx**: Root layout wrapper

## Next Steps

1. ✅ Project structure created
2. 📝 Fill in code for each file (refer to implementation_plan.md)
3. 🗄️ Set up PostgreSQL database
4. 🔑 Configure environment variables
5. 🚀 Run migrations and start development

## Notes

- All files currently contain placeholder comments
- Actual implementation should follow the detailed plan in `implementation_plan.md`
- Environment variables must be configured before running the app
- Database must be created before running migrations
