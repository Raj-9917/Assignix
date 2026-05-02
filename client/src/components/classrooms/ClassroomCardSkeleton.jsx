import Skeleton from '../ui/Skeleton';

export default function ClassroomCardSkeleton() {
  return (
    <div className="bg-white border border-surface-700 rounded-[2.5rem] overflow-hidden shadow-sm h-[400px]">
      {/* Visual Accent placeholder */}
      <div className="h-2 bg-surface-800 animate-pulse" />
      
      <div className="p-10">
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-3 w-full">
            {/* Title Placeholder */}
            <Skeleton variant="text" width="60%" height="28px" />
            {/* Teacher Placeholder */}
            <Skeleton variant="text" width="40%" height="12px" />
          </div>
          {/* Icon Placeholder */}
          <Skeleton variant="rectangular" width="56px" height="56px" className="rounded-2xl shrink-0" />
        </div>

        <div className="grid grid-cols-2 gap-5 mb-10">
          {/* Stats Placeholders */}
          <Skeleton variant="rectangular" width="100%" height="80px" className="rounded-3xl" />
          <Skeleton variant="rectangular" width="100%" height="80px" className="rounded-3xl" />
        </div>

        {/* Action Button Placeholder */}
        <Skeleton variant="rectangular" width="100%" height="60px" className="rounded-2xl" />
      </div>
    </div>
  );
}
