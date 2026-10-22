export default function Loading() {
  return (
    <main
      className="min-h-screen flex items-center justify-center bg-[#FBF8F3] text-[#12100E]"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="text-center relative z-10 max-w-sm px-6">
        <div className="w-10 h-10 border-2 border-black/10 border-t-[#FF4D24] rounded-full animate-spin mx-auto" />
        <p className="mt-6 text-xs font-mono font-bold uppercase tracking-[0.25em] text-[#12100E]">
          Rare Ember
        </p>
        <p className="mt-2 text-xs text-neutral-500 font-mono">
          Loading archive...
        </p>
      </div>
    </main>
  );
}
