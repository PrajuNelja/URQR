// src/pages/Table_Management/Components/ManagerLogin.tsx

import { Sparkles } from "lucide-react";

import { Button } from "../../../components/Buttons/Button";
import { InputField } from "../../../components/InputField/InputField";
import { Notification } from "../../../components/Notification/Notification";

import { LOGIN_COPY, LOGIN_HIGHLIGHTS } from "../Config/Login.config";
import { useManagerLogin } from "../Hooks/useManagerLogin";

const ManagerLogin = () => {
  const { form, feedback, isSubmitting, onSubmit, dismissFeedback } =
    useManagerLogin();

  const { errors } = form.formState;

  return (
    <main className="min-h-screen bg-bg flex flex-col lg:flex-row font-sans">
      <Notification
        isOpen={feedback.isOpen}
        type={feedback.type}
        message={feedback.message}
        onClose={dismissFeedback}
      />

      {/* ── LEFT BRAND PANEL ── */}
      <section className="relative w-full lg:w-[50%] bg-primary-dark text-on-primary p-8 md:p-16 lg:p-24 flex flex-col justify-center overflow-hidden min-h-[50vh] lg:min-h-screen">
        <div
          className="hidden lg:block absolute top-[-22%] left-[-26%] w-[82%] h-[158%] bg-primary-dark pointer-events-none"
          style={{ borderRadius: "0 52% 48% 0 / 0 68% 60% 0" }}
          aria-hidden="true"
        />

        <div className="relative z-10 w-full max-w-[420px] mx-auto lg:mx-0 flex flex-col h-full justify-between py-8 lg:py-16">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <span className="w-1.5 h-1.5 bg-on-primary/50 rounded-full" />
              <p className="font-bold tracking-[0.18em] text-xs uppercase text-on-primary/80">
                {LOGIN_COPY.brand}
              </p>
            </div>
            <h1 className="text-4xl lg:text-[56px] lg:leading-[68px] font-semibold mb-6 tracking-tight">
              {LOGIN_COPY.headline}
            </h1>
            <p className="text-lg lg:text-[22px] lg:leading-[34px] text-on-primary/90 max-w-[340px]">
              {LOGIN_COPY.description}
            </p>
          </div>

          <div className="mt-16 lg:mt-auto flex flex-col items-start gap-4">
            {LOGIN_HIGHLIGHTS.map((highlight) => (
              <div
                key={highlight}
                className="inline-flex h-[52px] items-center gap-3 bg-on-primary/20 px-5 rounded-full text-[16px] leading-[24px] font-semibold border border-on-primary/10 w-fit"
              >
                <Sparkles size={16} aria-hidden="true" />
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RIGHT SIGN-IN PANEL ── */}
      <section className="flex-1 flex flex-col justify-center items-center p-8 lg:p-16 bg-bg">
        <div className="w-full max-w-[360px]">
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-primary-dark rounded-[12px] flex items-center justify-center text-on-primary mx-auto mb-6 text-2xl">
              ✦
            </div>
            <h2 className="text-[28px] leading-[36px] font-semibold text-text mb-4">
              {LOGIN_COPY.welcome}
            </h2>
            <p className="text-[14px] leading-[22px] text-text-secondary">
              {LOGIN_COPY.instructions}
            </p>
          </div>

          <form onSubmit={onSubmit} noValidate className="space-y-6">
            <InputField
              label={LOGIN_COPY.usernameLabel}
              type="text"
              autoComplete="username"
              placeholder={LOGIN_COPY.usernamePlaceholder}
              fieldSize="lg"
              wrapperClassName="manager-login_field"
              error={errors.username?.message}
              disabled={isSubmitting}
              {...form.register("username")}
            />

            <InputField
              label={LOGIN_COPY.passwordLabel}
              type="password"
              autoComplete="current-password"
              placeholder={LOGIN_COPY.passwordPlaceholder}
              fieldSize="lg"
              wrapperClassName="manager-login_field"
              error={errors.password?.message}
              disabled={isSubmitting}
              {...form.register("password")}
            />

            <Button
              type="submit"
              variant="primary"
              size="login"
              fullWidth
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? LOGIN_COPY.submittingLabel
                : LOGIN_COPY.submitLabel}
            </Button>
          </form>

          {/* ── DEMO HINT (DEV ONLY — stripped from production build) ── */}
          {import.meta.env.DEV && (
            <p className="text-center text-[13px] leading-[20px] text-text-secondary mt-6">
              Demo login:{" "}
              <span className="font-mono font-semibold text-text">MGR-8902</span>
              {" / "}
              <span className="font-mono font-semibold text-text">2305</span>
            </p>
          )}
        </div>
      </section>
    </main>
  );
};

export default ManagerLogin;