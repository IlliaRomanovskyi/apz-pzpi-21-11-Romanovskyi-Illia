import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './AddSensorPage.css';

function AddSensorPage() {
  const { productionZoneId } = useParams();
  const [sensorId, setSensorId] = useState('');
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
      const response = await fetch(`http://localhost:8000/add_sensor/${productionZoneId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ sensor_id: sensorId }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(t('sensorAddedSuccessfully'));
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
    <div className="add-sensor-container">
      <h2>{t('addSensor')}</h2>
      <form onSubmit={handleSubmit} className="add-sensor-form">
        <div className="form-group">
          <label>
            {t('sensorId')}:
            <input 
              type="text" 
              value={sensorId}
              onChange={(e) => setSensorId(e.target.value)}
              required 
            />
          </label>
        </div>
        <button type="submit">{t('addSensor')}</button>
      </form>
      {message && <p>{message}</p>}
      <button onClick={() => navigate(-1)}>{t('back')}</button>
    </div>
  );
}

export default AddSensorPage;
