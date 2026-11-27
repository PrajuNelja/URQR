import { useEffect, useRef, useState } from "react";
import { Sparkles, Eye, EyeOff } from "lucide-react";

import { Button } from "../../../components/Buttons/Button";
import { InputField } from "../../../components/InputField/InputField";
import { Notification } from "../../../components/Notification/Notification";
import { SessionTimeoutModal } from "../../../components/PopupModal/SessionTimeoutModal";

import { LOGIN_COPY, LOGIN_HIGHLIGHTS } from "../Config/Login.config";
import { useManagerLogin } from "../Hooks/useManagerLogin";

const formatToday = () => {
  const now = new Date();
  const weekday = now.toLocaleDateString("en-IN", { weekday: "short" });
  const day = String(now.getDate()).padStart(2, "0");
  const month = now.toLocaleDateString("en-IN", { month: "short" });
  return `${weekday}, ${day} ${month} ${now.getFullYear()}`;
};

const ManagerLogin = () => {
  const { form, feedback, isSubmitting, onSubmit, dismissFeedback } = useManagerLogin();
  const { errors } = form.formState;

  const [showPassword, setShowPassword] = useState(false);
  const [today, setToday] = useState(formatToday());
  const [isTimeoutOpen, setIsTimeoutOpen] = useState(false);

  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const interval = window.setInterval(() => setToday(formatToday()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-bg font-sans transition-colors duration-200">
      <Notification
        isOpen={feedback.isOpen}
        type={feedback.type}
        message={feedback.message}
        onClose={dismissFeedback}
      />

      {/* HEADER */}
      <header className="sticky top-0 z-30 h-[72px] shrink-0 border-b border-border bg-surface">
        <div className="mx-auto flex h-full max-w-[1920px] items-center justify-between gap-4 px-6 sm:px-10 lg:px-16">
          
          {/* LOGO & BRAND */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-dashed border-primary/60 bg-surface-alt/60 text-[11px] font-semibold text-text-secondary">
              Logo
            </div>
            <span className="text-[19px] font-bold leading-[22px] tracking-tight text-text">
              URQR
            </span>
          </div>

          {/* HEADER ACTIONS */}
          <div className="flex items-center gap-2.5">
            <span className="hidden h-9 items-center gap-1.5 rounded-full border border-border bg-success-bg px-3 text-xs font-medium text-success sm:inline-flex">
              <span className="h-2 w-2 rounded-full bg-success" />
              Online
            </span>

            <span className="hidden h-9 items-center rounded-md border border-border bg-surface px-3 text-xs font-medium text-text md:inline-flex">
              {today}
            </span>

            <button
              type="button"
              onClick={() => setIsTimeoutOpen(true)}
              className="urqr-focus inline-flex h-9 items-center justify-center rounded-md border border-border bg-warning-bg px-3 text-xs font-medium text-warning transition-opacity hover:opacity-90"
            >
              Timeout Modal
            </button>

            
            <button
              type="button"
              onClick={() => setIsDark((previous) => !previous)}
              aria-label="Toggle dark sepia theme"
              aria-pressed={isDark}
              className="urqr-focus inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-surface-alt px-3 text-xs font-medium text-text transition-colors hover:bg-border/40"
            >
              {isDark ? "Light" : "Dark"}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT WITH EXACT CURVE */}
      <div className="grand-horizon-curve relative flex-1 overflow-x-hidden overflow-y-auto lg:overflow-hidden bg-bg">
        <div
          className="grand-horizon-brand-bg pointer-events-none absolute left-[-26%] top-[-22%] hidden h-[158%] w-[82%] lg:block"
          style={{
            backgroundColor: "var(--color-brand-panel, #5C3D26)",
            borderRadius: "0 52% 48% 0 / 0 68% 60% 0",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto grid h-full min-h-full w-full max-w-[1920px] grid-cols-1 lg:grid-cols-12">
          
          {/* LEFT SECTION */}
          <section
            className="grand-horizon-brand-col flex flex-col justify-between px-6 pt-8 pb-16 sm:px-10 sm:pt-10 sm:pb-20 lg:col-span-6 lg:bg-transparent lg:pl-[72px] lg:pr-14 lg:pt-12 lg:pb-24 xl:pl-[76px] xl:pr-16 xl:pt-16 xl:pb-28"
            style={{ color: "var(--color-brand-text, #FFFFFF)" }}
          >
            <div className="max-w-lg space-y-4 lg:space-y-4 xl:space-y-6">
              <div
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]"
                style={{ color: "var(--color-brand-muted, #E6D8C8)" }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: "var(--color-brand-muted, #E6D8C8)" }}
                />
                <span>{LOGIN_COPY.brand}</span>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[44px] lg:leading-[54px] xl:text-[56px] xl:leading-[68px]">
                {LOGIN_COPY.headline}
              </h1>
              <p
                className="text-base font-normal leading-relaxed text-white/90 sm:text-lg lg:text-[18px] lg:leading-[28px] xl:text-[22px] xl:leading-[34px]"
                style={{ color: "var(--color-brand-muted, #E6D8C8)" }}
              >
                {LOGIN_COPY.description}
              </p>
            </div>

            {/* THREE INFORMATIONAL METRIC PILLS */}
            <div
              className="mt-10 flex flex-col items-start gap-4 sm:gap-4.5 lg:gap-5"
              aria-label="Operational highlights"
            >
              {LOGIN_HIGHLIGHTS.map((highlight) => (
                <div
                  key={highlight}
                  className="inline-flex h-[52px] items-center gap-3.5 rounded-full border border-white/20 px-6 text-[15px] sm:text-[16px] font-semibold leading-[24px] shadow-sm backdrop-blur-sm transition-transform hover:translate-x-1"
                  style={{
                    backgroundColor: "var(--color-brand-pill, rgba(139, 94, 60, 0.55))",
                    color: "var(--color-brand-text, #FFFFFF)",
                  }}
                >
                  <Sparkles size={18} className="text-white shrink-0" aria-hidden="true" />
                  <span className="text-white whitespace-nowrap">{highlight}</span>
                </div>
              ))}
            </div>
          </section>

          {/* RIGHT SECTION (FORM) */}
          <section
            className="flex items-center justify-center px-6 py-8 sm:px-8 lg:col-span-6 lg:py-4 xl:py-8"
          >
            <div className="w-full max-w-[360px]">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[12px] bg-primary text-xl text-on-primary lg:h-[56px] lg:w-[56px] lg:text-2xl" aria-hidden="true">
                  ✦
                </div>
                <h2 className="mt-3 whitespace-pre-line text-[24px] font-semibold leading-[32px] tracking-tight text-text lg:mt-4 lg:text-[28px] lg:leading-[36px]">
                  {LOGIN_COPY.welcome}
                </h2>
                <p className="mt-2 text-[13px] font-normal leading-[20px] text-text-secondary lg:mt-3 lg:text-[14px] lg:leading-[22px]">
                  {LOGIN_COPY.instructions}
                </p>
              </div>

              <form
                ref={formRef}
                onSubmit={onSubmit}
                noValidate
                aria-busy={isSubmitting}
                className="mt-[28px] space-y-[20px] lg:mt-[28px] xl:mt-[40px] xl:space-y-[24px]"
              >
                {/* MANAGER ID */}
                <InputField
                  label={LOGIN_COPY.usernameLabel}
                  type="text"
                  autoComplete="username"
                  placeholder={LOGIN_COPY.usernamePlaceholder}
                  fieldSize="lg"
                  error={errors.username?.message}
                  {...form.register("username")}
                />

                {/* PASSWORD */}
                <InputField
                  label={LOGIN_COPY.passwordLabel}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder={LOGIN_COPY.passwordPlaceholder}
                  fieldSize="lg"
                  error={errors.password?.message}
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      onMouseDown={(e) => e.preventDefault()}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-md text-text-secondary hover:text-text transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} strokeWidth={1.8} /> : <Eye size={20} strokeWidth={1.8} />}
                    </button>
                  }
                  {...form.register("password")}
                />

                {/* BUTTON */}
                <Button
                  type="submit"
                  variant="primary"
                  size="login"
                  fullWidth
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? LOGIN_COPY.submittingLabel : LOGIN_COPY.submitLabel}
                </Button>
              </form>

              <p className="mt-[20px] text-center text-[13px] font-normal leading-[20px] text-text-secondary">
                {LOGIN_COPY.demoHint}
              </p>
            </div>
          </section>
        </div>
      </div>

      <SessionTimeoutModal
        isOpen={isTimeoutOpen}
        onClose={() => setIsTimeoutOpen(false)}
        initialSeconds={60}
        onExtend={() => setIsTimeoutOpen(false)}
        onLogout={() => setIsTimeoutOpen(false)}
      />
    </main>
  );
};

export default ManagerLogin;