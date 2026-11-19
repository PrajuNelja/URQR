import { Sparkles } from "lucide-react";
import Button from "../../../components/Buttons/Button";
import InputField from "../../../components/InputField/InputField";
import Logo from "../../../components/Logo/Logo";
import Notification from "../../../components/Notification/Notification";
import { LOGIN_COPY, LOGIN_HIGHLIGHTS } from "../Config/Login.config";
import { useManagerLogin } from "../Hooks/useManagerLogin";
import "../../../Styles/manager-login.css";

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
    <main className="manager-login">
      <Notification
        isOpen={feedback.isOpen}
        type={feedback.type}
        message={feedback.message}
        onClose={dismissFeedback}
      />
      <section className="manager-login__story" aria-labelledby="login-headline">
        <div className="manager-login__story-content">
          <p className="manager-login__brand">{LOGIN_COPY.brand}</p>
          <h1 id="login-headline" className="manager-login__headline">
            {LOGIN_COPY.headline}
          </h1>
          <p className="manager-login__description">
            {LOGIN_COPY.description}
          </p>
          <ul className="manager-login__highlights" aria-label="Today's highlights">
            {LOGIN_HIGHLIGHTS.map((highlight) => (
              <li className="manager-login__highlight" key={highlight}>
                <Sparkles size={14} aria-hidden="true" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="manager-login__panel" aria-labelledby="login-title">
        <div className="manager-login__form-content">
          <div className="manager-login__logo" aria-hidden="true">
            <Logo size="md" showText={false} />
          </div>
          <h2 id="login-title" className="manager-login__title">
            {LOGIN_COPY.welcome}
          </h2>
          <p className="manager-login__instructions">
            {LOGIN_COPY.instructions}
          </p>

          <form className="manager-login__form" onSubmit={onSubmit}>
            <InputField
              label={LOGIN_COPY.userNameLabel}
              name="userName"
              type="text"
              autoComplete="username"
              placeholder={LOGIN_COPY.userNamePlaceholder}
              value={userName}
              onChange={onUserNameChange}
              wrapperClassName="manager-login__field"
              className="manager-login__input"
              required
            />
            <InputField
              label={LOGIN_COPY.passwordLabel}
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder={LOGIN_COPY.passwordPlaceholder}
              value={password}
              onChange={onPasswordChange}
              wrapperClassName="manager-login__field"
              className="manager-login__input"
              required
            />
            <Button
              className="manager-login__submit"
              type="submit"
              size="lg"
              fullWidth
            >
              {LOGIN_COPY.submitLabel}
            </Button>
          </form>

          <p className="manager-login__demo-hint">{LOGIN_COPY.credentialsHint}</p>
        </div>
      </section>
    </main>
  );
};

export default ManagerLogin;
