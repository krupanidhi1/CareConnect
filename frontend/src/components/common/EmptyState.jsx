import React from "react";

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="surface flex flex-col items-center justify-center px-6 py-14 text-center">
      {Icon && (
        <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-primary">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      )}
      <h3 className="font-heading text-lg text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}