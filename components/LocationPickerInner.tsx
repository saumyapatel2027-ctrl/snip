"use client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { useState } from "react";

const icon = L.divIcon({
  className: "",
  html: `<div style="width:24px;height:24px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#5C1A2C;border:3px solid #FBF6EF;box-shadow:0 4px 10px rgba(0,0,0,.25)"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

function ClickToPlace({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

/** Click the map to drop the studio pin. Writes hidden lat/lng inputs for the surrounding form. */
export default function LocationPickerInner({ lat, lng }: { lat: number | null; lng: number | null }) {
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(lat != null && lng != null ? { lat, lng } : null);
  const pick = (a: number, b: number) => setPos({ lat: Number(a.toFixed(6)), lng: Number(b.toFixed(6)) });

  return (
    <div>
      <MapContainer
        center={pos ? [pos.lat, pos.lng] : [28.6139, 77.209]}
        zoom={pos ? 14 : 11}
        style={{ height: 300, width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickToPlace onPick={pick} />
        {pos && (
          <Marker
            position={[pos.lat, pos.lng]}
            icon={icon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const ll = (e.target as L.Marker).getLatLng();
                pick(ll.lat, ll.lng);
              },
            }}
          />
        )}
      </MapContainer>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-500">
        <span>{pos ? `Pin at ${pos.lat}, ${pos.lng}` : "Click the map to drop your studio pin."}</span>
        <button
          type="button"
          className="btn-ghost btn-sm"
          onClick={() =>
            navigator.geolocation?.getCurrentPosition((p) => pick(p.coords.latitude, p.coords.longitude))
          }
        >
          Use my current location
        </button>
      </div>
      <input type="hidden" name="lat" value={pos?.lat ?? ""} />
      <input type="hidden" name="lng" value={pos?.lng ?? ""} />
    </div>
  );
}
