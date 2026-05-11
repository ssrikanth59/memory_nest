import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";

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
          throw new Error("Invalid credentials");
        }

        await connectToDB();

        const user = await User.findOne({ email: credentials.email });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
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
        
        // Prevent huge base64 strings from crashing the JWT cookie (4KB limit)
        // NextAuth automatically maps user.image to token.picture, so we must clear both!
        const userImage = (user as any).image;
        if (userImage && userImage.startsWith('data:image')) {
          token.image = null;
          token.picture = null;
        } else {
          token.image = userImage;
          token.picture = userImage;
        }
        
        token.phone = (user as any).phone;
        token.language = (user as any).language;
      }
      // Handle session update
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

        // Ensure we always have the freshest data from DB (especially base64 images that we strip from JWT)
        try {
          await connectToDB();
          const dbUser = await User.findById(token.id);
          if (dbUser) {
            session.user.name = dbUser.name;
            session.user.email = dbUser.email;
            if (dbUser.image) {
               session.user.image = dbUser.image;
            }
            (session.user as any).phone = dbUser.phone;
            (session.user as any).language = dbUser.language;
            (session.user as any).baby = dbUser.baby || null;
            (session.user as any).settings = dbUser.settings || {};
          }
        } catch (err) {
          console.error("Error fetching user session data:", err);
        }
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "your-very-secure-random-secret-key-memory-nest-1234",
};
