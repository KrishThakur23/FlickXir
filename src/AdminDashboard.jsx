import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from './contexts/AuthContext';
import MedicineService from './services/medicineService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, loading, user } = useAuth();

  // Medicine state
  const [medicineName, setMedicineName] = useState('');
  const [medicineDescription, setMedicineDescription] = useState('');
  const [medicinePrice, setMedicinePrice] = useState('');
  const [medicineDosage, setMedicineDosage] = useState('');
  const [medicineImage, setMedicineImage] = useState(null);
  const [isMedicineSubmitting, setIsMedicineSubmitting] = useState(false);
  const [medicineMessage, setMedicineMessage] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [showMedicineForm, setShowMedicineForm] = useState(false);

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalMedicines: 0,
    lowStock: 0,
    expiringSoon: 0
  });

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Load medicines on component mount
  useEffect(() => {
    loadMedicines();
  }, []);

  // Update dashboard stats
  useEffect(() => {
    updateDashboardStats();
  }, [medicines]);

  const updateDashboardStats = () => {
    setDashboardStats({
      totalMedicines: medicines.length,
      lowStock: 0, // TODO: Implement low stock logic
      expiringSoon: 0 // TODO: Implement expiry logic
    });
  };

  const loadMedicines = async () => {
    try {
      const { data, error } = await MedicineService.getAllMedicines();
      if (error) throw error;
      setMedicines(data || []);
    } catch (err) {
      console.error('Error loading medicines:', err);
    }
  };

  const isAdminUser = isAdmin;

  useEffect(() => {
    // Only redirect if we're done loading
    if (!loading) {
      if (!isAuthenticated || !isAdminUser) {
        navigate('/');
      }
    }
  }, [loading, isAuthenticated, isAdminUser, navigate]);

  // Medicine handlers
  const handleMedicineImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMedicineImage(file);
    }
  };

  const handleMedicineSubmit = async (e) => {
    e.preventDefault();
    setMedicineMessage('');
    setIsMedicineSubmitting(true);
    
    try {
      let imageUrl = null;
      if (medicineImage) {
        const { url, error } = await MedicineService.uploadMedicineImage(medicineImage);
        if (error) throw error;
        imageUrl = url;
      }

      const medicine = {
        name: medicineName,
        description: medicineDescription,
        price: parseFloat(medicinePrice),
        dosage_limit: medicineDosage,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5b474b2f0?w=400&h=300&fit=crop&crop=center'
      };

      const { error } = await MedicineService.createMedicine(medicine);
      if (error) throw error;

      setMedicineMessage('✅ Medicine added successfully!');
      setMedicineName('');
      setMedicineDescription('');
      setMedicinePrice('');
      setMedicineDosage('');
      setMedicineImage(null);
      setShowMedicineForm(false);
      
      showToast('Medicine added successfully!', 'success');
      loadMedicines();
    } catch (error) {
      setMedicineMessage(`❌ Error: ${error.message}`);
      showToast(`Error: ${error.message}`, 'error');
    } finally {
      setIsMedicineSubmitting(false);
    }
  };

  const deleteMedicine = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        const { error } = await MedicineService.deleteMedicine(id);
        if (error) throw error;
        
        showToast('Medicine deleted successfully!', 'success');
        loadMedicines();
      } catch (error) {
        showToast(`Error deleting medicine: ${error.message}`, 'error');
      }
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Debug logging
  console.log('AdminDashboard - Auth State:', { 
    loading, 
    isAuthenticated, 
    isAdmin, 
    userEmail: user?.email,
    isAdminUser 
  });

  if (loading) {
    return (
      <div className="admin-page">
        <Header />
        <main className="admin-main">
          <div className="admin-container">
            <div className="admin-card">
              <div className="loading-state">
                <div className="loading-spinner-large"></div>
                <h3>Loading Dashboard...</h3>
                <p>Please wait while we load your admin dashboard.</p>
                <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                  Checking authentication status...
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // For development/testing - allow access if user is authenticated
  // In production, you should have proper admin role management
  const allowAccess = isAuthenticated && (isAdminUser || process.env.NODE_ENV === 'development');
  
  // Temporary admin access for testing
  const [tempAdminAccess, setTempAdminAccess] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="admin-page">
        <Header />
        <main className="admin-main">
          <div className="admin-container">
            <div className="admin-card unauthorized-card">
              <div className="unauthorized-content">
                <div className="unauthorized-icon">🔐</div>
                <h2>Authentication Required</h2>
                <p>Please sign in to access the admin dashboard.</p>
                <button className="btn-primary" onClick={() => navigate('/signin')}>
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!allowAccess && !tempAdminAccess) {
    return (
      <div className="admin-page">
        <Header />
        <main className="admin-main">
          <div className="admin-container">
            <div className="admin-card unauthorized-card">
              <div className="unauthorized-content">
                <div className="unauthorized-icon">🚫</div>
                <h2>Access Denied</h2>
                <p>You are not authorized to view this page.</p>
                <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                  Admin access required. Contact administrator if you believe this is an error.
                </div>
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button className="btn-primary" onClick={() => navigate('/')}>
                    Return to Home
                  </button>
                  <button 
                    className="btn-secondary" 
                    onClick={() => setTempAdminAccess(true)}
                    style={{ fontSize: '0.875rem' }}
                  >
                    🔓 Demo Access (Testing)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`admin-page ${darkMode ? 'dark-mode' : ''}`}>
      <Header />
      <main className="admin-main">
        <div className="admin-container">
          {/* Dashboard Header */}
          <div className="dashboard-header">
            <div className="header-content">
              <div className="header-text">
                <h1 className="dashboard-title">Medicine Management Dashboard</h1>
                <p className="dashboard-subtitle">Manage medicines in your healthcare platform</p>
              </div>
              <div className="header-actions">
                <button 
                  className="dark-mode-toggle"
                  onClick={() => setDarkMode(!darkMode)}
                  title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {darkMode ? '☀️' : '🌙'}
                </button>
                <button className="btn-secondary" onClick={() => navigate('/')}>
                  <span className="btn-icon">👁️</span>
                  View Site
                </button>
              </div>
            </div>
          </div>

          {/* Dashboard Stats Overview */}
          <div className="stats-overview">
            <div className="stat-card">
              <div className="stat-icon">💊</div>
              <div className="stat-content">
                <div className="stat-number">{dashboardStats.totalMedicines}</div>
                <div className="stat-label">Total Medicines</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <div className="stat-number">{dashboardStats.lowStock}</div>
                <div className="stat-label">Low Stock</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <div className="stat-number">{dashboardStats.expiringSoon}</div>
                <div className="stat-label">Expiring Soon</div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="search-section">
            <div className="search-container">
              <div className="search-icon">🔍</div>
              <input
                type="text"
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {/* Medicine Management Section */}
          <div className="content-section">
            <div className="section-header">
              <h2 className="section-title">Medicine Management</h2>
              <p className="section-subtitle">Add and manage medicines in your inventory</p>
            </div>

            {/* Add Medicine Form */}
            {showMedicineForm && (
              <div className="admin-card">
                <form onSubmit={handleMedicineSubmit} className="admin-form">
                  {/* Basic Info Card */}
                  <div className="form-card">
                    <div className="form-card-header">
                      <div className="card-icon">💊</div>
                      <h3>Medicine Information</h3>
                    </div>
                    <div className="form-card-content">
                      <div className="form-row">
                        <div className="form-field">
                          <label className="form-label">Medicine Name</label>
                          <input 
                            className="form-input" 
                            value={medicineName} 
                            onChange={(e) => setMedicineName(e.target.value)} 
                            required 
                            placeholder="e.g., Paracetamol 500mg" 
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Description</label>
                          <textarea 
                            className="form-textarea" 
                            value={medicineDescription} 
                            onChange={(e) => setMedicineDescription(e.target.value)} 
                            rows={4} 
                            placeholder="Detailed description of the medicine..." 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Dosage Card */}
                  <div className="form-card">
                    <div className="form-card-header">
                      <div className="card-icon">💉</div>
                      <h3>Pricing & Dosage</h3>
                    </div>
                    <div className="form-card-content">
                      <div className="form-row two-col">
                        <div className="form-field">
                          <label className="form-label">Price (₹)</label>
                          <input 
                            className="form-input" 
                            type="number" 
                            min="0" 
                            step="0.01" 
                            value={medicinePrice} 
                            onChange={(e) => setMedicinePrice(e.target.value)} 
                            required 
                            placeholder="e.g., 25.00" 
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Dosage Instructions</label>
                          <input 
                            className="form-input" 
                            value={medicineDosage} 
                            onChange={(e) => setMedicineDosage(e.target.value)} 
                            placeholder="e.g., Take 1-2 tablets every 4-6 hours" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Image Upload Card */}
                  <div className="form-card">
                    <div className="form-card-header">
                      <div className="card-icon">🖼️</div>
                      <h3>Medicine Image</h3>
                    </div>
                    <div className="form-card-content">
                      <div className="form-field">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleMedicineImageChange}
                          className="file-input-simple"
                        />
                        <div className="helper-text">Upload a clear image of the medicine (optional)</div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="form-actions">
                    <button 
                      className="btn-secondary" 
                      type="button" 
                      onClick={() => setShowMedicineForm(false)}
                    >
                      <span className="btn-icon">❌</span>
                      Cancel
                    </button>
                    <button 
                      className="btn-primary" 
                      type="submit" 
                      disabled={isMedicineSubmitting}
                    >
                      {isMedicineSubmitting ? (
                        <>
                          <span className="loading-spinner"></span>
                          Adding...
                        </>
                      ) : (
                        <>
                          <span className="btn-icon">✅</span>
                          Add Medicine
                        </>
                      )}
                    </button>
                  </div>

                  {medicineMessage && (
                    <div className={`status-message ${medicineMessage.startsWith('✅') ? 'success' : 'error'}`}>
                      {medicineMessage}
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Medicines List */}
            <div className="medicines-section">
              <div className="medicines-header">
                <div className="medicines-title">
                  <h3>Current Medicines</h3>
                  <span className="medicines-count">({filteredMedicines.length})</span>
                </div>
                <button 
                  className="btn-primary floating-action"
                  onClick={() => setShowMedicineForm(!showMedicineForm)}
                >
                  <span className="btn-icon">+</span>
                  {showMedicineForm ? 'Cancel' : 'Add New Medicine'}
                </button>
              </div>

              {filteredMedicines.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">💊</div>
                  <h4>No medicines found</h4>
                  <p>{searchTerm ? 'Try adjusting your search terms' : 'Add your first medicine to get started!'}</p>
                  {!searchTerm && (
                    <button 
                      className="btn-primary"
                      onClick={() => setShowMedicineForm(true)}
                    >
                      <span className="btn-icon">+</span>
                      Add First Medicine
                    </button>
                  )}
                </div>
              ) : (
                <div className="medicines-grid">
                  {filteredMedicines.map((medicine) => (
                    <div key={medicine.id} className="medicine-card">
                      <div className="medicine-image">
                        <img 
                          src={medicine.image_url} 
                          alt={medicine.name}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5b474b2f0?w=400&h=300&fit=crop&crop=center';
                          }}
                        />
                      </div>
                      <div className="medicine-info">
                        <h4 className="medicine-name">{medicine.name}</h4>
                        <p className="medicine-price">₹{medicine.price}</p>
                        <p className="medicine-description">{medicine.description}</p>
                        {medicine.dosage_limit && (
                          <p className="medicine-dosage">
                            <strong>Dosage:</strong> {medicine.dosage_limit}
                          </p>
                        )}
                        <div className="medicine-actions">
                          <button 
                            className="btn-danger"
                            onClick={() => deleteMedicine(medicine.id)}
                          >
                            <span className="btn-icon">🗑️</span>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' ? '✅' : '❌'}
          </div>
          <div className="toast-message">{toast.message}</div>
          <button 
            className="toast-close"
            onClick={() => setToast({ show: false, message: '', type: 'success' })}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;


