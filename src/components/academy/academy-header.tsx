"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, GraduationCap, Calendar, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleToggle } from "@/components/locale-toggle";
import { useTranslations } from "@/components/providers/locale-provider";
import { logout } from "@/lib/api/auth";

const navLinks = [
  { href: "/academy", labelKey: "title" as const, icon: BookOpen },
  { href: "/academy/my-courses", labelKey: "myCourses" as const, icon: GraduationCap },
  { href: "/academy/bookings", labelKey: "myBookings" as const, icon: Calendar },
];

export function AcademyHeader() {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/academy" className="flex items-center gap-2 font-bold text-xl">
            <GraduationCap className="h-6 w-6" />
            <span>{t.academy.title}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <ButtonLink
                  key={link.href}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  href={link.href}
                >
                  <Icon className="h-4 w-4 ml-2" />
                  {t.academy[link.labelKey]}
                </ButtonLink>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <LocaleToggle />
          <ThemeToggle />
          <ButtonLink variant="ghost" size="icon" href="/academy/profile">
            <User className="h-5 w-5" />
          </ButtonLink>
          <Button variant="ghost" size="icon" onClick={() => logout()}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
