import Image from "next/image";

export function Avatar({
  url,
  label,
  size = 40,
  online,
}: {
  url?: string | null;
  label: string;
  size?: number;
  online?: boolean;
}) {
  const initial = label?.trim()?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {url ? (
        <Image
          src={url}
          alt={label}
          width={size}
          height={size}
          className="rounded-full object-cover"
        />
      ) : (
        <div
          className="flex items-center justify-center rounded-full bg-moss-100 font-display font-bold text-moss-700"
          style={{ width: size, height: size, fontSize: size * 0.4 }}
        >
          {initial}
        </div>
      )}
      {online && (
        <span
          className="absolute bottom-0 left-0 block rounded-full border-2 border-white bg-moss-500"
          style={{ width: size * 0.28, height: size * 0.28 }}
        />
      )}
    </div>
  );
}
