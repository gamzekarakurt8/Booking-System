import { AuthForm } from "../../components/auth/auth-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-10 px-4 py-12 md:grid md:grid-cols-[1.2fr_1fr] md:items-center">
      <section className="animate-fade-up text-ink">
        <p className="mb-3 text-xs uppercase tracking-[0.24em] text-ink/60">Qpioneers Test</p>
        <h1 className="font-serif text-5xl leading-[1.05] md:text-7xl">Find the right session, then book in seconds.</h1>
        <p className="mt-4 max-w-xl text-base text-ink/75 md:text-lg">
          Access your profile, view real-time availability, and secure your preferred slot without double-booking risks.
        </p>
      </section>

      <div className="animate-fade-up [animation-delay:120ms]">
        <AuthForm />
      </div>
    </main>
  );
}
