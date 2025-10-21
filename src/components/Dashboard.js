import React, { useState, useEffect } from 'react';
import './CustomerDashboardModern.css';
import apiService from '../services/apiService';

const Dashboard = ({ userType, user }) => {
  const [dashboardData, setDashboardData] = useState({
    companyNews: [],
    marketResearch: [],
    topProducts: [],
    invoiceStats: null,
    loading: true,
    error: ''
  });

  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState(3);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('Dashboard: Starting data fetch for userType:', userType, 'user:', user);
        setDashboardData(prev => ({ ...prev, loading: true, error: '' }));

        let companyNewsResponse, researchResponse, invoiceStatsResponse, topProductsResponse;

        if (userType === 'customer' && user?.customer_code) {
          console.log('Dashboard: Fetching customer-specific data for customer_code:', user.customer_code);
          // Fetch customer-specific data
          [companyNewsResponse, researchResponse, invoiceStatsResponse, topProductsResponse] = await Promise.all([
            // Company News = Customer's Meeting Minutes (last 3)
            apiService.getCustomerMeetings(user.customer_code, { limit: 3, sort: 'created_date', order: 'desc' }),
            // Market Reports = Customer's Market Research (last 3)
            apiService.getCustomerMarketReports(user.customer_code, { limit: 3, sort: 'created_date', order: 'desc' }),
            // Order Statistics
            apiService.getCustomerOrderStats(user.customer_code).catch(err => {
              console.warn('Customer stats not available:', err);
              return { success: false };
            }),
            // Top Products
            apiService.getTopProducts(3)
          ]);

          console.log('Dashboard: Customer-specific responses:', {
            companyNews: companyNewsResponse,
            research: researchResponse,
            stats: invoiceStatsResponse
          });
        } else if (userType === 'customer' && !user?.customer_code) {
          console.log('Dashboard: Customer user but no customer_code, fetching general data');
          // Customer without customer_code - show general data but mention in UI
          [companyNewsResponse, researchResponse, invoiceStatsResponse, topProductsResponse] = await Promise.all([
            apiService.getLatestNews(3),
            apiService.getLatestMarketResearch(3),
            apiService.getInvoiceStats().catch(err => {
              console.warn('Invoice stats not available:', err);
              return { success: false };
            }),
            apiService.getTopProducts(3)
          ]);
        } else {
          console.log('Dashboard: Fetching general data for admin or customers without customer_code');
          // Fetch general data for admin or customers without customer_code
          [companyNewsResponse, researchResponse, invoiceStatsResponse, topProductsResponse] = await Promise.all([
            apiService.getLatestNews(3),
            apiService.getLatestMarketResearch(3),
            apiService.getInvoiceStats().catch(err => {
              console.warn('Invoice stats not available:', err);
              return { success: false };
            }),
            apiService.getTopProducts(3)
          ]);

          console.log('Dashboard: General responses:', {
            companyNews: companyNewsResponse,
            research: researchResponse,
            stats: invoiceStatsResponse
          });
        }

        const finalData = {
          companyNews: companyNewsResponse.success ?
            (companyNewsResponse.data.news || companyNewsResponse.data.meetings || companyNewsResponse.data || []) : [],
          marketResearch: researchResponse.success ?
            (researchResponse.data.research || researchResponse.data.reports || researchResponse.data || []) : [],
          topProducts: topProductsResponse.success ?
            (() => {
              // Handle different response structures
              const data = topProductsResponse.data;
              if (Array.isArray(data)) {
                return data;
              } else if (data && Array.isArray(data.products)) {
                return data.products;
              } else if (data && Array.isArray(data.data)) {
                return data.data;
              } else {
                console.warn('Unexpected topProducts response structure:', topProductsResponse);
                return [];
              }
            })() : [],
          invoiceStats: invoiceStatsResponse.success ? {
            total: invoiceStatsResponse.data?.totalOrders || invoiceStatsResponse.totalOrders || 0,
            totalAmount: invoiceStatsResponse.data?.totalAmount || invoiceStatsResponse.totalAmount || 0,
            byStatus: {
              dispatched: invoiceStatsResponse.data?.dispatchedOrders || invoiceStatsResponse.dispatchedOrders || 0,
              pending: invoiceStatsResponse.data?.pendingOrders || invoiceStatsResponse.pendingOrders || 0
            }
          } : null,
          loading: false,
          error: ''
        };

        console.log('Dashboard: Final data to set:', finalData);
        setDashboardData(finalData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load dashboard data'
        }));
      }
    };

    fetchDashboardData();
  }, [userType, user]);

  const summaryStats = [
    {
      title: 'Total Orders',
      value: dashboardData.invoiceStats?.total || '0',
      change: '+12%',
      isPositive: true,
      icon: '🛒',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500'
    },
    {
      title: 'Dispatched',
      value: dashboardData.invoiceStats?.byStatus?.dispatched || '0',
      change: '+8%',
      isPositive: true,
      icon: '🚚',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-500'
    },
    {
      title: 'Sales Amount',
      value: dashboardData.invoiceStats?.totalAmount ? `₹ ${dashboardData.invoiceStats.totalAmount.toLocaleString()}` : '₹ 0',
      change: '+15%',
      isPositive: true,
      icon: '💰',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-500'
    },
    {
      title: 'Meeting Minutes',
      value: dashboardData.companyNews?.length || '0',
      change: '+2',
      isPositive: true,
      icon: '📝',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-500'
    }
  ];

  // Helper function to format products from API data
  const getFormattedProducts = () => {
    const productsArray = Array.isArray(dashboardData.topProducts)
      ? dashboardData.topProducts
      : [];

    if (!productsArray || productsArray.length === 0) {
      return [
        {
          id: 1,
          product_name: 'No Products Available',
          product_description: 'No products found in database',
          created_date: new Date().toLocaleDateString(),
          product_image: '📦',
          hasImage: false,
          sales: 0,
          rating: 0,
          growth: '0%',
          qty: '0%'
        }
      ];
    }

    const emojis = ['🌸', '🌹', '💜', '🌼', '🌺'];

    return productsArray.slice(0, 3).map((product, index) => {
      // Determine the image to use: image1_url first, then image2_url, then emoji fallback
      let productImage = null;
      let hasImage = false;

      console.log(`Product ${index + 1} image data:`, {
        image1_url: product.image1_url,
        image2_url: product.image2_url,
        product_name: product.product_name
      });

      if (product.image1_url && product.image1_url.trim() !== '') {
        productImage = product.image1_url;
        hasImage = true;
        console.log(`Using image1_url for ${product.product_name}:`, productImage);
      } else if (product.image2_url && product.image2_url.trim() !== '') {
        productImage = product.image2_url;
        hasImage = true;
        console.log(`Using image2_url for ${product.product_name}:`, productImage);
      } else {
        productImage = emojis[index] || '🌸';
        hasImage = false;
        console.log(`Using emoji fallback for ${product.product_name}:`, productImage);
      }

      return {
        id: product.id || product.product_id || index + 1,
        product_name: product.product_name || product.name || product.title || `Product ${index + 1}`,
        product_description: product.product_short_description || product.product_long_description || product.description || product.short_description || 'Product description not available',
        created_date: product.created_date || product.creation_date || product.date_created || new Date().toLocaleDateString(),
        product_image: productImage,
        hasImage: hasImage,
        sales: Math.floor(Math.random() * 200) + 50,
        rating: (Math.random() * 0.5 + 4.5).toFixed(1),
        growth: `+${Math.floor(Math.random() * 20) + 5}%`,
        qty:Math.floor(Math.random() * 200) + 50,
      };
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'In Transit': return 'bg-blue-100 text-blue-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (dashboardData.loading) {
    return (
      <div className="modern-dashboard">
        <div className="loading-container">
          <div className="modern-spinner"></div>
          <span style={{ marginLeft: '10px' }}>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-dashboard">
      {/* Top Navigation Bar */}
      <nav className="dashboard-nav">
        <div className="nav-content">
          <div className="nav-left">
            <h1 className="dashboard-title">Customer Dashboard</h1>
          </div>

          <div className="nav-right">
            {/* Search */}
            {/* <div className="search-container">
             
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div> */}

            {/* Notifications */}
            {/* <button className="notification-btn">
              <span className="bell-icon">🔔</span>
              {notifications > 0 && (
                <span className="notification-badge">{notifications}</span>
              )}
            </button> */}

            {/* User Menu */}
            {/* <div className="user-menu">
              <div className="user-avatar">👤</div>
              <span className="user-name">{user?.username || 'Customer'}</span>
            </div> */}
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        {dashboardData.error && (
          <div className="error-message">
            {dashboardData.error}
          </div>
        )}

        {userType === 'customer' && !user?.customer_code && (
          <div className="info-message">
            <strong>Note:</strong> Customer-specific data filtering is not available. Please contact administrator to set up your customer code.
          </div>
        )}

        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="welcome-content">
            <h2>Welcome back, {user?.username || 'Customer'}! 👋</h2>
            <p>Here's what's happening with your business today.</p>
            <div className="welcome-stats">
              <div className="welcome-stat">
                <span className="stat-icon">📅</span>
                <span>Today: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="welcome-stat">
                <span className="stat-icon">📈</span>
                <span>Sales performance looking great</span>
              </div>
            </div>
          </div>
          <div className="welcome-decoration"></div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {summaryStats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-header">
                <div className={`stat-icon-container ${stat.bgColor}`}>
                  <span className="stat-icon-emoji">{stat.icon}</span>
                </div>
                <div className={`stat-change ${stat.isPositive ? 'positive' : 'negative'}`}>
                  <span className="change-arrow">{stat.isPositive ? '↗' : '↘'}</span>
                  <span>{stat.change}</span>
                </div>
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-title">{stat.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="main-grid">
          {/* Company News */}
          <div className="news-section">
            <div className="section-header">
              <h3>Company News</h3>
              <button className="view-all-btn">View All</button>
            </div>
            <div className="news-list">
              {dashboardData.companyNews.length > 0 ? (
                dashboardData.companyNews.map((newsItem, index) => (
                  <div key={newsItem.id || index} className="news-item">
                    <div className="news-icon">
                      <span>{userType === 'customer' ? '📝' : '📰'}</span>
                    </div>
                    <div className="news-content">
                      <h4 className="news-title">
                        {userType === 'customer'
                          ? (newsItem.meeting_title || newsItem.title)
                          : (newsItem.news_title || newsItem.news_name)
                        }
                      </h4>
                      <p className="news-description">
                        {userType === 'customer'
                          ? (newsItem.meeting_description || newsItem.agenda || 'Meeting details...').substring(0, 100) + '...'
                          : (newsItem.news_short_description || newsItem.news_long_description?.substring(0, 100) + '...')
                        }
                      </p>
                      <div className="news-footer">
                        <span className="news-date">
                          {userType === 'customer'
                            ? (newsItem.meeting_date
                              ? new Date(newsItem.meeting_date).toLocaleDateString()
                              : new Date(newsItem.created_date).toLocaleDateString())
                            : new Date(newsItem.created_date).toLocaleDateString()
                          }
                        </span>
                        <button className="read-more-btn">Read More</button>
                      </div>
                    </div>
                    <span className="priority-badge high">High</span>
                  </div>
                ))
              ) : (
                <div className="no-data">
                  <span className="no-data-icon">📰</span>
                  <p>{userType === 'customer' ? 'No meeting minutes available at the moment.' : 'No news available at the moment.'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="sidebar-content">
            {/* Top Products */}
            <div className="products-section">
              <div className="section-header">
                <h3>Top Products</h3>
              </div>
              <div className="products-list">
                {getFormattedProducts().map((product, index) => (
                  <div key={product.id} className="product-item">
                    <div className="product-left">
                      <div className="product-image-containers">
                        {product.hasImage ? (
                          <img
                            src={product.product_image}
                            alt={product.product_name}
                            className="product-image"
                            onError={(e) => {
                              // If image fails to load, show emoji fallback
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className="product-emoji"
                          style={{ display: product.hasImage ? 'none' : 'flex' }}
                        >
                          {product.hasImage ? '🌸' : product.product_image}
                        </div>
                      </div>
                      <div className="product-info">
                        <h4 className="product-name">{product.product_name}</h4>
                        <div className="product-stats">
                          <div className="product-rating">
                            <span className="star">⭐</span>
                            <span>{product.rating}</span>
                          </div>
                          <span className="product-growth">{product.growth}</span>
                        </div>
                      </div>
                    </div>
                    <div className="product-sales">
                      <div className="sales-number">{product.qty}</div>
                      <div className="sales-label">qty</div>
                       <div className="sales-number">{product.sales}</div>
                      <div className="sales-label">sales</div>
                    </div>
                    
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            {/* <div className="quick-actions">
              <div className="section-header">
                <h3>Quick Actions</h3>
              </div>
              <div className="actions-grid">
                <button className="action-btn blue">
                  <span className="action-icon">🛒</span>
                  <span>New Order</span>
                </button>
                <button className="action-btn green">
                  <span className="action-icon">📊</span>
                  <span>Reports</span>
                </button>
                <button className="action-btn purple">
                  <span className="action-icon">👥</span>
                  <span>Meetings</span>
                </button>
                <button className="action-btn orange">
                  <span className="action-icon">⚙️</span>
                  <span>Settings</span>
                </button>
              </div>
            </div> */}
          </div>
        </div>

        {/* Market Reports */}
        <div className="reports-section">
          <div className="section-header">
            <h3>Market Reports</h3>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="reports-grid">
            {dashboardData.marketResearch.length > 0 ? (
              dashboardData.marketResearch.map((report, index) => (
                <div key={report.id || index} className="report-card">
                  <div className="report-icon">
                    <span>📊</span>
                  </div>
                  <div className="report-content">
                    <h4 className="report-title">
                      {report.research_title || report.research_name || 'Market Research Report'}
                    </h4>
                    <p className="report-summary">
                      {report.research_short_description || report.research_long_description?.substring(0, 80) + '...'}
                    </p>
                    <div className="report-footer">
                      <span className="report-date">
                        {report.research_date
                          ? new Date(report.research_date).toLocaleDateString()
                          : new Date(report.created_date).toLocaleDateString()
                        }
                      </span>
                      <div className="report-trend">
                        <span className="trend-icon">📈</span>
                        <span>Growing</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data wide">
                <span className="no-data-icon">📊</span>
                <p>No market research available.</p>
              </div>
            )}
          </div>
        </div>

        {/* Performance Chart Section */}
        <div className="chart-section">
          <div className="section-header">
            <h3>Sales Performance</h3>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="period-select"
            >
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="thisQuarter">This Quarter</option>
            </select>
          </div>
          <div className="chart-container">
            <div className="chart-placeholder">
              <span className="chart-icon">📊</span>
              <p>Chart visualization would go here</p>
              <p className="chart-subtitle">Sales trends and analytics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;