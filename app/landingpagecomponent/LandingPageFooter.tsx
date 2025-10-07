import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import styles from '../sass/landingpage/footer.module.scss'

const LandingPageFooter = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Company',
      links: [
        { href: '/about', label: 'About Us' },
        { href: '/careers', label: 'Careers' },
        { href: '/press', label: 'Press & Media' },
        { href: '/contact', label: 'Contact Us' }
      ]
    },
    {
      title: 'Services',
      links: [
        { href: '/servicelist', label: 'Browse Services' },
        { href: '/postservice', label: 'Become a Provider' },
        { href: '/ordertracking', label: 'Track Your Order' },
        { href: '/dashboard', label: 'Dashboard' }
      ]
    },
    {
      title: 'Support',
      links: [
        { href: '/help', label: 'Help Center' },
        { href: '/faq', label: 'FAQ' },
        { href: '/contact', label: 'Customer Support' },
        { href: '/feedback', label: 'Send Feedback' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { href: '/privacy', label: 'Privacy Policy' },
        { href: '/terms', label: 'Terms of Service' },
        { href: '/accessibility', label: 'Accessibility' },
        { href: '/cookies', label: 'Cookie Policy' }
      ]
    }
  ];

  const socialLinks = [
    { href: 'https://facebook.com/servicexpress', icon: '📘', label: 'Facebook' },
    { href: 'https://twitter.com/servicexpress', icon: '🐦', label: 'Twitter' },
    { href: 'https://instagram.com/servicexpress', icon: '📷', label: 'Instagram' },
    { href: 'https://linkedin.com/company/servicexpress', icon: '💼', label: 'LinkedIn' }
  ];

  return (
    <footer className={styles.landingpage_footer_box}>
      <div className={styles.container}>
        {/* Main Footer Content */}
        <div className={styles.footer_main}>
          {/* Brand Section */}
          <div className={styles.brand_section}>
            <div className={styles.brand_info}>
              <Link href="/" className={styles.footer_logo}>
                <Image 
                  src="/logo.jpg" 
                  alt="ServiceXpress" 
                  width={40} 
                  height={40} 
                  className={styles.logo_img}
                />
                <span className={styles.brand_name}>ServiceXpress</span>
              </Link>
              <p className={styles.brand_description}>
                Your trusted platform for on-demand services. Connecting customers 
                with professional service providers across Nigeria and beyond.
              </p>
              <div className={styles.location_info}>
                <div className={styles.location_item}>
                  <Image src='/naija.png' alt='Nigeria flag' width={24} height={24}/>
                  <span>Available in Nigeria</span>
                </div>
                <div className={styles.location_item}>
                  <Image src='/globe.png' alt='Global coverage' width={24} height={24}/>
                  <span>Expanding Globally</span>
                </div>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className={styles.newsletter_section}>
              <h3>Stay Updated</h3>
              <p>Get the latest news and special offers delivered to your inbox.</p>
              <form className={styles.newsletter_form}>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className={styles.email_input}
                />
                <button type="submit" className={styles.subscribe_btn}>
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Footer Links */}
          <div className={styles.footer_links}>
            {footerSections.map((section) => (
              <div key={section.title} className={styles.footer_column}>
                <h3 className={styles.column_title}>{section.title}</h3>
                <ul className={styles.links_list}>
                  {section.links.map((link) => (
                    <li key={link.href} className={styles.link_item}>
                      <Link href={link.href} className={styles.footer_link}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Bottom */}
        <div className={styles.footer_bottom}>
          <div className={styles.bottom_left}>
            <p className={styles.copyright}>
              © {currentYear} ServiceXpress. All rights reserved.
            </p>
            <div className={styles.certifications}>
              <span className={styles.cert_item}>🔒 SSL Secured</span>
              <span className={styles.cert_item}>✅ Verified Platform</span>
              <span className={styles.cert_item}>🏆 Award Winning</span>
            </div>
          </div>

          {/* Social Links */}
          <div className={styles.social_section}>
            <span className={styles.social_title}>Follow Us:</span>
            <div className={styles.social_links}>
              {socialLinks.map((social) => (
                <Link 
                  key={social.href} 
                  href={social.href} 
                  className={styles.social_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                >
                  <span className={styles.social_icon}>{social.icon}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* App Download Section */}
        <div className={styles.app_download}>
          <p className={styles.download_text}>Download our mobile app for a better experience</p>
          <div className={styles.download_buttons}>
            <Link href="#" className={styles.download_btn}>
              <span className={styles.store_icon}>📱</span>
              <div className={styles.store_text}>
                <span className={styles.store_line1}>Download on the</span>
                <span className={styles.store_line2}>App Store</span>
              </div>
            </Link>
            <Link href="#" className={styles.download_btn}>
              <span className={styles.store_icon}>🤖</span>
              <div className={styles.store_text}>
                <span className={styles.store_line1}>Get it on</span>
                <span className={styles.store_line2}>Google Play</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default LandingPageFooter