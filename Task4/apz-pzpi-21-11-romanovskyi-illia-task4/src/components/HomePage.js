import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './HomePage.css';

function HomePage() {
  const { t } = useTranslation(); // Добавляем хук для перевода
  const [profile, setProfile] = useState(null);
  const [productions, setProductions] = useState([]);
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

  useEffect(() => {
    fetch('http://localhost:8000', {
      method: 'GET',
      credentials: 'include',
    })
      .then(response => {
        if (response.status === 403) {
          throw new Error('User is not authenticated');
        }
        return response.json();
      })
      .then(data => {
        if (data.error) {
          setMessage(data.error);
        } else {
          setProfile(data.profile);
          setProductions(data.productions);
        }
      })
      .catch(error => {
        setMessage(error.message);
      });
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:8000/exit', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/login'); // Перенаправляем на страницу входа после выхода
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage('Failed to fetch');
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/delete_production/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setProductions(productions.filter(production => production.id !== id));
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage('Failed to fetch');
      console.error('Error:', error);
    }
  };

  return (
    <div className="home-container">
      <button onClick={handleLogout} className="logout-button">{t('logout')}</button>
      {message && <p>{message}</p>}
      {profile && (
        <div className="profile-container">
          <h3>{t('profile')}</h3>
          <p>{t('username')}: {profile.username}</p>
          <p>{t('email')}: {profile.email}</p>
          <p>{t('role')}: {profile.is_owner ? t('owner') : profile.is_worker ? t('worker') : t('none')}</p>
        </div>
      )}
      {profile && profile.is_owner && (
        <Link to="/create_production">
          <button className="create-production-button">{t('createNewProduction')}</button>
        </Link>
      )}
      {productions && productions.length > 0 && (
        <div className="productions-container">
          <h3>{t('productions')}</h3>
          <ul className="productions-list">
            {productions.map(production => (
              <li key={production.id} className="production-item">
                <h4>{production.name}</h4>
                <p>{production.description}</p>
                <p>{t('owner')}: {production.owner}</p>
                <div className="button-group">
                  <Link to={`/production_zones/${production.id}`}>
                    <button>{t('viewZones')}</button>
                  </Link>
                  {profile && profile.is_owner && (
                    <>
                      <Link to={`/production_workers/${production.id}`}>
                        <button>{t('viewWorkers')}</button>
                      </Link>
                      <Link to={`/edit_production/${production.id}`}>
                        <button>{t('edit')}</button>
                      </Link>
                      <button onClick={() => handleDelete(production.id)}>{t('delete')}</button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default HomePage;
