export default function Logo({ className = 'h-12 w-12' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-label="Tropitwist logo" role="img">
      <defs><clipPath id="tt-circle"><circle cx="50" cy="50" r="48" /></clipPath></defs>
      <g clipPath="url(#tt-circle)">
        <rect width="100" height="100" fill="#FFF8EE" />
        {[0, 24, 48, 72, 96].map((x) => <rect key={x} x={x} width="12" height="100" fill="#F4C430" />)}
      </g>
      <circle cx="50" cy="50" r="30" fill="#F63946" />
      <text x="50" y="62" textAnchor="middle" fontFamily="'Big Shoulders Display', Impact, sans-serif" fontWeight="900" fontSize="30" fill="#F4C430">TT</text>
      <circle cx="50" cy="50" r="48" fill="none" stroke="#231F20" strokeWidth="2" />
    </svg>
  );
}
