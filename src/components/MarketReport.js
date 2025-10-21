import React, { useState } from 'react';
import './MarketReport.css';
import CustomerMarketReport from './customer/CustomerMarketReport';

const MarketReport = ({ userType, user }) => {
  // Always call hooks first
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Then handle conditional rendering
  if (userType === 'customer') {
    return <CustomerMarketReport userType={userType} user={user} />;
  }

  // Original market report view for other cases

  const marketData = {
    overview: {
      totalRevenue: '$245,678',
      growthRate: '+12.5%',
      marketShare: '15.3%',
      customerGrowth: '+8.2%'
    },
    trends: [
      { category: 'Sustainable Products', growth: '+23%', color: 'success' },
      { category: 'Digital Services', growth: '+18%', color: 'primary' },
      { category: 'Premium Items', growth: '+15%', color: 'warning' },
      { category: 'Basic Products', growth: '+5%', color: 'secondary' }
    ],
    competitors: [
      { name: 'EcoTech Solutions', marketShare: '22.1%', change: '-2.3%' },
      { name: 'GreenFuture Corp', marketShare: '18.7%', change: '+1.8%' },
      { name: 'Our Company', marketShare: '15.3%', change: '+2.1%' },
      { name: 'SustainableTech', marketShare: '12.9%', change: '+0.5%' },
      { name: 'CleanEnergy Ltd', marketShare: '10.4%', change: '-1.2%' }
    ]
  };

  const insights = [
    {
      title: 'Market Opportunity',
      description: 'Growing demand for sustainable products presents significant growth opportunities.',
      impact: 'High',
      timeframe: 'Q2 2025'
    },
    {
      title: 'Competitive Position',
      description: 'Strong position in premium segment with opportunities to expand market share.',
      impact: 'Medium',
      timeframe: 'Q3 2025'
    },
    {
      title: 'Customer Behavior',
      description: 'Shift towards digital-first interactions and sustainable product preferences.',
      impact: 'High',
      timeframe: 'Ongoing'
    }
  ];

  return (
    <div className="market-report">
      <div className="page-content">
        <div className="report-header">
          <div className="header-content">
            <h1>Market Report</h1>
            <p>Comprehensive market analysis and competitive insights</p>
          </div>
          
          <div className="report-controls">
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="period-select"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
            
            <button className="btn btn-primary">Export Report</button>
          </div>
        </div>

        <div className="report-overview">
          <div className="overview-card revenue">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h3>Total Revenue</h3>
              <div className="metric-value">{marketData.overview.totalRevenue}</div>
              <div className="metric-change positive">{marketData.overview.growthRate}</div>
            </div>
          </div>
          
          <div className="overview-card market-share">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <h3>Market Share</h3>
              <div className="metric-value">{marketData.overview.marketShare}</div>
              <div className="metric-change positive">+0.8%</div>
            </div>
          </div>
          
          <div className="overview-card customers">
            <div className="card-icon">👥</div>
            <div className="card-content">
              <h3>Customer Growth</h3>
              <div className="metric-value">{marketData.overview.customerGrowth}</div>
              <div className="metric-change positive">vs last period</div>
            </div>
          </div>
        </div>

        <div className="report-content">
          <div className="content-section">
            <div className="card">
              <div className="card-header">
                <h3>Category Performance</h3>
              </div>
              <div className="card-body">
                <div className="trends-list">
                  {marketData.trends.map((trend, index) => (
                    <div key={index} className="trend-item">
                      <div className="trend-info">
                        <span className="trend-category">{trend.category}</span>
                        <span className={`trend-growth ${trend.color}`}>{trend.growth}</span>
                      </div>
                      <div className="trend-bar">
                        <div 
                          className={`trend-progress ${trend.color}`}
                          style={{ width: `${Math.abs(parseInt(trend.growth))}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="content-section">
            <div className="card">
              <div className="card-header">
                <h3>Competitive Analysis</h3>
              </div>
              <div className="card-body">
                <div className="competitors-table">
                  <div className="table-header">
                    <span>Company</span>
                    <span>Market Share</span>
                    <span>Change</span>
                  </div>
                  {marketData.competitors.map((competitor, index) => (
                    <div key={index} className={`competitor-row ${competitor.name === 'Our Company' ? 'highlight' : ''}`}>
                      <span className="company-name">{competitor.name}</span>
                      <span className="market-share">{competitor.marketShare}</span>
                      <span className={`change ${parseFloat(competitor.change) >= 0 ? 'positive' : 'negative'}`}>
                        {competitor.change}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="insights-section">
          <div className="card">
            <div className="card-header">
              <h3>Market Insights & Recommendations</h3>
            </div>
            <div className="card-body">
              <div className="insights-grid">
                {insights.map((insight, index) => (
                  <div key={index} className="insight-card">
                    <div className="insight-header">
                      <h4>{insight.title}</h4>
                      <div className="insight-meta">
                        <span className={`impact-badge ${insight.impact.toLowerCase()}`}>
                          {insight.impact} Impact
                        </span>
                        <span className="timeframe">📅 {insight.timeframe}</span>
                      </div>
                    </div>
                    <p className="insight-description">{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="report-footer">
          <div className="footer-info">
            <p>Report generated on {new Date().toLocaleDateString()}</p>
            <p>Data sources: Internal analytics, market research, competitor analysis</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketReport;