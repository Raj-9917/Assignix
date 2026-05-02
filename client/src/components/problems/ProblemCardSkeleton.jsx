import Skeleton from '../ui/Skeleton';

export default function ProblemCardSkeleton() {
  return (
    <div className="glass p-6 rounded-[2.5rem] border border-surface-700 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-5 w-full">
          {/* Icon Placeholder */}
          <Skeleton variant="rectangular" width="48px" height="48px" className="rounded-2xl shrink-0" />
          
          <div className="space-y-3 w-full">
            {/* Title Placeholder */}
            <Skeleton variant="text" width="60%" height="24px" />
            
            <div className="flex items-center gap-3">
              {/* Badge Placeholder */}
              <Skeleton variant="rectangular" width="60px" height="20px" className="rounded-full" />
              {/* Category Placeholder */}
              <Skeleton variant="text" width="80px" height="12px" />
            </div>
          </div>
        </div>
      </div>

      {/* Tags Placeholder */}
      <div className="mt-6 flex flex-wrap gap-2 pt-6 border-t border-surface-700">
        <Skeleton variant="rectangular" width="50px" height="24px" className="rounded-full" />
        <Skeleton variant="rectangular" width="70px" height="24px" className="rounded-full" />
        <Skeleton variant="rectangular" width="60px" height="24px" className="rounded-full" />
      </div>
    </div>
  );
}
