"use client";

import { Bell, Lightbulb, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, readSession, type ClientUser } from "../lib/auth";
import { BookingWidget } from "./booking/booking-widget";
import { Button } from "./ui/button";

type SessionState = {
  token: string;
  user: ClientUser;
};

export function ProfileShell() {
  const router = useRouter();
  const [session, setSession] = useState<SessionState | null>(null);

  useEffect(() => {
    const storedSession = readSession();
    if (!storedSession) {
      router.push("/login");
      return;
    }

    setSession(storedSession);
  }, [router]);

  if (!session) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
        <p className="rounded-xl bg-white/70 px-4 py-3 text-sm text-ink shadow-card">Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 md:py-12">
      <section className="mb-6 flex items-center justify-between rounded-3xl border border-white/30 bg-white/70 p-4 shadow-card backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <button
              aria-label="Ideas"
              className="rounded-full border border-ink/15 bg-white p-2 text-ink/80 transition hover:bg-ink/5"
              type="button"
            >
              <Lightbulb className="size-4" />
            </button>
            <button
              aria-label="Messages"
              className="rounded-full border border-ink/15 bg-white p-2 text-ink/80 transition hover:bg-ink/5"
              type="button"
            >
              <MessageCircle className="size-4" />
            </button>
            <button
              aria-label="Notifications"
              className="rounded-full border border-ink/15 bg-white p-2 text-ink/80 transition hover:bg-ink/5"
              type="button"
            >
              <Bell className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-serif text-3xl text-ink">Consultant</p>
            <p className="text-xs text-ink/60">{session.user.email}</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              clearSession();
              router.push("/login");
              router.refresh();
            }}
            type="button"
          >
            Log out
          </Button>
        </div>
      </section>

      <BookingWidget token={session.token} />
    </main>
  );
}
