"use client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useEffect } from "react";
import { inr } from "@/lib/utils";

export type MapPoint = {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  kind: string;
  starting_price: number;
  featured?: boolean;
};

const pin = (featured?: boolean) =>
  L.divIcon({
    className: "",
    html: `<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${
      featured ? "#C98A2B" : "#5C1A2C"
    };border:3px solid #FBF6EF;box-shadow:0 4px 10px rgba(0,0,0,.25)"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
  });

const meIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#2F6B57;border:3px solid #fff;box-shadow:0 0 0 6px rgba(47,107,87,.25)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function Fit({ points, me }: { points: MapPoint[]; me?: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    const all = points.map((p) => [p.lat, p.lng] as [number, number]);
    if (me) all.push([me.lat, me.lng]);
    if (all.length === 1) map.setView(all[0], 13);
    else if (all.length > 1) map.fitBounds(L.latLngBounds(all), { padding: [30, 30], maxZoom: 14 });
  }, [map, points, me]);
  return null;
}

export default function StudioMapInner({
  points,
  me,
  height = 420,
}: {
  points: MapPoint[];
  me?: { lat: number; lng: number } | null;
  height?: number;
}) {
  return (
    <MapContainer center={[28.6139, 77.209]} zoom={11} scrollWheelZoom={false} style={{ height, width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((p) => (
        <Marker key={p.slug} position={[p.lat, p.lng]} icon={pin(p.featured)}>
          <Popup>
            <div style={{ fontFamily: "Manrope, sans-serif" }}>
              <strong>{p.name}</strong>
              <div style={{ color: "#6B5E56", fontSize: 12 }}>
                {p.kind} · from {inr(p.starting_price)}
              </div>
              <Link href={`/designers/${p.slug}`} style={{ color: "#5C1A2C", fontWeight: 700, fontSize: 12 }}>
                View profile →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
      {me && <Marker position={[me.lat, me.lng]} icon={meIcon} />}
      <Fit points={points} me={me} />
    </MapContainer>
  );
}
