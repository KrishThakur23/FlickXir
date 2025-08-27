import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useCart } from './contexts/CartContext';
import { addressService } from './services/addressService';
import './Checkout.css';

const Checkout = () => {
  const { user } = useAuth();
  const { items, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    is_default: false
  });

  const shippingCost = getCartTotal > 500 ? 0 : 50;
  const totalAmount = getCartTotal + shippingCost;

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    fetchAddresses();
  }, [user, items, navigate]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await addressService.getUserAddresses(user.id);
      setAddresses(data);
      
      // Auto-select default address if available
      const defaultAddress = data.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (data.length > 0) {
        setSelectedAddress(data[0]);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const addressData = {
        user_id: user.id,
        ...newAddress
      };

      await addressService.addAddress(addressData);
      
      // Reset form and refresh addresses
      setNewAddress({
        name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
        is_default: false
      });
      setShowAddressForm(false);
      
      // Refresh addresses and select the newly created one
      await fetchAddresses();
      
      // Select the newly created address
      const newAddresses = await addressService.getUserAddresses(user.id);
      const newlyCreated = newAddresses[newAddresses.length - 1];
      setSelectedAddress(newlyCreated);
    } catch (error) {
      console.error('Error adding address:', error);
      alert('Failed to add address. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProceedToPayment = () => {
    if (!selectedAddress) {
      alert('Please select or create an address to continue.');
      return;
    }
    
    // Here you would typically navigate to payment page or process payment
    // For now, we'll just show a success message
    alert('Proceeding to payment with selected address!');
    console.log('Selected address:', selectedAddress);
    console.log('Order total:', totalAmount);
  };

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <p>Complete your order by providing delivery details</p>
        </div>

        <div className="checkout-content">
          {/* Address Selection Section */}
          <div className="checkout-section">
            <div className="section-header">
              <h2>Delivery Address</h2>
              {addresses.length > 0 && (
                <button 
                  className="add-new-address-btn"
                  onClick={() => setShowAddressForm(!showAddressForm)}
                >
                  {showAddressForm ? 'Cancel' : '+ Add New Address'}
                </button>
              )}
            </div>

            {/* Show existing addresses if available */}
            {addresses.length > 0 && !showAddressForm && (
              <div className="addresses-grid">
                {addresses.map((address) => (
                  <div 
                    key={address.id} 
                    className={`address-card ${selectedAddress?.id === address.id ? 'selected' : ''}`}
                    onClick={() => setSelectedAddress(address)}
                  >
                    <div className="address-header">
                      <h3>{address.name}</h3>
                      {address.is_default && <span className="default-badge">Default</span>}
                    </div>
                    <p className="address-phone">{address.phone}</p>
                    <p className="address-line">{address.address_line1}</p>
                    {address.address_line2 && (
                      <p className="address-line">{address.address_line2}</p>
                    )}
                    <p className="address-city">{address.city}, {address.state} {address.pincode}</p>
                    <div className="address-actions">
                      <button 
                        className="select-address-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAddress(address);
                        }}
                      >
                        {selectedAddress?.id === address.id ? '✓ Selected' : 'Select'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Address Form */}
            {showAddressForm && (
              <div className="add-address-form">
                <h3>Add New Address</h3>
                <form onSubmit={handleAddressSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Full Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={newAddress.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number *</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={newAddress.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="address_line1">Address Line 1 *</label>
                    <input
                      type="text"
                      id="address_line1"
                      name="address_line1"
                      value={newAddress.address_line1}
                      onChange={handleInputChange}
                      required
                      placeholder="Street address, apartment, suite, etc."
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="address_line2">Address Line 2</label>
                    <input
                      type="text"
                      id="address_line2"
                      name="address_line2"
                      value={newAddress.address_line2}
                      onChange={handleInputChange}
                      placeholder="Apartment, suite, unit, etc. (optional)"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="city">City *</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={newAddress.city}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter city name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="state">State *</label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={newAddress.state}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter state name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="pincode">Pincode *</label>
                      <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        value={newAddress.pincode}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter pincode"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="is_default"
                        checked={newAddress.is_default}
                        onChange={handleInputChange}
                      />
                      <span className="checkmark"></span>
                      Set as default address
                    </label>
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={() => setShowAddressForm(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Save Address
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* No addresses message */}
            {addresses.length === 0 && !showAddressForm && (
              <div className="no-addresses">
                <div className="no-addresses-icon">📍</div>
                <h3>No addresses found</h3>
                <p>Please add a delivery address to continue with your order.</p>
                <button 
                  className="btn-primary"
                  onClick={() => setShowAddressForm(true)}
                >
                  + Add Your First Address
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Section */}
          <div className="checkout-section">
            <h2>Order Summary</h2>
            <div className="order-summary">
              <div className="summary-items">
                {items.map((item) => (
                  <div key={item.id} className="summary-item">
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                    </div>
                    <span className="item-price">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              
              <div className="summary-totals">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>₹{getCartTotal}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping:</span>
                  <span className={shippingCost === 0 ? 'free-shipping' : ''}>
                    {shippingCost === 0 ? 'Free' : `₹${shippingCost}`}
                  </span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Actions */}
          <div className="checkout-actions">
            <button 
              className="btn-secondary"
              onClick={() => navigate('/cart')}
            >
              ← Back to Cart
            </button>
            
            <button 
              className="btn-primary checkout-btn"
              onClick={handleProceedToPayment}
              disabled={!selectedAddress}
            >
              {selectedAddress ? 'Proceed to Payment' : 'Select Address to Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
