export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const scale = size === 'sm' ? 0.6 : size === 'lg' ? 1.4 : 1
  const w = Math.round(160 * scale)
  const h = Math.round(40 * scale)

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 160 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="coNNect"
    >
      {/* Lettera c */}
      <text x="0" y="30" fontFamily="inherit" fontSize="32" fontWeight="500" fill="#a3e635">c</text>
      {/* o */}
      <text x="20" y="30" fontFamily="inherit" fontSize="32" fontWeight="500" fill="currentColor">o</text>
      {/* N */}
      <text x="42" y="30" fontFamily="inherit" fontSize="32" fontWeight="500" fill="currentColor">N</text>
      {/* N */}
      <text x="65" y="30" fontFamily="inherit" fontSize="32" fontWeight="500" fill="currentColor">N</text>
      {/* ect */}
      <text x="88" y="30" fontFamily="inherit" fontSize="32" fontWeight="300" fill="currentColor" opacity="0.7">ect</text>

      {/* Simbolo infinito che parte dalla C e si interseca tra le due N */}
      <path
        d="M 12 10
           C 12 2, 28 -1, 38 8
           C 50 18, 58 22, 72 22
           C 58 22, 50 26, 38 36
           C 28 45, 12 42, 12 34
           C 12 26, 22 20, 34 20
           C 46 20, 58 22, 65 22
           C 58 22, 46 24, 34 24
           C 22 24, 12 30, 12 22"
        stroke="#a3e635"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
    </svg>
  )
}
