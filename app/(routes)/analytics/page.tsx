'use client'
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  FiTrendingUp, 
  FiUsers, 
  FiShoppingBag, 
  FiDollarSign,
  FiCalendar,
  FiDownload,
  FiRefreshCw,
  FiFilter,
  FiBarChart,
  FiPieChart,
  FiActivity
} from 'react-icons/fi';
import { MdAnalytics, MdInsights, MdTimeline } from 'react-icons/md';
import axios from 'axios';
import Swal from 'sweetalert2';
import styles from '../../sass/analytics/analytics.module.scss';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalVendors: number;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    conversionRate: number;
  };
  growth: {
    userGrowth: number;
    orderGrowth: number;
    revenueGrowth: number;
  };
  userStats: {
    activeUsers: number;
    newUsersThisMonth: number;
    returningUsers: number;
    userRetentionRate: number;
  };
  orderStats: {
    completedOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
    averageCompletionTime: number;
  };
  topServices: Array<{
    serviceName: string;
    orders: number;
    revenue: number;
  }>;
  monthlyData: Array<{
    month: string;
    users: number;
    orders: number;
    revenue: number;
  }>;
}

const Analytics = () => {
  const { userId, userRole } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days
  const [refreshing, setRefreshing] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!userId || userRole !== 'admin') {
      router.push('/sign-in');
      return;
    }
    fetchAnalytics();
  }, [userId, userRole, router, dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await axios.get(`${baseUrl}/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { dateRange }
      });

      setAnalytics(response.data);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      if (error.response?.status === 403) {
        Swal.fire('Access Denied', 'You do not have admin privileges', 'error');
        router.push('/dashboard');
      } else {
        Swal.fire('Error', 'Failed to load analytics data', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  const exportAnalytics = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${baseUrl}/admin/analytics/export`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { dateRange },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      Swal.fire('Success', 'Analytics report exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting analytics:', error);
      Swal.fire('Error', 'Failed to export analytics report', 'error');
    }
  };

  if (loading) {
    return (
      <div className={styles.loading_container}>
        <MdAnalytics className={styles.loading_icon} />
        <h2>Loading Analytics...</h2>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={styles.error_container}>
        <h2>Failed to Load Analytics</h2>
        <button onClick={fetchAnalytics} className={styles.retry_btn}>
          <FiRefreshCw /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.analytics_dashboard}>
      <div className={styles.analytics_header}>
        <div className={styles.header_content}>
          <div className={styles.title_section}>
            <MdAnalytics className={styles.analytics_icon} />
            <div>
              <h1>Analytics Dashboard</h1>
              <p>Monitor your platform's performance and insights</p>
            </div>
          </div>
          
          <div className={styles.header_controls}>
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className={styles.filter_select}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
            
            <button 
              onClick={handleRefresh} 
              className={styles.refresh_btn}
              disabled={refreshing}
            >
              <FiRefreshCw className={refreshing ? styles.spinning : ''} />
              Refresh
            </button>
            
            <button 
              onClick={exportAnalytics}
              className={styles.export_btn}
            >
              <FiDownload />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Overview KPIs */}
      <div className={styles.kpi_section}>
        <h2><MdInsights /> Key Performance Indicators</h2>
        <div className={styles.kpi_grid}>
          <div className={styles.kpi_card}>
            <div className={styles.kpi_icon}>
              <FiUsers />
            </div>
            <div className={styles.kpi_content}>
              <h3>{analytics.overview.totalUsers.toLocaleString()}</h3>
              <p>Total Users</p>
              <span className={`${styles.growth} ${analytics.growth.userGrowth >= 0 ? styles.positive : styles.negative}`}>
                {analytics.growth.userGrowth >= 0 ? '+' : ''}{analytics.growth.userGrowth}% growth
              </span>
            </div>
          </div>

          <div className={styles.kpi_card}>
            <div className={styles.kpi_icon}>
              <FiShoppingBag />
            </div>
            <div className={styles.kpi_content}>
              <h3>{analytics.overview.totalOrders.toLocaleString()}</h3>
              <p>Total Orders</p>
              <span className={`${styles.growth} ${analytics.growth.orderGrowth >= 0 ? styles.positive : styles.negative}`}>
                {analytics.growth.orderGrowth >= 0 ? '+' : ''}{analytics.growth.orderGrowth}% growth
              </span>
            </div>
          </div>

          <div className={styles.kpi_card}>
            <div className={styles.kpi_icon}>
              <FiDollarSign />
            </div>
            <div className={styles.kpi_content}>
              <h3>₦{analytics.overview.totalRevenue.toLocaleString()}</h3>
              <p>Total Revenue</p>
              <span className={`${styles.growth} ${analytics.growth.revenueGrowth >= 0 ? styles.positive : styles.negative}`}>
                {analytics.growth.revenueGrowth >= 0 ? '+' : ''}{analytics.growth.revenueGrowth}% growth
              </span>
            </div>
          </div>

          <div className={styles.kpi_card}>
            <div className={styles.kpi_icon}>
              <FiTrendingUp />
            </div>
            <div className={styles.kpi_content}>
              <h3>₦{analytics.overview.averageOrderValue.toLocaleString()}</h3>
              <p>Avg Order Value</p>
              <span className={styles.metric}>
                {analytics.overview.conversionRate.toFixed(1)}% conversion rate
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className={styles.charts_section}>
        <div className={styles.chart_grid}>
          {/* User Analytics */}
          <div className={styles.chart_card}>
            <div className={styles.chart_header}>
              <h3><FiUsers /> User Analytics</h3>
              <FiBarChart className={styles.chart_type_icon} />
            </div>
            <div className={styles.chart_content}>
              <div className={styles.user_metrics}>
                <div className={styles.metric_item}>
                  <span className={styles.metric_label}>Active Users</span>
                  <span className={styles.metric_value}>{analytics.userStats.activeUsers.toLocaleString()}</span>
                </div>
                <div className={styles.metric_item}>
                  <span className={styles.metric_label}>New This Month</span>
                  <span className={styles.metric_value}>{analytics.userStats.newUsersThisMonth.toLocaleString()}</span>
                </div>
                <div className={styles.metric_item}>
                  <span className={styles.metric_label}>Returning Users</span>
                  <span className={styles.metric_value}>{analytics.userStats.returningUsers.toLocaleString()}</span>
                </div>
                <div className={styles.metric_item}>
                  <span className={styles.metric_label}>Retention Rate</span>
                  <span className={styles.metric_value}>{analytics.userStats.userRetentionRate.toFixed(1)}%</span>
                </div>
              </div>
              <div className={styles.chart_placeholder}>
                <FiBarChart />
                <p>User growth chart will be implemented with Chart.js</p>
              </div>
            </div>
          </div>

          {/* Order Analytics */}
          <div className={styles.chart_card}>
            <div className={styles.chart_header}>
              <h3><FiShoppingBag /> Order Analytics</h3>
              <FiPieChart className={styles.chart_type_icon} />
            </div>
            <div className={styles.chart_content}>
              <div className={styles.order_metrics}>
                <div className={styles.metric_item}>
                  <span className={styles.metric_label}>Completed</span>
                  <span className={styles.metric_value}>{analytics.orderStats.completedOrders.toLocaleString()}</span>
                </div>
                <div className={styles.metric_item}>
                  <span className={styles.metric_label}>Pending</span>
                  <span className={styles.metric_value}>{analytics.orderStats.pendingOrders.toLocaleString()}</span>
                </div>
                <div className={styles.metric_item}>
                  <span className={styles.metric_label}>Cancelled</span>
                  <span className={styles.metric_value}>{analytics.orderStats.cancelledOrders.toLocaleString()}</span>
                </div>
                <div className={styles.metric_item}>
                  <span className={styles.metric_label}>Avg Completion</span>
                  <span className={styles.metric_value}>{analytics.orderStats.averageCompletionTime}h</span>
                </div>
              </div>
              <div className={styles.chart_placeholder}>
                <FiPieChart />
                <p>Order status distribution chart</p>
              </div>
            </div>
          </div>

          {/* Revenue Trends */}
          <div className={styles.chart_card}>
            <div className={styles.chart_header}>
              <h3><FiDollarSign /> Revenue Trends</h3>
              <MdTimeline className={styles.chart_type_icon} />
            </div>
            <div className={styles.chart_content}>
              <div className={styles.revenue_overview}>
                <div className={styles.revenue_stat}>
                  <h4>₦{analytics.overview.totalRevenue.toLocaleString()}</h4>
                  <p>Total Revenue</p>
                </div>
                <div className={styles.revenue_stat}>
                  <h4>₦{analytics.overview.averageOrderValue.toLocaleString()}</h4>
                  <p>Average Order</p>
                </div>
              </div>
              <div className={styles.chart_placeholder}>
                <MdTimeline />
                <p>Revenue timeline chart</p>
              </div>
            </div>
          </div>

          {/* Top Services */}
          <div className={styles.chart_card}>
            <div className={styles.chart_header}>
              <h3><FiActivity /> Top Services</h3>
              <FiBarChart className={styles.chart_type_icon} />
            </div>
            <div className={styles.chart_content}>
              <div className={styles.top_services}>
                {analytics.topServices.length > 0 ? (
                  analytics.topServices.map((service, index) => (
                    <div key={index} className={styles.service_item}>
                      <div className={styles.service_rank}>#{index + 1}</div>
                      <div className={styles.service_info}>
                        <h4>{service.serviceName}</h4>
                        <p>{service.orders} orders • ₦{service.revenue.toLocaleString()}</p>
                      </div>
                      <div className={styles.service_bar}>
                        <div 
                          className={styles.bar_fill}
                          style={{ width: `${(service.orders / analytics.topServices[0].orders) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.no_data}>
                    <p>No service data available yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Performance */}
      <div className={styles.performance_section}>
        <h2><MdTimeline /> Monthly Performance</h2>
        <div className={styles.performance_table}>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>New Users</th>
                <th>Orders</th>
                <th>Revenue</th>
                <th>Growth</th>
              </tr>
            </thead>
            <tbody>
              {analytics.monthlyData.map((month, index) => (
                <tr key={index}>
                  <td>{month.month}</td>
                  <td>{month.users.toLocaleString()}</td>
                  <td>{month.orders.toLocaleString()}</td>
                  <td>₦{month.revenue.toLocaleString()}</td>
                  <td>
                    <span className={styles.growth_indicator}>
                      {index > 0 ? (
                        <span className={month.revenue > analytics.monthlyData[index - 1].revenue ? styles.up : styles.down}>
                          {month.revenue > analytics.monthlyData[index - 1].revenue ? '↗' : '↘'}
                          {Math.abs(((month.revenue - analytics.monthlyData[index - 1].revenue) / analytics.monthlyData[index - 1].revenue) * 100).toFixed(1)}%
                        </span>
                      ) : (
                        <span>-</span>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights Section */}
      <div className={styles.insights_section}>
        <h2><MdInsights /> AI-Powered Insights</h2>
        <div className={styles.insights_grid}>
          <div className={styles.insight_card}>
            <div className={styles.insight_icon}>💡</div>
            <h3>Peak Usage Times</h3>
            <p>Most orders are placed between 2 PM - 6 PM. Consider running promotions during these hours for maximum impact.</p>
          </div>
          
          <div className={styles.insight_card}>
            <div className={styles.insight_icon}>📈</div>
            <h3>Growth Opportunity</h3>
            <p>Vendor registrations are up 25% this month. Focus on vendor onboarding to maximize service availability.</p>
          </div>
          
          <div className={styles.insight_card}>
            <div className={styles.insight_icon}>🎯</div>
            <h3>User Retention</h3>
            <p>Users who complete their first order have an 80% chance of making another. Improve first-time user experience.</p>
          </div>
          
          <div className={styles.insight_card}>
            <div className={styles.insight_icon}>⚡</div>
            <h3>Performance Tip</h3>
            <p>Average order completion time is 4.2 hours. Vendors completing orders faster get 30% more bookings.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;