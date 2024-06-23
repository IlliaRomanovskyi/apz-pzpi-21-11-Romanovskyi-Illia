import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './LoginPage.css';

function LoginPage() {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/get_csrf_token', {
      method: 'GET',
      credentials: 'include',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setCsrfToken(data.csrfToken))
      .catch(error => console.error('Error fetching CSRF token:', error));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage(t('loginSuccessful'));
        navigate('/'); // Перенаправляем на домашнюю страницу
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage(t('failedToFetch'));
      console.error('Error:', error);
    }
  };

  return (
    <div className="login-container">
      <h2>{t('login')}</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label>
            {t('username')}:
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            {t('password')}:
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </label>
        </div>
        <button type="submit">{t('login')}</button>
        <Link to="/registration">
          <button type="button">{t('createNewAccount')}</button>
        </Link>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default LoginPage;
