import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/prisma/client";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
      Credentials({
        credentials: {
          email: { label: "Email", type: "email", placeholder: "Email" },
          password: {
            label: "Password",
            type: "password",
            placeholder: "Password",
          },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials.password) return null;
  
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
  
          if (!user) return null;
  
          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.hashedPassword!
          );
  
          return passwordMatch ? user : null;
        },
      }),
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    ],
    session: {
      strategy: "jwt",
    },
  };

  export default authOptions;
  