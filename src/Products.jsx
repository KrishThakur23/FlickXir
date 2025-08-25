import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './config/supabase';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Load products and categories on component mount
  useEffect(() => {
    // Add a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    const loadCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*");

        if (error) {
          setCategories([]);
        } else {
          setCategories(data || []);
        }
      } catch (err) {
        setCategories([]);
      }
    };

    const loadProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*");
    
        if (error) {
          setProducts([]);
        } else {
          setProducts(data || []);
        }
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
        clearTimeout(loadingTimeout);
      }
    };
    
    loadCategories();
    loadProducts();
    
    // Load cart if user is authenticated
    if (isAuthenticated) {
      loadCartItems();
    }
    
    // Cleanup function
    return () => {
      clearTimeout(loadingTimeout);
    };
  }, [isAuthenticated]);

  const loadCartItems = async () => {
    if (!isAuthenticated || !user) return;

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (*)
        `)
        .eq('user_id', user.id);

      if (error) {
        setCartItems([]);
      } else {
        setCartItems(data || []);
      }
    } catch (err) {
      setCartItems([]);
    }
  };

  const addToCart = async (product) => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    try {
      // Check if item already exists in cart
      const existingItem = cartItems.find(item => item.product_id === product.id);
      
      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        // Add new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: 1,
            price: product.price
          });

        if (error) throw error;
      }

      // Reload cart items
      loadCartItems();
      
      // Show success message
      alert('Product added to cart!');
    } catch (error) {
      alert('Failed to add product to cart');
    }
  };

  // Filter products based on category and search
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || 
      getProductCategoryName(product) === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Get category name from product
  const getProductCategoryName = (product) => {
    // Find category directly from categories array
    if (product.category_id && categories.length > 0) {
      const category = categories.find(cat => cat.id === product.category_id);
      return category ? category.name : 'Uncategorized';
    }
    return 'Uncategorized';
  };

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="products-loading">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-hero">
        <h1>Our Products</h1>
        <p>Discover our range of healthcare products</p>
      </div>

      <div className="products-container">
        {/* Filters and Search */}
        <div className="products-filters">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="category-filters">
            <button
              className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All Products
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-btn ${selectedCategory === category.name ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.name)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {filteredProducts.length === 0 ? (
            <div className="no-products">
              <p>No products found matching your criteria.</p>
            </div>
          ) : (
            filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  {product.image_urls && product.image_urls.length > 0 ? (
                    <img 
                      src={product.image_urls[0]} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = '/placeholder-product.jpg';
                      }}
                    />
                  ) : (
                    <div className="placeholder-image">
                      <span>📦</span>
                    </div>
                  )}
                  <div className="product-category">
                    {getProductCategoryName(product)}
                  </div>
                </div>

                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  
                  <div className="product-meta">
                    <span className="product-price">${product.price}</span>
                    <span className={`product-stock ${product.in_stock ? 'in-stock' : 'out-of-stock'}`}>
                      {product.in_stock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  <button
                    className={`add-to-cart-btn ${!product.in_stock ? 'disabled' : ''}`}
                    onClick={() => addToCart(product)}
                    disabled={!product.in_stock}
                  >
                    {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>


      </div>
    </div>
  );
};

export default Products;

