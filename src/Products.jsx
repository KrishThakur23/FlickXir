import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const [diseaseFilter, setDiseaseFilter] = useState(null);
  const [categoryIdsFilter, setCategoryIdsFilter] = useState([]);
  const [keywordsFilter, setKeywordsFilter] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(-1);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

      // Load products and categories on component mount
  useEffect(() => {
    // Handle URL parameters for filtering
    const urlCategory = searchParams.get('category');
    const urlDisease = searchParams.get('disease');
    const urlCategoryIds = searchParams.get('categoryIds');
    const urlKeywords = searchParams.get('keywords');
    
    if (urlCategory) {
      // Map URL category to actual category name
      if (urlCategory === 'medicines') {
        setSelectedCategory('Medicine');
      } else if (urlCategory === 'healthcare') {
        setSelectedCategory('Healthcare');
      } else {
        setSelectedCategory(urlCategory);
      }
    }
    if (urlDisease) {
      setDiseaseFilter(urlDisease);
    }
    if (urlCategoryIds) {
      setCategoryIdsFilter(urlCategoryIds.split(','));
    }
    if (urlKeywords) {
      setKeywordsFilter(urlKeywords.split(','));
    }
    
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
          .select(`
            *,
            categories(name, description)
          `);
    
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
      // First get the user's cart, then get cart items
      const { data: cartData, error: cartError } = await supabase
        .from('cart')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (cartError) {
        setCartItems([]);
        return;
      }

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (*)
        `)
        .eq('cart_id', cartData.id);

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
        // Add new item - first ensure user has a cart
        let cartId;
        const { data: existingCart, error: cartError } = await supabase
          .from('cart')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (cartError || !existingCart) {
          // Create cart if it doesn't exist
          const { data: newCart, error: createCartError } = await supabase
            .from('cart')
            .insert({ user_id: user.id })
            .select('id')
            .single();

          if (createCartError) throw createCartError;
          cartId = newCart.id;
        } else {
          cartId = existingCart.id;
        }

        // Now add the cart item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            cart_id: cartId,
            product_id: product.id,
            quantity: 1
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

  // Helper functions
  const getProductCategoryName = (product) => {
    return product.categories?.name || 'Uncategorized';
  };

  const getCategoryName = (categoryId) => {
    if (categoryId && categories.length > 0) {
      const category = categories.find(cat => cat.id === categoryId);
      return category ? category.name : 'Uncategorized';
    }
    return 'Uncategorized';
  };

  // Search functionality
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedSearchIndex(-1);
    
    if (query.trim() === '') {
      setSearchResults([]);
      setShowSearchDropdown(false);
    } else {
      const results = products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
      setShowSearchDropdown(true);
    }
  };

  const handleSearchResultClick = (product) => {
    setSearchQuery('');
    setShowSearchDropdown(false);
    setSearchResults([]);
    navigate(`/product/${product.id}`);
  };

  // Filter products based on category, search, and disease filters
  const filteredProducts = products.filter(product => {
    // Basic category and search filtering
    let matchesCategory = true;
    if (selectedCategory === 'all') {
      matchesCategory = true;
    } else if (selectedCategory === 'Medicine') {
      // For Medicine category, show all products (no category restriction)
      matchesCategory = true;
    } else {
      matchesCategory = getProductCategoryName(product) === selectedCategory;
    }
    
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Disease-based filtering
    let matchesDisease = true;
    if (diseaseFilter || categoryIdsFilter.length > 0 || keywordsFilter.length > 0) {
      // Check if product matches category IDs
      if (categoryIdsFilter.length > 0) {
        matchesDisease = categoryIdsFilter.includes(product.category_id);
      }
      
      // Check if product matches keywords
      if (keywordsFilter.length > 0 && matchesDisease) {
        const productText = `${product.name} ${product.description}`.toLowerCase();
        matchesDisease = keywordsFilter.some(keyword => 
          productText.includes(keyword.toLowerCase())
        );
      }
    }
    
    return matchesCategory && matchesSearch && matchesDisease;
  });

  // Clear disease filters
  const clearDiseaseFilters = () => {
    setDiseaseFilter(null);
    setCategoryIdsFilter([]);
    setKeywordsFilter([]);
    // Update URL to remove disease parameters
    const params = new URLSearchParams(searchParams);
    params.delete('disease');
    params.delete('categoryIds');
    params.delete('keywords');
    navigate(`/products?${params.toString()}`);
  };

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-bar')) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
              onChange={handleSearchChange}
              onFocus={() => {
                if (searchQuery.trim() !== '') {
                  setShowSearchDropdown(true);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setSelectedSearchIndex(prev => 
                    prev < searchResults.length - 1 ? prev + 1 : prev
                  );
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setSelectedSearchIndex(prev => prev > 0 ? prev - 1 : -1);
                } else if (e.key === 'Enter' && selectedSearchIndex >= 0) {
                  e.preventDefault();
                  handleSearchResultClick(searchResults[selectedSearchIndex]);
                } else if (e.key === 'Escape') {
                  setShowSearchDropdown(false);
                  setSelectedSearchIndex(-1);
                }
              }}
            />
            
            {/* Search Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="search-dropdown">
                {searchResults.slice(0, 5).map((product, index) => (
                  <div
                    key={product.id}
                    className={`search-result-item ${index === selectedSearchIndex ? 'selected' : ''}`}
                    onClick={() => handleSearchResultClick(product)}
                    onMouseEnter={() => setSelectedSearchIndex(index)}
                  >
                    <div className="search-result-image">
                      <img 
                        src={product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : '/placeholder-product.jpg'} 
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = '/placeholder-product.jpg';
                        }}
                      />
                    </div>
                    <div className="search-result-info">
                      <div className="search-result-name">{product.name}</div>
                      <div className="search-result-category">{getProductCategoryName(product)}</div>
                      <div className="search-result-price">${product.price}</div>
                    </div>
                  </div>
                ))}
                {searchResults.length > 5 && (
                  <div className="search-result-more">
                    +{searchResults.length - 5} more results
                  </div>
                )}
              </div>
            )}
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

        {/* Filter Summary */}
        {(diseaseFilter || categoryIdsFilter.length > 0 || keywordsFilter.length > 0) && (
          <div className="filter-summary">
            <div className="active-filters">
              {diseaseFilter && (
                <span className="filter-tag">
                  Disease: {diseaseFilter}
                  <button onClick={clearDiseaseFilters} className="clear-filter-btn">×</button>
                </span>
              )}
              {categoryIdsFilter.length > 0 && (
                <span className="filter-tag">
                  Categories: {categoryIdsFilter.length} selected
                  <button onClick={clearDiseaseFilters} className="clear-filter-btn">×</button>
                </span>
              )}
              {keywordsFilter.length > 0 && (
                <span className="filter-tag">
                  Keywords: {keywordsFilter.join(', ')}
                  <button onClick={clearDiseaseFilters} className="clear-filter-btn">×</button>
                </span>
              )}
            </div>
            <button onClick={clearDiseaseFilters} className="clear-all-filters-btn">
              Clear All Filters
            </button>
          </div>
        )}

        {/* Products Grid */}
        <div className="products-grid">
          {filteredProducts.length === 0 ? (
            <div className="no-products">
              <p>No products found matching your criteria.</p>
            </div>
          ) : (
            filteredProducts.map(product => (
              <div 
                key={product.id} 
                className="product-card"
                onClick={() => navigate(`/product/${product.id}`)}
                style={{ cursor: 'pointer' }}
              >
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
                      <span className="category-tag">{getProductCategoryName(product)}</span>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
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

