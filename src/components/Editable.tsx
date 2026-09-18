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
        // Dashed, not solid: a solid ring reads as "already applied", which
        // contradicts the preview card's "nothing has changed yet".
        // whitespace-normal overrides the sidebar's `truncate` while a proposal is
        // showing, otherwise the "proposed" tag is clipped to a single letter.
        focus.on && "rounded-md px-1 whitespace-normal outline-dashed outline-2 outline-offset-2 outline-emerald-500"
      )}
    >
      {showing ? (
        <>
          <span className="opacity-45 line-through">{value}</span>
          <span className="mx-1.5 font-bold text-emerald-700">{focus.preview}</span>
          <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[.08em] text-emerald-800 align-middle">
            proposed
          </span>
        </>
      ) : value}
    </Tag>
  );
}
