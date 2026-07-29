import type { ProjectImage } from '@/data/projects';
import { ProjectVisual } from './ProjectVisual';

interface ProjectPreviewProps {
  images?: ProjectImage[];
  visualIdx: number;
  tone: string;
  animate: boolean;
}

export function ProjectPreview({ images, visualIdx, tone, animate }: ProjectPreviewProps) {
  const first = images?.[0];
  if (first?.src) {
    return (
      <img
        src={first.src}
        alt={first.alt ?? ''}
        loading="lazy"
        decoding="async"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: animate ? 'scale(1.04)' : 'scale(1)',
          transition: 'transform .6s cubic-bezier(.2,.7,.2,1)',
        }}
      />
    );
  }
  return <ProjectVisual idx={visualIdx} tone={tone} animate={animate} />;
}
