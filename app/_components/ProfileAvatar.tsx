'use client'
import React, { useState } from 'react';
import Image from 'next/image';

interface ProfileAvatarProps {
  src?: string | null;
  alt?: string;
  firstname?: string;
  lastname?: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  src,
  alt,
  firstname = '',
  lastname = '',
  width = 40,
  height = 40,
  className = '',
  style = {}
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Generate initials from first and last name
  const getInitials = (first: string, last: string) => {
    const firstInitial = first?.charAt(0)?.toUpperCase() || '';
    const lastInitial = last?.charAt(0)?.toUpperCase() || '';
    return firstInitial + lastInitial || 'U'; // Default to 'U' for User
  };

  // Generate background color based on name
  const getBackgroundColor = (name: string) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
      '#EE5A24', '#0097E6', '#8C7AE6', '#A4B0BE', '#2F3542'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getInitials(firstname, lastname);
  const backgroundColor = getBackgroundColor(firstname + lastname);
  const shouldShowImage = src && !imageError && imageLoading === false;

  const avatarStyle: React.CSSProperties = {
    width: `${width}px`,
    height: `${height}px`,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: shouldShowImage ? 'transparent' : backgroundColor,
    color: 'white',
    fontSize: `${Math.max(12, width * 0.4)}px`,
    fontWeight: '600',
    border: '2px solid #ff9b05',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    ...style
  };

  return (
    <div className={className} style={avatarStyle}>
      {src && !imageError ? (
        <Image
          src={src}
          alt={alt || `${firstname} ${lastname}`.trim() || 'User'}
          width={width}
          height={height}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '50%'
          }}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
          priority={false}
        />
      ) : (
        <span style={{ 
          userSelect: 'none',
          textShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}>
          {initials}
        </span>
      )}
    </div>
  );
};

export default ProfileAvatar;