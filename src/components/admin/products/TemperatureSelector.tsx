/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Switch } from "@/components/ui/switch";
import type { TemperatureOption } from "@/services/admin.products";

const TEMP_OPTIONS: TemperatureOption[] = ["hot", "iced", "both", "warm"];

type Props = {
  label?: string;
  value: TemperatureOption[];
  onChange: (next: TemperatureOption[]) => void;
};

export function TemperatureSelector({ label = "Nhiệt độ", value, onChange }: Props) {
  function toggle(opt: TemperatureOption, checked: boolean) {
    const next = checked
      ? Array.from(new Set([...value, opt]))
      : value.filter((t) => t !== opt);
    onChange(next);
  }

  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium leading-none">{label}</span>
      <div className="flex flex-wrap gap-3">
        {TEMP_OPTIONS.map((opt) => (
          <div key={opt} className="flex items-center gap-2">
            <Switch checked={value.includes(opt)} onCheckedChange={(v) => toggle(opt, v)} />
            <span className="text-sm capitalize">{opt === "both" ? "Hot + Iced" : opt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const ALL_TEMP_OPTIONS = TEMP_OPTIONS;
