import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './CreateProductionPage.css';

function CreateProductionPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation(); // Добавляем хук для перевода

  useEffect(() => {
    fetch('http://localhost:8000/get_csrf_token', {
      method: 'GET',
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => setCsrfToken(data.csrfToken))
      .catch(error => console.error('Error fetching CSRF token:', error));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8000/create_production', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ name, description }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(t('productionCreatedSuccessfully'));
        navigate('/'); // Перенаправляем на домашнюю страницу после создания
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage(t('failedToFetch'));
      console.error('Error:', error);
    }
  };

  return (
    <div className="create-production-container">
      <h2>{t('createProduction')}</h2>
      <form onSubmit={handleSubmit} className="create-production-form">
        <div className="form-group">
          <label>
            {t('name')}:
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            {t('description')}:
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
        </div>
        <button type="submit">{t('create')}</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default CreateProductionPage;
