import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './EditReportPage.css';

function EditReportPage() {
  const { reportId } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [photos, setPhotos] = useState([]);
  const [previewPhotos, setPreviewPhotos] = useState([]);
  const [message, setMessage] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const statusChoices = [
    { value: 'Active', label: t('statusActive') },
    { value: 'Resolved', label: t('statusResolved') },
    { value: 'InProgress', label: t('statusInProgress') },
    { value: 'Cancelled', label: t('statusCancelled') },
  ];

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
      fetch(`http://localhost:8000/get_report/${reportId}`, {
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
            setTitle(data.report.title);
            setDescription(data.report.description);
            setStatus(data.report.status);
            setPreviewPhotos(data.report.photos.map(photo => `http://localhost:8000${photo}`));
          }
        })
        .catch(error => {
          setMessage(t('failedToFetchReport'));
          console.error('Error:', error);
        });
    }
  }, [csrfToken, reportId, t]);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setPhotos(newFiles);

    const filePreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviewPhotos((prevPreviews) => [...prevPreviews, ...filePreviews]);
  };

  const handleRemovePhoto = (index) => {
    setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
    setPreviewPhotos((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('status', status);
    photos.forEach(photo => formData.append('photos', photo));

    try {
      const response = await fetch(`http://localhost:8000/edit_report/${reportId}`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(t('reportUpdatedSuccessfully'));
        navigate(-1); // Перенаправить на предыдущую страницу после редактирования отчета
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage(t('failedToUpdateReport'));
      console.error('Error:', error);
    }
  };

  return (
    <div className="edit-report-container">
      <h2>{t('editReport')}</h2>
      <form onSubmit={handleSubmit} className="edit-report-form">
        <div className="form-group">
          <label>
            {t('title')}:
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              required 
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            {t('status')}:
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              {statusChoices.map((choice) => (
                <option key={choice.value} value={choice.value}>{choice.label}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-group">
          <label>
            {t('photos')}:
            <input 
              type="file" 
              onChange={handleFileChange}
              multiple 
            />
          </label>
        </div>
        <div className="photo-previews">
          {previewPhotos.map((photo, index) => (
            <div key={index} className="photo-preview">
              <img src={photo} alt={`Preview ${index + 1}`} />
              <button type="button" onClick={() => handleRemovePhoto(index)}>{t('remove')}</button>
            </div>
          ))}
        </div>
        <button type="submit">{t('updateReport')}</button>
      </form>
      {message && <p>{message}</p>}
      <button onClick={() => navigate(-1)}>{t('back')}</button>
    </div>
  );
}

export default EditReportPage;
