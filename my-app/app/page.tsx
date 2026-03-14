"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { NeededItem, Org } from "../lib/types";
import { seedIfEmpty, subscribeToOrgs } from "../lib/store";

const MapView = dynamic(() => import("./components/MapView"), {
  ssr: false,
  loading: () => <div className="leaflet-map map-loading">Loading map...</div>,
});

function ItemCard({ item }: { item: NeededItem }) {
  return (
    <div className="item-card">
      <div className="item-icon">{item.image}</div>
      <div className="min-w-0">
        <div className="item-name">{item.name}</div>
        <div className="item-meta">
          {item.category} · qty {item.quantity}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    (async () => {
      await seedIfEmpty();
      unsub = subscribeToOrgs(setOrgs);
    })();

    return () => unsub?.();
  }, []);

  const selectedOrg: Org | null =
    orgs.find((org: Org) => org.id === selectedOrgId) ?? null;

  const visibleItems: NeededItem[] = useMemo(() => {
    if (selectedOrg) return selectedOrg.items;

    return orgs.flatMap((org: Org) =>
      org.items.map((item: NeededItem) => ({
        ...item,
        id: `${org.id}-${item.id}`,
      }))
    );
  }, [orgs, selectedOrg]);

  const totalNeeded = visibleItems.reduce(
    (sum: number, item: NeededItem) => sum + item.quantity,
    0
  );

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Moncton community needs</p>
          <h1 className="hero-title">Support maps</h1>
        </div>

        <div className="topbar-actions">
          <button
            className={`theme-btn ${selectedOrg === null ? "theme-btn-active" : ""}`}
            onClick={() => setSelectedOrgId(null)}
          >
            All needs
          </button>

          <Link href="/org/humanity-project" className="theme-btn">
            Simulate org login
          </Link>
        </div>
      </header>

      <main className="layout">
        <section className="map-panel">
          <div className="panel-head">
            <div>
              <h2 className="panel-title">Map</h2>
              <p className="panel-subtitle">Tap a location to filter needed items</p>
            </div>
            <div className="stat-pill">
              {selectedOrg ? selectedOrg.name : "All organizations"}
            </div>
          </div>

          <div className="map-wrap">
            <MapView
              orgs={orgs}
              selectedOrg={selectedOrg}
              setSelectedOrgId={setSelectedOrgId}
            />
          </div>

          <div className="org-chips">
            {orgs.map((org: Org) => (
              <button
                key={org.id}
                className={`org-chip ${selectedOrg?.id === org.id ? "org-chip-active" : ""}`}
                onClick={() => setSelectedOrgId(org.id)}
              >
                {org.name}
              </button>
            ))}
          </div>
        </section>

        <aside className="list-panel">
          <div className="panel-head">
            <div>
              <h2 className="panel-title">
                {selectedOrg ? "Location needs" : "All needed items"}
              </h2>
              <p className="panel-subtitle">
                {selectedOrg
                  ? selectedOrg.address
                  : "Showing combined needs across all mapped organizations"}
              </p>
            </div>
            <div className="count-badge">{totalNeeded} total</div>
          </div>

          {selectedOrg && (
            <div className="selected-card">
              <div className="selected-card-title">{selectedOrg.name}</div>
              <div className="selected-card-text">{selectedOrg.locationLabel}</div>
              <div className="selected-card-text">{selectedOrg.phone}</div>

              <div className="tag-row">
                {selectedOrg.tags.map((tag: string) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="items-grid">
            {visibleItems.map((item: NeededItem) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}