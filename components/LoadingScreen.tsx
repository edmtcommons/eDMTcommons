'use client';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-b from-teal-900 via-blue-900 to-teal-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-cream border-t-transparent rounded-full animate-spin" />
        <p className="text-cream font-mono text-lg">Loading...</p>
      </div>
    </div>
  );
}

