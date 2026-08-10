'use client';
import { useEffect, useRef, useState } from 'react';
import { ServiceVisual, type ServiceVisualKind } from './ServiceVisual';

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
  /** Animated placeholder to fall back to when there is no usable media. */
  visual?: ServiceVisualKind;
  hue?: string;
  active?: boolean;
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
  visual,
  hue,
  active = true,
}: ServiceMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const notify = () => {
    if (!loaded) {
      setLoaded(true);
      onLoad?.();
    }
  };

  // Nudge muted autoplay — some browsers won't start a decorative aria-hidden
  // video on their own. If play() is rejected (iOS Low Power Mode, Data Saver)
  // and there's no poster to fall back to, drop to the placeholder rather than
  // leaving a blank box the viewer can't recover from (the video has no controls).
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !video) return;
    const p = el.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {
        if (!image) setVideoFailed(true);
      });
    }
  }, [video, image]);

  const fit: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit,
    display: 'block',
    ...style,
  };

  if (video && !videoFailed) {
    return (
      <video
        ref={videoRef}
        src={video}
        poster={image}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
        onCanPlay={notify}
        onEnded={notify}
        onError={() => setVideoFailed(true)}
        className={className}
        style={fit}
      />
    );
  }

  if (image) {
    return (
      <img
        src={image}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={notify}
        className={className}
        style={fit}
      />
    );
  }

  if (visual) {
    return <ServiceVisual kind={visual} hue={hue ?? '#ff813a'} active={active} />;
  }

  return null;
}
