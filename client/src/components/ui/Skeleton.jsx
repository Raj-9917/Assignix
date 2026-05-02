export default function Skeleton({ className = "", variant = "rectangular", width, height }) {
  const variantStyles = {
    text: "rounded-md h-4 w-full",
    circular: "rounded-full",
    rectangular: "rounded-2xl"
  };

  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div 
      className={`bg-slate-900/5 border border-slate-200/50 relative overflow-hidden ${variantStyles[variant]} ${className}`}
      style={style}
    >
      <div className="absolute inset-0 skeleton-scanline bg-gradient-to-b from-transparent via-brand-500/10 to-transparent" />
    </div>
  );
}
