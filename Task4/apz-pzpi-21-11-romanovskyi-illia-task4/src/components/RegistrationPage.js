import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './RegistrationPage.css';

function RegistrationPage() {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isWorker, setIsWorker] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
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

    if (isWorker && isOwner) {
      setMessage(t('cannotSelectBoth'));
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ username, password, email, is_worker: isWorker, is_owner: isOwner }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage(t('registrationSuccessful'));
        navigate('/login');
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage(t('failedToFetch'));
      console.error('Error:', error);
    }
  };

  const handleIsWorkerChange = (e) => {
    setIsWorker(e.target.checked);
    if (e.target.checked) {
      setIsOwner(false);
    }
  };

  const handleIsOwnerChange = (e) => {
    setIsOwner(e.target.checked);
    if (e.target.checked) {
      setIsWorker(false);
    }
  };

  return (
    <div className="registration-container">
      <h2>{t('register')}</h2>
      <form onSubmit={handleSubmit} className="registration-form">
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
        <div className="form-group">
          <label>
            {t('email')}:
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            {t('isWorker')}:
            <input 
              type="checkbox" 
              checked={isWorker}
              onChange={handleIsWorkerChange}
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            {t('isOwner')}:
            <input 
              type="checkbox" 
              checked={isOwner}
              onChange={handleIsOwnerChange}
            />
          </label>
        </div>
        <button type="submit" className="register-button">{t('registerButton')}</button>
      </form>

      <Link to="/login">
        <button>{t('alreadyHaveAccount')}</button>
      </Link>

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default RegistrationPage;
