"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";

type ItemCategory = "food" | "clothing" | "hygiene" | "supplies";

type NeededItem = {
  id: string;
  quantity: number;
  name: string;
  image: string;
  category: ItemCategory;
};

type Org = {
  id: string;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  locationLabel: string;
  tags: string[];
  items: NeededItem[];
};

const MONCTON_CENTER: [number, number] = [46.0878, -64.7782];

function MapFlyTo({ selectedOrg }: { selectedOrg: Org | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedOrg) {
      map.flyTo([selectedOrg.lat, selectedOrg.lng], 15, { duration: 0.75 });
    } else {
      map.flyTo(MONCTON_CENTER, 13, { duration: 0.75 });
    }
  }, [map, selectedOrg]);

  return null;
}

type MapViewProps = {
  orgs: Org[];
  selectedOrg: Org | null;
  setSelectedOrgId: (id: string | null) => void;
};

export default function MapView({
  orgs,
  selectedOrg,
  setSelectedOrgId,
}: MapViewProps) {
  return (
    <MapContainer
      center={MONCTON_CENTER}
      zoom={13}
      scrollWheelZoom={true}
      className="leaflet-map"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapFlyTo selectedOrg={selectedOrg} />

      {orgs.map((org) => {
        const active = selectedOrg?.id === org.id;

        return (
          <CircleMarker
            key={org.id}
            center={[org.lat, org.lng] as [number, number]}
            radius={active ? 12 : 9}
            pathOptions={{
              color: "#0b0b0b",
              weight: 2,
              fillColor: "#31EDC7",
              fillOpacity: active ? 1 : 0.85,
            }}
            eventHandlers={{
              click: () => setSelectedOrgId(org.id),
            }}
          >
            <Popup>
              <div style={{ minWidth: 220 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{org.name}</div>
                <div style={{ fontSize: 14, marginBottom: 6 }}>{org.address}</div>
                <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 10 }}>
                  {org.phone}
                </div>
                <button
                  onClick={() => setSelectedOrgId(org.id)}
                  style={{
                    border: "none",
                    borderRadius: 999,
                    padding: "10px 14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    background: "#31EDC7",
                    color: "#041311",
                  }}
                >
                  Show needs
                </button>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}