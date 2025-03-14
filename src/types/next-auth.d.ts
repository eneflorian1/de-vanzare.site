import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    name: string
    role: string
    firstName?: string
    lastName?: string
    phone?: string
    city?: string
    address?: string
    notifyEmail?: boolean
    notifyPhone?: boolean
    createdAt?: string
    image?: string
  }

  interface Session {
    user: User
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
  }
}