import React, { useState } from 'react';
import './ProductDetails.css';

const ProductDetails = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState('description');

  const product = {
    id: 1,
    name: 'Premium Coffee Beans',
    price: '$24.99',
    originalPrice: '$29.99',
    discount: '17% OFF',
    rating: 4.8,
    reviews: 234,
    image: '☕',
    category: 'Beverages',
    inStock: true,
    stockCount: 15,
    description: 'Our Premium Coffee Beans are sourced from the finest coffee plantations around the world. These beans are carefully selected and roasted to perfection to deliver a rich, smooth, and aromatic coffee experience. Perfect for coffee enthusiasts who appreciate quality and sustainability.',
    features: [
      'Single-origin arabica beans',
      'Medium roast profile',
      'Ethically sourced',
      'Fair trade certified',
      'Fresh roasted weekly',
      'Vacuum sealed packaging'
    ],
    specifications: {
      'Origin': 'Colombia, Ethiopia',
      'Roast Level': 'Medium',
      'Processing': 'Washed',
      'Altitude': '1200-1800m',
      'Harvest': 'Hand-picked',
      'Packaging': '250g sealed bag'
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stockCount) {
      setQuantity(newQuantity);
    }
  };

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'features', label: 'Features' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'reviews', label: 'Reviews' }
  ];

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">★</span>);
    }

    return stars;
  };

  return (
    <div className="product-details">
      <div className="product-details-container">
        <div className="product-gallery">
          <div className="main-image">
            <span className="product-emoji">{product.image}</span>
            {product.discount && (
              <div className="discount-badge">{product.discount}</div>
            )}
          </div>
        </div>

        <div className="product-info">
          <div className="product-header">
            <span className="product-category">{product.category}</span>
            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-rating">
              <div className="stars">
                {renderStars(product.rating)}
              </div>
              <span className="rating-text">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            <div className="product-pricing">
              <span className="current-price">{product.price}</span>
              {product.originalPrice && (
                <span className="original-price">{product.originalPrice}</span>
              )}
            </div>

            <div className="stock-info">
              {product.inStock ? (
                <span className="in-stock">
                  ✅ In Stock ({product.stockCount} available)
                </span>
              ) : (
                <span className="out-of-stock">❌ Out of Stock</span>
              )}
            </div>
          </div>

          <div className="product-actions">
            <div className="quantity-selector">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="quantity-display">{quantity}</span>
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stockCount}
                >
                  +
                </button>
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn btn-primary add-to-cart">
                Add to Cart - {(parseFloat(product.price.replace('$', '')) * quantity).toFixed(2)}
              </button>
              <button className="btn btn-outline wishlist-btn">
                ♡ Add to Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="product-tabs">
        <div className="tab-navigation">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${selectedTab === tab.id ? 'active' : ''}`}
              onClick={() => setSelectedTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {selectedTab === 'description' && (
            <div className="tab-panel">
              <h3>Product Description</h3>
              <p>{product.description}</p>
            </div>
          )}

          {selectedTab === 'features' && (
            <div className="tab-panel">
              <h3>Key Features</h3>
              <ul className="features-list">
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {selectedTab === 'specifications' && (
            <div className="tab-panel">
              <h3>Specifications</h3>
              <div className="specifications-table">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="spec-row">
                    <span className="spec-label">{key}:</span>
                    <span className="spec-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'reviews' && (
            <div className="tab-panel">
              <h3>Customer Reviews</h3>
              <div className="reviews-summary">
                <div className="rating-overview">
                  <span className="avg-rating">{product.rating}</span>
                  <div className="stars-large">
                    {renderStars(product.rating)}
                  </div>
                  <span className="total-reviews">Based on {product.reviews} reviews</span>
                </div>
              </div>
              <p className="reviews-placeholder">Individual reviews would be loaded here...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;