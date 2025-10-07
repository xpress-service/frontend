'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../../sass/postservice/service.module.scss';
import Image from 'next/image';
import Link from 'next/link';
import { useSearch } from "../../_layoutcomponents/searchContext";
import { useAuth } from "../../contexts/AuthContext";
import { FiPlus, FiSearch, FiFilter, FiMapPin, FiDollarSign, FiStar, FiClock } from 'react-icons/fi';
import { MdCategory, MdVerified } from 'react-icons/md';
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
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const { searchQuery } = useSearch();
  const { userRole } = useAuth();

  // Define categories with icons (matching backend service categories)
  const categories = [
    { id: 'all', name: 'All Services', icon: '🏪' },
    { id: 'Cleaning', name: 'Cleaning', icon: '🧹' },
    { id: 'Tutoring', name: 'Tutoring', icon: '📚' },
    { id: 'Delivery', name: 'Delivery', icon: '🚚' },
    { id: 'Repair', name: 'Repair', icon: '🔧' },
    { id: 'Beauty', name: 'Beauty', icon: '�' },
    { id: 'Fitness', name: 'Fitness', icon: '💪' },
    { id: 'Photography', name: 'Photography', icon: '📸' },
    { id: 'Catering', name: 'Catering', icon: '🍽️' },
    { id: 'Transportation', name: 'Transportation', icon: '🚗' },
    { id: 'Pet Care', name: 'Pet Care', icon: '�' },
    { id: 'Gardening', name: 'Gardening', icon: '🌱' },
    { id: 'Other', name: 'Other', icon: '�' }
  ];

  useEffect(() => {
    // Fetch services
    const fetchServices = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${baseUrl}/services`,
        );
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to load services. Please try again.',
          icon: 'error',
          timer: 3000,
          showConfirmButton: false
        });
      } finally {
        setLoading(false);
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

  // Advanced filtering and sorting
  const getFilteredAndSortedServices = () => {
    let filtered = services.filter((service) => {
      const matchesSearch = service?.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           service?.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || 
                            service.category?.toLowerCase() === selectedCategory?.toLowerCase();
      return matchesSearch && matchesCategory;
    });

    // Sort services
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.serviceName.localeCompare(b.serviceName));
        break;
      case 'newest':
      default:
        // Assuming newest first (you might want to add createdAt field)
        break;
    }

    return filtered;
  };

  const filteredServices = getFilteredAndSortedServices();

  if (loading) {
    return (
      <div className={styles.loading_container}>
        <div className={styles.spinner}></div>
        <p>Loading services...</p>
      </div>
    );
  }

  return (
    <div className={styles.services_list_box}>
      {/* Header Section */}
      <div className={styles.header_section}>
        <div className={styles.title_section}>
          <h1><FiSearch className={styles.icon} />Available Services</h1>
          <p className={styles.subtitle}>Discover and book amazing services from trusted providers</p>
        </div>
        {userRole === 'vendor' && (
          <Link href='/postservice' className={styles.post_service_link}>
            <button className={styles.post_service_btn}>
              <FiPlus className={styles.icon} />
              Post Service
            </button>
          </Link>
        )}
      </div>

      {/* Category Tabs */}
      <div className={styles.category_tabs_container}>
        <div className={styles.category_tabs}>
          {categories.map(category => (
            <button
              key={category.id}
              className={`${styles.category_tab} ${selectedCategory === category.id ? styles.active : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className={styles.category_icon}>{category.icon}</span>
              <span className={styles.category_name}>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Controls Section */}
      <div className={styles.controls_section}>
        <div className={styles.filter_group}>
          <div className={styles.sort_filter}>
            <FiFilter className={styles.filter_icon} />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.filter_select}
            >
              <option value="newest">Newest First</option>
              <option value="name">Name (A-Z)</option>
              <option value="price-low">Price (Low to High)</option>
              <option value="price-high">Price (High to Low)</option>
            </select>
          </div>
        </div>
        
        <div className={styles.results_info}>
          <span>{filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found</span>
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className={styles.no_services}>
          <div className={styles.no_services_content}>
            <FiSearch className={styles.no_services_icon} />
            <h3>No services found</h3>
            <p>Try adjusting your search criteria or check back later for new services.</p>
            {userRole === 'vendor' && (
              <Link href='/postservice'>
                <button className={styles.post_first_service_btn}>
                  <FiPlus className={styles.icon} />
                  Be the first to post a service
                </button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.service_grid}>
          {filteredServices.map((service: Service) => (
            <div key={service._id} className={styles.service_card}>
              <div className={styles.service_image_container}>
                <Image
                  src={service.imageUrl}
                  alt={service.serviceName}
                  className={styles.service_image}
                  width={300}
                  height={200}
                  style={{ objectFit: 'cover' }}
                />
                <div className={styles.availability_badge}>
                  <span className={`${styles.status_dot} ${service.availability ? styles.available : styles.unavailable}`}></span>
                  {service.availability ? 'Available' : 'Unavailable'}
                </div>
              </div>
              
              <div className={styles.service_content}>
                <div className={styles.service_header}>
                  <h3 className={styles.service_title}>{service.serviceName}</h3>
                  <div className={styles.service_rating}>
                    <FiStar className={styles.star_icon} />
                    <span>4.8</span>
                  </div>
                </div>
                
                <div className={styles.service_meta}>
                  <div className={styles.category_tag}>
                    <MdCategory className={styles.meta_icon} />
                    <span>{service.category}</span>
                  </div>
                </div>
                
                <p className={styles.service_description}>{service.description}</p>
                
                <div className={styles.service_footer}>
                  <div className={styles.price_section}>
                    <FiDollarSign className={styles.price_icon} />
                    <span className={styles.price}>${service.price}</span>
                    <span className={styles.price_unit}>per service</span>
                  </div>
                  
                  <button
                    disabled={!service.availability || loadingStates[service._id]}
                    className={`${styles.order_btn} ${!service.availability ? styles.disabled : ''}`}
                    onClick={() => handleOrder(service._id, service.serviceOwnerId)}
                  >
                    {loadingStates[service._id] ? (
                      <>
                        <div className={styles.btn_spinner}></div>
                        <span>Ordering...</span>
                      </>
                    ) : (
                      <>
                        <FiClock className={styles.btn_icon} />
                        <span>Book Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceList;
