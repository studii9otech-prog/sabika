"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export default function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    const newLocale = locale === "ar" ? "en" : "ar";
    // استبدل اللوكيل في المسار
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="font-semibold text-xs px-3 py-1.5 h-auto rounded-xl hover:bg-muted transition-all cursor-pointer flex items-center gap-1.5"
    >
      <Globe className="w-4 h-4 text-muted-foreground" />
      <span>{locale === "ar" ? "EN" : "العربية"}</span>
    </Button>
  );
}
