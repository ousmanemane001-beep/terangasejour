import { cn } from "@/lib/utils";

interface ShimmerBlockProps {
  className?: string;
  style?: React.CSSProperties;
}

const ShimmerBlock = ({ className, style }: ShimmerBlockProps) => (
  <div
    className={cn("shimmer rounded-xl", className)}
    style={style}
  />
);

export default ShimmerBlock;
