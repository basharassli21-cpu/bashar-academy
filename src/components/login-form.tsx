"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/components/providers/locale-provider";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

const roleHome: Record<string, string> = {
  ADMIN: "/admin",
  TEAM_LEADER: "/team-leader",
  SALES_EMPLOYEE: "/sales",
};

export function LoginForm() {
  const t = useTranslations();
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [needsTwoFactor, setNeedsTwoFactor] = React.useState(false);
  const [twoFactorCode, setTwoFactorCode] = React.useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(res.status === 429 ? t.auth.tooManyAttempts : t.auth.invalidCredentials);
        return;
      }
      if (data.requires2fa) {
        setNeedsTwoFactor(true);
        return;
      }
      router.push(roleHome[data.role] ?? "/login");
      router.refresh();
    } catch {
      setServerError(t.common.error);
    } finally {
      setSubmitting(false);
    }
  }

  async function onSubmitTwoFactor(event: React.FormEvent) {
    event.preventDefault();
    setServerError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: twoFactorCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(res.status === 429 ? t.auth.tooManyAttempts : t.auth.invalidTwoFactorCode);
        return;
      }
      router.push(roleHome[data.role] ?? "/login");
      router.refresh();
    } catch {
      setServerError(t.common.error);
    } finally {
      setSubmitting(false);
    }
  }

  if (needsTwoFactor) {
    return (
      <form onSubmit={onSubmitTwoFactor} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="twoFactorCode">{t.auth.twoFactorCodeLabel}</Label>
          <Input
            id="twoFactorCode"
            autoComplete="one-time-code"
            placeholder={t.auth.twoFactorCodePlaceholder}
            autoFocus
            value={twoFactorCode}
            onChange={(e) => setTwoFactorCode(e.target.value.trim())}
          />
        </div>
        {serverError && <p className="text-sm text-destructive">{serverError}</p>}
        <Button type="submit" disabled={submitting || !twoFactorCode} className="mt-2">
          {t.auth.verifyCode}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setNeedsTwoFactor(false);
            setTwoFactorCode("");
            setServerError(null);
          }}
        >
          {t.auth.backToLogin}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="username">{t.auth.username}</Label>
        <Input id="username" autoComplete="username" autoFocus {...register("username")} />
        {errors.username && (
          <p className="text-sm text-destructive">{t.common.required}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">{t.auth.password}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{t.common.required}</p>
        )}
      </div>
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
      <Button type="submit" disabled={submitting} className="mt-2">
        {t.auth.login}
      </Button>
    </form>
  );
}
