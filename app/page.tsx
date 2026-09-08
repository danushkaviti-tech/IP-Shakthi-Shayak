import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as { role?: string; email?: string };
  const isAdmin =
    user.role === "admin" ||
    user.email?.toLowerCase() === "admin@ipsakti.gov.in" ||
    user.email?.toLowerCase().startsWith("admin@");

  if (isAdmin) {
    redirect("/admin/analytics");
  } else {
    redirect("/dashboard");
  }
}