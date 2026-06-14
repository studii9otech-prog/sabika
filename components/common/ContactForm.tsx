"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Send, CheckCircle2, AlertTriangle, Mail, User, BookOpen } from "lucide-react";

export default function ContactForm() {
  const t = useTranslations("contactPage");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        setStatus("error");
        setErrorMsg(data.error || t("errorMessage"));
      }
    } catch (err) {
      console.error("Submission error:", err);
      setStatus("error");
      setErrorMsg(t("errorMessage"));
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="relative rounded-2xl border border-border/60 bg-card p-6 sm:p-8 hover:border-primary/30 transition-all duration-300 shadow-xl overflow-hidden">
        {/* Subtle radial golden glow inside form */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-primary/5 rounded-full filter blur-[80px] pointer-events-none z-0" />
        <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-primary/3 rounded-full filter blur-[60px] pointer-events-none z-0" />

        <div className="relative z-10 space-y-6">
          {/* Form Status Notifications */}
          {status === "success" && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm animate-in fade-in duration-300 text-start">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold">{t("successMessage")}</p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-600 dark:text-rose-400 text-xs sm:text-sm animate-in fade-in duration-300 text-start">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold">{errorMsg || t("errorMessage")}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Name field */}
              <div className="space-y-1.5 text-start">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  {t("nameLabel")} <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className="absolute start-3.5 w-4 h-4 text-muted-foreground/60" />
                  <input
                    type="text"
                    required
                    value={name}
                    disabled={status === "sending"}
                    placeholder={t("placeholderName")}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-11 ps-10 pe-4 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/50 focus:bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email field */}
              <div className="space-y-1.5 text-start">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  {t("emailLabel")} <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute start-3.5 w-4 h-4 text-muted-foreground/60" />
                  <input
                    type="email"
                    required
                    value={email}
                    disabled={status === "sending"}
                    placeholder={t("placeholderEmail")}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 ps-10 pe-4 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/50 focus:bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>

            </div>

            {/* Subject field */}
            <div className="space-y-1.5 text-start">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                {t("subjectLabel")}
              </label>
              <div className="relative flex items-center">
                <BookOpen className="absolute start-3.5 w-4 h-4 text-muted-foreground/60" />
                <input
                  type="text"
                  value={subject}
                  disabled={status === "sending"}
                  placeholder={t("placeholderSubject")}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full h-11 ps-10 pe-4 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/50 focus:bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>

            {/* Message field */}
            <div className="space-y-1.5 text-start">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                {t("messageLabel")} <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={message}
                disabled={status === "sending"}
                placeholder={t("placeholderMessage")}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-4 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/50 focus:bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
              />
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all select-none cursor-pointer active:scale-[0.98]"
              >
                {status === "sending" ? (
                  <>
                    <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    <span>{t("sending")}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t("sendButton")}</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}

