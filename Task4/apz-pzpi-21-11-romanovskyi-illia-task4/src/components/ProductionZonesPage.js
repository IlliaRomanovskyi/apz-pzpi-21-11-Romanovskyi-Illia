import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './ProductionZonesPage.css';

function ProductionZonesPage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const { productionId } = useParams();
  const [zones, setZones] = useState([]);
  const [message, setMessage] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const navigate = useNavigate();

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
      fetch(`http://localhost:8000/production_zones/${productionId}`, {
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
            setProfile(data.profile);
            setZones(data.zones);
          }
        })
        .catch(error => {
          setMessage(t('failedToFetch'));
          console.error('Error:', error);
        });
    }
  }, [csrfToken, productionId, t]);

  const handleDeleteZone = async (zoneId) => {
    try {
      const response = await fetch(`http://localhost:8000/delete_production_zone/${zoneId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setZones(zones.filter(zone => zone.id !== zoneId));
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage(t('failedToDeleteZone'));
      console.error('Error:', error);
    }
  };

  const handleDeleteSensor = async (zoneId) => {
    try {
      const response = await fetch(`http://localhost:8000/delete_sensor/${zoneId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setZones(zones.map(zone => 
          zone.id === zoneId ? { ...zone, sensor: null } : zone
        ));
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage(t('failedToDeleteSensor'));
      console.error('Error:', error);
    }
  };

  return (
    <div className="zones-container">
      <h2>{t('productionZones')}</h2>
      {message && <p>{message}</p>}
      {profile && profile.is_owner && (
      <div className="button-group add-zone-group">
        <Link to={`/create_production_zone/${productionId}`}>
          <button className="add-zone-button">{t('addZone')}</button>
        </Link>
      </div>)}
      <ul className="zones-list">
        {zones.map(zone => (
          <li key={zone.id} className="zone-item">
            <h3>{zone.name}</h3>
            <p>{zone.description}</p>

            {zone.responsible_worker && <p>{t('responsibleWorker')}: {zone.responsible_worker}</p>}
            <div className="button-group">
              <Link to={`/add_report/${zone.id}`}>
                <button className="add-report-button">{t('addReport')}</button>
              </Link>
              {(profile && profile.is_owner) || (profile && profile.username === zone.responsible_worker) ? (
                <Link to={`/all_reports/${zone.id}`}>
                  <button className="view-reports-button">{t('viewReports')}</button>
                </Link>
              ) : null}
              {profile && profile.is_owner && (
              <>
                <Link to={`/edit_production_zone/${zone.id}`}>
                  <button className="edit-zone-button">{t('editZone')}</button>
                </Link>
                {zone.sensor ? (
                  <>
                  <button className="delete-sensor-button" onClick={() => handleDeleteSensor(zone.id)}>{t('deleteSensor')}</button>
                  <Link to={`/sensor_data/${zone.id}`}>
                    <button className="sensor-data-button">{t('sensorData')}</button>
                  </Link>
                </>
                ) : (
                  <Link to={`/add_sensor/${zone.id}`}>
                    <button className="add-sensor-button">{t('addSensor')}</button>
                  </Link>
                )}
                <button className="delete-zone-button" onClick={() => handleDeleteZone(zone.id)}>{t('deleteZone')}</button>
              </>
              )}
              {profile && profile.is_worker && (
                <Link to="/my_reports">
                  <button className="my-reports-button">{t('myReports')}</button>
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
      <button className="back-button" onClick={() => navigate(-1)}>{t('back')}</button>
    </div>
  );
}

export default ProductionZonesPage;
