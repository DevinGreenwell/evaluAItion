import { getServerSession } from "next-auth/next"; // <-- Remove NextAuthOptions from here
import { DefaultSession, Session, User, type NextAuthOptions } from "next-auth"; // <-- Add NextAuthOptions here
import { JWT } from "next-auth/jwt";
// Import your providers etc. here now
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID || "",
      clientSecret: process.env.APPLE_SECRET || "",
    }),
    // Using Credentials provider instead of Email provider to avoid adapter requirement
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // For demo purposes, allow any login
        if (credentials?.email) {
          return {
            id: "1",
            name: "Demo User",
            email: credentials.email,
          };
        }
        return null;
      }
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  callbacks: {
    // Add types: { session: Session; token: JWT } and return type: Promise<Session>
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      if (token && session.user && token.sub) { // Added check for token.sub
        // Assign the token's subject (usually user ID) to the session user's ID
        session.user.id = token.sub;
      }
      return session;
    },
    // Add types: { token: JWT; user?: User } and return type: Promise<JWT>
    async jwt({ token, user }: { token: JWT; user?: User }): Promise<JWT> {
      // user is optional because it's only passed during sign-in/account creation
      if (user) {
        // If user object exists, add its ID to the JWT token
        token.id = user.id;
      }
      return token; // Always return the token
    }
  }, // <-- Make sure this comma is here before the 'session:' strategy line below it
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret-do-not-use-in-production",
};

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  
  if (!session?.user?.email) {
    return null;
  }
  
  return session.user;
}
