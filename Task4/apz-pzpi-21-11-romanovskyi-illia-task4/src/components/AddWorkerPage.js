import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './AddWorkerPage.css';

function AddWorkerPage() {
  const { productionId } = useParams();
  const [username, setUsername] = useState('');
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
      const response = await fetch(`http://localhost:8000/add_worker/${productionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(t('workerAddedSuccessfully'));
        navigate(-1);
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage(t('failedToFetch'));
      console.error('Error:', error);
    }
  };

  return (
    <div className="add-worker-container">
      <h2>{t('addWorker')}</h2>
      <form onSubmit={handleSubmit} className="add-worker-form">
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
        <button type="submit">{t('addWorker')}</button>
      </form>
      {message && <p>{message}</p>}
      <button onClick={() => navigate(-1)}>{t('back')}</button>
    </div>
  );
}

export default AddWorkerPage;
