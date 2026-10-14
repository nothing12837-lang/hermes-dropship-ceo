export default function Loading() {
  return (
    <main
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background:
          'radial-gradient(900px 460px at 78% -10%, rgba(255,122,24,0.10), transparent 60%), radial-gradient(760px 420px at 12% 22%, rgba(232,36,75,0.07), transparent 60%), #FCF8F2',
      }}
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="text-center relative z-10">
        {/* Ember ring spinner */}
        <div className="relative w-20 h-20 mx-auto">
          <div
            className="absolute inset-0 rounded-full animate-spin-slow"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0%, #FF4D24 35%, #F7B733 60%, transparent 75%)',
              mask: 'radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4px))',
              WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4px))',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-3xl animate-float-y">
            🔥
          </div>
        </div>

        <p className="mt-7 text-xs font-black uppercase tracking-[0.42em] text-gradient-ember-animated">
          RareEmber
        </p>
        <div className="mt-4 w-44 h-[3px] mx-auto rounded-full overflow-hidden shimmer" />
        <p className="mt-4 text-[13px] font-semibold text-[#A18A73]">
          Curating the good stuff…
        </p>
      </div>
    </main>
  );
}
