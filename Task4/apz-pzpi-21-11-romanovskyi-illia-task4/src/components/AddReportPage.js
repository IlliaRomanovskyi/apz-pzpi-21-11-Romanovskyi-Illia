import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './AddReportPage.css';

function AddReportPage() {
  const { productionZoneId } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [previewPhotos, setPreviewPhotos] = useState([]);
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

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setPhotos((prevPhotos) => [...prevPhotos, ...newFiles]);

    const newPreviewPhotos = newFiles.map(file => URL.createObjectURL(file));
    setPreviewPhotos((prevPreviews) => [...prevPreviews, ...newPreviewPhotos]);
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
    photos.forEach(photo => formData.append('photos', photo));

    try {
      const response = await fetch(`http://localhost:8000/add_report/${productionZoneId}`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(t('reportAddedSuccessfully'));
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
    <div className="add-report-container">
      <h2>{t('addReport')}</h2>
      <form onSubmit={handleSubmit} className="add-report-form">
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
        <button type="submit">{t('addReport')}</button>
      </form>
      {message && <p>{message}</p>}
      <button onClick={() => navigate(-1)}>{t('back')}</button>
    </div>
  );
}

export default AddReportPage;
