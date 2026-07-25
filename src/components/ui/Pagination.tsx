import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

export default function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  for (let p = Math.max(1, page - 2); p <= Math.min(totalPages, page + 2); p++) {
    pages.push(p);
  }

  return (
    <nav aria-label="Pagination" className="mt-5 flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="inline-flex h-9 items-center gap-1 border border-stone-200 bg-white px-2.5 text-sm font-semibold text-stone-600 transition-colors hover:bg-stone-50 disabled:pointer-events-none disabled:opacity-40"
        style={{ borderRadius: 8 }}
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </button>

      {pages[0] > 1 && (
        <>
          <PageButton value={1} active={page === 1} onClick={onChange} />
          {pages[0] > 2 && <span className="px-1 text-stone-400">...</span>}
        </>
      )}

      {pages.map((p) => (
        <PageButton key={p} value={p} active={p === page} onClick={onChange} />
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="px-1 text-stone-400">...</span>
          )}
          <PageButton value={totalPages} active={page === totalPages} onClick={onChange} />
        </>
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="inline-flex h-9 items-center gap-1 border border-stone-200 bg-white px-2.5 text-sm font-semibold text-stone-600 transition-colors hover:bg-stone-50 disabled:pointer-events-none disabled:opacity-40"
        style={{ borderRadius: 8 }}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

function PageButton({
  value,
  active,
  onClick,
}: {
  value: number;
  active: boolean;
  onClick: (page: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      aria-current={active ? "page" : undefined}
      className={`h-9 min-w-9 px-2 text-sm font-semibold transition-colors ${
        active
          ? "bg-teal-700 text-white"
          : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
      }`}
      style={{ borderRadius: 8 }}
    >
      {value}
    </button>
  );
}
