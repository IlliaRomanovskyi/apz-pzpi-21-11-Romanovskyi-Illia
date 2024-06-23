import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './MyReportsPage.css';

function MyReportsPage() {
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [message, setMessage] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const [modalPhoto, setModalPhoto] = useState(null);
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
      fetch('http://localhost:8000/my_reports', {
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
            setReports(data.reports);
          }
        })
        .catch(error => {
          setMessage(t('failedToFetchReports'));
          console.error('Error:', error);
        });
    }
  }, [csrfToken, t]);

  const handleDeleteReport = async (reportId) => {
    try {
      const response = await fetch(`http://localhost:8000/delete_report/${reportId}`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setReports(reports.filter(report => report.id !== reportId));
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage(t('failedToDeleteReport'));
      console.error('Error:', error);
    }
  };

  const handlePhotoClick = (photo) => {
    setModalPhoto(photo);
  };

  const closeModal = () => {
    setModalPhoto(null);
  };

  const statusTranslations = {
    'Active': t('statusActive'),
    'Resolved': t('statusResolved'),
    'InProgress': t('statusInProgress'),
    'Cancelled': t('statusCancelled'),
  };

  return (
    <div className="my-reports-container">
      <h2>{t('myReports')}</h2>
      {message && <p>{message}</p>}
      <ul className="reports-list">
        {reports.map(report => (
          <li key={report.id} className="report-item">
            <p>{t('description')}: {report.description}</p>
            <p>{t('status')}: {statusTranslations[report.status]}</p>
            <p>{t('timestamp')}: {report.timestamp}</p>
            <div className="report-photos">
              {report.photos.map((photo, index) => (
                <img
                  key={index}
                  src={`http://localhost:8000${photo}`}
                  alt={`Photo ${index + 1} of report ${report.id}`}
                  onClick={() => handlePhotoClick(`http://localhost:8000${photo}`)}
                />
              ))}
            </div>
            <button onClick={() => handleDeleteReport(report.id)}>{t('deleteReport')}</button>
          </li>
        ))}
      </ul>
      <button onClick={() => navigate(-1)}>{t('back')}</button>

      {modalPhoto && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={closeModal}>&times;</span>
            <img src={modalPhoto} alt={t('fullSize')} />
          </div>
        </div>
      )}
    </div>
  );
}

export default MyReportsPage;
