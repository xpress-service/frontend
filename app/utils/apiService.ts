'use client';

import axios from 'axios';
import { apiCache, createCacheKey } from './apiCache';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

// Enhanced API service with caching and debouncing
class APIService {
  private pendingRequests = new Map<string, Promise<any>>();

  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async makeRequest(
    url: string, 
    options: any = {}, 
    cacheKey?: string,
    cacheTTL: number = 30000
  ): Promise<any> {
    // Check cache first
    if (cacheKey && apiCache.has(cacheKey)) {
      return apiCache.get(cacheKey);
    }

    // Check if there's already a pending request for this endpoint
    if (this.pendingRequests.has(url)) {
      return this.pendingRequests.get(url);
    }

    // Make the request
    const requestPromise = axios({
      url,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers
      },
      ...options
    }).then(response => {
      // Cache successful responses
      if (cacheKey && response.status === 200) {
        apiCache.set(cacheKey, response.data, cacheTTL);
      }
      return response.data;
    }).finally(() => {
      // Remove from pending requests
      this.pendingRequests.delete(url);
    });

    this.pendingRequests.set(url, requestPromise);
    return requestPromise;
  }

  // Optimized notification fetching for vendors
  async fetchVendorNotifications(serviceOwnerId: string): Promise<any> {
    const cacheKey = createCacheKey('vendor_notifications', { serviceOwnerId });
    return this.makeRequest(
      `${baseUrl}/orders/notifications/${serviceOwnerId}`,
      { method: 'GET' },
      cacheKey,
      15000 // 15 seconds cache for notifications
    );
  }

  // Optimized notification fetching for customers
  async fetchCustomerNotifications(userId: string): Promise<any> {
    const cacheKey = createCacheKey('customer_notifications', { userId });
    return this.makeRequest(
      `${baseUrl}/orders/notifications/user/${userId}`,
      { method: 'GET' },
      cacheKey,
      15000 // 15 seconds cache for notifications
    );
  }

  // Optimized profile data fetching
  async fetchUserProfile(userRole: string): Promise<any> {
    const cacheKey = createCacheKey('user_profile', { userRole });
    const endpoint = userRole === 'admin' ? '/api/adminProfile' : '/api/profile';
    
    return this.makeRequest(
      `${baseUrl}${endpoint}`,
      { method: 'GET' },
      cacheKey,
      60000 // 60 seconds cache for profile data
    );
  }

  // Optimized order fetching
  async fetchUserOrders(): Promise<any> {
    const cacheKey = createCacheKey('user_orders');
    return this.makeRequest(
      `${baseUrl}/orders/user`,
      { method: 'GET' },
      cacheKey,
      20000 // 20 seconds cache for orders
    );
  }

  // Optimized vendor orders fetching
  async fetchVendorOrders(serviceOwnerId: string): Promise<any> {
    const cacheKey = createCacheKey('vendor_orders', { serviceOwnerId });
    return this.makeRequest(
      `${baseUrl}/orders/notifications/${serviceOwnerId}`,
      { method: 'GET' },
      cacheKey,
      20000 // 20 seconds cache for vendor orders
    );
  }

  // Mark notification as read (no caching for write operations)
  async markNotificationAsRead(notificationId: string): Promise<any> {
    // Clear related cache entries when updating
    const userId = localStorage.getItem('userId');
    if (userId) {
      apiCache.clear(); // Simple approach: clear all cache on write operations
    }

    return axios.patch(
      `${baseUrl}/orders/notifications/${notificationId}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  // Update order status (no caching for write operations)
  async updateOrderStatus(orderId: string, status: string): Promise<any> {
    // Clear cache on write operations
    apiCache.clear();

    return axios.patch(
      `${baseUrl}/orders/status/${orderId}`,
      { status },
      { headers: this.getAuthHeaders() }
    );
  }

  // Clear all cached data (useful for logout or when fresh data is needed)
  clearCache(): void {
    apiCache.clear();
    this.pendingRequests.clear();
  }
}

// Export singleton instance
export const apiService = new APIService();