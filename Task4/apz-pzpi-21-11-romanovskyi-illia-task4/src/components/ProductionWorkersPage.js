import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './ProductionWorkersPage.css';

function ProductionWorkersPage() {
  const { productionId } = useParams();
  const [workers, setWorkers] = useState([]);
  const [message, setMessage] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    fetch('http://localhost:8000/get_csrf_token', {
      method: 'GET',
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => setCsrfToken(data.csrfToken))
      .catch(error => console.error('Error fetching CSRF token:', error));
  }, []);

  useEffect(() => {
    if (csrfToken) {
      fetch(`http://localhost:8000/production_workers/${productionId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'X-CSRFToken': csrfToken,
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            setMessage(data.error);
          } else {
            setWorkers(data.workers);
          }
        })
        .catch(error => {
          setMessage('Failed to fetch workers');
          console.error('Error:', error);
        });
    }
  }, [csrfToken, productionId]);

  const handleDeleteWorker = async (username) => {
    try {
      const response = await fetch(`http://localhost:8000/delete_worker/${productionId}`, {
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
        setWorkers(workers.filter(worker => worker.username !== username));
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage('Failed to fetch');
      console.error('Error:', error);
    }
  };

  return (
    <div className="workers-container">
      <h2>{t('productionWorkers')}</h2>
      {message && <p>{message}</p>}
      <ul className="workers-list">
        {workers.map(worker => (
          <li key={worker.id} className="worker-item">
            {worker.username}
            <button className="delete-button" onClick={() => handleDeleteWorker(worker.username)}>{t('deleteWorker')}</button>
          </li>
        ))}
      </ul>
      <Link to={`/add_worker/${productionId}`}>
          <button className="add-button">{t('addWorker')}</button>
      </Link>
      <div className="button-group">
        <button className="back-button" onClick={() => navigate(-1)}>{t('back')}</button>
      </div>

      
    </div>
  );
}

export default ProductionWorkersPage;
