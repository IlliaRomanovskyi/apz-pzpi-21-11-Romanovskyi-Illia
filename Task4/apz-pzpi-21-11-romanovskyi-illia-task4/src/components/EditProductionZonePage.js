import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './EditProductionZonePage.css';

function EditProductionZonePage() {
  const { productionZoneId } = useParams();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [responsibleWorker, setResponsibleWorker] = useState('');
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
    if (csrfToken) {
      fetch(`http://localhost:8000/get_production_zone/${productionZoneId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'X-CSRFToken': csrfToken,
        },
      })
        .then(response => response.json())
        .then(data => {
          setName(data.name);
          setDescription(data.description);
          setResponsibleWorker(data.responsible_worker);
        })
        .catch(error => console.error('Error fetching zone:', error));
    }
  }, [csrfToken, productionZoneId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:8000/edit_production_zone/${productionZoneId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ name, description, responsible_worker: responsibleWorker }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(t('productionZoneUpdatedSuccessfully'));
        navigate(-1); // Перенаправляем на предыдущую страницу после редактирования
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage(t('failedToFetch'));
      console.error('Error:', error);
    }
  };

  return (
    <div className="edit-production-zone-container">
      <h2>{t('editProductionZone')}</h2>
      <form onSubmit={handleSubmit} className="edit-production-zone-form">
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
        <div className="form-group">
          <label>
            {t('responsibleWorker')}:
            <input 
              type="text" 
              value={responsibleWorker}
              onChange={(e) => setResponsibleWorker(e.target.value)}
            />
          </label>
        </div>
        <button type="submit">{t('update')}</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default EditProductionZonePage;
