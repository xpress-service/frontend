'use client'
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RouteDebugger() {
  const router = useRouter();

  useEffect(() => {
    console.log('Route debugger loaded');
    console.log('Current pathname:', window.location.pathname);
    console.log('Router object:', router);
  }, [router]);

  const testNavigation = () => {
    console.log('Testing navigation to /notification');
    try {
      router.push('/notification');
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      background: 'white', 
      border: '2px solid #ff9b05',
      padding: '10px',
      borderRadius: '8px',
      zIndex: 10000,
      fontSize: '12px'
    }}>
      <h4>Route Debugger</h4>
      <p>Current: {typeof window !== 'undefined' ? window.location.pathname : 'Loading...'}</p>
      <button onClick={testNavigation} style={{
        background: '#ff9b05',
        color: 'white',
        border: 'none',
        padding: '5px 10px',
        borderRadius: '4px',
        cursor: 'pointer'
      }}>
        Test Navigation
      </button>
    </div>
  );
}