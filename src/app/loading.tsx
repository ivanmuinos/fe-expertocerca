export default function Loading() {
  return (
    <div className='min-h-screen bg-background flex items-center justify-center'>
      <div className='text-center space-y-4'>
        <div className='w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto' />
      </div>
    </div>
  );
}
