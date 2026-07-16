"use client";

import { useState } from "react";

export default function PortalButton() {
  const [loading, setLoading] = useState(false);

  async function handlePortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Could not open billing portal.");
      }
    } catch {
      alert("Failed to open billing portal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handlePortal}
      disabled={loading}
      className="w-full rounded-full border border-border py-2 text-sm text-muted transition hover:bg-surface-light"
    >
      {loading ? "Opening..." : "Manage Billing"}
    </button>
  );
}
