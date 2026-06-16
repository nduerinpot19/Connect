export default function ConnectLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const scales = { sm: 0.6, md: 1, lg: 1.6 }
  const scale = scales[size]

  return (
    <svg
      width={220 * scale}
      height={52 * scale}
      viewBox="0 0 220 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="coNNect"
    >
      <defs>
        <linearGradient id="infinityGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a3e635" />
          <stop offset="50%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#a3e635" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Lettera C */}
      <text
        x="2"
        y="38"
        fontFamily="'Georgia', serif"
        fontSize="40"
        fontWeight="700"
        fill="#a3e635"
        letterSpacing="-1"
      >
        c
      </text>

      {/* o */}
      <text
        x="24"
        y="38"
        fontFamily="'Georgia', serif"
        fontSize="40"
        fontWeight="700"
        fill="#d4d4d4"
        letterSpacing="-1"
      >
        o
      </text>

      {/* Prima N */}
      <text
        x="52"
        y="38"
        fontFamily="'Georgia', serif"
        fontSize="40"
        fontWeight="700"
        fill="#a3e635"
        letterSpacing="-1"
      >
        N
      </text>

      {/* Seconda N */}
      <text
        x="82"
        y="38"
        fontFamily="'Georgia', serif"
        fontSize="40"
        fontWeight="700"
        fill="#a3e635"
        letterSpacing="-1"
      >
        N
      </text>

      {/* ect */}
      <text
        x="113"
        y="38"
        fontFamily="'Georgia', serif"
        fontSize="40"
        fontWeight="700"
        fill="#d4d4d4"
        letterSpacing="-1"
      >
        ect
      </text>

      {/* Simbolo infinito animato che parte dalla C e si intreccia tra le N */}
      <path
        d="M 18 22 
           C 18 14, 28 10, 36 16 
           C 44 22, 52 28, 62 28
           C 72 28, 80 24, 86 20
           C 92 16, 100 12, 108 18
           C 116 24, 110 34, 100 30
           C 90 26, 80 22, 70 22
           C 60 22, 50 26, 42 30
           C 34 34, 22 32, 18 22 Z"
        stroke="url(#infinityGrad)"
        strokeWidth="2.2"
        fill="none"
        filter="url(#glow)"
        strokeLinecap="round"
      >
        <animate
          attributeName="stroke-dasharray"
          values="0 400; 200 200; 400 0; 0 400"
          dur="4s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.5; 1; 0.5"
          dur="4s"
          repeatCount="indefinite"
        />
      </path>

      {/* Punto luminoso che percorre l'infinito */}
      <circle r="3" fill="#a3e635" filter="url(#glow)" opacity="0.9">
        <animateMotion
          dur="4s"
          repeatCount="indefinite"
          path="M 18 22 C 18 14, 28 10, 36 16 C 44 22, 52 28, 62 28 C 72 28, 80 24, 86 20 C 92 16, 100 12, 108 18 C 116 24, 110 34, 100 30 C 90 26, 80 22, 70 22 C 60 22, 50 26, 42 30 C 34 34, 22 32, 18 22"
        />
      </circle>
    </svg>
  )
}
