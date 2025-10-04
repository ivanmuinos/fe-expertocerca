export default function MisPublicationsSkeleton() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
      {[...Array(6)].map((_, i) => (
        <div key={i} className='bg-card border border-border rounded-2xl p-6'>
          <div className='space-y-5'>
            <div className='flex gap-4'>
              <div className='h-16 w-16 bg-muted rounded-full animate-pulse' />
              <div className='flex-1'>
                <div className='h-4 bg-muted rounded w-3/4 mb-2 animate-pulse' />
                <div className='h-3 bg-muted rounded w-1/2 animate-pulse' />
              </div>
            </div>
            <div className='h-20 bg-muted rounded-xl animate-pulse' />
            <div className='flex gap-2'>
              <div className='h-6 bg-muted rounded-full w-16 animate-pulse' />
              <div className='h-6 bg-muted rounded-full w-20 animate-pulse' />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
