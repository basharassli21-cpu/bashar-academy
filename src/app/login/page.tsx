"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoginForm } from "@/components/login-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleToggle } from "@/components/locale-toggle";
import { useTranslations } from "@/components/providers/locale-provider";

export default function LoginPage() {
  const t = useTranslations();

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex justify-end gap-1 p-4">
        <LocaleToggle />
        <ThemeToggle />
      </div>
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>{t.auth.loginSubtitle}</CardTitle>
            <CardDescription>{t.auth.loginTitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
