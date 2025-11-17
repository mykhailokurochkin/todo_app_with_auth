import React, { useState } from 'react';
import { register, login } from '../../api/authClient';
import './AuthForm.css';

interface AuthFormProps {
  onSuccess: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      if (isRegisterMode) {
        await register(email, password);
        setMessage('Registration successful!');
      } else {
        await login(email, password);
        setMessage('Login successful!');
      }
      setEmail('');
      setPassword('');
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed.');
    }
  };

  return (
    <div className="auth-form">
      <h2 className="auth-form__title">{isRegisterMode ? 'Register' : 'Login'}</h2>
      <form className="auth-form__form" onSubmit={handleSubmit}>
        <div className="auth-form__group">
          <label htmlFor="email" className="auth-form__label">Email:</label>
          <input
            type="email"
            id="email"
            className="auth-form__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="auth-form__group">
          <label htmlFor="password" className="auth-form__label">Password:</label>
          <input
            type="password"
            id="password"
            className="auth-form__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-form__button">{isRegisterMode ? 'Register' : 'Login'}</button>
      </form>
      <button onClick={() => setIsRegisterMode(!isRegisterMode)} type="button" className="auth-form__switch-button">
        Switch to {isRegisterMode ? 'Login' : 'Register'}
      </button>
      {message && <p className="auth-form__message auth-form__message--success">{message}</p>}
      {error && <p className="auth-form__message auth-form__message--error">{error}</p>}
    </div>
  );
};

export default AuthForm;
