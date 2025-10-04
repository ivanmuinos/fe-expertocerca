export default function PublicationSkeleton() {
  return (
    <div className='max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-8 lg:pb-8'>
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8'>
        {/* Sidebar skeleton */}
        <div className='hidden lg:block lg:col-span-5 xl:col-span-4'>
          <div className='sticky top-20 space-y-6'>
            <div className='bg-card rounded-2xl p-6 shadow-sm border border-border'>
              <div className='flex items-center gap-4 mb-6 mt-8'>
                <div className='w-20 h-20 rounded-full bg-muted animate-pulse' />
                <div className='space-y-2 flex-1'>
                  <div className='h-4 bg-muted rounded w-3/4 animate-pulse' />
                  <div className='h-3 bg-muted rounded w-1/2 animate-pulse' />
                </div>
              </div>
              <div className='space-y-3'>
                <div className='h-3 bg-muted rounded w-28 animate-pulse' />
                <div className='flex flex-wrap gap-2'>
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className='h-6 w-20 bg-muted rounded-full animate-pulse'
                    />
                  ))}
                </div>
                <div className='h-10 bg-muted rounded-xl animate-pulse' />
              </div>
            </div>
          </div>
        </div>

        {/* Main content skeleton */}
        <div className='lg:col-span-7 xl:col-span-8 space-y-6 lg:space-y-8'>
          <div>
            <div className='h-6 w-40 bg-muted rounded mb-4 lg:mb-8 animate-pulse' />
            <div className='bg-white border border-gray-200 rounded-xl lg:rounded-2xl p-4 lg:p-8'>
              <div className='space-y-3'>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className='h-4 bg-muted rounded animate-pulse' />
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className='h-6 w-32 bg-muted rounded mb-4 animate-pulse' />
            <div className='grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4'>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className='aspect-square bg-muted rounded-xl animate-pulse'
                />
              ))}
            </div>
          </div>

          <div>
            <div className='h-6 w-28 bg-muted rounded mb-4 animate-pulse' />
            <div className='space-y-3'>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className='h-16 bg-muted rounded-xl animate-pulse'
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
