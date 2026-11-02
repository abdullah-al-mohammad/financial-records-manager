import { useState } from 'react';
import {
  api,
  getScriptUrl,
  isLiveMode,
  saveSession,
  setLiveMode,
  setScriptUrl,
} from '../../utils/api';
import { validateLogin } from './loginLogic';

// Owns login form state, mode configuration and the authentication flow.
export default function useLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [live, setLive] = useState(isLiveMode());
  const [url, setUrl] = useState(getScriptUrl());
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();

    const validationError = validateLogin({ username, password, live, url });
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Save configuration options
      setLiveMode(live);
      if (live) setScriptUrl(url);

      // Perform API authentication
      const data = await api.login(username.trim(), password);

      // Store session data
      saveSession({
        username: data.username,
        role: data.role,
        sessionToken: data.sessionToken,
        isLive: live,
      });

      setSuccess('Logged in successfully!');
      setTimeout(() => {
        onLoginSuccess();
      }, 800);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
}
