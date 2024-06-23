import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './SensorDataPage.css';

function SensorDataPage() {
  const { t } = useTranslation();
  const { productionZoneId } = useParams();
  const [sensorData, setSensorData] = useState(null);
  const [message, setMessage] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const navigate = useNavigate();

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
      fetch(`http://localhost:8000/display_sensor_data/${productionZoneId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'X-CSRFToken': csrfToken,
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setSensorData(data);
          } else {
            setMessage(data.error);
          }
        })
        .catch(error => {
          setMessage(t('failedToFetchSensorData'));
          console.error('Error:', error);
        });
    }
  }, [csrfToken, productionZoneId, t]);

  return (
    <div className="sensor-data-container">
      <h2>{t('sensorData')}</h2>
      {message && <p className="message">{message}</p>}
      {sensorData ? (
        <div className="sensor-data">
          <p><strong>{t('sensorId')}:</strong> {sensorData.sensor_id}</p>
          <p><strong>{t('temperature')}:</strong> {sensorData.temperature}</p>
          <p><strong>{t('humidity')}:</strong> {sensorData.humidity}</p>
          <p><strong>{t('noise')}:</strong> {sensorData.noise}</p>
        </div>
      ) : (
        <p>{t('loadingSensorData')}</p>
      )}
      <button onClick={() => navigate(-1)} className="back-button">{t('back')}</button>
    </div>
  );
}

export default SensorDataPage;
