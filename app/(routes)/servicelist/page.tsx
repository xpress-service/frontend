 'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../../sass/postservice/service.module.scss';
import Image from 'next/image';

interface Service {
  _id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  availability: boolean;
  imageUrl: string;
}

const ServiceList: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);


  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/services');
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className={styles.services_list_box}>
      <div className={styles.service_wrapper}>
      <h1>Available Services</h1>
      
      <div className={styles.service_list}>

        {services.map((service) => (
          <div key={service._id} className={styles.service_card}>
            <div className={styles.deco}>
            <Image
                  src={service.imageUrl}
                  alt={service.serviceName}
                  className={styles.service_image}
                  width={200} 
                  height={200}
                  layout="responsive"
                />
            <h2>{service.serviceName}</h2>
            <p>Category: {service.category}</p>
            <p>{service.description}</p>
            <p>Price: ${service.price}</p>
            </div>
            <div className={styles.cardBottom}>
            <p>{service.availability ? 'Available' : 'Not Available'}</p>
            </div>
            <button disabled={!service.availability} className={styles.orderbtn}>Order Now</button>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};

export default ServiceList;
