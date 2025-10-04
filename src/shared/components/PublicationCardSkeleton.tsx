export default function PublicationCardSkeleton() {
  return (
    <div className='flex-shrink-0 w-[160px] sm:w-[180px]'>
      <div className='bg-white rounded-xl border border-border overflow-hidden'>
        <div className='aspect-square bg-muted animate-pulse' />
        <div className='p-3 space-y-2'>
          <div className='h-4 bg-muted rounded w-3/4 animate-pulse' />
          <div className='h-3 bg-muted rounded w-1/2 animate-pulse' />
          <div className='flex gap-1 pt-1'>
            <div className='h-5 bg-muted rounded-full w-12 animate-pulse' />
            <div className='h-5 bg-muted rounded-full w-16 animate-pulse' />
          </div>
        </div>
      </div>
    </div>
  );
}
