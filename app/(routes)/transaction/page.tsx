"use client";
import React, { useState, useEffect } from 'react'
import { 
  MdKeyboardArrowLeft, 
  MdKeyboardArrowRight, 
  MdPayment,
  MdCheckCircle,
  MdCancel,
  MdPending,
  MdRefresh,
  MdFilterList,
  MdDownload,
  MdMoreVert,
  MdReceipt,
  MdHistory,
  MdAccountBalanceWallet,
  MdSearch,
  MdClose,
  MdTrendingUp,
  MdAttachMoney
} from 'react-icons/md'
import { FaCreditCard, FaFilter, FaMoneyBillWave, FaEye, FaDownload, FaStore } from 'react-icons/fa'
import { BiTime, BiMoney, BiCalendar } from 'react-icons/bi'
import { HiOutlineDocumentDownload } from 'react-icons/hi'
import { useAuth } from '../../contexts/AuthContext'
import styles from '../../sass/transaction/transaction.module.scss'
import axios from 'axios'
import Swal from 'sweetalert2'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

interface Transaction {
  _id: string;
  serviceId: {
    _id: string;
    title: string;
    serviceName: string;
    price: number;
    category: string;
    vendorId: {
      _id: string;
      firstname: string;
      lastname: string;
      email: string;
    };
  };
  userId: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'online' | 'offline' | null;
  paymentProof?: string;
  platformFee: number;
  vendorReceives: number;
  totalAmount: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  refundedAt?: string;
  refundAmount?: number;
}

interface TransactionStats {
  totalTransactions: number;
  totalAmount: number;
  successfulTransactions: number;
  pendingTransactions: number;
  refundedAmount: number;
}

const TransactionPage = () => {
  const { userId, userRole } = useAuth();
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Role-based view state
  const isVendor = userRole === 'vendor';
  const isCustomer = userRole === 'customer';
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;
  
  // Stats states
  const [stats, setStats] = useState<TransactionStats>({
    totalTransactions: 0,
    totalAmount: 0,
    successfulTransactions: 0,
    pendingTransactions: 0,
    refundedAmount: 0
  });

  useEffect(() => {
    if (userId && userRole) {
      fetchTransactions();
    }
  }, [userId, userRole]);

  useEffect(() => {
    applyFilters();
  }, [allTransactions, filterStatus, filterPaymentStatus, dateRange, searchTerm]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!userId) {
        setError('Please log in to view your transactions.');
        return;
      }

      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }

      let apiEndpoint = '';
      
      if (isVendor) {
        // Vendor sees transactions for their services
        const serviceOwnerId = localStorage.getItem('serviceOwnerId') || userId;
        apiEndpoint = `${baseUrl}/orders/vendor/${serviceOwnerId}`;
      } else {
        // Customer sees their purchase transactions
        apiEndpoint = `${baseUrl}/orders/user`;
      }

      console.log('Fetching transactions from:', apiEndpoint);
      
      const response = await axios.get(apiEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Transaction response:', response.data);
      
      const transactions = response.data || [];
      
      // Validate transaction data structure
      const validatedTransactions = transactions.map((tx: any) => ({
        _id: tx._id || '',
        serviceId: {
          _id: tx.serviceId?._id || '',
          title: tx.serviceId?.title || tx.serviceId?.serviceName || 'Unknown Service',
          serviceName: tx.serviceId?.serviceName || tx.serviceId?.title || 'Unknown Service',
          price: tx.serviceId?.price || 0,
          category: tx.serviceId?.category || 'General',
          vendorId: {
            _id: tx.serviceId?.vendorId?._id || '',
            firstname: tx.serviceId?.vendorId?.firstname || 'Unknown',
            lastname: tx.serviceId?.vendorId?.lastname || 'Provider',
            email: tx.serviceId?.vendorId?.email || ''
          }
        },
        userId: {
          _id: tx.userId?._id || '',
          firstname: tx.userId?.firstname || 'Unknown',
          lastname: tx.userId?.lastname || 'User',
          email: tx.userId?.email || ''
        },
        status: tx.status?.toLowerCase() || 'pending',
        paymentStatus: tx.paymentStatus || 'pending',
        paymentMethod: tx.paymentMethod || 'offline',
        paymentProof: tx.paymentProof || '',
        platformFee: tx.platformFee || 0,
        vendorReceives: tx.vendorReceives || 0,
        totalAmount: tx.totalAmount || 0,
        quantity: tx.quantity || 1,
        createdAt: tx.createdAt || new Date().toISOString(),
        updatedAt: tx.updatedAt || tx.createdAt || new Date().toISOString(),
        completedAt: tx.completedAt || null,
        refundedAt: tx.refundedAt || null,
        refundAmount: tx.refundAmount || null
      }));
      
      setAllTransactions(validatedTransactions);
      calculateStats(validatedTransactions);
      
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      
      if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        setError('Access denied. You do not have permission to view these transactions.');
      } else if (error.response?.status === 404) {
        setError('Transaction endpoint not found. Please contact support.');
      } else if (error.code === 'NETWORK_ERROR') {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch transactions. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (transactions: Transaction[]) => {
    let totalAmount = 0;
    
    if (isVendor) {
      // For vendors, show earnings (vendorReceives)
      totalAmount = transactions
        .filter(tx => tx.paymentStatus === 'paid')
        .reduce((sum, tx) => sum + (tx.vendorReceives || 0), 0);
    } else {
      // For customers, show total spent
      totalAmount = transactions
        .filter(tx => tx.paymentStatus === 'paid')
        .reduce((sum, tx) => sum + tx.totalAmount, 0);
    }

    const stats = {
      totalTransactions: transactions.length,
      totalAmount,
      successfulTransactions: transactions.filter(tx => tx.paymentStatus === 'paid').length,
      pendingTransactions: transactions.filter(tx => tx.paymentStatus === 'pending').length,
      refundedAmount: transactions
        .filter(tx => tx.paymentStatus === 'refunded')
        .reduce((sum, tx) => sum + (tx.refundAmount || tx.totalAmount), 0)
    };
    setStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...allTransactions];

    // Filter by order status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(tx => tx.status === filterStatus);
    }

    // Filter by payment status
    if (filterPaymentStatus !== 'all') {
      filtered = filtered.filter(tx => tx.paymentStatus === filterPaymentStatus);
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(tx => new Date(tx.createdAt) >= filterDate);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(tx => new Date(tx.createdAt) >= filterDate);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(tx => new Date(tx.createdAt) >= filterDate);
          break;
        case '3months':
          filterDate.setMonth(now.getMonth() - 3);
          filtered = filtered.filter(tx => new Date(tx.createdAt) >= filterDate);
          break;
      }
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tx => {
        const searchLower = searchTerm.toLowerCase();
        try {
          return (
            tx.serviceId?.title?.toLowerCase().includes(searchLower) ||
            tx.serviceId?.serviceName?.toLowerCase().includes(searchLower) ||
            tx.serviceId?.category?.toLowerCase().includes(searchLower) ||
            (isVendor ? 
              tx.userId?.firstname?.toLowerCase().includes(searchLower) ||
              tx.userId?.lastname?.toLowerCase().includes(searchLower) :
              tx.serviceId?.vendorId?.firstname?.toLowerCase().includes(searchLower) ||
              tx.serviceId?.vendorId?.lastname?.toLowerCase().includes(searchLower)
            )
          );
        } catch (error) {
          console.warn('Error filtering transaction:', tx._id, error);
          return false;
        }
      });
    }

    setFilteredTransactions(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleDownloadReceipt = async (transaction: Transaction) => {
    if (transaction.paymentStatus !== 'paid') {
      Swal.fire({
        icon: 'warning',
        title: 'Receipt Not Available',
        text: 'Receipt is only available for paid transactions.'
      });
      return;
    }

    try {
      const receiptData = `
        ${isVendor ? 'EARNINGS' : 'TRANSACTION'} RECEIPT
        ==================
        
        Transaction ID: ${transaction._id}
        Date: ${new Date(transaction.createdAt).toLocaleDateString()}
        
        Service: ${transaction.serviceId.title || transaction.serviceId.serviceName}
        Category: ${transaction.serviceId.category}
        ${isVendor ? 
          `Customer: ${transaction.userId.firstname} ${transaction.userId.lastname}` :
          `Provider: ${transaction.serviceId.vendorId.firstname} ${transaction.serviceId.vendorId.lastname}`
        }
        
        ${isVendor ? 
          `Earnings: ₦${(transaction.vendorReceives || 0).toLocaleString()}
Platform Fee: ₦${transaction.platformFee.toLocaleString()}
Total Order: ₦${transaction.totalAmount.toLocaleString()}` :
          `Amount Paid: ₦${transaction.totalAmount.toLocaleString()}`
        }
        Payment Method: ${transaction.paymentMethod === 'online' ? 'Online Payment' : 'Offline Payment'}
        Status: ${transaction.paymentStatus.toUpperCase()}
        
        Thank you for using our service!
      `;
      
      const blob = new Blob([receiptData], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${isVendor ? 'earnings' : 'receipt'}-${transaction._id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      Swal.fire({
        icon: 'success',
        title: `${isVendor ? 'Earnings Report' : 'Receipt'} Downloaded`,
        text: `Your ${isVendor ? 'earnings report' : 'transaction receipt'} has been downloaded.`
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Download Failed',
        text: 'Failed to download. Please try again.'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <MdCheckCircle className={styles.success_icon} />;
      case 'pending':
        return <MdPending className={styles.pending_icon} />;
      case 'failed':
        return <MdCancel className={styles.error_icon} />;
      case 'refunded':
        return <MdAccountBalanceWallet className={styles.refund_icon} />;
      default:
        return <MdPending className={styles.pending_icon} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return styles.status_success;
      case 'pending':
        return styles.status_pending;
      case 'failed':
        return styles.status_error;
      case 'refunded':
        return styles.status_refund;
      default:
        return styles.status_pending;
    }
  };

  // Pagination logic
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  if (loading) {
    return (
      <div className={styles.loading_container}>
        <div className={styles.loading_spinner}>
          <BiTime className={styles.spinning} />
          <p>Loading your transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.transaction_container}>
      {/* Header - Role-based */}
      <div className={styles.transaction_header}>
        <div className={styles.header_content}>
          <div className={styles.header_text}>
            <h1>
              {isVendor ? (
                <>
                  <MdTrendingUp className={styles.header_icon} />
                  Earnings & Transactions
                </>
              ) : (
                <>
                  <MdHistory className={styles.header_icon} />
                  Transaction History
                </>
              )}
            </h1>
            <p>
              {isVendor 
                ? "Track your earnings and manage service transactions" 
                : "View and manage your transaction history and activities"
              }
            </p>
          </div>
          <button 
            className={styles.refresh_btn}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <MdRefresh className={refreshing ? styles.spinning : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards - Role-based */}
      <div className={styles.stats_container}>
        <div className={styles.stat_card}>
          <div className={styles.stat_icon}>
            <MdReceipt />
          </div>
          <div className={styles.stat_content}>
            <h3>{stats.totalTransactions}</h3>
            <p>Total Transactions</p>
          </div>
        </div>
        
        <div className={styles.stat_card}>
          <div className={styles.stat_icon}>
            {isVendor ? <MdAttachMoney /> : <BiMoney />}
          </div>
          <div className={styles.stat_content}>
            <h3>₦{stats.totalAmount.toLocaleString()}</h3>
            <p>{isVendor ? 'Total Earnings' : 'Total Spent'}</p>
          </div>
        </div>
        
        <div className={styles.stat_card}>
          <div className={styles.stat_icon}>
            <MdCheckCircle />
          </div>
          <div className={styles.stat_content}>
            <h3>{stats.successfulTransactions}</h3>
            <p>Successful</p>
          </div>
        </div>
        
        <div className={styles.stat_card}>
          <div className={styles.stat_icon}>
            <MdPending />
          </div>
          <div className={styles.stat_content}>
            <h3>{stats.pendingTransactions}</h3>
            <p>Pending</p>
          </div>
        </div>

        {stats.refundedAmount > 0 && (
          <div className={styles.stat_card}>
            <div className={styles.stat_icon}>
              <MdAccountBalanceWallet />
            </div>
            <div className={styles.stat_content}>
              <h3>₦{stats.refundedAmount.toLocaleString()}</h3>
              <p>Refunded</p>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className={styles.filters_container}>
        <div className={styles.search_container}>
          <MdSearch className={styles.search_icon} />
          <input
            type="text"
            placeholder={isVendor ? "Search customers, services..." : "Search transactions..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.search_input}
          />
        </div>

        <div className={styles.filter_group}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filter_select}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filterPaymentStatus}
            onChange={(e) => setFilterPaymentStatus(e.target.value)}
            className={styles.filter_select}
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending Payment</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className={styles.filter_select}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="3months">Last 3 Months</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className={styles.error_container}>
          <MdCancel className={styles.error_icon} />
          <p>{error}</p>
          <button onClick={handleRefresh} className={styles.retry_btn}>
            Try Again
          </button>
        </div>
      )}

      {/* Transactions List */}
      {!error && (
        <div className={styles.transactions_container}>
          {currentTransactions.length === 0 ? (
            <div className={styles.empty_state}>
              {isVendor ? <FaStore className={styles.empty_icon} /> : <MdReceipt className={styles.empty_icon} />}
              <h3>No Transactions Found</h3>
              <p>
                {filteredTransactions.length === 0 && allTransactions.length === 0
                  ? isVendor 
                    ? "You haven't received any orders yet." 
                    : "You haven't made any transactions yet."
                  : "No transactions match your current filters."}
              </p>
            </div>
          ) : (
            <>
              <div className={styles.transactions_list}>
                {currentTransactions.map((transaction) => (
                  <div key={transaction._id} className={styles.transaction_card}>
                    <div className={styles.transaction_header}>
                      <div className={styles.transaction_info}>
                        <h4>{transaction.serviceId?.title || transaction.serviceId?.serviceName || 'Unknown Service'}</h4>
                        <p className={styles.transaction_meta}>
                          {transaction.serviceId?.category || 'General'} • {isVendor 
                            ? `Customer: ${transaction.userId?.firstname || 'Unknown'} ${transaction.userId?.lastname || 'User'}`
                            : `Provider: ${transaction.serviceId?.vendorId?.firstname || 'Unknown'} ${transaction.serviceId?.vendorId?.lastname || 'Provider'}`
                          }
                        </p>
                      </div>
                      <div className={styles.transaction_amount}>
                        <span className={styles.amount}>
                          ₦{isVendor 
                            ? (transaction.vendorReceives || 0).toLocaleString() 
                            : (transaction.totalAmount || 0).toLocaleString()
                          }
                        </span>
                        <span className={`${styles.status} ${getStatusColor(transaction.paymentStatus || 'pending')}`}>
                          {getStatusIcon(transaction.paymentStatus || 'pending')}
                          {(transaction.paymentStatus || 'pending').charAt(0).toUpperCase() + (transaction.paymentStatus || 'pending').slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className={styles.transaction_details}>
                      <div className={styles.detail_item}>
                        <BiCalendar className={styles.detail_icon} />
                        <span>{transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className={styles.detail_item}>
                        <FaCreditCard className={styles.detail_icon} />
                        <span>{(transaction.paymentMethod || 'offline') === 'online' ? 'Online Payment' : 'Offline Payment'}</span>
                      </div>
                      <div className={styles.detail_item}>
                        <span className={`${styles.order_status} ${getStatusColor(transaction.status || 'pending')}`}>
                          Order: {(transaction.status || 'pending').charAt(0).toUpperCase() + (transaction.status || 'pending').slice(1)}
                        </span>
                      </div>
                      {isVendor && (transaction.paymentStatus === 'paid' || transaction.paymentStatus === 'confirmed') && (
                        <div className={styles.detail_item}>
                          <span className={styles.earnings_highlight}>
                            Earnings: ₦{(transaction.vendorReceives || 0).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className={styles.transaction_actions}>
                      <button 
                        onClick={() => handleViewDetails(transaction)}
                        className={styles.action_btn}
                      >
                        <FaEye /> View Details
                      </button>
                      {transaction.paymentStatus === 'paid' && (
                        <button 
                          onClick={() => handleDownloadReceipt(transaction)}
                          className={styles.action_btn}
                        >
                          <FaDownload /> {isVendor ? 'Earnings Report' : 'Receipt'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={styles.pagination_btn}
                  >
                    <MdKeyboardArrowLeft />
                  </button>
                  
                  <span className={styles.pagination_info}>
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={styles.pagination_btn}
                  >
                    <MdKeyboardArrowRight />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Transaction Details Modal - Role-based */}
      {showTransactionModal && selectedTransaction && (
        <div className={styles.modal_overlay}>
          <div className={styles.modal_content}>
            <div className={styles.modal_header}>
              <h3>{isVendor ? 'Earnings Details' : 'Transaction Details'}</h3>
              <button 
                onClick={() => setShowTransactionModal(false)}
                className={styles.close_btn}
              >
                <MdClose />
              </button>
            </div>
            
            <div className={styles.modal_body}>
              <div className={styles.detail_section}>
                <h4>Service Information</h4>
                <div className={styles.detail_grid}>
                  <div className={styles.detail_row}>
                    <span>Service:</span>
                    <span>{selectedTransaction.serviceId?.title || selectedTransaction.serviceId?.serviceName || 'Unknown Service'}</span>
                  </div>
                  <div className={styles.detail_row}>
                    <span>Category:</span>
                    <span>{selectedTransaction.serviceId?.category || 'General'}</span>
                  </div>
                  <div className={styles.detail_row}>
                    <span>{isVendor ? 'Customer:' : 'Provider:'}</span>
                    <span>
                      {isVendor 
                        ? `${selectedTransaction.userId?.firstname || 'Unknown'} ${selectedTransaction.userId?.lastname || 'User'}`
                        : `${selectedTransaction.serviceId?.vendorId?.firstname || 'Unknown'} ${selectedTransaction.serviceId?.vendorId?.lastname || 'Provider'}`
                      }
                    </span>
                  </div>
                  <div className={styles.detail_row}>
                    <span>Quantity:</span>
                    <span>{selectedTransaction.quantity || 1}</span>
                  </div>
                </div>
              </div>

              <div className={styles.detail_section}>
                <h4>{isVendor ? 'Earnings Information' : 'Payment Information'}</h4>
                <div className={styles.detail_grid}>
                  {isVendor ? (
                    <>
                      <div className={styles.detail_row}>
                        <span>Your Earnings:</span>
                        <span className={styles.amount_highlight}>₦{(selectedTransaction.vendorReceives || 0).toLocaleString()}</span>
                      </div>
                      <div className={styles.detail_row}>
                        <span>Platform Fee:</span>
                        <span>₦{selectedTransaction.platformFee.toLocaleString()}</span>
                      </div>
                      <div className={styles.detail_row}>
                        <span>Total Order Value:</span>
                        <span>₦{selectedTransaction.totalAmount.toLocaleString()}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={styles.detail_row}>
                        <span>Total Amount:</span>
                        <span className={styles.amount_highlight}>₦{selectedTransaction.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className={styles.detail_row}>
                        <span>Platform Fee:</span>
                        <span>₦{selectedTransaction.platformFee.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                  <div className={styles.detail_row}>
                    <span>Payment Method:</span>
                    <span>{selectedTransaction.paymentMethod === 'online' ? 'Online Payment' : 'Offline Payment'}</span>
                  </div>
                  <div className={styles.detail_row}>
                    <span>Payment Status:</span>
                    <span className={`${styles.status_badge} ${getStatusColor(selectedTransaction.paymentStatus)}`}>
                      {selectedTransaction.paymentStatus.charAt(0).toUpperCase() + selectedTransaction.paymentStatus.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.detail_section}>
                <h4>Order Information</h4>
                <div className={styles.detail_grid}>
                  <div className={styles.detail_row}>
                    <span>Order Status:</span>
                    <span className={`${styles.status_badge} ${getStatusColor(selectedTransaction.status)}`}>
                      {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                    </span>
                  </div>
                  <div className={styles.detail_row}>
                    <span>Order Date:</span>
                    <span>{new Date(selectedTransaction.createdAt).toLocaleString()}</span>
                  </div>
                  <div className={styles.detail_row}>
                    <span>Last Updated:</span>
                    <span>{new Date(selectedTransaction.updatedAt).toLocaleString()}</span>
                  </div>
                  {selectedTransaction.completedAt && (
                    <div className={styles.detail_row}>
                      <span>Completed:</span>
                      <span>{new Date(selectedTransaction.completedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedTransaction.paymentStatus === 'refunded' && (
                <div className={styles.detail_section}>
                  <h4>Refund Information</h4>
                  <div className={styles.detail_grid}>
                    <div className={styles.detail_row}>
                      <span>Refund Amount:</span>
                      <span className={styles.refund_amount}>₦{(selectedTransaction.refundAmount || selectedTransaction.totalAmount).toLocaleString()}</span>
                    </div>
                    {selectedTransaction.refundedAt && (
                      <div className={styles.detail_row}>
                        <span>Refunded On:</span>
                        <span>{new Date(selectedTransaction.refundedAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.modal_footer}>
              {selectedTransaction.paymentStatus === 'paid' && (
                <button 
                  onClick={() => handleDownloadReceipt(selectedTransaction)}
                  className={styles.download_btn}
                >
                  <HiOutlineDocumentDownload /> Download {isVendor ? 'Earnings Report' : 'Receipt'}
                </button>
              )}
              <button 
                onClick={() => setShowTransactionModal(false)}
                className={styles.close_modal_btn}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionPage;