import Skeleton from '../ui/Skeleton';

export default function AssignmentGroupCardSkeleton() {
  return (
    <div className="glass overflow-hidden rounded-[2.5rem] border border-surface-700 h-[100px]">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-5 w-full">
            {/* Icon Placeholder */}
            <Skeleton variant="rectangular" width="48px" height="48px" className="rounded-2xl shrink-0" />
            
            <div className="space-y-3 w-full">
              {/* Title Placeholder */}
              <Skeleton variant="text" width="50%" height="20px" />
              
              <div className="flex items-center gap-4">
                {/* Problems count placeholder */}
                <Skeleton variant="text" width="80px" height="10px" />
                <Skeleton variant="text" width="120px" height="10px" />
              </div>
            </div>
          </div>
          {/* Chevron Placeholder */}
          <Skeleton variant="rectangular" width="24px" height="24px" className="rounded-md shrink-0 mt-2" />
        </div>
      </div>
    </div>
  );
}
