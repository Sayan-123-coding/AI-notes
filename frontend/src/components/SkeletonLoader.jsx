// Reusable skeleton loader component
const SkeletonLoader = ({ count = 2 }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array(count)
        .fill(0)
        .map((_, index) => (
          <div
            key={index}
            className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-7 sm:p-8 animate-pulse"
          >
            {/* Category Badge skeleton */}
            <div className="mb-4">
              <div className="inline-block h-8 bg-white/10 rounded-lg w-32"></div>
            </div>

            {/* Note text skeleton */}
            <div className="mb-6 space-y-3">
              <div className="h-4 bg-white/10 rounded w-full"></div>
              <div className="h-4 bg-white/10 rounded w-5/6"></div>
              <div className="h-4 bg-white/10 rounded w-4/6"></div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/10 mb-6"></div>

            {/* Summary skeleton */}
            <div className="mb-6">
              <div className="h-6 bg-white/10 rounded w-24 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-white/10 rounded"></div>
                <div className="h-4 bg-white/10 rounded w-5/6"></div>
              </div>
            </div>

            {/* Action buttons skeleton */}
            <div className="flex gap-3">
              <div className="flex-1 h-12 bg-white/10 rounded-xl"></div>
              <div className="flex-1 h-12 bg-white/10 rounded-xl"></div>
              <div className="flex-1 h-12 bg-white/10 rounded-xl"></div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default SkeletonLoader;
