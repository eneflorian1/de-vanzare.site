import { PrismaAdapter } from '@auth/prisma-adapter';
import { NextAuthOptions } from 'next-auth';
import prisma from './prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 zile
  },
  pages: {
    signIn: '/auth/autentificare',
    error: '/auth/error',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email și parola sunt obligatorii');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            hashedPassword: true,
            firstName: true,
            lastName: true,
            phone: true,
            city: true,
            address: true,
            role: true,
            notifyEmail: true,
            notifyPhone: true,
            createdAt: true
          }
        });

        if (!user) {
          throw new Error('Email sau parolă incorectă');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isPasswordValid) {
          throw new Error('Email sau parolă incorectă');
        }

        return {
          id: user.id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          city: user.city,
          address: user.address,
          notifyEmail: user.notifyEmail,
          notifyPhone: user.notifyPhone,
          role: user.role,
          createdAt: user.createdAt.toISOString()
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.createdAt = user.createdAt;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.phone = token.phone;
        session.user.city = token.city;
        session.user.address = token.address;
        session.user.notifyEmail = token.notifyEmail;
        session.user.notifyPhone = token.notifyPhone;
        session.user.role = token.role;
        session.user.createdAt = token.createdAt;
      }
      return session;
    }
  }
};