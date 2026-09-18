import React, { useEffect, useState } from "react";
import { useOverrides } from "../lib/overrides";
import { builderFocus } from "../lib/builderFocus";
import { cx } from "./ui";

/**
 * Renders a value the Builder is allowed to change.
 *
 * While the Builder is considering this target it gets a green glow and shows
 * the proposed value inline — nothing is written until Andy approves.
 */
export function Editable({ id, fallback, className = "", as: Tag = "span" }: {
  id: string; fallback: string; className?: string; as?: any;
}) {
  const { get } = useOverrides();
  const [focus, setFocus] = useState<{ on: boolean; preview?: string }>({ on: false });

  useEffect(() => builderFocus.subscribe((targetId, previewValue) => {
    setFocus({ on: targetId === id, preview: previewValue });
  }), [id]);

  const value = get(id, fallback);
  const showing = focus.on && focus.preview !== undefined;
  const shown = showing ? focus.preview : value;

  return (
    <Tag
      data-edit-id={id}
      data-edit-focused={focus.on ? "true" : undefined}
      className={cx(
        className,
        focus.on && "rounded-md ring-2 ring-emerald-400 ring-offset-2 ring-offset-white/40 transition-all"
      )}
    >
      {shown}
      {showing && (
        <span className="ml-2 text-[11px] font-semibold not-italic opacity-50">
          (was “{value}”)
        </span>
      )}
    </Tag>
  );
}
