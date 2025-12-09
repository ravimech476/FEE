import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import apiService from '../services/apiService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, activitiesData] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getRecentActivities()
      ]);
      setStats(statsData);
      setActivities(activitiesData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGrowthPercentage = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading dashboard insights...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <div className="error-text">Error loading dashboard: {error}</div>
          <button onClick={fetchDashboardData} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Dashboard Overview</h1>
          <p className="current-time">{getCurrentTime()}</p>
        </div>
        <div className="header-right">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button onClick={fetchDashboardData} className="refresh-btn">
            <span className="refresh-icon">🔄</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="metrics-grid">
        {/* Total Users */}
        <div className="metric-card users">
          <div className="metric-header">
            <div className="metric-icon">
              <span>👥</span>
            </div>
            <div className="metric-trend positive">
              <span className="trend-icon">↗️</span>
              <span>+{getGrowthPercentage(stats?.userStats?.total, stats?.userStats?.previousTotal)}%</span>
            </div>
          </div>
          <div className="metric-content">
            <div className="metric-value">{stats?.userStats?.total || 0}</div>
            <div className="metric-label">Total Users</div>
            <div className="metric-details">
              <div className="detail-item">
                <span className="detail-dot active"></span>
                Active: {stats?.userStats?.active || 0}
              </div>
              <div className="detail-item">
                <span className="detail-dot admin"></span>
                Admins: {stats?.userStats?.admins || 0}
              </div>
              <div className="detail-item">
                <span className="detail-dot new"></span>
                New: {stats?.userStats?.recent || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="metric-card products">
          <div className="metric-header">
            <div className="metric-icon">
              <span>📦</span>
            </div>
            <div className="metric-trend stable">
              <span className="trend-icon">➡️</span>
              <span>+{getGrowthPercentage(stats?.productStats?.total, stats?.productStats?.previousTotal)}%</span>
            </div>
          </div>
          <div className="metric-content">
            <div className="metric-value">{stats?.productStats?.total || 0}</div>
            <div className="metric-label">Products</div>
            <div className="metric-details">
              <div className="detail-item">
                <span className="detail-dot active"></span>
                Active: {stats?.productStats?.active || 0}
              </div>
              <div className="detail-item">
                <span className="detail-dot inactive"></span>
                Inactive: {stats?.productStats?.inactive || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="metric-card revenue">
          <div className="metric-header">
            <div className="metric-icon">
              <span>💰</span>
            </div>
            <div className="metric-trend positive">
              <span className="trend-icon">📈</span>
              <span>+{getGrowthPercentage(stats?.salesStats?.revenue, stats?.salesStats?.previousRevenue)}%</span>
            </div>
          </div>
          <div className="metric-content">
            <div className="metric-value">₹{(stats?.salesStats?.revenue || 0).toLocaleString('en-IN')}</div>
            <div className="metric-label">Total Revenue</div>
            <div className="metric-details">
              <div className="detail-item">
                <span className="detail-dot success"></span>
                Orders: {stats?.salesStats?.orders || 0}
              </div>
              <div className="detail-item">
                <span className="detail-dot warning"></span>
                Pending: {stats?.salesStats?.pendingOrders || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Invoices */}
        <div className="metric-card invoices">
          <div className="metric-header">
            <div className="metric-icon">
              <span>🚚</span>
            </div>
            <div className="metric-trend positive">
              <span className="trend-icon">📊</span>
              <span>+{getGrowthPercentage(stats?.invoiceStats?.total, stats?.invoiceStats?.previousTotal)}%</span>
            </div>
          </div>
          <div className="metric-content">
            <div className="metric-value">{stats?.invoiceStats?.total || 0}</div>
            <div className="metric-label">Invoices</div>
            <div className="metric-details">
              <div className="detail-item">
                <span className="detail-dot warning"></span>
                Pending: {stats?.invoiceStats?.pending || 0}
              </div>
              <div className="detail-item">
                <span className="detail-dot success"></span>
                Delivered: {stats?.invoiceStats?.delivered || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats Grid */}
      <div className="secondary-stats">
        <div className="stat-item">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <div className="stat-number">{stats?.meetingStats?.total || 0}</div>
            <div className="stat-text">Meeting Minutes</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <div className="stat-number">{stats?.reportStats?.total || 0}</div>
            <div className="stat-text">Market Reports</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">💳</div>
          <div className="stat-info">
            <div className="stat-number">{stats?.paymentStats?.total || 0}</div>
            <div className="stat-text">Payment Records</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">🔐</div>
          <div className="stat-info">
            <div className="stat-number">{stats?.roleStats?.total || 0}</div>
            <div className="stat-text">Active Roles</div>
          </div>
        </div>
      </div>

      {/* Dashboard Content Grid */}
      <div className="dashboard-content">
        {/* Recent Activities */}
        <div className="dashboard-card activities-card">
          <div className="card-header">
            <h3>Recent Activities</h3>
            <div className="card-actions">
              <button className="action-btn">View All</button>
            </div>
          </div>
          <div className="card-content">
            <div className="activities-list">
              {activities.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <div className="empty-text">No recent activities</div>
                </div>
              ) : (
                activities.slice(0, 6).map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-avatar">
                      <span className="activity-type-icon">
                        {activity.type === 'user' ? '👤' : 
                         activity.type === 'product' ? '📦' : 
                         activity.type === 'order' ? '💰' : '📅'}
                      </span>
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">{activity.title}</div>
                      <div className="activity-time">
                        {new Date(activity.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="activity-status">
                      <div className={`status-indicator ${activity.status || 'completed'}`}></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card quick-actions-card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="card-content">
            <div className="quick-actions-grid">
              <div className="quick-action" onClick={() => navigate('/admin/users')}>
                <div className="quick-action-icon users">
                  <span>👥</span>
                </div>
                <div className="quick-action-text">Add User</div>
              </div>
              <div className="quick-action" onClick={() => navigate('/admin/products/create')}>
                <div className="quick-action-icon products">
                  <span>📦</span>
                </div>
                <div className="quick-action-text">Add Product</div>
              </div>
              <div className="quick-action" onClick={() => navigate('/admin/roles/create')}>
                <div className="quick-action-icon roles">
                  <span>🔐</span>
                </div>
                <div className="quick-action-text">Create Role</div>
              </div>
              <div className="quick-action" onClick={() => navigate('/admin/meeting-minutes/add')}>
                <div className="quick-action-icon meetings">
                  <span>📝</span>
                </div>
                <div className="quick-action-text">Add Meeting</div>
              </div>
              <div className="quick-action" onClick={() => navigate('/market-report/add')}>
                <div className="quick-action-icon reports">
                  <span>📊</span>
                </div>
                <div className="quick-action-text">Add Report</div>
              </div>
              <div className="quick-action" onClick={() => navigate('/admin/settings')}>
                <div className="quick-action-icon settings">
                  <span>⚙️</span>
                </div>
                <div className="quick-action-text">Settings</div>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        {/* <div className="dashboard-card system-status-card">
          <div className="card-header">
            <h3>System Status</h3>
            <div className="status-indicator online"></div>
          </div>
          <div className="card-content">
            <div className="system-metrics">
              <div className="system-metric">
                <div className="metric-label">Database</div>
                <div className="metric-status online">Online</div>
              </div>
              <div className="system-metric">
                <div className="metric-label">API Server</div>
                <div className="metric-status online">Healthy</div>
              </div>
              <div className="system-metric">
                <div className="metric-label">Storage</div>
                <div className="metric-status warning">85% Used</div>
              </div>
              <div className="system-metric">
                <div className="metric-label">Last Backup</div>
                <div className="metric-status success">2 hours ago</div>
              </div>
            </div>
          </div>
        </div> */}

        {/* Performance Chart */}
        <div className="dashboard-card chart-card">
          <div className="card-header">
            <h3>Monthly Performance</h3>
            <div className="chart-controls">
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color revenue"></div>
                  <span>Revenue (₹)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color orders"></div>
                  <span>Orders</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color growth"></div>
                  <span>Growth %</span>
                </div>
              </div>
            </div>
          </div>
          <div className="card-content">
            <div className="chart-container">
              {stats?.monthlyData && stats.monthlyData.length > 0 ? (
                <div className="performance-chart">
                  {/* Chart Grid Background */}
                  <div className="chart-grid">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="grid-line" style={{ bottom: `${i * 25}%` }}>
                        <span className="grid-label">{i * 25}%</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Chart Bars */}
                  <div className="chart-bars">
                    {stats.monthlyData.map((month, index) => {
                      const maxRevenue = Math.max(...stats.monthlyData.map(m => m.revenue || 0));
                      const maxOrders = Math.max(...stats.monthlyData.map(m => m.count || 0));
                      const revenueHeight = maxRevenue > 0 ? (month.revenue || 0) / maxRevenue * 100 : 0;
                      const ordersHeight = maxOrders > 0 ? (month.count || 0) / maxOrders * 100 : 0;
                      const growthRate = index > 0 && stats.monthlyData[index - 1]?.revenue
                        ? ((month.revenue - stats.monthlyData[index - 1].revenue) / stats.monthlyData[index - 1].revenue * 100)
                        : 0;
                      
                      return (
                        <div key={index} className="chart-bar-group">
                          <div className="chart-bars-container">
                            {/* Revenue Bar */}
                            <div className="bar-wrapper">
                              <div 
                                className="chart-bar revenue"
                                style={{
                                  height: `${Math.max(revenueHeight, 2)}%`,
                                  animationDelay: `${index * 0.1}s`
                                }}
                                title={`Revenue: ₹${(month.revenue || 0).toLocaleString('en-IN')}`}
                              >
                                <div className="bar-value">₹{(month.revenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                              </div>
                            </div>
                            
                            {/* Orders Bar */}
                            <div className="bar-wrapper">
                              <div 
                                className="chart-bar orders"
                                style={{
                                  height: `${Math.max(ordersHeight, 2)}%`,
                                  animationDelay: `${index * 0.1 + 0.05}s`
                                }}
                                title={`Orders: ${month.count || 0}`}
                              >
                                <div className="bar-value">{month.count}</div>
                              </div>
                            </div>
                            
                            {/* Growth Indicator */}
                            {index > 0 && (
                              <div className="growth-indicator">
                                <div className={`growth-arrow ${growthRate >= 0 ? 'positive' : 'negative'}`}>
                                  {growthRate >= 0 ? '↗' : '↘'}
                                </div>
                                <div className="growth-percentage">
                                  {Math.abs(growthRate).toFixed(1)}%
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Month Label */}
                          <div className="chart-label">
                            <div className="month-name">
                              {new Date(2024, (month.month || 1) - 1).toLocaleDateString('en-US', { month: 'short' })}
                            </div>
                            <div className="month-stats">
                              <div className="revenue-stat">₹{(month.revenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                              <div className="orders-stat">{month.count || 0} orders</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Chart Summary */}
                  <div className="chart-summary">
                    <div className="summary-item">
                      <div className="summary-label">Total Revenue</div>
                      <div className="summary-value revenue">
                        ₹{stats.monthlyData.reduce((sum, month) => sum + (month.revenue || 0), 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="summary-item">
                      <div className="summary-label">Total Orders</div>
                      <div className="summary-value orders">
                        {stats.monthlyData.reduce((sum, month) => sum + (month.count || 0), 0)}
                      </div>
                    </div>
                    <div className="summary-item">
                      <div className="summary-label">Avg. Order Value</div>
                      <div className="summary-value average">
                        ₹{Math.round(stats.monthlyData.reduce((sum, month) => sum + (month.revenue || 0), 0) / Math.max(stats.monthlyData.reduce((sum, month) => sum + (month.count || 0), 0), 1)).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="summary-item">
                      <div className="summary-label">Best Month</div>
                      <div className="summary-value best">
                        {stats.monthlyData.reduce((best, month) => 
                          (month.revenue || 0) > (best.revenue || 0) ? month : best, 
                          stats.monthlyData[0] || {}
                        ).month ? new Date(2024, ((stats.monthlyData.reduce((best, month) => 
                          (month.revenue || 0) > (best.revenue || 0) ? month : best, 
                          stats.monthlyData[0] || {}
                        ).month || 1) - 1)).toLocaleDateString('en-US', { month: 'short' }) : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="chart-placeholder">
                  <div className="placeholder-content">
                    <div className="placeholder-icon">📈</div>
                    <div className="placeholder-text">No performance data available</div>
                    <div className="placeholder-subtext">Data will appear here once you have monthly sales records</div>
                    <button className="placeholder-action" onClick={fetchDashboardData}>
                      Refresh Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;