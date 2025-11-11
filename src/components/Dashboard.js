import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';
import apiService from '../services/apiService';

const Dashboard = ({ userType, user }) => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    companyNews: [],
    marketResearch: [],
    topProducts: [],
    invoiceStats: null,
    meetingMinutes: [],
    salesChartData: [],
    loading: true,
    error: ''
  });

  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardData(prev => ({ ...prev, loading: true, error: '' }));

        let companyNewsResponse, researchResponse, invoiceStatsResponse, topProductsResponse, meetingResponse, chartResponse;

        if (userType === 'customer' && user?.customer_code) {
          [companyNewsResponse, researchResponse, invoiceStatsResponse, topProductsResponse, meetingResponse, chartResponse] = await Promise.all([
            apiService.getLatestNews(), // Changed to use news table
            apiService.getLatestMarketResearch(3), // Changed to fetch ALL market reports (not customer-specific)
            apiService.getCustomerOrderStats(user.customer_code).catch(err => {
              console.warn('Customer stats not available:', err);
              return { success: false };
            }),
            apiService.getTopProducts(3, user.customer_code),
            apiService.getCustomerMeetings(user.customer_code, { limit: 10, sort: 'created_date', order: 'desc' }),
            apiService.getMonthlySalesChart(selectedPeriod, user.customer_code)
          ]);
        } else {
          [companyNewsResponse, researchResponse, invoiceStatsResponse, topProductsResponse, meetingResponse, chartResponse] = await Promise.all([
            apiService.getLatestNews(), // Using news table for all users
            apiService.getLatestMarketResearch(3),
            apiService.getInvoiceStats().catch(err => {
              console.warn('Invoice stats not available:', err);
              return { success: false };
            }),
            apiService.getTopProducts(3),
            apiService.getMeetings({ limit: 10, sort: 'created_date', order: 'desc' }),
            apiService.getMonthlySalesChart(selectedPeriod)
          ]);
        }

        const finalData = {
          companyNews: companyNewsResponse.success ?
            (companyNewsResponse.data || []) : [],
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
            total: invoiceStatsResponse.data?.total || invoiceStatsResponse.data?.totalOrders || invoiceStatsResponse.totalOrders || 0,
            totalAmount: invoiceStatsResponse.data?.totalAmount || invoiceStatsResponse.totalAmount || 0,
            totalQuantity: invoiceStatsResponse.data?.totalQuantity || invoiceStatsResponse.totalQuantity || 0,
            
            byStatus: {
              dispatched: invoiceStatsResponse.data?.byStatus?.dispatched || invoiceStatsResponse.data?.dispatchedOrders || invoiceStatsResponse.dispatchedOrders || 0,
              pending: invoiceStatsResponse.data?.byStatus?.pending || invoiceStatsResponse.data?.pendingOrders || invoiceStatsResponse.pendingOrders || 0
            }
          } : null,
          meetingMinutes: meetingResponse.success ?
            (meetingResponse.data?.meetings || meetingResponse.data || []) : [],
          salesChartData: chartResponse.success ? (chartResponse.data || []) : [],
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
  }, [userType, user, selectedPeriod]);

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
                      <span className="metric-val">{dashboardData.invoiceStats?.totalQuantity || 0}</span>
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
                        {newsItem.title || 'No Title'}
                      </h3>
                      <p className="news-desc">
                        {(newsItem.excerpt || newsItem.content || 'No description available').substring(0, 100) + '...'}
                      </p>
                    </div>
                    <div className="news-date-box">
                      {newsItem.published_date
                        ? new Date(newsItem.published_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
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
                  <div 
                    key={report.id || index} 
                    className="market-item-box"
                    onClick={() => navigate(`/market-report-details/${report.id}`)}
                  >
                    <div className="market-chart-box">
                      {report.research_image1 ? (
                        <img 
                          src={`http://localhost:5000${report.research_image1}`}
                          alt={report.research_name || 'Market Report'}
                          className="market-report-image"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                          onError={(e) => {
                            // Fallback to bar chart if image fails to load
                            e.target.style.display = 'none';
                            const chartFallback = e.target.nextElementSibling;
                            if (chartFallback) {
                              chartFallback.style.display = 'block';
                            }
                          }}
                        />
                      ) : null}
                      <div className="chart-visual-box" style={{ display: report.research_image1 ? 'none' : 'block' }}>
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
                        {report.research_name }
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

      {/* Sales Performance Chart */}
      <div className="chart-section">
        <div className="section-header">
          <h3>Sales Performance</h3>
          <select 
            className="period-select" 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="thisMonth">This Month</option>
            <option value="last3months">Last 3 Months</option>
            <option value="last6months">Last 6 Months</option>
            <option value="last12months">Last 12 Months</option>
          </select>
        </div>
        <div className="chart-container">
          {dashboardData.salesChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.salesChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="month" 
                  stroke="#666"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#27ae60"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#3498db"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #27ae60',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                  formatter={(value, name) => {
                    if (name === 'value') return [`₹${value.toLocaleString()}`, 'Sales Value'];
                    if (name === 'quantity') return [value, 'Quantity'];
                    return [value, name];
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px' }}
                  formatter={(value) => {
                    if (value === 'value') return 'Sales Value (₹)';
                    if (value === 'quantity') return 'Quantity';
                    return value;
                  }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="value" 
                  stroke="#27ae60" 
                  strokeWidth={3}
                  dot={{ fill: '#27ae60', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="quantity" 
                  stroke="#3498db" 
                  strokeWidth={3}
                  dot={{ fill: '#3498db', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-placeholder">
              <div className="chart-icon">📊</div>
              <p>Sales Performance Chart</p>
              <p className="chart-subtitle">No sales data available for the selected period</p>
            </div>
          )}
        </div>
      </div>

    
    </div>
  );
};

export default Dashboard;
