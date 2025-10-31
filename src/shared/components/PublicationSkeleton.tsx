export default function PublicationSkeleton() {
  return (
    <div className='max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pb-24 lg:pb-8 lg:mt-6'>
      {/* Mobile Gallery Skeleton - Show first on mobile */}
      <div className='lg:hidden mb-6'>
        <div className='grid grid-cols-2 gap-2 rounded-xl overflow-hidden'>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className='aspect-square bg-muted rounded-lg animate-pulse'
            />
          ))}
        </div>
      </div>

      {/* Mobile Hero Card Skeleton */}
      <div className='lg:hidden mb-6'>
        <div className='bg-card rounded-xl p-4'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-14 h-14 rounded-full bg-muted animate-pulse' />
            <div className='flex-1 space-y-2'>
              <div className='h-5 bg-muted rounded w-3/4 animate-pulse' />
              <div className='h-4 bg-muted rounded w-1/2 animate-pulse' />
              <div className='h-3 bg-muted rounded w-2/3 animate-pulse' />
            </div>
          </div>

          {/* Mobile Specialties Skeleton */}
          <div className='mb-4'>
            <div className='flex flex-wrap gap-1.5'>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className='h-6 w-20 bg-muted rounded-full animate-pulse'
                />
              ))}
              <div className='h-6 w-12 bg-muted rounded-full animate-pulse' />
            </div>
          </div>

          {/* WhatsApp Skeleton */}
          <div className='p-3 bg-green-50 rounded-lg'>
            <div className='flex items-center gap-2 mb-1'>
              <div className='w-6 h-6 bg-green-100 rounded-full animate-pulse' />
              <div className='h-4 w-20 bg-green-100 rounded animate-pulse' />
            </div>
            <div className='h-3 w-32 bg-green-100 rounded ml-8 animate-pulse' />
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4'>
        {/* Main content skeleton */}
        <div className='lg:col-span-7 space-y-6 lg:order-1'>
          {/* Desktop Gallery skeleton */}
          <div className='hidden lg:block'>
            <div className='grid grid-cols-2 gap-2 rounded-xl overflow-hidden max-w-2xl'>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className='aspect-square bg-muted rounded-lg animate-pulse'
                />
              ))}
            </div>
          </div>
          
          {/* Description skeleton */}
          <div>
            <div className='h-6 w-40 bg-muted rounded mb-4 lg:mb-8 px-1 animate-pulse' />
            <div className='bg-white rounded-xl lg:rounded-2xl p-4 lg:p-8'>
              <div className='space-y-3'>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className='h-4 bg-muted rounded animate-pulse' />
                ))}
              </div>
            </div>
          </div>

          {/* Reviews skeleton */}
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

        {/* Desktop Sidebar skeleton */}
        <div className='hidden lg:block lg:col-span-5 xl:col-span-4 lg:order-2'>
          <div className='lg:sticky lg:top-20 space-y-6'>
            <div className='bg-card rounded-2xl p-6'>
              <div className='flex items-center gap-4 mb-6 mt-8'>
                <div className='w-20 h-20 rounded-full bg-muted animate-pulse' />
                <div className='space-y-2 flex-1'>
                  <div className='h-5 bg-muted rounded w-3/4 animate-pulse' />
                  <div className='h-4 bg-muted rounded w-1/2 animate-pulse' />
                </div>
              </div>
              <div className='mb-6'>
                <div className='h-4 bg-muted rounded w-28 mb-3 animate-pulse' />
                <div className='flex flex-wrap gap-2'>
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className='h-7 w-24 bg-muted rounded-full animate-pulse'
                    />
                  ))}
                </div>
              </div>
              <div className='mb-6'>
                <div className='h-4 bg-muted rounded w-32 mb-3 animate-pulse' />
                <div className='h-14 bg-muted rounded-xl animate-pulse' />
              </div>
              <div className='space-y-4'>
                <div className='p-4 bg-green-50 rounded-xl mb-4'>
                  <div className='flex items-center gap-3 mb-2'>
                    <div className='w-8 h-8 bg-green-100 rounded-full animate-pulse' />
                    <div className='h-4 w-20 bg-green-100 rounded animate-pulse' />
                  </div>
                  <div className='h-3 w-32 bg-green-100 rounded ml-11 animate-pulse' />
                </div>
                <div className='h-12 bg-muted rounded-xl animate-pulse' />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Button Skeleton */}
      <div className='fixed bottom-0 inset-x-0 lg:hidden z-50 bg-white border-t border-gray-200 shadow-lg' style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className='px-4 py-3'>
          <div className='h-12 bg-muted rounded-xl animate-pulse' />
        </div>
      </div>
    </div>
  );
}
