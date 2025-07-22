import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { staff } from '../schema/staff';
import { eq } from 'drizzle-orm';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const user = await db
            .select()
            .from(staff)
            .where(eq(staff.username, credentials.username))
            .limit(1);

          if (user.length === 0) {
            return null;
          }

          const staffMember = user[0];

          if (!staffMember.isActive) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            staffMember.passwordHash
          );

          if (!isPasswordValid) {
            return null;
          }

          await db
            .update(staff)
            .set({ lastLogin: new Date().toISOString() })
            .where(eq(staff.id, staffMember.id));

          return {
            id: staffMember.id.toString(),
            name: `${staffMember.firstName} ${staffMember.lastName}`,
            email: staffMember.email,
            role: staffMember.role,
            department: staffMember.department || '',
            permissions: staffMember.permissions || ''
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.department = user.department;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.department = token.department as string;
        session.user.permissions = token.permissions as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  secret: process.env.NEXTAUTH_SECRET || 'development-secret-key'
};