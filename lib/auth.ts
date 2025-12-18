import NextAuth, { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const authConfig: NextAuthConfig = {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === 'google' && profile?.email) {
                try {
                    const existingUser = await db.query.users.findFirst({
                        where: eq(users.email, profile.email),
                    });

                    if (!existingUser) {
                        await db.insert(users).values({
                            email: profile.email,
                            name: profile.name || '',
                            googleId: profile.sub || '',
                            profilePicture: (profile as any).picture || null,
                        });
                    } else {
                        await db
                            .update(users)
                            .set({
                                name: profile.name || existingUser.name,
                                profilePicture: (profile as any).picture || existingUser.profilePicture,
                                updatedAt: new Date(),
                            })
                            .where(eq(users.id, existingUser.id));
                    }

                    return true;
                } catch (error) {
                    console.error('Error in signIn callback:', error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, account, profile }) {
            if (account?.provider === 'google' && profile?.email) {
                // Store user info in JWT token
                token.email = profile.email;
                token.name = profile.name;
                token.picture = (profile as any).picture;
            }
            return token;
        },
        async session({ session, token }) {
            // Get user info from JWT token (no database call)
            if (token) {
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.image = token.picture as string;
                session.user.id = token.sub as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/',
    },
    session: {
        strategy: 'jwt',
    },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
