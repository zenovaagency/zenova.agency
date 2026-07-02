import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ApplyButtonSize = 'sm' | 'md' | 'lg';

export interface ApplyButtonProps {
  text?: string;
  onClick?: () => void;
  className?: string;
  size?: ApplyButtonSize;
}

/**
 * Per-size tokens. The chip sits `right-1` (4px) from the edge; on hover it slides to
 * `right-[calc(100%-{chip+4}px)]` so it lands flush against the left padding. The collapsed
 * end-padding (`pe`) must clear the chip; on hover the start/end padding swap.
 */
const SIZE = {
  sm: {
    height: 'h-9',
    pad: 'ps-4 pe-11 hover:ps-11 hover:pe-4',
    chip: 'h-7 w-7',
    slide: 'group-hover:right-[calc(100%-32px)]',
    icon: 14,
    text: 'text-xs',
  },
  md: {
    height: 'h-12',
    pad: 'ps-6 pe-14 hover:ps-14 hover:pe-6',
    chip: 'h-10 w-10',
    slide: 'group-hover:right-[calc(100%-44px)]',
    icon: 16,
    text: 'text-sm',
  },
  lg: {
    height: 'h-14',
    pad: 'ps-8 pe-16 hover:ps-16 hover:pe-8',
    chip: 'h-12 w-12',
    slide: 'group-hover:right-[calc(100%-52px)]',
    icon: 18,
    text: 'text-base',
  },
} as const;

export function ApplyButton({
  text = 'Apply now',
  onClick,
  className = '',
  size = 'md',
}: ApplyButtonProps) {
  const s = SIZE[size];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative inline-flex w-fit items-center justify-center overflow-hidden rounded-full p-1 font-medium',
        'bg-primary text-primary-foreground hover:bg-primary/90',
        'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'cursor-pointer transition-[padding,background-color] duration-500 ease-out motion-reduce:transition-none',
        s.height,
        s.pad,
        s.text,
        className,
      )}
    >
      <span className="relative z-10 whitespace-nowrap transition-transform duration-500 ease-out motion-reduce:transition-none">
        {text}
      </span>
      <span
        className={cn(
          'absolute right-1 flex items-center justify-center rounded-full',
          'bg-background text-foreground transition-all duration-500 ease-out',
          'group-hover:rotate-45 motion-reduce:transition-none',
          s.chip,
          s.slide,
        )}
        aria-hidden="true"
      >
        <ArrowUpRight size={s.icon} />
      </span>
    </button>
  );
}
