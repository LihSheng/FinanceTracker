import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Finance Tracker</h1>
      <p className="mt-4 text-lg text-gray-600">
        Personal Finance & Portfolio Management
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/login"
          className="rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-500"
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="rounded-md border border-gray-300 px-6 py-3 hover:bg-gray-50"
        >
          Create Account
        </Link>
      </div>
    </main>
  );
}
