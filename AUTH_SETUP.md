# Authentication System Setup

This document describes the authentication system implementation for the Finance Tracker application.

## Overview

The authentication system uses NextAuth.js v4 with credentials-based authentication, bcrypt for password hashing, and JWT for session management.

## Features Implemented

- ✅ User registration with email uniqueness check
- ✅ Secure password hashing with bcrypt
- ✅ Login with email and password
- ✅ Session management with JWT
- ✅ Protected routes middleware
- ✅ Form validation with Zod and React Hook Form
- ✅ Auto-login after registration
- ✅ Logout functionality

## File Structure

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx          # Login page with form
│   ├── register/
│   │   └── page.tsx          # Registration page with form
│   └── layout.tsx            # Auth layout
├── api/
│   └── auth/
│       ├── [...nextauth]/
│       │   └── route.ts      # NextAuth API handler
│       └── register/
│           └── route.ts      # Registration API endpoint
├── dashboard/
│   └── page.tsx              # Protected dashboard page
└── page.tsx                  # Home page with auth redirect

lib/
├── auth.ts                   # NextAuth configuration
├── session.ts                # Session utilities
├── validations/
│   └── auth.ts              # Zod validation schemas
└── utils/
    └── auth-helpers.ts      # Auth utility functions

components/
├── auth/
│   └── LogoutButton.tsx     # Client-side logout button
└── providers/
    └── SessionProvider.tsx  # NextAuth session provider

middleware.ts                 # Protected routes middleware
types/
└── next-auth.d.ts           # NextAuth TypeScript definitions
```

## Environment Variables

Add these to your `.env` file:

```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

To generate a secure secret, run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Protected Routes

The following routes are protected by the middleware and require authentication:

- `/dashboard/*`
- `/portfolio/*`
- `/budgets/*`
- `/transactions/*`
- `/goals/*`
- `/statistics/*`
- `/forecast/*`
- `/journal/*`
- `/settings/*`

## API Endpoints

### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "..."
  }
}
```

**Error Response (400):**
```json
{
  "error": "User with this email already exists"
}
```

### POST /api/auth/signin
Login (handled by NextAuth).

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### POST /api/auth/signout
Logout (handled by NextAuth).

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## Usage Examples

### Server-Side Authentication Check

```typescript
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }
  
  return <div>Welcome {user.name}</div>;
}
```

### Client-Side Authentication Check

```typescript
"use client";

import { useSession } from "next-auth/react";

export default function ClientComponent() {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  
  if (!session) {
    return <div>Not authenticated</div>;
  }
  
  return <div>Welcome {session.user.name}</div>;
}
```

### Logout

```typescript
"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/login" })}>
      Sign Out
    </button>
  );
}
```

## Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt with a salt round of 10
2. **JWT Sessions**: Sessions are stored as JWT tokens, not in the database
3. **CSRF Protection**: NextAuth includes built-in CSRF protection
4. **Secure Cookies**: Session cookies are httpOnly and secure in production
5. **Input Validation**: All inputs are validated using Zod schemas
6. **Email Uniqueness**: Registration checks for existing emails before creating users

## Testing the Authentication

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`

3. Click "Create Account" and register a new user

4. You'll be automatically logged in and redirected to the dashboard

5. Test logout by clicking the "Sign Out" button

6. Try logging in again with your credentials

## Troubleshooting

### "Invalid credentials" error
- Check that the email and password are correct
- Ensure the user exists in the database
- Verify the password was hashed correctly during registration

### Session not persisting
- Check that NEXTAUTH_SECRET is set in .env
- Verify NEXTAUTH_URL matches your application URL
- Clear browser cookies and try again

### Protected routes not working
- Ensure middleware.ts is in the root directory
- Check that the route pattern matches in middleware config
- Verify the session is being created correctly

## Next Steps

- Add password reset functionality
- Implement email verification
- Add OAuth providers (Google, GitHub, etc.)
- Add two-factor authentication
- Implement rate limiting on auth endpoints
