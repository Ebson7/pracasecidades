import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs animate-pulse space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1.5 w-1/2">
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-3.5 bg-slate-100 rounded w-1/2" />
            </div>
            <div className="h-6 w-20 bg-slate-200 rounded-md" />
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="h-6 w-32 bg-slate-200 rounded-md" />
            <div className="h-8 w-24 bg-slate-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};
