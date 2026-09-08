import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const emailClean = String(credentials.email).toLowerCase().trim();
        const client = await clientPromise;
        const db = client.db("ip-sakti");
        const users = db.collection("users");

        const user = await users.findOne({
          email: emailClean,
        });

        if (!user) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          String(credentials.password),
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        // Determine role (force admin for admin@ipsakti.gov.in)
        const isDefaultAdmin = emailClean === "admin@ipsakti.gov.in" || emailClean.startsWith("admin@");
        const userRole = isDefaultAdmin ? "admin" : (user.role || "user");

        // Update database role if needed
        if (isDefaultAdmin && user.role !== "admin") {
          await users.updateOne({ email: emailClean }, { $set: { role: "admin" } });
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: userRole,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      const jwtToken = token as typeof token & { id?: string; role?: string };
      const authUser = user as typeof user & { id?: string; role?: string };

      if (user) {
        jwtToken.id = authUser.id;
        jwtToken.role = authUser.role ?? "user";
      }

      return jwtToken;
    },

    async session({ session, token }) {
      const jwtToken = token as typeof token & { id?: string; role?: string };
      const sessionUser = session.user as typeof session.user & {
        id?: string;
        role?: string;
      };

      if (sessionUser) {
        sessionUser.id = jwtToken.id as string;
        sessionUser.role = (jwtToken.role as string) ?? "user";
      }

      return session;
    },
  },
});
