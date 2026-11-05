"use client";

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import { colors, font, radius, shadow } from "@/lib/tokens";
import { buttonStyle, ghostButtonStyle } from "./ui";

export interface PedidoBorrado {
  /** Qué es lo que se borra, en singular: "receta", "ingrediente", "factura". */
  cosa: string;
  /** Nombre visible del elemento; va escrito en el papelito que cae al caldero. */
  nombre: string;
  /** Consecuencias, si las hay ("También se revierte el stock que sumó."). */
  detalle?: string;
}

type ConfirmarBorrado = (pedido: PedidoBorrado) => Promise<boolean>;

const Contexto = createContext<ConfirmarBorrado | null>(null);

/**
 * Pide confirmación para borrar con el modal del caldero. Resuelve `true` cuando
 * el usuario echó el elemento al fuego (ya terminó la animación) y `false` si cancela.
 */
export function useConfirmarBorrado(): ConfirmarBorrado {
  const confirmar = useContext(Contexto);
  if (!confirmar) throw new Error("useConfirmarBorrado debe usarse dentro de <ConfirmarBorradoProvider>");
  return confirmar;
}

export function ConfirmarBorradoProvider({ children }: { children: React.ReactNode }) {
  const [pedido, setPedido] = useState<PedidoBorrado | null>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);

  const confirmar = useCallback<ConfirmarBorrado>((p) => {
    resolver.current?.(false);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
      setPedido(p);
    });
  }, []);

  const cerrar = useCallback((ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setPedido(null);
  }, []);

  return (
    <Contexto.Provider value={confirmar}>
      {children}
      {pedido && <DialogoCaldero pedido={pedido} onCerrar={cerrar} />}
    </Contexto.Provider>
  );
}

// Tiempo que dura la quema antes de ejecutar el borrado (ms).
const DURACION_QUEMA = 1150;

function DialogoCaldero({ pedido, onCerrar }: { pedido: PedidoBorrado; onCerrar: (ok: boolean) => void }) {
  const [quemando, setQuemando] = useState(false);
  const tituloId = useId();
  const detalleId = useId();
  const cancelarRef = useRef<HTMLButtonElement>(null);
  const quemarRef = useRef<HTMLButtonElement>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Foco inicial en "Cancelar" (lo seguro) y al cerrar se devuelve a donde estaba.
  useEffect(() => {
    const previo = document.activeElement as HTMLElement | null;
    cancelarRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      clearTimeout(temporizador.current);
      previo?.focus?.();
    };
  }, []);

  function quemar() {
    if (quemando) return;
    setQuemando(true);
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    temporizador.current = setTimeout(() => onCerrar(true), reducido ? 120 : DURACION_QUEMA);
  }

  function onTecla(e: React.KeyboardEvent) {
    if (e.key === "Escape" && !quemando) {
      e.stopPropagation();
      onCerrar(false);
    } else if (e.key === "Tab") {
      // Trampa de foco entre los dos botones.
      const orden = [cancelarRef.current, quemarRef.current].filter(Boolean) as HTMLElement[];
      const i = orden.indexOf(document.activeElement as HTMLElement);
      const sig = e.shiftKey ? (i <= 0 ? orden.length - 1 : i - 1) : (i + 1) % orden.length;
      e.preventDefault();
      orden[sig]?.focus();
    }
  }

  return (
    <div
      className="caldero-velo"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !quemando) onCerrar(false);
      }}
      onKeyDown={onTecla}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        aria-describedby={detalleId}
        className="caldero-panel"
        style={{
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderTop: `4px solid ${colors.accent}`,
          borderRadius: radius.xl,
          boxShadow: shadow.raised,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase", color: colors.accent }}>
          Borrar {pedido.cosa}
        </div>

        <Escena cosa={pedido.cosa} nombre={pedido.nombre} quemando={quemando} />

        <h2
          id={tituloId}
          style={{
            fontFamily: font.display,
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: -0.4,
            lineHeight: 1.15,
            margin: 0,
            color: colors.text,
          }}
        >
          {quemando ? "Adiós…" : `¿Echar “${pedido.nombre}” al caldero?`}
        </h2>
        <p id={detalleId} style={{ fontSize: 13.5, color: colors.textMuted, lineHeight: 1.5, margin: 0, minHeight: 20 }}>
          {pedido.detalle ?? "Se quema y no se puede recuperar."}
        </p>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            ref={cancelarRef}
            type="button"
            onClick={() => onCerrar(false)}
            disabled={quemando}
            style={{ ...ghostButtonStyle, padding: "11px 20px", fontSize: 14 }}
          >
            Mejor no
          </button>
          <button ref={quemarRef} type="button" onClick={quemar} disabled={quemando} style={buttonStyle}>
            Echar al caldero
          </button>
        </div>
      </div>
    </div>
  );
}

const CHISPAS = [-46, -26, -10, 8, 24, 42, 58];
const HUMO = [-30, 4, 34];

function llama(cx: number, w: number, h: number): string {
  const top = 60 - h;
  return `M${cx - w} 60 C${cx - w} ${60 - h * 0.45} ${cx - w * 0.25} ${60 - h * 0.6} ${cx} ${top} C${cx + w * 0.25} ${60 - h * 0.6} ${cx + w} ${60 - h * 0.45} ${cx + w} 60Z`;
}

const LLAMAS: { cx: number; w: number; h: number; retraso: number }[] = [
  { cx: 38, w: 15, h: 34, retraso: 0.2 },
  { cx: 70, w: 19, h: 46, retraso: 0.5 },
  { cx: 100, w: 23, h: 56, retraso: 0 },
  { cx: 130, w: 19, h: 46, retraso: 0.35 },
  { cx: 162, w: 15, h: 34, retraso: 0.65 },
];

function Escena({ cosa, nombre, quemando }: { cosa: string; nombre: string; quemando: boolean }) {
  const gradId = useId().replace(/:/g, "");
  return (
    <div className={`caldero-escena${quemando ? " quemando" : ""}`} aria-hidden>
      <div className="caldero-brasa" />

      {/* Interior del caldero (detrás del papelito). */}
      <svg className="caldero-fondo" viewBox="0 0 200 130" width="200" height="130">
        <ellipse cx="100" cy="34" rx="78" ry="12" fill="#0E1F19" stroke={colors.mangoDeep} strokeWidth="3" />
      </svg>

      {/* El papelito con el nombre: flota y, al confirmar, cae y se quema. */}
      <div className="caldero-ticket recibo" style={{ ["--zz" as string]: "10px" }}>
        <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", color: colors.textFaint }}>
          {cosa}
        </span>
        <span
          style={{
            fontFamily: font.display,
            fontSize: 16,
            fontWeight: 600,
            lineHeight: 1.15,
            color: colors.text,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {nombre}
        </span>
      </div>

      {/* Cuerpo del caldero (delante: tapa al papelito cuando cae adentro). */}
      <svg className="caldero-cuerpo" viewBox="0 0 200 130" width="200" height="130">
        <defs>
          <linearGradient id={`hierro-${gradId}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#3A2A22" />
            <stop offset="0.35" stopColor="#54403A" />
            <stop offset="1" stopColor="#241711" />
          </linearGradient>
        </defs>
        {/* Asas */}
        <path d="M22 40 C6 38 6 62 24 62" fill="none" stroke="#241711" strokeWidth="6" strokeLinecap="round" />
        <path d="M178 40 C194 38 194 62 176 62" fill="none" stroke="#241711" strokeWidth="6" strokeLinecap="round" />
        {/* Patas */}
        <path d="M58 104 L50 124 M142 104 L150 124" stroke="#241711" strokeWidth="7" strokeLinecap="round" />
        {/* Panza */}
        <path d="M22 34 A78 12 0 0 0 178 34 C178 34 176 104 100 108 C24 104 22 34 22 34Z" fill={`url(#hierro-${gradId})`} />
        {/* Brillo y aro */}
        <path d="M34 58 C36 78 50 92 70 98" fill="none" stroke="#FFFFFF" strokeOpacity="0.14" strokeWidth="5" strokeLinecap="round" />
        <path d="M22 34 A78 12 0 0 0 178 34" fill="none" stroke={colors.mangoDeep} strokeWidth="3" />
      </svg>

      {/* Humo y chispas (solo mientras se quema). */}
      {HUMO.map((dx, i) => (
        <span key={`h${i}`} className="caldero-humo" style={{ ["--dx" as string]: `${dx}px`, animationDelay: `${0.35 + i * 0.18}s` }} />
      ))}
      {CHISPAS.map((dx, i) => (
        <span key={`c${i}`} className="caldero-chispa" style={{ ["--dx" as string]: `${dx}px`, animationDelay: `${0.3 + i * 0.07}s` }} />
      ))}

      {/* Fuego debajo. */}
      <svg className="caldero-fuego" viewBox="0 0 200 60" width="200" height="60">
        <defs>
          <linearGradient id={`fuego-${gradId}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor={colors.mango} />
            <stop offset="0.55" stopColor="#E8742A" />
            <stop offset="1" stopColor={colors.accent} />
          </linearGradient>
        </defs>
        {LLAMAS.map((l, i) => (
          <path key={i} className="llama" d={llama(l.cx, l.w, l.h)} fill={`url(#fuego-${gradId})`} style={{ animationDelay: `${l.retraso}s` }} />
        ))}
        <path className="llama" d={llama(100, 11, 30)} fill={colors.mangoSoft} fillOpacity="0.85" />
      </svg>
    </div>
  );
}
