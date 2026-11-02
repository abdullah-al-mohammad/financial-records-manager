import LoginAlerts from './LoginAlerts';
import LoginBrand from './LoginBrand';
import LoginForm from './LoginForm';
import LoginModeToggle from './LoginModeToggle';
import useLogin from './useLogin';

export default function Login({ onLoginSuccess }) {
  const {
    username,
    setUsername,
    password,
    setPassword,
    live,
    setLive,
    url,
    setUrl,
    showPassword,
    setShowPassword,
    loading,
    error,
    success,
    handleSubmit,
  } = useLogin({ onLoginSuccess });

  return (
    <div className="login-screen min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#060913]">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel-glow rounded-2xl overflow-hidden p-8 z-10 transition-all duration-300">
        <LoginBrand />

        <LoginModeToggle live={live} onChangeMode={setLive} />

        <LoginAlerts error={error} success={success} />

        <LoginForm
          live={live}
          url={url}
          onUrlChange={setUrl}
          username={username}
          onUsernameChange={setUsername}
          password={password}
          onPasswordChange={setPassword}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
          loading={loading}
          onSubmit={handleSubmit}
        />

        <div className="mt-8 text-center text-[10px] text-slate-500 border-t border-slate-900 pt-4">
          {!live ? (
            <p>
              Sandbox Credentials: <span className="font-semibold text-slate-400">admin</span> / <span className="font-semibold text-slate-400">admin123</span>
            </p>
          ) : (
            <p>
              Protected by SHA-256 and custom HMAC signature handshakes.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
