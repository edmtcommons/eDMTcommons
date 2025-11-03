'use client';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ backgroundColor: '#123138' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-11 h-11 border-4 border-cream border-t-transparent rounded-full animate-spin" />
        <p className="text-cream font-mono text-lg">Loading...</p>
      </div>
    </div>
  );
}

