import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";

const roleHome: Record<string, string> = {
  ADMIN: "/admin",
  TEAM_LEADER: "/team-leader",
  SALES_EMPLOYEE: "/sales",
};

export default async function Home() {
  const user = await getCurrentUser();
  redirect(user ? roleHome[user.role] : "/login");
}
