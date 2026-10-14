export default function Loading() {
  return (
    <main
      style={{
        background: '#fffbf5',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-busy="true"
      aria-label="Loading"
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', animation: 'rareember-bounce 1.2s ease-in-out infinite' }}>
          🐾
        </div>
        <p style={{ color: '#8a7b6b', fontWeight: 700, marginTop: '1rem' }}>
          Fetching cozy chapters…
        </p>
        <style>{`@keyframes rareember-bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`}</style>
      </div>
    </main>
  );
}
