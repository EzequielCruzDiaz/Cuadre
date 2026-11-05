"use client";

import { useState } from "react";
import { useConfirmarBorrado } from "@/components/ConfirmarBorrado";
import { ConfirmarFactura } from "@/components/ConfirmarFactura";
import { ReciboFactura } from "@/components/ReciboFactura";
import { PageTitle, SectionTitle } from "@/components/ui";
import type { Factura } from "@/lib/types";
import { useStore } from "@/components/StoreProvider";

export default function FacturasPage() {
  const { facturas, inventario, addFactura, removeFactura } = useStore();
  const confirmarBorrado = useConfirmarBorrado();
  const [formKey, setFormKey] = useState(0);

  async function confirmarYBorrar(f: Factura) {
    const vinculados = f.items.some((it) => it.ingredientId);
    const ok = await confirmarBorrado({
      cosa: "factura",
      nombre: f.proveedor,
      detalle: vinculados ? "También se revierte el stock que sumó." : undefined,
    });
    if (ok) removeFactura(f.id);
  }

  return (
    <>
      <PageTitle
        eyebrow="Compras"
        title="Facturas"
        subtitle="Escanea o carga las compras a tus suplidores. Al confirmar, los ítems vinculados suman al stock."
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <ConfirmarFactura
          key={formKey}
          inventario={inventario}
          facturas={facturas}
          onConfirmar={(f) => {
            addFactura(f);
            setFormKey((k) => k + 1);
          }}
        />

        {facturas.length > 0 && (
          <section style={{ marginTop: 12 }}>
            <SectionTitle>Registradas</SectionTitle>
            <div className="grid-recibos">
              {facturas.map((f) => (
                <ReciboFactura key={f.id} factura={f} onBorrar={() => confirmarYBorrar(f)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
