export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className="w-16 h-16 relative flex items-center justify-center">
        <div className="absolute w-full h-full border-4 border-gray-200 rounded-full"></div>
        <div className="absolute w-full h-full border-4 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
      <h3 className="text-lg font-medium mt-4">Loading Rafiki Rewards...</h3>
      <p className="text-sm text-muted-foreground mt-2">Please wait while we set things up</p>
    </div>
  );
} 