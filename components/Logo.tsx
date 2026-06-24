export function Logo({ size = 36 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 3C10.6 3 3 9.8 3 18.2c0 4.6 2.3 8.7 5.9 11.5-.3 2-1.1 4.3-2.4 6.1a.6.6 0 0 0 .6.9c3-.5 5.7-1.7 7.8-3.3 1.6.5 3.3.8 5.1.8 9.4 0 17-6.8 17-15.2C37 9.8 29.4 3 20 3Z"
          fill="#3F6B3A"
        />
        <circle cx="13.5" cy="18" r="2.3" fill="#F7F5F1" />
        <circle cx="20" cy="18" r="2.3" fill="#F7F5F1" />
        <circle cx="26.5" cy="18" r="2.3" fill="#F7F5F1" />
      </svg>
      <span className="font-display text-xl font-extrabold tracking-tight text-ink">
        كومڤا
      </span>
    </div>
  );
}
