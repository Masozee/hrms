import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      department: string;
      permissions: string;
    }
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    permissions: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    department: string;
    permissions: string;
  }
}