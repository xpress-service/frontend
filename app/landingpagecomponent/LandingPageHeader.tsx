'use client'
import Image from "next/image";
import React, { useState, useEffect } from "react";
import styles from "../sass/landingpage/header.module.scss";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LandingPageHeader = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navigationItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/servicelist', label: 'Services', icon: '🛍️' },
    { href: '/notification', label: 'Notifications', icon: '🔔' },
    { href: '/ordertracking', label: 'Track Order', icon: '📦' },
    { href: '/about', label: 'About Us', icon: 'ℹ️' }
  ];

  return (
    <header className={`${styles.landingpage_header_box} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        {/* Logo Section */}
        <div className={styles.logo_section}>
          <Link href="/" className={styles.logo_link}>
            <Image 
              src="/logo.jpg" 
              alt="Servi-Xpress - On-demand services platform" 
              width={45} 
              height={45} 
              className={styles.logo}
            />
            <span className={styles.brand_name}>Servi-Xpress</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className={styles.desktop_nav}>
          <ul className={styles.nav_list}>
            {navigationItems.map((item) => (
              <li key={item.href} className={styles.nav_item}>
                <Link 
                  href={item.href} 
                  className={`${styles.nav_link} ${pathname === item.href ? styles.active : ''}`}
                >
                  <span className={styles.nav_icon}>{item.icon}</span>
                  <span className={styles.nav_text}>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Action Buttons */}
        <div className={styles.header_actions}>
          <Link 
            href="/sign-in" 
            className={styles.login_btn}
            prefetch={true}
          >
            Login
          </Link>
          <Link 
            href="/sign-up" 
            className={styles.cta_btn}
            prefetch={true}
          >
            Get Started
          </Link>
          
          {/* Mobile Menu Button */}
          <button 
            className={`${styles.mobile_menu_btn} ${isMenuOpen ? styles.open : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
          >
            <span className={styles.hamburger_line}></span>
            <span className={styles.hamburger_line}></span>
            <span className={styles.hamburger_line}></span>
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className={`${styles.mobile_nav} ${isMenuOpen ? styles.open : ''}`}>
          <div className={styles.mobile_nav_header}>
            <Image 
              src="/logo.jpg" 
              alt="ServiceXpress" 
              width={35} 
              height={35} 
              className={styles.mobile_logo}
            />
            <span className={styles.mobile_brand}>ServiceXpress</span>
            <button 
              className={styles.close_btn}
              onClick={closeMenu}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
          
          <ul className={styles.mobile_nav_list}>
            {navigationItems.map((item) => (
              <li key={item.href} className={styles.mobile_nav_item}>
                <Link 
                  href={item.href} 
                  className={`${styles.mobile_nav_link} ${pathname === item.href ? styles.active : ''}`}
                  onClick={closeMenu}
                >
                  <span className={styles.mobile_nav_icon}>{item.icon}</span>
                  <span className={styles.mobile_nav_text}>{item.label}</span>
                  <span className={styles.nav_arrow}>→</span>
                </Link>
              </li>
            ))}
          </ul>
          
          <div className={styles.mobile_nav_footer}>
            <Link 
              href="/sign-in" 
              className={styles.mobile_login} 
              onClick={closeMenu}
              prefetch={true}
            >
              Login to Account
            </Link>
            <Link 
              href="/sign-up" 
              className={styles.mobile_cta} 
              onClick={closeMenu}
              prefetch={true}
            >
              Create Account
            </Link>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div 
            className={styles.mobile_overlay}
            onClick={closeMenu}
            aria-hidden="true"
          />
        )}
      </div>
    </header>
  );
};

export default LandingPageHeader;
