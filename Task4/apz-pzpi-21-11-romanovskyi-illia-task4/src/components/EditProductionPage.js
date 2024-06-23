import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './EditProductionPage.css';

function EditProductionPage() {
  const { productionId } = useParams();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    fetch(`http://localhost:8000/get_csrf_token`, {
      method: 'GET',
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => setCsrfToken(data.csrfToken))
      .catch(error => console.error('Error fetching CSRF token:', error));
  }, []);

  useEffect(() => {
    fetch(`http://localhost:8000`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'X-CSRFToken': csrfToken,
      },
    })
      .then(response => response.json())
      .then(data => {
        const production = data.productions.find(p => p.id === parseInt(productionId));
        setName(production.name);
        setDescription(production.description);
      })
      .catch(error => console.error('Error fetching production:', error));
  }, [csrfToken, productionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:8000/edit_production/${productionId}`, {
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
        setMessage(t('productionUpdatedSuccessfully'));
        navigate('/');
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage(t('failedToFetch'));
      console.error('Error:', error);
    }
  };

  return (
    <div className="edit-production-container">
      <h2>{t('editProduction')}</h2>
      <form onSubmit={handleSubmit} className="edit-production-form">
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
        <button type="submit">{t('update')}</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default EditProductionPage;
