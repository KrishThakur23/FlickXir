import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from './contexts/AuthContext';
import { supabase } from './config/supabase';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, user } = useAuth();
  // You can change this email to your own admin email
  const ADMIN_EMAIL = 'bhalackdhebil@gmail.com'; // Change this to your email
  const isAdminUser = user?.email ? user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() : false;

  // Product state
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productImage, setProductImage] = useState(null);
  const [isProductSubmitting, setIsProductSubmitting] = useState(false);
  const [productMessage, setProductMessage] = useState('');
  const [products, setProducts] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [categories, setCategories] = useState([]);

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalProducts: 0,
    totalCategories: 0
  });

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('products');

  // Toast notifications
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Load products and categories on component mount
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // Update dashboard stats
  useEffect(() => {
    updateDashboardStats();
  }, [products, categories]);

  const updateDashboardStats = () => {
    setDashboardStats({
      totalProducts: products.length,
      totalCategories: categories.length
    });
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  // Product handlers
  const handleProductImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductImage(file);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setProductMessage('');
    setIsProductSubmitting(true);
    
    try {
      let imageUrl = null;
      if (productImage) {
        // For now, use a placeholder image URL
        // In production, you'd want to implement proper image upload
        imageUrl = 'https://images.unsplash.com/photo-1584308666744-24d5b474b2f0?w=400&h=300&fit=crop&crop=center';
      }

      // Find category ID from selected category name
      const selectedCategory = categories.find(cat => cat.name === productCategory);
      const categoryId = selectedCategory ? selectedCategory.id : null;

      const product = {
        name: productName,
        description: productDescription,
        price: parseFloat(productPrice),
        category_id: categoryId,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5b474b2f0?w=400&h=300&fit=crop&crop=center',
        in_stock: true,
        is_active: true
      };

      const { error } = await supabase
        .from('products')
        .insert([product]);

      if (error) throw error;

      setProductMessage('✅ Product added successfully!');
      setProductName('');
      setProductDescription('');
      setProductPrice('');
      setProductCategory('');
      setProductImage(null);
      setShowProductForm(false);
      
      showToast('Product added successfully!', 'success');
      loadProducts();
    } catch (error) {
      setProductMessage(`❌ Error: ${error.message}`);
      showToast(`Error: ${error.message}`, 'error');
    } finally {
      setIsProductSubmitting(false);
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        showToast('Product deleted successfully!', 'success');
        loadProducts();
      } catch (error) {
        showToast(`Error deleting product: ${error.message}`, 'error');
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    // Only redirect if we're done loading
    if (!loading) {
      if (!isAuthenticated || !isAdminUser) {
        navigate('/');
      }
    }
  }, [loading, isAuthenticated, isAdminUser, navigate]);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdminUser) {
    return null;
  }

  return (
    <div className={`admin-page ${darkMode ? 'dark-mode' : ''}`}>
      <main className="admin-main">
        <div className="admin-container">
          {/* Dashboard Header */}
          <div className="dashboard-header">
            <div className="header-content">
              <div className="header-text">
                <div className="header-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="9" y1="9" x2="15" y2="9"/>
                    <line x1="9" y1="12" x2="15" y2="12"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                  </svg>
                </div>
                <div>
                  <h1 className="dashboard-title">Dashboard</h1>
                  <p className="dashboard-subtitle">Manage your products and orders with ease</p>
                </div>
              </div>
              <div className="header-actions">
                <button 
                  className="dark-mode-toggle"
                  onClick={() => setDarkMode(!darkMode)}
                  title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {darkMode ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="5"/>
                      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Dashboard Tabs */}
          <div className="dashboard-tabs">
            <button 
              className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
              Products
            </button>
            <button 
              className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Orders (0)
            </button>
          </div>

          {/* Products Tab Content */}
          {activeTab === 'products' && (
            <>
              {/* Products Section */}
              <div className="products-section">
                <div className="products-header">
                  <div className="products-title">
                    <h3>Your Products ({filteredProducts.length})</h3>
                  </div>
                  <button 
                    className="btn-primary add-product-btn"
                    onClick={() => setShowProductForm(!showProductForm)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Add Product
                  </button>
                </div>

                {/* Add Product Form */}
                {showProductForm && (
                  <div className="admin-card">
                    <form onSubmit={handleProductSubmit} className="admin-form">
                      {/* Basic Info Card */}
                      <div className="form-card">
                        <div className="form-card-header">
                          <div className="card-icon">📦</div>
                          <h3>Product Information</h3>
                        </div>
                        <div className="form-card-content">
                          <div className="form-row">
                            <div className="form-field">
                              <label className="form-label">Product Name</label>
                              <input 
                                className="form-input" 
                                value={productName} 
                                onChange={(e) => setProductName(e.target.value)} 
                                required 
                                placeholder="e.g., Paracetamol 500mg" 
                              />
                            </div>
                            <div className="form-field">
                              <label className="form-label">Description</label>
                              <textarea 
                                className="form-textarea" 
                                value={productDescription} 
                                onChange={(e) => setProductDescription(e.target.value)} 
                                rows={4} 
                                placeholder="Detailed description of the product..." 
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Pricing & Category Card */}
                      <div className="form-card">
                        <div className="form-card-header">
                          <div className="card-icon">💰</div>
                          <h3>Pricing & Category</h3>
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
                                value={productPrice} 
                                onChange={(e) => setProductPrice(e.target.value)} 
                                required 
                                placeholder="e.g., 25.00" 
                              />
                            </div>
                            <div className="form-field">
                              <label className="form-label">Category</label>
                              <select 
                                className="form-input" 
                                value={productCategory} 
                                onChange={(e) => setProductCategory(e.target.value)} 
                                required
                              >
                                <option value="">Select a category</option>
                                {categories.map(category => (
                                  <option key={category.id} value={category.name}>
                                    {category.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Image Upload Card */}
                      <div className="form-card">
                        <div className="form-card-header">
                          <div className="card-icon">🖼️</div>
                          <h3>Product Image</h3>
                        </div>
                        <div className="form-card-content">
                          <div className="form-field">
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleProductImageChange}
                              className="file-input-simple"
                            />
                            <div className="helper-text">Upload a clear image of the product (optional)</div>
                          </div>
                        </div>
                      </div>

                      {/* Form Actions */}
                      <div className="form-actions">
                        <button 
                          className="btn-secondary" 
                          type="button" 
                          onClick={() => setShowProductForm(false)}
                        >
                          <span className="btn-icon">❌</span>
                          Cancel
                        </button>
                        <button 
                          className="btn-primary" 
                          type="submit" 
                          disabled={isProductSubmitting}
                        >
                          {isProductSubmitting ? (
                            <>
                              <span className="loading-spinner"></span>
                              Adding...
                            </>
                          ) : (
                            <>
                              <span className="btn-icon">✅</span>
                              Add Product
                            </>
                          )}
                        </button>
                      </div>

                      {productMessage && (
                        <div className={`status-message ${productMessage.startsWith('✅') ? 'success' : 'error'}`}>
                          {productMessage}
                        </div>
                      )}
                    </form>
                  </div>
                )}

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <h4>No products found</h4>
                    <p>{searchTerm ? 'Try adjusting your search terms' : 'Add your first product to get started!'}</p>
                    {!searchTerm && (
                      <button 
                        className="btn-primary"
                        onClick={() => setShowProductForm(true)}
                      >
                        <span className="btn-icon">+</span>
                        Add First Product
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="products-grid">
                    {filteredProducts.map((product) => (
                      <div 
                        key={product.id} 
                        className="product-card"
                      >
                        <div className="product-image">
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5b474b2f0?w=400&h=300&fit=crop&crop=center';
                            }}
                          />
                          <div className="product-tag">PRODUCT</div>
                        </div>
                        <div className="product-info">
                          <h4 className="product-name">{product.name}</h4>
                          <p className="product-category">{product.categories?.name || 'Uncategorized'}</p>
                          <p className="product-price">₹{product.price}</p>
                          <p className="product-description">{product.description}</p>
                        </div>
                        <div className="product-actions">
                          <button 
                            className="btn-edit"
                            onClick={() => navigate(`/product/${product.id}`)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            Edit
                          </button>
                          <button 
                            className="btn-delete"
                            onClick={() => deleteProduct(product.id)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18"/>
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Orders Tab Content */}
          {activeTab === 'orders' && (
            <div className="orders-section">
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h4>No orders yet</h4>
                <p>Orders will appear here when customers make purchases</p>
              </div>
            </div>
          )}

          {/* Toast Notification */}
          {toast.show && (
            <div className={`toast-notification ${toast.type}`}>
              {toast.message}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;


