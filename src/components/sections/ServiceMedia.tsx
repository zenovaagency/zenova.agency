'use client';
import { useRef, useState } from 'react';

interface ServiceMediaProps {
  image?: string;
  video?: string;
  alt: string;
  loading?: 'lazy' | 'eager';
  className?: string;
  style?: React.CSSProperties;
  objectFit?: 'cover' | 'contain' | 'fill';
  /** Called when media is done loading (image loaded, video can play). */
  onLoad?: () => void;
}

export function ServiceMedia({
  image,
  video,
  alt,
  loading = 'lazy',
  className,
  style,
  objectFit = 'cover',
  onLoad,
}: ServiceMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);

  const notify = () => {
    if (!loaded) {
      setLoaded(true);
      onLoad?.();
    }
  };

  if (video) {
    return (
      <video
        ref={videoRef}
        src={video}
        poster={image}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        tabIndex={-1}
        onCanPlay={notify}
        onEnded={notify}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          objectFit,
          display: 'block',
          ...style,
        }}
      />
    );
  }

  return (
    <img
      src={image}
      alt={alt}
      loading={loading}
      decoding="async"
      onLoad={notify}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        objectFit,
        display: 'block',
        ...style,
      }}
    />
  );
}
