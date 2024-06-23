import React from 'react';
import './i18n';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegistrationPage from './components/RegistrationPage';
import CreateProductionPage from './components/CreateProductionPage';
import EditProductionPage from './components/EditProductionPage';
import ProductionZonesPage from './components/ProductionZonesPage';
import CreateProductionZonePage from './components/CreateProductionZonePage';
import EditProductionZonePage from './components/EditProductionZonePage';
import AddSensorPage from './components/AddSensorPage';
import SensorDataPage from './components/SensorDataPage';
import ProductionWorkersPage from './components/ProductionWorkersPage';
import AddWorkerPage from './components/AddWorkerPage';
import AllReportsPage from './components/AllReportsPage';
import MyReportsPage from './components/MyReportsPage';
import AddReportPage from './components/AddReportPage';
import EditReportPage from './components/EditReportPage';
import LanguageSwitcher from './components/LanguageSwitcher';

function App() {
  return (
    <Router>
      <div>
        <LanguageSwitcher />
        <Routes>
          <Route exact path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="/create_production" element={<CreateProductionPage />} />
          <Route path="/edit_production/:productionId" element={<EditProductionPage />} />
          <Route path="/production_zones/:productionId" element={<ProductionZonesPage />} />
          <Route path="/create_production_zone/:productionId" element={<CreateProductionZonePage />} />
          <Route path="/edit_production_zone/:productionZoneId" element={<EditProductionZonePage />} /> 
          <Route path="/add_sensor/:productionZoneId" element={<AddSensorPage />} />
          <Route path="/sensor_data/:productionZoneId" element={<SensorDataPage />} />
          <Route path="/production_workers/:productionId" element={<ProductionWorkersPage />} />
          <Route path="/add_worker/:productionId" element={<AddWorkerPage />} />
          <Route path="/all_reports/:productionZoneId" element={<AllReportsPage />} />
          <Route path="/my_reports" element={<MyReportsPage />} />
          <Route path="/add_report/:productionZoneId" element={<AddReportPage />} />
          <Route path="/edit_report/:reportId" element={<EditReportPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
