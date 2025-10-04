export default function HomeSkeleton() {
  return (
    <div className='space-y-6'>
      {[...Array(3)].map((_, idx) => (
        <div key={idx} className='space-y-3'>
          <div className='h-5 bg-muted rounded w-48 animate-pulse' />
          <div className='flex gap-3 overflow-hidden'>
            {[...Array(4)].map((__, i) => (
              <div key={i} className='flex-shrink-0 w-[160px] sm:w-[180px]'>
                <div className='bg-white rounded-xl border border-border overflow-hidden'>
                  <div className='aspect-square bg-muted animate-pulse' />
                  <div className='p-3 space-y-2'>
                    <div className='h-4 bg-muted rounded w-3/4' />
                    <div className='h-3 bg-muted rounded w-1/2' />
                    <div className='flex gap-1'>
                      <div className='h-5 bg-muted rounded-full w-12' />
                      <div className='h-5 bg-muted rounded-full w-16' />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
