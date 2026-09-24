"use client";

export default function PrintButton() {
  return (
    <button type="button" className="btn-secondary no-print" onClick={() => window.print()}>
      הדפסה / PDF
    </button>
  );
}
