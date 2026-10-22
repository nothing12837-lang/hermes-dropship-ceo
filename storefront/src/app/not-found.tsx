import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FBF8F3] text-[#12100E] px-6 py-20">
      <div className="max-w-md w-full text-center">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#FF4D24] block mb-3">
          404 — Not Found
        </span>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#12100E]">
          Drop Not Located
        </h1>
        <p className="text-neutral-600 text-sm mt-4 leading-relaxed font-normal">
          This piece or page does not exist or has been moved from the active collection. Explore our active streetwear drops in the catalog.
        </p>
        <div className="flex gap-3 justify-center mt-8 flex-wrap">
          <Link
            href="/shop"
            className="px-6 py-3 bg-[#FF4D24] hover:bg-[#e03d15] text-white font-bold text-xs uppercase tracking-wider no-underline transition-colors"
          >
            Explore Catalog →
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-[#12100E] hover:bg-black text-white font-bold text-xs uppercase tracking-wider no-underline transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
