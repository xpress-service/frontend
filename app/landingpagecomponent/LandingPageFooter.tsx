import Image from 'next/image'
import React from 'react'
import styles from '../sass/landingpage/footer.module.scss'


const LandingPageFooter = () => {
  return (
    <div className={styles.landingpage_footer_box}>
      <main>
      <div className={styles.footContainer}>
      <div className={styles.footImg}>
        <Image src='/naija.png' alt='flag' width={20} height={20}/>
        <Image src='/globe.png' alt='global' width={20} height={20}/>
      </div>
      <ul>
        <h3>Company</h3>
        <li>About Us</li>
        <li>Destination</li>
        <li>Packages</li>
        <li>Contacts</li>
      </ul>
      <ul>
      <h3>Help</h3>
        <li>Help/FAQ</li>
        <li>Cancel your order</li>
        <li>Press</li>
        <li></li>
      </ul>
      <ul>
      <h3>More</h3>
        <li>Book</li>
        <li>Investor relations</li>
        <li>Partnerships</li>
        <li>Jobs</li>
      </ul>
      <ul>
      <h3>Terms</h3>
        <li>Privacy Policy</li>
        <li>Terms of Use</li>
        <li>Accessibility</li>
        <li></li>
      </ul>
      </div>
      <div className={styles.Copyright}>
        <p>Copyright (c) 2023 ServiceXpress. All Right Reserved </p>
      </div>
      </main>
    </div>
  )
}

export default LandingPageFooter