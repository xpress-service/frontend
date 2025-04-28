//  'use client'
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import styles from '../../sass/postservice/service.module.scss';
// import Image from 'next/image';
// import Link from 'next/link';
// import io from 'socket.io-client';


// interface Service {
//   _id: string;
//   serviceName: string;
//   category: string;
//   description: string;
//   price: number;
//   availability: boolean;
//   imageUrl: string;
// }

// const ServiceList: React.FC = () => {
//   const [services, setServices] = useState<Service[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [message, setMessage] = useState<string | null>(null);

//   const socket = io('http://localhost:5000');
//   useEffect(() => {
//     const fetchServices = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/api/services');
//         setServices(response.data);
//       } catch (error) {
//         console.error('Error fetching services:', error);
//       }
//     };

//     fetchServices();
//   }, []);


//   const handleOrder = async (serviceId: string) => {
//     setIsLoading(true);
//     setMessage(null); // Clear any previous messages
//     try {
//       const userId = localStorage.getItem("userId"); // Replace with the actual logged-in user's ID
//       const response = await axios.post('http://localhost:5000/api/orders', {
//         serviceId,
//         userId,
//         quantity: 1, // You can customize this if you want to allow multiple quantities
//       });
//       setMessage(response.data.message || 'Order placed successfully!');
//     } catch (error) {
//       setMessage('Failed to place the order. Please try again.');
//       console.error('Error placing order:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

 

// // useEffect(() => {
// //   socket.emit('join', serviceOwnerId);

// //   socket.on('notification', (message) => {
// //     alert(message); // Display real-time notification
// //     fetchNotifications(serviceOwnerId); // Refresh notifications
// //   });

// //   return () => {
// //     socket.disconnect();
// //   };
// // }, [serviceOwnerId]);


//   return (
//     <div className={styles.services_list_box}>
//       <div className={styles.service_wrapper}>
//         <div className={styles.create_service}>
//       <h1>Available Services</h1>
//       <Link href='/postservice'>
//       <button>Post service</button>
//       </Link>
//       </div>
//       <div className={styles.service_list}>
//         {services.map((service) => (
//           <div key={service._id} className={styles.service_card}>
//             <div className={styles.deco}>
//             <Image
//                   src={service.imageUrl}
//                   alt={service.serviceName}
//                   className={styles.service_image}
//                   width={100} 
//                   height={100}
//                   layout="responsive"
//                 />
//             <h2>{service.serviceName}</h2>
//             <p>Category: {service.category}</p>
//             <p>{service.description}</p>
//             <p>Price: ${service.price}</p>
//             </div>
//             <div className={styles.cardBottom}>
//             <p>{service.availability ? 'Available' : 'Not Available'}</p>
//             </div>
//             <button
//                 disabled={!service.availability || isLoading}
//                 className={styles.orderbtn}
//                 onClick={() => handleOrder(service._id)}
//               >
//                 {isLoading ? 'Placing Order...' : 'Order Now'}
//               </button>
//           </div>
//         ))}
//       </div>
//       </div>
//     </div>
//   );
// };

// export default ServiceList;


// 'use client'
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import styles from '../../sass/postservice/service.module.scss';
// import Image from 'next/image';
// import Link from 'next/link';
// import DefaultLayout from '@/app/_layoutcomponents/DefaultLayout';
// // import io from 'socket.io-client';

// interface Service {
//   _id: string;
//   serviceName: string;
//   category: string;
//   description: string;
//   price: number;
//   availability: boolean;
//   imageUrl: string;
//   serviceOwnerId: string;
// }

// const ServiceList: React.FC = () => {
//   const [services, setServices] = useState<Service[]>([]);
//   const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
//   const [message, setMessage] = useState<string | null>(null);

//   // const socket = io('http://localhost:5000');

//   useEffect(() => {
//     const fetchServices = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/api/services');
//         setServices(response.data);
//       } catch (error) {
//         console.error('Error fetching services:', error);
//       }
//     };

//     fetchServices();
//   }, []);

//   const handleOrder = async (serviceId: string, serviceOwnerId: string) => {
//     setLoadingStates((prev) => ({ ...prev, [serviceId]: true }));
//     setMessage(null); // Clear any previous messages

//     try {
//       const userId = localStorage.getItem("userId"); // Replace with the actual logged-in user's ID
//       const response = await axios.post('http://localhost:5000/api/orders', {
//         serviceId,
//         userId,
//         serviceOwnerId,
//         quantity: 1, // You can customize this if you want to allow multiple quantities
//       });
//       setMessage(response.data.message || 'Order placed successfully!');
//     } catch (error) {
//       setMessage('Failed to place the order. Please try again.');
//       console.error('Error placing order:', error);
//     } finally {
//       setLoadingStates((prev) => ({ ...prev, [serviceId]: false }));
//     }
//   };

//   return (
//     <DefaultLayout>
//     <div className={styles.services_list_box}>
//       <div className={styles.service_wrapper}>
//         <div className={styles.create_service}>
//           <h1>Available Services</h1>
//           <Link href='/postservice'>
//             <button>Post service</button>
//           </Link>
//         </div>
//         <div className={styles.service_list}>
//           {services.map((service) => (
//             <div key={service._id} className={styles.service_card}>
//               <div className={styles.deco}>
//                 <Image
//                   src={service.imageUrl}
//                   alt={service.serviceName}
//                   className={styles.service_image}
//                   width={100} 
//                   height={100}
//                   layout="responsive"
//                 />
//                 <h2>{service.serviceName}</h2>
//                 <p>Category: {service.category}</p>
//                 <p>{service.description}</p>
//                 <p>Price: ${service.price}</p>
//               </div>
//               <div className={styles.cardBottom}>
//                 <p>{service.availability ? 'Available' : 'Not Available'}</p>
//               </div>
//               <button
//                 disabled={!service.availability || loadingStates[service._id]}
//                 className={styles.orderbtn}
//                 onClick={() => handleOrder(service._id, service.serviceOwnerId)}
//               >
//                 {loadingStates[service._id] ? 'Placing Order...' : 'Order Now'}
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//     </DefaultLayout>
//   );
// };

// export default ServiceList;


'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../../sass/postservice/service.module.scss';
import Image from 'next/image';
import Link from 'next/link';
import DefaultLayout from '@/app/_layoutcomponents/DefaultLayout';

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

const ServiceList: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [message, setMessage] = useState<string | null>(null);
  const [serviceOwnerId, setServiceOwnerId] = useState<string | null>(null); // Add state for serviceOwnerId

  useEffect(() => {
    // Fetch services
    const fetchServices = async () => {
      try {
        const response = await axios.get(
          'https://backend-production-d818.up.railway.app/api/services',
          // 'http://localhost:5000/api/services',
        );
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchServices();

    // Fetch serviceOwnerId (e.g., from local storage or API)
    const storedOwnerId = localStorage.getItem('serviceOwnerId'); // Replace with actual logic
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
      const userId = localStorage.getItem('userId'); // Replace with actual logged-in user's ID
      const response = await axios.post(
        'https://backend-production-d818.up.railway.app/api/orders',
        // 'http://localhost:5000/api/orders',
         {
        serviceId,
        userId,
        serviceOwnerId,
        quantity: 1,
      });
      setMessage(response.data.message || 'Order placed successfully!');
    } catch (error) {
      setMessage('Failed to place the order. Please try again.');
      console.error('Error placing order:', error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [serviceId]: false }));
    }
  };

  return (
    <DefaultLayout serviceOwnerId={serviceOwnerId || ''}>
      <div className={styles.services_list_box}>
        <div className={styles.service_wrapper}>
          <div className={styles.create_service}>
            <h1>Available Services</h1>
            <Link href='/postservice'>
              <button>Post service</button>
            </Link>
          </div>
          <div className={styles.service_list}>
            {services.map((service) => (
              <div key={service._id} className={styles.service_card}>
                <div className={styles.deco}>
                  <Image
                    src={service.imageUrl}
                    alt={service.serviceName}
                    className={styles.service_image}
                    width={100}
                    height={100}
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
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ServiceList;
