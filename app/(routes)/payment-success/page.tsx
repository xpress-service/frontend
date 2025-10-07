'use client'
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { FiCheckCircle, FiXCircle, FiLoader, FiArrowLeft } from 'react-icons/fi';
import { MdPayment } from 'react-icons/md';
import Link from 'next/link';
import styles from '../../sass/transaction/payment-success.module.scss';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

interface PaymentResult {
  success: boolean;
  message: string;
  orderDetails?: {
    serviceName: string;
    totalAmount: number;
    platformFee: number;
    vendorReceives: number;
    reference: string;
  };
}

const PaymentSuccess = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const reference = searchParams.get('reference');

    if (!orderId) {
      setPaymentResult({
        success: false,
        message: 'Invalid payment request. Order ID is missing.'
      });
      setLoading(false);
      return;
    }

    verifyPayment(orderId, reference);
  }, [searchParams]);

  const verifyPayment = async (orderId: string, reference: string | null) => {
    try {
      setLoading(true);

      // If we have a reference, it means user came back from Paystack
      if (reference) {
        // Verify payment with Paystack
        const response = await axios.post(`${baseUrl}/orders/payments/verify`, {
          reference,
          orderId
        });

        if (response.data.success) {
          setPaymentResult({
            success: true,
            message: 'Payment successful! Your order has been confirmed.',
            orderDetails: response.data.orderDetails
          });
        } else {
          setPaymentResult({
            success: false,
            message: response.data.message || 'Payment verification failed.'
          });
        }
      } else {
        // Check order status
        const orderResponse = await axios.get(`${baseUrl}/orders/${orderId}`);
        const order = orderResponse.data;

        if (order.isPaid) {
          setPaymentResult({
            success: true,
            message: 'Payment already completed for this order.',
            orderDetails: {
              serviceName: order.serviceId.serviceName,
              totalAmount: order.totalAmount || order.serviceId.price * order.quantity,
              platformFee: order.platformFee || 0,
              vendorReceives: order.vendorReceives || order.serviceId.price * order.quantity,
              reference: order.paymentReference || 'N/A'
            }
          });
        } else {
          setPaymentResult({
            success: false,
            message: 'Payment not completed. Please try again.'
          });
        }
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      setPaymentResult({
        success: false,
        message: error.response?.data?.message || 'An error occurred while verifying payment.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.payment_container}>
        <div className={styles.payment_card}>
          <div className={styles.loading_section}>
            <FiLoader className={styles.loading_icon} />
            <h2>Verifying Payment...</h2>
            <p>Please wait while we confirm your payment</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.payment_container}>
      <div className={styles.payment_card}>
        <div className={styles.result_section}>
          {paymentResult?.success ? (
            <>
              <FiCheckCircle className={styles.success_icon} />
              <h2>Payment Successful!</h2>
              <p className={styles.success_message}>{paymentResult.message}</p>
              
              {paymentResult.orderDetails && (
                <div className={styles.order_summary}>
                  <h3>Order Summary</h3>
                  <div className={styles.summary_item}>
                    <span>Service:</span>
                    <span>{paymentResult.orderDetails.serviceName}</span>
                  </div>
                  <div className={styles.summary_item}>
                    <span>Total Amount:</span>
                    <span className={styles.amount}>${paymentResult.orderDetails.totalAmount}</span>
                  </div>
                  <div className={styles.summary_item}>
                    <span>Platform Fee (10%):</span>
                    <span className={styles.platform_fee}>${paymentResult.orderDetails.platformFee}</span>
                  </div>
                  <div className={styles.summary_item}>
                    <span>Vendor Receives:</span>
                    <span className={styles.vendor_amount}>${paymentResult.orderDetails.vendorReceives}</span>
                  </div>
                  <div className={styles.summary_item}>
                    <span>Reference:</span>
                    <span className={styles.reference}>{paymentResult.orderDetails.reference}</span>
                  </div>
                </div>
              )}
              
              <div className={styles.action_buttons}>
                <Link href="/orders" className={styles.primary_btn}>
                  <MdPayment />
                  View My Orders
                </Link>
                <Link href="/servicelist" className={styles.secondary_btn}>
                  Continue Shopping
                </Link>
              </div>
            </>
          ) : (
            <>
              <FiXCircle className={styles.error_icon} />
              <h2>Payment Failed</h2>
              <p className={styles.error_message}>{paymentResult?.message}</p>
              
              <div className={styles.action_buttons}>
                <Link href="/notification" className={styles.primary_btn}>
                  <FiArrowLeft />
                  Back to Notifications
                </Link>
                <Link href="/servicelist" className={styles.secondary_btn}>
                  Browse Services
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;