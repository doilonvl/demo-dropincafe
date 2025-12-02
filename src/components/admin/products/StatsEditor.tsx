/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type StatFormRow = {
  id: string;
  labelVi: string;
  labelEn: string;
  value: number;
};

export function StatsEditor({
  rows,
  onChange,
}: {
  rows: StatFormRow[];
  onChange: (rows: StatFormRow[]) => void;
}) {
  function updateRow(id: string, patch: Partial<StatFormRow>) {
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function removeRow(id: string) {
    onChange(rows.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-2">
      {rows.length === 0 && (
        <div className="text-xs text-muted-foreground">
          Chưa có thống kê. Thêm 3-4 dòng cho best-seller.
        </div>
      )}
      {rows.map((row) => (
        <div
          key={row.id}
          className="grid gap-2 rounded-md border p-2 md:grid-cols-[1.2fr,1.2fr,0.6fr,auto]"
        >
          <Input
            placeholder="Label (VI)"
            value={row.labelVi}
            onChange={(e) => updateRow(row.id, { labelVi: e.target.value })}
          />
          <Input
            placeholder="Label (EN)"
            value={row.labelEn}
            onChange={(e) => updateRow(row.id, { labelEn: e.target.value })}
          />
          <Input
            type="number"
            min={0}
            max={100}
            placeholder="%"
            value={row.value}
            onChange={(e) =>
              updateRow(row.id, { value: Number(e.target.value || 0) })
            }
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => removeRow(row.id)}
          >
            X
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          onChange([
            ...rows,
            {
              id: crypto.randomUUID(),
              labelVi: "",
              labelEn: "",
              value: 100,
            },
          ])
        }
      >
        Thêm dòng thống kê
      </Button>
    </div>
  );
}
