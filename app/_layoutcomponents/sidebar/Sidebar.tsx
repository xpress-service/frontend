'use client'
import { HiHome, HiOutlineHome } from "react-icons/hi";
import { MdDashboard, MdOutlineDashboard, MdTrackChanges, MdOutlineTrackChanges } from "react-icons/md";

import { FaFirstOrder, FaRegClipboard } from "react-icons/fa";
import { GrTransaction } from "react-icons/gr";
import { BiUser, BiUserCircle } from "react-icons/bi";
import { RiServiceLine, RiServiceFill } from "react-icons/ri";
import { TbReceipt2 } from "react-icons/tb";
import { IoReceiptOutline } from "react-icons/io5";
import { HiChevronLeft } from "react-icons/hi2";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import styles from "../../sass/layout/layout.module.scss";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

interface NavItem {
  href: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  label: string;
  badge?: number;
}

interface SidebarProps {
  onToggleCollapse?: (collapsed: boolean) => void;
}

const Sidebar = ({ onToggleCollapse }: SidebarProps) => {
  const pathname = usePathname();
  const { userId, isAuthenticated } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notifications, setNotifications] = useState(0);

  // Navigation items with active/inactive icons
  const navItems: NavItem[] = [
    {
      href: "/",
      icon: <HiOutlineHome size={22} />,
      activeIcon: <HiHome size={22} />,
      label: "Home"
    },
    {
      href: "/dashboard",
      icon: <MdOutlineDashboard size={22} />,
      activeIcon: <MdDashboard size={22} />,
      label: "Dashboard"
    },
    {
      href: "/servicelist",
      icon: <RiServiceLine size={22} />,
      activeIcon: <RiServiceFill size={22} />,
      label: "Services"
    },
    {
      href: "/orders",
      icon: <FaRegClipboard size={22} />,
      activeIcon: <FaFirstOrder size={22} />,
      label: "Orders",
      badge: notifications
    },
    {
      href: "/ordertracking",
      icon: <MdOutlineTrackChanges size={22} />,
      activeIcon: <MdTrackChanges size={22} />,
      label: "Tracking"
    },
    {
      href: "/transaction",
      icon: <IoReceiptOutline size={22} />,
      activeIcon: <TbReceipt2 size={22} />,
      label: "Transaction"
    },
    {
      href: "/userprofile",
      icon: <BiUserCircle size={22} />,
      activeIcon: <BiUser size={22} />,
      label: "Profile"
    }
  ];

  // Check if path is active
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // Load actual order count
  useEffect(() => {
    const fetchOrderCount = async () => {
      if (!isAuthenticated || !userId) {
        setNotifications(0);
        return;
      }

      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${baseUrl}/orders/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Count pending or active orders
        const activeOrders = response.data.filter((order: any) => 
          order.status === 'pending' || order.status === 'in-progress'
        );
        setNotifications(activeOrders.length);
      } catch (error) {
        console.log('Could not fetch order count:', error);
        // Remove the badge if there's an error
        setNotifications(0);
      }
    };

    fetchOrderCount();
  }, [isAuthenticated, userId]);

  return (
    <aside className={`${styles.sidebarItems} ${isCollapsed ? styles.collapsed : ''}`}>
      {/* Logo Section */}
      <div className={styles.sidebar_header}>
        <Link href="/" className={styles.logo_container}>
          <div className={styles.logo_box}>
            <Image 
              src="/logo.jpg" 
              alt="ServiceXpress Logo" 
              width={isCollapsed ? 32 : 50} 
              height={isCollapsed ? 32 : 50}
              className={styles.logo_img}
            />
            {!isCollapsed && (
              <div className={styles.logo_text}>
                <h3>ServiceXpress</h3>
                <span>Your Service Hub</span>
              </div>
            )}
          </div>
        </Link>
        
        {/* Collapse Toggle */}
        <button 
          className={styles.collapse_btn}
          onClick={() => {
            const newCollapsedState = !isCollapsed;
            setIsCollapsed(newCollapsedState);
            onToggleCollapse?.(newCollapsedState);
          }}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <HiChevronLeft 
            size={16} 
            className={`${styles.collapse_icon} ${isCollapsed ? styles.rotated : ''}`}
          />
        </button>
      </div>

      {/* Navigation Section */}
      <nav className={styles.nav}>
        <div className={styles.nav_section}>
          {!isCollapsed && (
            <div className={styles.nav_title}>
              <span>Main Menu</span>
            </div>
          )}
          
          {navItems.map((item) => {
            const active = isActive(item.href);
            
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`${styles.icons} ${active ? styles.active : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className={styles.nav_icon}>
                  {active ? item.activeIcon : item.icon}
                </div>
                {!isCollapsed && (
                  <>
                    <p className={styles.nav_label}>{item.label.toUpperCase()}</p>
                    {item.badge && item.badge > 0 && (
                      <span className={styles.nav_badge}>{item.badge}</span>
                    )}
                  </>
                )}
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className={styles.nav_tooltip}>
                    <span>{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className={styles.tooltip_badge}>{item.badge}</span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer Section */}
      {!isCollapsed && (
        <div className={styles.sidebar_footer}>
          <div className={styles.footer_content}>
            <div className={styles.user_status}>
              <div className={styles.status_indicator}></div>
              <span>Online</span>
            </div>
            <p className={styles.footer_text}>
              ServiceXpress v2.0
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;