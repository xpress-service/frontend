'use client';

import { FC } from 'react';
import styles from '../sass/layout/loading.module.scss';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = 'primary', 
  text = 'Loading...', 
  fullScreen = false 
}) => {
  const spinnerClass = `${styles.spinner} ${styles[`spinner--${size}`]} ${styles[`spinner--${color}`]}`;
  const containerClass = fullScreen ? `${styles.container} ${styles['container--fullscreen']}` : styles.container;

  return (
    <div className={containerClass}>
      <div className={styles.spinnerWrapper}>
        <div className={spinnerClass}>
          <div className={styles.bounce1}></div>
          <div className={styles.bounce2}></div>
          <div className={styles.bounce3}></div>
        </div>
        {text && <p className={styles.loadingText}>{text}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;