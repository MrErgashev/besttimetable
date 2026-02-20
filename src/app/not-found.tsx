import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="text-center max-w-md space-y-4">
        <div className="text-6xl font-bold text-[var(--muted)]">404</div>
        <h2 className="text-xl font-bold text-[var(--foreground)]">
          Sahifa topilmadi
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Siz qidirayotgan sahifa mavjud emas yoki ko&apos;chirilgan bo&apos;lishi
          mumkin.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius)] bg-[var(--color-accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Bosh sahifaga qaytish
        </Link>
      </div>
    </div>
  );
}
