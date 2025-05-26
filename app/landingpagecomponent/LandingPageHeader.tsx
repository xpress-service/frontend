'use client'
import Image from "next/image";
import React from "react";
import styles from "../sass/landingpage/header.module.scss";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LandingPageHeader = () => {
  const pathname = usePathname();

  return (
    <div className={styles.landingpage_header_box}>
      <main>
        <Image src="/logo.jpg" alt="logo" width={50} height={50} />
        <ul>
          <li className={pathname === '/' ? styles.active : ''}>
            <Link href='/'>Home</Link>
          </li>
          <li className={pathname === '/servicelist' ? styles.active : ''}>
            <Link href='/servicelist'>Book</Link>
          </li>
          <li className={pathname === '/notification' ? styles.active : ''}>
            <Link href='/notification'>Notification</Link>
          </li>
          <li className={pathname === '/history' ? styles.active : ''}>
            <Link href='/history'>History</Link>
          </li>
          <li className={pathname === '/about' ? styles.active : ''}>
            <Link href='/about'>About us</Link>
          </li>
        </ul>
        <div className={styles.landingpage_header_btn}>
          {/* <Link href="sign-in">
            <button className={styles.login}>Login</button>
          </Link> */}
          <Link href="/sign-in">
            <button className={styles.getstarted}>Get Started</button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default LandingPageHeader;
