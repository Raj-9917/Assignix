import Skeleton from '../ui/Skeleton';

export default function AssignmentCardSkeleton() {
  return (
    <div className="relative bg-white border border-surface-700 rounded-[2.5rem] p-10 shadow-sm overflow-hidden min-h-[300px]">
      <div className="flex justify-between items-start mb-6">
        {/* Category Badge Placeholder */}
        <Skeleton variant="rectangular" width="100px" height="24px" className="rounded-xl shrink-0" />
        {/* Status Badge Placeholder */}
        <Skeleton variant="rectangular" width="120px" height="32px" className="rounded-full shrink-0" />
      </div>

      {/* Title Placeholder */}
      <div className="mb-3">
        <Skeleton variant="text" width="70%" height="32px" />
      </div>

      {/* Description Placeholder */}
      <div className="mb-10 space-y-2">
        <Skeleton variant="text" width="40%" height="14px" />
      </div>

      <div className="flex items-center justify-between pt-8 border-t border-surface-700">
        <div className="space-y-3">
          {/* Due Date Label Placeholder */}
          <Skeleton variant="text" width="60px" height="10px" />
          {/* Due Date Value Placeholder */}
          <Skeleton variant="text" width="100px" height="16px" />
        </div>

        {/* Action Button Placeholder */}
        <Skeleton variant="rectangular" width="140px" height="48px" className="rounded-2xl shrink-0" />
      </div>
    </div>
  );
}
