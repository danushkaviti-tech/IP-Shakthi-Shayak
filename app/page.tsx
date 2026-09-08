import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as { role?: string; email?: string };
  const isAdmin =
    user.role === "admin" &&
    (user.email?.toLowerCase().includes("danush") || user.email?.toLowerCase() === "danush@ipsakti.gov.in");

  if (isAdmin) {
    redirect("/admin/analytics");
  } else {
    redirect("/dashboard");
  }
}