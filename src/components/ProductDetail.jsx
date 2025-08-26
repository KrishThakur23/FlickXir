import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../config/supabase';
import Header from '../Header';
import Footer from '../Footer';
import './ProductDetail.css';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchRelatedProducts();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name, description, slug)
        `)
        .eq('id', productId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Product not found');
        } else {
          throw error;
        }
      } else {
        setProduct(data);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', product?.category_id)
        .eq('is_active', true)
        .eq('in_stock', true)
        .neq('id', productId)
        .limit(4);

      if (!error && data) {
        setRelatedProducts(data);
      }
    } catch (err) {
      console.error('Error fetching related products:', err);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({ ...product, quantity });
      // Show success message or redirect to cart
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock_quantity || 10)) {
      setQuantity(newQuantity);
    }
  };

  const handleImageClick = (index) => {
    setSelectedImage(index);
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading product...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <Header />
        <div className="error-container">
          <h2>Product Not Found</h2>
          <p>{error || 'The product you are looking for does not exist.'}</p>
          <button onClick={() => navigate('/')} className="back-home-btn">
            Back to Home
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Handle multiple images (if product has image_urls array)
  const productImages = product.image_urls && Array.isArray(product.image_urls) 
    ? product.image_urls 
    : [product.image_url];

  return (
    <div className="product-detail-page">
      <Header />
      
      <main className="product-detail-main">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <span onClick={() => navigate('/')} className="breadcrumb-link">Home</span>
            <span className="breadcrumb-separator">/</span>
            <span onClick={() => navigate(`/category/${product.category?.slug}`)} className="breadcrumb-link">
              {product.category?.name}
            </span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{product.name}</span>
          </nav>

          {/* Product Details */}
          <div className="product-detail-container">
            {/* Product Images */}
            <div className="product-images">
              <div className="main-image">
                <img 
                  src={productImages[selectedImage]} 
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5b474b2f0?w=500&h=500&fit=crop&crop=center';
                  }}
                />
              </div>
              {productImages.length > 1 && (
                <div className="thumbnail-images">
                  {productImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                      onClick={() => handleImageClick(index)}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5b474b2f0?w=100&h=100&fit=crop&crop=center';
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="product-info">
              <h1 className="product-title">{product.name}</h1>
              
              <div className="product-category">
                <span className="category-tag">{product.category?.name}</span>
              </div>

              <div className="product-price-section">
                <span className="current-price">₹{product.price}</span>
                {product.original_price && product.original_price > product.price && (
                  <span className="original-price">₹{product.original_price}</span>
                )}
                {product.original_price && product.original_price > product.price && (
                  <span className="discount">
                    {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                  </span>
                )}
              </div>

              <div className="product-description">
                <p>{product.description}</p>
              </div>

              {/* Product Specifications */}
              <div className="product-specs">
                {product.strength && (
                  <div className="spec-item">
                    <span className="spec-label">Strength:</span>
                    <span className="spec-value">{product.strength}</span>
                  </div>
                )}
                {product.dosage_form && (
                  <div className="spec-item">
                    <span className="spec-label">Dosage Form:</span>
                    <span className="spec-value">{product.dosage_form}</span>
                  </div>
                )}
                {product.manufacturer && (
                  <div className="spec-item">
                    <span className="spec-label">Manufacturer:</span>
                    <span className="spec-value">{product.manufacturer}</span>
                  </div>
                )}
                {product.sku && (
                  <div className="spec-item">
                    <span className="spec-label">SKU:</span>
                    <span className="spec-value">{product.sku}</span>
                  </div>
                )}
              </div>

              {/* Stock Status */}
              <div className="stock-status">
                {product.in_stock ? (
                  <span className="in-stock">✅ In Stock</span>
                ) : (
                  <span className="out-of-stock">❌ Out of Stock</span>
                )}
                {product.stock_quantity > 0 && (
                  <span className="stock-quantity">({product.stock_quantity} available)</span>
                )}
              </div>

              {/* Prescription Required */}
              {product.prescription_required && (
                <div className="prescription-notice">
                  <span className="prescription-icon">📋</span>
                  <span>Prescription Required</span>
                </div>
              )}

              {/* Add to Cart Section */}
              <div className="add-to-cart-section">
                <div className="quantity-selector">
                  <label htmlFor="quantity">Quantity:</label>
                  <div className="quantity-controls">
                    <button 
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="quantity-btn"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      min="1"
                      max={product.stock_quantity || 10}
                      className="quantity-input"
                    />
                    <button 
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= (product.stock_quantity || 10)}
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button 
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                  className="add-to-cart-btn"
                >
                  {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>

              {/* Product Actions */}
              <div className="product-actions">
                <button className="wishlist-btn">
                  <span>❤️</span> Add to Wishlist
                </button>
                <button className="share-btn">
                  <span>📤</span> Share
                </button>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="related-products">
              <h2>Related Products</h2>
              <div className="related-products-grid">
                {relatedProducts.map((relatedProduct) => (
                  <div 
                    key={relatedProduct.id} 
                    className="related-product-card"
                    onClick={() => navigate(`/product/${relatedProduct.id}`)}
                  >
                    <img 
                      src={relatedProduct.image_url} 
                      alt={relatedProduct.name}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5b474b2f0?w=200&h=200&fit=crop&crop=center';
                      }}
                    />
                    <h3>{relatedProduct.name}</h3>
                    <p className="related-product-price">₹{relatedProduct.price}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
