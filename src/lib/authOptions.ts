import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import mongoose from "mongoose";

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
          
          // If the database is not connected, we transition to Sanctuary Mode
          if (mongoose.connection.readyState !== 1) {
            console.warn("=> Database disconnected. Entering Sanctuary Mode.");
            throw new Error("Database connection failed");
          }

          const user = await User.findOne({ email: credentials.email });

          if (!user || !user.password) {
            throw new Error("Invalid email or password");
          }

          const isCorrectPassword = await bcrypt.compare(credentials.password, user.password);

          if (!isCorrectPassword) {
            throw new Error("Invalid email or password");
          }

          return { 
            id: user._id.toString(), 
            email: user.email, 
            name: user.name,
            vaultPin: user.vaultPin,
            image: user.image,
            phone: user.phone,
            language: user.language
          };
        } catch (error: any) {
          // If it's a DB error, we catch it and throw a specific message
          if (error.message.includes('buffering') || error.message.includes('connection') || error.message.includes('authentication failed')) {
            throw new Error("Database connection failed");
          }
          throw error;
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
        token.image = (user as any).image;
        token.phone = (user as any).phone;
        token.language = (user as any).language;
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
        (session.user as any).phone = token.phone;
        (session.user as any).language = token.language;
        session.user.image = token.image as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key",
};
