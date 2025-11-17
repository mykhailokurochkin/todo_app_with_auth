import React, { useState } from 'react';
import { login } from '../../api/authClient';
import './AuthForm.css';

interface AuthFormProps {
  onSuccess: (userId: number) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      let result;
      result = await login(email, password);
      onSuccess(result.userId);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed.');
    }
  };

  return (
    <div className="auth-form">
      <h2 className="auth-form__title">Register or Login</h2>
      <form className="auth-form__form" onSubmit={handleSubmit}>
        <div className="auth-form__group">
          <label htmlFor="email" className="auth-form__label">Email:</label>
          <input
            type="email"
            id="email"
            className="auth-form__input"
            value={email}
            onChange={e => setEmail(e.target.value)}
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
        <button type="submit" className="auth-form__button">Continue</button>
      </form>
      {error && <p className="auth-form__error">{error}</p>}
    </div>
  );
};

export default AuthForm;
