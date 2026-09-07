import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Not logged in -> Redirect to login
  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as { role?: string; email?: string };
  const isAdmin =
    user.role === "admin" ||
    user.email?.toLowerCase() === "admin@ipsakti.gov.in" ||
    user.email?.toLowerCase().startsWith("admin@");

  // If not admin -> Redirect to user dashboard
  if (!isAdmin) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
