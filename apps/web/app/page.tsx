import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("booking_token")?.value;
  redirect(token ? "/profile" : "/login");
}
