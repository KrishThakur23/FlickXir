import React, { useState, useEffect } from 'react';
import ProductService from '../services/productService';
import './Medicines.css';

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      // Filter products to get only medicines/healthcare products
      const { data, error } = await ProductService.getProducts({ 
        category: 'medicines', // or whatever category ID you use for medicines
        limit: 50 
      });
      if (error) throw error;
      setMedicines(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (medicine) => {
    setSelectedMedicine(medicine);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMedicine(null);
  };

  if (loading) {
    return (
      <div className="medicines-page">
        <div className="medicines-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading medicines...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="medicines-page">
        <div className="medicines-container">
          <div className="error-state">
            <p>Error: {error}</p>
            <button onClick={fetchMedicines} className="retry-btn">Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="medicines-page">
      <div className="medicines-container">
        <div className="medicines-header">
          <h1>Our Medicines</h1>
          <p>Browse our comprehensive collection of medicines and healthcare products</p>
        </div>

        {medicines.length === 0 ? (
          <div className="no-medicines">
            <p>No medicines available at the moment.</p>
          </div>
        ) : (
          <div className="medicines-grid">
            {medicines.map((medicine) => (
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
                <div className="medicine-content">
                  <h3 className="medicine-name">{medicine.name}</h3>
                  <p className="medicine-description">
                    {medicine.description}
                  </p>
                  {medicine.dosage_limit && (
                    <div className="medicine-dosage">
                      <strong>Dosage:</strong> {medicine.dosage_limit}
                    </div>
                  )}
                  <div className="medicine-price">₹{medicine.price}</div>
                  <button 
                    onClick={() => openModal(medicine)}
                    className="view-details-btn"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Medicine Details Modal */}
      {showModal && selectedMedicine && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <div className="modal-body">
              <div className="modal-image">
                <img 
                  src={selectedMedicine.image_url} 
                  alt={selectedMedicine.name}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5b474b2f0?w=400&h=300&fit=crop&crop=center';
                  }}
                />
              </div>
              <div className="modal-info">
                <h2>{selectedMedicine.name}</h2>
                <p className="modal-description">{selectedMedicine.description}</p>
                {selectedMedicine.dosage_limit && (
                  <div className="modal-dosage">
                    <h3>Dosage Instructions:</h3>
                    <p>{selectedMedicine.dosage_limit}</p>
                  </div>
                )}
                <div className="modal-price">₹{selectedMedicine.price}</div>
                <button className="add-to-cart-btn">Add to Cart</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Medicines;
