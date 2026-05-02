import Skeleton from '../ui/Skeleton';

export function ActivityFeedSkeleton() {
  return (
    <div className="glass rounded-[2.5rem] p-8 border border-surface-700 shadow-sm h-full">
      <div className="flex items-center gap-3 mb-8">
        <Skeleton variant="rectangular" width="24px" height="24px" className="rounded-md" />
        <Skeleton variant="text" width="100px" height="18px" />
      </div>
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton variant="circular" width="32px" height="32px" className="shrink-0" />
            <div className="space-y-2 w-full">
              <Skeleton variant="text" width="80%" height="14px" />
              <Skeleton variant="text" width="40%" height="10px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProgressCardSkeleton() {
  return (
    <div className="glass rounded-[3rem] p-10 border border-surface-700 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <Skeleton variant="text" width="150px" height="20px" />
        <Skeleton variant="rectangular" width="60px" height="30px" className="rounded-full" />
      </div>
      <Skeleton variant="rectangular" width="100%" height="12px" className="rounded-full mb-10" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton variant="text" width="40px" height="10px" />
            <Skeleton variant="text" width="60px" height="18px" />
          </div>
        ))}
      </div>
    </div>
  );
}
