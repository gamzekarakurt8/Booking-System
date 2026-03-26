"use client";

import { authCredentialsSchema, authResponseSchema, registerSchema } from "@booking/shared";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { persistSession } from "../../lib/auth";
import { apiRequest } from "../../lib/api-client";
import { showToast } from "../../lib/toast";
import { Button } from "../ui/button";

type Mode = "login" | "register";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
  }>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    try {
      setIsLoading(true);

      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload = mode === "login" ? { email, password } : { email, password, fullName };
      const validationResult =
        mode === "login" ? authCredentialsSchema.safeParse(payload) : registerSchema.safeParse(payload);

      if (!validationResult.success) {
        const errors = validationResult.error.flatten().fieldErrors as Record<string, string[] | undefined>;
        setFieldErrors({
          fullName: errors.fullName?.[0],
          email: errors.email?.[0],
          password: errors.password?.[0],
        });
        return;
      }

      const response = await apiRequest<typeof payload, ReturnType<typeof authResponseSchema.parse>>(endpoint, {
        method: "POST",
        body: payload,
        schema: authResponseSchema,
      });

      persistSession(response.token, response.user);
      router.push("/profile");
      router.refresh();
    } catch (submitError) {
      if (
        typeof submitError === "object" &&
        submitError !== null &&
        "issues" in submitError &&
        Array.isArray((submitError as { issues?: unknown }).issues)
      ) {
        showToast({
          message: "Unexpected response format from server.",
          variant: "error",
        });
      } else {
        showToast({
          message: submitError instanceof Error ? submitError.message : "Authentication failed",
          variant: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="w-full max-w-md rounded-3xl border border-white/35 bg-white/70 p-6 shadow-card backdrop-blur-md">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-4xl text-ink">Book Session</h1>
        <button
          className="text-sm font-semibold text-ink underline-offset-4 hover:underline"
          onClick={() => setMode((current) => (current === "login" ? "register" : "login"))}
          type="button"
        >
          {mode === "login" ? "Create account" : "Have an account?"}
        </button>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {mode === "register" ? (
          <label className="flex flex-col gap-1 text-sm text-ink/80">
            Full Name
            <input
              className={`rounded-xl border bg-white px-3 py-2 outline-none focus:border-ink ${
                fieldErrors.fullName ? "border-ember" : "border-ink/20"
              }`}
              placeholder="Jane Doe"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
            {fieldErrors.fullName ? <span className="text-xs text-ember">{fieldErrors.fullName}</span> : null}
          </label>
        ) : null}

        <label className="flex flex-col gap-1 text-sm text-ink/80">
          Email
          <input
            className={`rounded-xl border bg-white px-3 py-2 outline-none focus:border-ink ${
              fieldErrors.email ? "border-ember" : "border-ink/20"
            }`}
            placeholder="you@example.com"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          {fieldErrors.email ? <span className="text-xs text-ember">{fieldErrors.email}</span> : null}
        </label>

        <label className="flex flex-col gap-1 text-sm text-ink/80">
          Password
          <input
            className={`rounded-xl border bg-white px-3 py-2 outline-none focus:border-ink ${
              fieldErrors.password ? "border-ember" : "border-ink/20"
            }`}
            placeholder="Minimum 8 characters"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {fieldErrors.password ? <span className="text-xs text-ember">{fieldErrors.password}</span> : null}
        </label>

        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>
    </section>
  );
}
