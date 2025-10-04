export default function HomeSkeleton() {
  return (
    <div className='space-y-6'>
      {[...Array(3)].map((_, idx) => (
        <div key={idx} className='space-y-3'>
          {/* Category title skeleton */}
          <div className='h-6 bg-muted rounded w-48 animate-pulse' />

          {/* Carousel of cards skeleton */}
          <div className='flex gap-3 overflow-hidden'>
            {[...Array(4)].map((__, i) => (
              <div
                key={i}
                className='flex-shrink-0 w-[200px] sm:w-[240px] md:w-[260px]'
              >
                <div className='bg-white rounded-xl hover:shadow-md transition-shadow duration-300 overflow-hidden'>
                  {/* Image skeleton - aspect-square */}
                  <div className='aspect-square relative bg-muted animate-pulse' />

                  {/* Content skeleton */}
                  <div className='p-3'>
                    <div className='space-y-2'>
                      {/* Title */}
                      <div className='h-5 bg-muted rounded w-3/4 animate-pulse' />

                      {/* Specialty */}
                      <div className='flex items-center gap-1.5'>
                        <div className='h-4 w-4 bg-muted rounded animate-pulse' />
                        <div className='h-4 bg-muted rounded w-20 animate-pulse' />
                      </div>

                      {/* Location */}
                      <div className='flex items-center gap-1'>
                        <div className='h-4 w-4 bg-muted rounded animate-pulse' />
                        <div className='h-3 bg-muted rounded w-2/3 animate-pulse' />
                      </div>

                      {/* Skills badges */}
                      <div className='flex flex-wrap gap-1 pt-1'>
                        <div className='h-5 bg-muted rounded-full w-16 animate-pulse' />
                        <div className='h-5 bg-muted rounded-full w-20 animate-pulse' />
                      </div>

                      {/* Price */}
                      <div className='pt-1'>
                        <div className='h-5 bg-muted rounded w-24 animate-pulse' />
                      </div>
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
