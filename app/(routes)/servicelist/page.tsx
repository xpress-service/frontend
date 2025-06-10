'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../../sass/postservice/service.module.scss';
import Image from 'next/image';
import Link from 'next/link';
import { useSearch } from "../../_layoutcomponents/searchContext";
import Swal from 'sweetalert2';

interface Service {
  _id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  availability: boolean;
  imageUrl: string;
  serviceOwnerId: string;
}
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

const ServiceList: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [message, setMessage] = useState<string | null>(null);
  const [serviceOwnerId, setServiceOwnerId] = useState<string | null>(null); 
  const { searchQuery } = useSearch();

  useEffect(() => {
    // Fetch services
    const fetchServices = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/services`,
        );
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchServices();

    // Fetch serviceOwnerId (from local storage or API)
    const storedOwnerId = localStorage.getItem('serviceOwnerId'); 
    if (storedOwnerId) {
      setServiceOwnerId(storedOwnerId);
    } else {
      console.warn('No serviceOwnerId found in local storage');
    }
  }, []);

  const handleOrder = async (serviceId: string, serviceOwnerId: string) => {
    setLoadingStates((prev) => ({ ...prev, [serviceId]: true }));
    setMessage(null);

    try {
      const userId = localStorage.getItem('userId'); 
      const response = await axios.post(
        `${baseUrl}/orders`,
         {
        serviceId,
        userId,
        serviceOwnerId,
        quantity: 1,
      });
       const status = response.status;
      setMessage(response.data.message || 'Order placed successfully!');
      if(status === 201){
      Swal.fire({
        title: 'Success',
        text:'Order placed successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      })
      }
    } catch (error) {
      setMessage('Failed to place the order. Please try again.');
      console.error('Error placing order:', error);

      Swal.fire({
    title: 'Error',
    text: 'Failed to place the order. Please try again.',
    icon: 'error',
    timer: 2000,
    showConfirmButton: false
  });
    } finally {
      setLoadingStates((prev) => ({ ...prev, [serviceId]: false }));
    }
  };

 const filteredService = services.filter((service) =>
  service?.serviceName?.toLowerCase().includes(searchQuery.toLowerCase())
);

  return (
      <div className={styles.services_list_box}>
        {/* <div className={styles.service_wrapper}> */}
          <div className={styles.create_service}>
            <h1>Available Services</h1>
            <Link href='/postservice' style={{textDecoration:'none'}}>
              <button>Post service</button>
            </Link>
          </div>
          <div className={styles.service_list}>
             {(searchQuery ? filteredService : services).map((service) => (
              <div key={service._id} className={styles.service_card}>
                <div className={styles.deco}>
                  <Image
                    src={service.imageUrl}
                    alt={service.serviceName}
                    className={styles.service_image}
                   width={300}
                   height={200}
                   
                     objectFit="cover"
                  />
                  <h2>{service.serviceName}</h2>
                  <p>Category: {service.category}</p>
                  <p>{service.description}</p>
                  <p>Price: ${service.price}</p>
                </div>
                <div className={styles.cardBottom}>
                  <p>{service.availability ? 'Available' : 'Not Available'}</p>
                </div>
                <button
                  disabled={!service.availability || loadingStates[service._id]}
                  className={styles.orderbtn}
                  onClick={() => handleOrder(service._id, service.serviceOwnerId)}
                >
                  {loadingStates[service._id] ? 'Placing Order...' : 'Order Now'}
                </button>
              </div>
            ))}
          </div>
        {/* </div> */}
      </div> 
  );
};

export default ServiceList;
