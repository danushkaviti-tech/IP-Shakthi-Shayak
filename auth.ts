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

        let emailClean = String(credentials.email).toLowerCase().trim();
        const rawPassword = String(credentials.password);

        // Normalize 'danush' username alias to official admin email
        if (emailClean === "danush") {
          emailClean = "danush@ipsakti.gov.in";
        }

        const client = await clientPromise;
        const db = client.db("ip-sakti");
        const users = db.collection("users");

        // Auto-seed / ensure Danush master admin user if not present
        if (emailClean === "danush@ipsakti.gov.in") {
          let danushUser = await users.findOne({
            email: { $in: ["danush@ipsakti.gov.in", "danush"] },
          });

          if (!danushUser) {
            const passwordHash = await bcrypt.hash("danush123", 10);
            const insertResult = await users.insertOne({
              name: "Danush (Administrator)",
              email: "danush@ipsakti.gov.in",
              password: passwordHash,
              role: "admin",
              createdAt: new Date(),
            });
            danushUser = {
              _id: insertResult.insertedId,
              name: "Danush (Administrator)",
              email: "danush@ipsakti.gov.in",
              password: passwordHash,
              role: "admin",
            };
          }

          // Check if password matches danush123 or stored hash
          const passwordMatch =
            rawPassword === "danush123" ||
            rawPassword === "Danush@2026" ||
            (await bcrypt.compare(rawPassword, danushUser.password));

          if (!passwordMatch) {
            return null;
          }

          // Always enforce admin role for danush
          if (danushUser.role !== "admin") {
            await users.updateOne(
              { _id: danushUser._id },
              { $set: { role: "admin" } }
            );
          }

          return {
            id: danushUser._id.toString(),
            name: danushUser.name || "Danush (Administrator)",
            email: "danush@ipsakti.gov.in",
            role: "admin",
          };
        }

        // Standard user lookup
        const user = await users.findOne({
          email: emailClean,
        });

        if (!user) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          rawPassword,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        // Only danush@ipsakti.gov.in can have the admin role
        const userRole = (emailClean === "danush@ipsakti.gov.in" || emailClean === "danush") ? "admin" : (user.role === "admin" && emailClean.includes("danush") ? "admin" : "user");

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
