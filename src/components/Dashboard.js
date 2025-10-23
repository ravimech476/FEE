import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import apiService from '../services/apiService';

const Dashboard = ({ userType, user }) => {
  const [dashboardData, setDashboardData] = useState({
    companyNews: [],
    marketResearch: [],
    topProducts: [],
    invoiceStats: null,
    meetingMinutes: [],
    loading: true,
    error: ''
  });

  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardData(prev => ({ ...prev, loading: true, error: '' }));

        let companyNewsResponse, researchResponse, invoiceStatsResponse, topProductsResponse, meetingResponse;

        if (userType === 'customer' && user?.customer_code) {
          [companyNewsResponse, researchResponse, invoiceStatsResponse, topProductsResponse, meetingResponse] = await Promise.all([
            apiService.getCustomerMeetings(user.customer_code, { limit: 5, sort: 'created_date', order: 'desc' }),
            apiService.getCustomerMarketReports(user.customer_code, { limit: 3, sort: 'created_date', order: 'desc' }),
            apiService.getCustomerOrderStats(user.customer_code).catch(err => {
              console.warn('Customer stats not available:', err);
              return { success: false };
            }),
            apiService.getTopProducts(3),
            apiService.getCustomerMeetings(user.customer_code, { limit: 10, sort: 'created_date', order: 'desc' })
          ]);
        } else {
          [companyNewsResponse, researchResponse, invoiceStatsResponse, topProductsResponse, meetingResponse] = await Promise.all([
            apiService.getLatestNews(5),
            apiService.getLatestMarketResearch(3),
            apiService.getInvoiceStats().catch(err => {
              console.warn('Invoice stats not available:', err);
              return { success: false };
            }),
            apiService.getTopProducts(3),
            apiService.getMeetings({ limit: 10, sort: 'created_date', order: 'desc' })
          ]);
        }

        const finalData = {
          companyNews: companyNewsResponse.success ?
            (companyNewsResponse.data.news || companyNewsResponse.data.meetings || companyNewsResponse.data || []) : [],
          marketResearch: researchResponse.success ?
            (researchResponse.data.research || researchResponse.data.reports || researchResponse.data || []) : [],
          topProducts: topProductsResponse.success ?
            (() => {
              const data = topProductsResponse.data;
              if (Array.isArray(data)) return data;
              if (data && Array.isArray(data.products)) return data.products;
              if (data && Array.isArray(data.data)) return data.data;
              return [];
            })() : [],
          invoiceStats: invoiceStatsResponse.success ? {
            total: invoiceStatsResponse.data?.totalOrders || invoiceStatsResponse.totalOrders || 0,
            totalAmount: invoiceStatsResponse.data?.totalAmount || invoiceStatsResponse.totalAmount || 0,
            byStatus: {
              dispatched: invoiceStatsResponse.data?.dispatchedOrders || invoiceStatsResponse.dispatchedOrders || 0,
              pending: invoiceStatsResponse.data?.pendingOrders || invoiceStatsResponse.pendingOrders || 0
            }
          } : null,
          meetingMinutes: meetingResponse.success ?
            (meetingResponse.data?.meetings || meetingResponse.data || []) : [],
          loading: false,
          error: ''
        };

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

  const getFormattedProducts = () => {
    const productsArray = Array.isArray(dashboardData.topProducts) ? dashboardData.topProducts : [];
    
    if (!productsArray || productsArray.length === 0) {
      return [];
    }

    return productsArray.slice(0, 3).map((product, index) => {
      let productImage = null;
      let hasImage = false;

      if (product.image1_url && product.image1_url.trim() !== '') {
        productImage = product.image1_url;
        hasImage = true;
      } else if (product.image2_url && product.image2_url.trim() !== '') {
        productImage = product.image2_url;
        hasImage = true;
      }

      return {
        id: product.id || product.product_id || index + 1,
        rank: index + 1,
        name: product.product_name || product.name || `Product ${index + 1}`,
        description: product.product_short_description || product.product_long_description || product.description || 'A beautiful and delicate bloom known for its graceful appearance and soft fragrance.',
        image: productImage,
        hasImage: hasImage
      };
    });
  };

  if (dashboardData.loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-wrapper">
          <div className="spinner"></div>
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Page Title */}
      <div className="page-header-dash">
        <h1 className="page-title-dash">Dashboard</h1>
      </div>

      {/* Main Grid */}
      <div className="dashboard-main-layout">
        {/* Left Column - Summary + Company News */}
        <div className="left-section">
          {/* Summary Section */}
          <div className="summary-box">
            <h2 className="box-title">Summary</h2>
            
            {/* Summary Cards Grid */}
            <div className="summary-content">
              <div className="summary-grid-dash">
                {/* No of Orders */}
                <div className="summary-card-dash orders-card">
                  <div className="card-title-dash">No of Orders</div>
                  <div className="card-number-dash">{dashboardData.invoiceStats?.total || 0}</div>
                </div>

                {/* No of Dispatch */}
                <div className="summary-card-dash dispatch-card">
                  <div className="card-title-dash">No of Dispatch</div>
                  <div className="card-number-dash">{dashboardData.invoiceStats?.byStatus?.dispatched || 0}</div>
                </div>

                {/* Sales Performance */}
                <div className="summary-card-dash performance-card">
                  <div className="card-title-dash">Sales Performance</div>
                  <div className="performance-metrics">
                    <div className="metric-box">
                      <span className="metric-name">VALUE</span>
                      <span className="metric-val">₹ {dashboardData.invoiceStats?.totalAmount?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="metric-box">
                      <span className="metric-name">QUANTITY</span>
                      <span className="metric-val">{dashboardData.invoiceStats?.total || 0}</span>
                    </div>
                  </div>
                </div>

                {/* MOM */}
                <div className="summary-card-dash mom-card-dash">
                  <div className="card-title-dash">MOM</div>
                  <div className="card-number-dash">{dashboardData.meetingMinutes?.length || 0}</div>
                  {dashboardData.meetingMinutes?.length > 0 && (
                    <a href="/meeting-minutes" className="mom-attachment-link">Click to view Attachment</a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Company News Section */}
          <div className="news-box">
            <h2 className="box-title">Company News</h2>
            <div className="news-content-scroll">
              {dashboardData.companyNews.length > 0 ? (
                dashboardData.companyNews.map((newsItem, index) => (
                  <div key={newsItem.id || index} className="news-item-box">
                    <div className="news-icon-box">📄</div>
                    <div className="news-text-box">
                      <h3 className="news-heading">
                        {userType === 'customer'
                          ? (newsItem.meeting_title || newsItem.title)
                          : (newsItem.news_title || newsItem.news_name)
                        }
                      </h3>
                      <p className="news-desc">
                        {userType === 'customer'
                          ? (newsItem.meeting_description || newsItem.agenda || 'Meeting details...').substring(0, 100) + '...'
                          : (newsItem.news_short_description || newsItem.news_long_description?.substring(0, 100) + '...')
                        }
                      </p>
                    </div>
                    <div className="news-date-box">
                      {userType === 'customer'
                        ? (newsItem.meeting_date
                          ? new Date(newsItem.meeting_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
                          : new Date(newsItem.created_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }))
                        : new Date(newsItem.created_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
                      }
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data-box">
                  <p>No company news available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Top Products + Market Reports */}
        <div className="right-section">
          {/* Top 3 Products Section */}
          <div className="products-box">
            <h2 className="box-title">Top 3 Products</h2>
            <div className="products-content-scroll">
              {getFormattedProducts().map((product, index) => (
                <div key={product.id} className={`product-card-box product-${index + 1}`}>
                  <div className="product-img-box">
                    {product.hasImage ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="product-img"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="product-emoji-box">
                        <span>🌸</span>
                      </div>
                    )}
                  </div>
                  <div className="product-text-box">
                    <div className="product-num">{product.rank}</div>
                    <p className="product-desc-box">{product.description}</p>
                    <h3 className="product-title-box">{product.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Report Section */}
          <div className="market-box">
            <h2 className="box-title">Market Report</h2>
            <div className="market-content-scroll">
              {dashboardData.marketResearch.length > 0 ? (
                dashboardData.marketResearch.map((report, index) => (
                  <div key={report.id || index} className="market-item-box">
                    <div className="market-chart-box">
                      <div className="chart-visual-box">
                        <div className="bars-container">
                          <div className="bar-item" style={{ height: '40%' }}></div>
                          <div className="bar-item" style={{ height: '60%' }}></div>
                          <div className="bar-item" style={{ height: '85%' }}></div>
                          <div className="bar-item" style={{ height: '100%' }}></div>
                          <div className="bar-item" style={{ height: '70%' }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="market-text-box">
                      <p className="market-desc-box">
                        {report.research_short_description || report.research_long_description?.substring(0, 100) + '...'}
                      </p>
                      <div className="market-date-box">
                        {report.research_date
                          ? new Date(report.research_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : new Date(report.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        }
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data-box">
                  <p>No market reports available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    
    </div>
  );
};

export default Dashboard;
