export default function Loading() {
  return (
    <div role="status" aria-live="polite" aria-label="Cargando" className="flex flex-col gap-[18px]">
      <div className="esqueleto h-10 w-[min(320px,70%)]" />
      <div className="esqueleto h-4 w-[min(460px,90%)]" />
      <div className="grid-recetas mt-3.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="esqueleto h-[150px]" />
        ))}
      </div>
    </div>
  );
}
