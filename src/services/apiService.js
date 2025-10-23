const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = null;
    this.loadToken();
  }

  loadToken() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      // If unauthorized, clear token and redirect to login
      if (response.status === 401) {
        this.setToken(null);
        window.location.href = '/';
        throw new Error('Authentication required. Please login again.');
      }
      
      const data = await response.json();

      if (!response.ok) {
        // For validation errors, include the full response
        const error = new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
        error.response = JSON.stringify(data);
        error.status = response.status;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    // Store the token if login successful
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.setToken(null);
    }
  }

  // Get current user's role permissions
  async getMyRolePermissions() {
    return this.request('/auth/my-role-permissions');
  }

  // User management
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/users?${queryString}`);
  }

  async getUserById(id) {
    return this.request(`/users/${id}`);
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE'
    });
  }

  // Role management
  async getRoles(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/roles?${queryString}`);
  }

  async getActiveRoles() {
    return this.request('/roles/active');
  }

  async getRoleById(id) {
    return this.request(`/roles/${id}`);
  }

  async getRole(id) {
    return this.request(`/roles/${id}`);
  }

  async createRole(roleData) {
    return this.request('/roles', {
      method: 'POST',
      body: JSON.stringify(roleData)
    });
  }

  async updateRole(id, roleData) {
    return this.request(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roleData)
    });
  }

  async deleteRole(id) {
    return this.request(`/roles/${id}`, {
      method: 'DELETE'
    });
  }

  // Product management
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/products?${queryString}`);
  }

  async getTopProducts(limit = 3, customerCode = null) {
    try {
      let url = `/products/top/by-sales?limit=${limit}`;
      if (customerCode) {
        url += `&customer_code=${customerCode}`;
      }
      const response = await this.request(url);
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Error getting top products:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getProductById(id) {
    return this.request(`/products/${id}`);
  }

  async createProduct(productData) {
    const headers = this.getHeaders();
    // Remove Content-Type header if productData is FormData
    if (productData instanceof FormData) {
      delete headers['Content-Type'];
    }
    
    return this.request('/products', {
      method: 'POST',
      body: productData instanceof FormData ? productData : JSON.stringify(productData),
      headers
    });
  }

  async createProductWithImages(formData) {
    return this.createProduct(formData);
  }

  async updateProduct(id, productData) {
    const headers = this.getHeaders();
    
    // Handle FormData differently (for file uploads)
    if (productData instanceof FormData) {
      // Don't set Content-Type for FormData - let browser set it with boundary
      delete headers['Content-Type'];
      
      return this.request(`/products/${id}`, {
        method: 'PUT',
        body: productData,
        headers
      });
    } else {
      // Handle regular JSON data
      return this.request(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
        headers
      });
    }
  }

  async updateProductWithImages(id, formData) {
    return this.updateProduct(id, formData);
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE'
    });
  }

  // Sales orders (read-only)
  async getSalesOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/sales?${queryString}`);
  }

  async getSalesOrderById(id) {
    return this.request(`/sales/${id}`);
  }

  async getSalesStats() {
    return this.request('/sales/stats');
  }

  // Order management (new)
  async getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/orders?${queryString}`);
  }

  async getOrderById(id) {
    return this.request(`/orders/${id}`);
  }

  async getOrderStats() {
    return this.request('/orders/stats');
  }

  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async updateOrder(id, orderData) {
    return this.request(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData)
    });
  }

  async updateOrderStatus(id, status) {
    return this.request(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  async deleteOrder(id) {
    return this.request(`/orders/${id}`, {
      method: 'DELETE'
    });
  }

  async getOrdersByCustomer(customerName, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/orders/customer/${encodeURIComponent(customerName)}?${queryString}`);
  }

  // Meeting minutes
  async getMeetings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/meetings?${queryString}`);
  }

  async getMeetingById(id) {
    return this.request(`/meetings/${id}`);
  }

  async createMeeting(meetingData) {
    return this.request('/meetings', {
      method: 'POST',
      body: JSON.stringify(meetingData)
    });
  }

  async createMeetingWithAttachments(formData) {
    const headers = this.getHeaders();
    delete headers['Content-Type']; // Let browser set it with boundary for FormData
    
    return this.request('/meetings', {
      method: 'POST',
      body: formData,
      headers
    });
  }

  async updateMeeting(id, meetingData) {
    return this.request(`/meetings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(meetingData)
    });
  }

  async updateMeetingWithAttachments(id, formData) {
    const headers = this.getHeaders();
    delete headers['Content-Type']; // Let browser set it with boundary for FormData
    
    return this.request(`/meetings/${id}`, {
      method: 'PUT',
      body: formData,
      headers
    });
  }

  async deleteMeeting(id) {
    return this.request(`/meetings/${id}`, {
      method: 'DELETE'
    });
  }

  async getMeetingStats() {
    return this.request('/meetings/stats');
  }

  // Market research
  async getMarketReports(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/market-research?${queryString}`);
  }

  // Customer-specific data methods
  async getLatestNews(limit = 5) {
    try {
      const response = await this.request(`/news?limit=${limit}&sort=created_date&order=desc`);
      // The response structure is: { success: true, data: { news: [...], pagination: {...} } }
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Error getting latest news:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getLatestMarketResearch(limit = 3) {
    try {
      const response = await this.request(`/market-research?limit=${limit}&sort=created_date&order=desc`);
      // The response structure is: { success: true, data: { research: [...], pagination: {...} } }
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Error getting latest market research:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getInvoiceStats() {
    try {
      const response = await this.request('/orders/stats');
      // The response is already in the right format: {totalOrders, totalAmount, pendingOrders, etc.}
      return {
        success: true,
        data: response,
        // Also spread the response for backward compatibility
        ...response
      };
    } catch (error) {
      console.error('Error getting invoice stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getCustomerData(customerCode) {
    return this.request(`/customer/${customerCode}/data`);
  }

  async getCustomerOrderStats(customerCode) {
    return this.request(`/customer/${customerCode}/order-stats`);
  }

  async getCustomerOrders(customerCode, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/customer/${customerCode}/orders?${queryString}`);
  }

  async getCustomerOrderById(customerCode, orderId) {
    return this.request(`/customer/${customerCode}/orders/${orderId}`);
  }

  async getCustomerMeetings(customerCode, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/customer/${customerCode}/meetings?${queryString}`);
  }

  async getCustomerMeetingById(customerCode, meetingId) {
    return this.request(`/customer/${customerCode}/meetings/${meetingId}`);
  }

  async getCustomerMarketReports(customerCode, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/customer/${customerCode}/market-reports?${queryString}`);
  }

  async getCustomerMarketReportById(customerCode, reportId) {
    return this.request(`/customer/${customerCode}/market-reports/${reportId}`);
  }

  async getCustomerPayments(customerCode, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/customer/${customerCode}/payments?${queryString}`);
  }

  async getCustomerPaymentById(customerCode, paymentId) {
    return this.request(`/customer/${customerCode}/payments/${paymentId}`);
  }

  async getCustomerInvoiceToDelivery(customerCode, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/customer/${customerCode}/invoice-to-delivery?${queryString}`);
  }

  async getMarketReportById(id) {
    return this.request(`/market-research/${id}`);
  }

  async createMarketReport(reportData) {
    return this.request('/market-research', {
      method: 'POST',
      body: JSON.stringify(reportData)
    });
  }

  async updateMarketReport(id, reportData) {
    return this.request(`/market-research/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reportData)
    });
  }

  async deleteMarketReport(id) {
    return this.request(`/market-research/${id}`, {
      method: 'DELETE'
    });
  }

  // Payment info
  async getPayments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/payments?${queryString}`);
  }

  async getPaymentById(id) {
    return this.request(`/payments/${id}`);
  }

  async createPayment(paymentData) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  async updatePayment(id, paymentData) {
    return this.request(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(paymentData)
    });
  }

  async deletePayment(id) {
    return this.request(`/payments/${id}`, {
      method: 'DELETE'
    });
  }

  async getPaymentStats() {
    return this.request('/payments/stats');
  }

  // Statement management
  async getStatements(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/statements?${queryString}`);
  }

  async getStatementById(id) {
    return this.request(`/statements/${id}`);
  }

  async getStatementsByCustomer(customerCode, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/statements/customer/${customerCode}?${queryString}`);
  }

  async getStatementSummary() {
    return this.request('/statements/summary');
  }

  // Invoice to Delivery management
  async getInvoiceToDeliveries(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/invoice-to-delivery?${queryString}`);
  }

  async getInvoiceToDeliveryById(id) {
    return this.request(`/invoice-to-delivery/${id}`);
  }

  async getInvoiceToDeliveryStats() {
    return this.request('/invoice-to-delivery/stats');
  }

  async createInvoiceToDelivery(data) {
    return this.request('/invoice-to-delivery', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateInvoiceToDelivery(id, data) {
    return this.request(`/invoice-to-delivery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteInvoiceToDelivery(id) {
    return this.request(`/invoice-to-delivery/${id}`, {
      method: 'DELETE'
    });
  }

  // Admin dashboard
  async getDashboardStats() {
    return this.request('/admin/dashboard/stats');
  }

  async getRecentActivities() {
    return this.request('/admin/dashboard/activities');
  }

  async getSystemHealth() {
    return this.request('/admin/system/health');
  }

  // Settings management
  async getExpertSettings() {
    return this.request('/settings/expert');
  }

  async updateExpertEmail(emailData) {
    return this.request('/settings/expert/email', {
      method: 'PUT',
      body: JSON.stringify(emailData)
    });
  }

  async getSocialMediaLinks() {
    return this.request('/settings/social-media');
  }

  async addSocialMediaLink(socialMediaData) {
    return this.request('/settings/social-media', {
      method: 'POST',
      body: JSON.stringify(socialMediaData)
    });
  }

  async updateSocialMediaLink(id, socialMediaData) {
    return this.request(`/settings/social-media/${id}`, {
      method: 'PUT',
      body: JSON.stringify(socialMediaData)
    });
  }

  async deleteSocialMediaLink(id) {
    return this.request(`/settings/social-media/${id}`, {
      method: 'DELETE'
    });
  }
}

export default new ApiService();