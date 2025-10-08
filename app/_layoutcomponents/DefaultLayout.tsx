'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from "../_layoutcomponents/header/Header";
import Sidebar from "../_layoutcomponents/sidebar/Sidebar";
import styles from "../sass/layout/layout.module.scss";
import { useAuth } from '../contexts/AuthContext';

interface DefaultLayoutProps {
  children: React.ReactNode;
  serviceOwnerId: string;
}

export default function DefaultLayout({ children, serviceOwnerId }: DefaultLayoutProps) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // Auto-collapse sidebar on mobile for better UX
      if (mobile) {
        setIsSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize layout after component mount - simplified
  useEffect(() => {
    setIsLoading(false); // Remove artificial delay for better performance
  }, []);

  // Handle sidebar collapse state
  const handleSidebarToggle = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };

  // Prevent body scroll when mobile overlay is active
  useEffect(() => {
    if (isMobile && !isSidebarCollapsed) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isMobile, isSidebarCollapsed]);

  // Get page title based on pathname
  const getPageTitle = (path: string) => {
    switch (path) {
      case '/dashboard':
        return 'Dashboard';
      case '/orders':
        return 'Orders';
      case '/ordertracking':
        return 'Order Tracking';
      case '/servicelist':
        return 'Services';
      case '/postservice':
        return 'Post Service';
      case '/transaction':
        return 'Transactions';
      case '/userprofile':
        return 'Profile';
      case '/notification':
        return 'Notifications';
      default:
        return 'Servi-Xpress';
    }
  };

  // Remove loading state to improve perceived performance
  // if (isLoading) {
  //   return (
  //     <div className={styles.layout_loading}>
  //       <div className={styles.loading_spinner}>
  //         <div></div>
  //         <div></div>
  //         <div></div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className={`${styles.layout_container} ${isSidebarCollapsed ? styles.sidebar_collapsed : ''}`}>
      <div className={styles.default}>
        {/* Skip to main content link for accessibility */}
        <a href="#main-content" className={styles.skip_link}>
          Skip to main content
        </a>

        {/* Header */}
        <header className={styles.header} role="banner">
          <Header serviceOwnerId={serviceOwnerId} />
        </header>

        {/* Main Content Area */}
        <div className={styles.content}>
          {/* Sidebar */}
          <aside 
            className={`${styles.sidebar} ${isMobile ? styles.mobile_sidebar : ''}`}
            role="navigation"
            aria-label="Main navigation"
          >
            <Sidebar />
          </aside>

          {/* Main Content */}
          <main 
            id="main-content"
            className={styles.main_content}
            role="main"
            aria-label={`${getPageTitle(pathname)} content`}
          >
            {/* Breadcrumb */}
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <ol className={styles.breadcrumb_list}>
                <li className={styles.breadcrumb_item}>
                  <a href="/dashboard">Home</a>
                </li>
                {pathname !== '/dashboard' && (
                  <li className={styles.breadcrumb_item} aria-current="page">
                    {getPageTitle(pathname)}
                  </li>
                )}
              </ol>
            </nav>

            {/* Page Content */}
            <div className={styles.page_content}>
              {children}
            </div>
          </main>
        </div>

        {/* Mobile Overlay */}
        {isMobile && !isSidebarCollapsed && (
          <div 
            className={styles.mobile_overlay} 
            onClick={() => setIsSidebarCollapsed(true)}
            style={{ 
              touchAction: 'auto',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none'
            }}
          />
        )}
      </div>
    </div>
  );
}
