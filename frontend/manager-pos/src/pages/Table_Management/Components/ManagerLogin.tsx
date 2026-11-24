import { Sparkles } from "lucide-react";
import { Button } from "../../../components/Buttons/Button";
import { InputField } from "../../../components/InputField/InputField";
import { Logo } from "../../../components/Logo/Logo";
import { Notification } from "../../../components/Notification/Notification";
import { LOGIN_COPY, LOGIN_HIGHLIGHTS } from "../Config/Login.config";
import { useManagerLogin } from "../Hooks/useManagerLogin";

const ManagerLogin = () => {
  const {
    userName,
    password,
    feedback,
    onUserNameChange,
    onPasswordChange,
    onSubmit,
    dismissFeedback,
  } = useManagerLogin();

  return (
    <main className="min-h-screen bg-bg flex flex-col lg:flex-row font-sans">
      <Notification
        isOpen={feedback.isOpen}
        type={feedback.type}
        message={feedback.message}
        onClose={dismissFeedback}
      />

      {/* ── LEFT PANEL (Dark Espresso Panel) ── */}
      <section className="relative w-full lg:w-[50%] bg-primary-dark text-surface p-8 md:p-16 lg:p-24 flex flex-col justify-center overflow-hidden min-h-[50vh] lg:min-h-screen">
        
        {/* The sweeping curve shape overlapping the right panel */}
        <div className="hidden lg:block absolute top-0 right-0 w-[120%] h-full bg-bg rounded-l-[100%] translate-x-[65%] pointer-events-none" />

        {/* Content Container - strictly constrained to prevent narrow text wrapping */}
        <div className="relative z-10 w-full max-w-[420px] ml-auto mr-auto lg:ml-0 lg:mr-0 flex flex-col h-full justify-between py-8 lg:py-16">
          
          <div>
            <div className="flex items-center gap-3 mb-12">
              <span className="w-1.5 h-1.5 bg-surface/50 rounded-full" />
              <p className="font-bold tracking-[0.2em] text-xs uppercase text-surface/70">
                {LOGIN_COPY.brand}
              </p>
            </div>
            
            <h1 className="text-4xl lg:text-[56px] font-semibold leading-[1.1] mb-6 tracking-tight">
              {LOGIN_COPY.headline}
            </h1>
            
            <p className="text-base lg:text-lg text-surface/80 leading-relaxed max-w-[340px]">
              {LOGIN_COPY.description}
            </p>
          </div>

          <div className="mt-16 lg:mt-auto space-y-4">
            {LOGIN_HIGHLIGHTS.map((highlight) => (
              <div 
                key={highlight} 
                className="inline-flex items-center gap-3 bg-surface/10 px-5 py-3.5 rounded-full text-sm font-medium border border-surface/10 w-fit"
              >
                <Sparkles size={16} className="text-surface" aria-hidden="true" />
                <span>{highlight}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── RIGHT PANEL (Login Form) ── */}
      <section className="flex-1 flex flex-col justify-center items-center p-8 lg:p-16 bg-bg" aria-labelledby="login-title">
        <div className="w-full max-w-[360px]">
          
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-primary-dark rounded-[12px] flex items-center justify-center text-surface mx-auto mb-6">
              <Logo size="md" showText={false} />
            </div>
            <h2 id="login-title" className="text-[28px] font-semibold text-text mb-2 leading-tight">
              {LOGIN_COPY.welcome}
            </h2>
            <p className="text-[14px] text-text-muted">
              {LOGIN_COPY.instructions}
            </p>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <InputField
              label="MANAGER ID"
              name="userName"
              type="text"
              autoComplete="username"
              placeholder="e.g., MGR-8902"
              value={userName}
              onChange={onUserNameChange}
              className="bg-surface border-border focus:border-primary h-[48px] rounded-md text-[14px] px-4"
              required
            />
            
            <InputField
              label="PASSWORD"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={onPasswordChange}
              className="bg-surface border-border focus:border-primary h-[48px] rounded-md text-[14px] px-4"
              required
            />

            <Button
              type="submit"
              size="lg"
              fullWidth
              className="bg-primary-dark text-onPrimary hover:bg-primary mt-2 h-[48px] rounded-md text-[14px] font-semibold transition-colors"
            >
              {LOGIN_COPY.submitLabel}
            </Button>
          </form>

          <p className="text-center text-[13px] text-text-muted mt-6">
            {LOGIN_COPY.credentialsHint}
          </p>
        </div>
      </section>
    </main>
  );
};

export default ManagerLogin;