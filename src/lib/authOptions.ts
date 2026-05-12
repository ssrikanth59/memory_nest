import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import mongoose from "mongoose";
import { cookies } from "next/headers";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        try {
          await connectToDB();
          
          // Case 1: Database is connected
          if (mongoose.connection.readyState === 1) {
            const user = await User.findOne({ email: credentials.email });
            if (user && user.password) {
              const isCorrectPassword = await bcrypt.compare(credentials.password, user.password);
              if (isCorrectPassword) {
                return { 
                  id: user._id.toString(), 
                  email: user.email, 
                  name: user.name,
                  vaultPin: user.vaultPin
                };
              }
            }
          }

          // Case 2: Database failure or User not found in DB
          // Check the Persistent Cookie (to make it work instantly on Vercel)
          // Note: cookies() is async in Next.js 15+
          const cookieStore = await cookies();
          const mockUserCookie = cookieStore.get('MOCK_USER_DATA');
          
          if (mockUserCookie) {
            const userData = JSON.parse(Buffer.from(mockUserCookie.value, 'base64').toString());
            
            if (userData.email === credentials.email) {
              const isCorrectPassword = await bcrypt.compare(credentials.password, userData.hashedPassword);
              if (isCorrectPassword) {
                return {
                  id: 'mock-' + Date.now(),
                  email: userData.email,
                  name: userData.name,
                  vaultPin: userData.vaultPin
                };
              }
            }
          }

          throw new Error("Invalid email or password");
        } catch (error: any) {
          console.error("Auth Error:", error.message);
          throw new Error(error.message || "Authentication failed");
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = (user as any).id;
        token.vaultPin = (user as any).vaultPin;
      }
      if (trigger === "update" && session) {
        return { ...token, ...session.user };
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = token.id;
        (session.user as any).vaultPin = token.vaultPin;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key",
};
