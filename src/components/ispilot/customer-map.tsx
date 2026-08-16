import { MapContainer, Marker, Polyline, TileLayer, Tooltip } from "react-leaflet";
import L from "leaflet";
import type { Customer } from "@/lib/customers";

function pin(color: string, label: string) {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px">
      <span style="width:14px;height:14px;border-radius:9999px;background:${color};box-shadow:0 0 0 4px ${color}33,0 0 12px ${color}"></span>
      <span style="font:600 10px/1 ui-sans-serif;color:#fafafa;background:#09090bcc;padding:2px 5px;border-radius:6px;white-space:nowrap">${label}</span>
    </div>`,
    iconSize: [14, 28],
    iconAnchor: [7, 7],
  });
}

export default function CustomerMap({ customer }: { customer: Customer }) {
  const home: [number, number] = [customer.address.lat, customer.address.lng];
  const cto: [number, number] = [customer.cto.lat, customer.cto.lng];
  const center: [number, number] = [(home[0] + cto[0]) / 2, (home[1] + cto[1]) / 2];

  return (
    <MapContainer
      key={customer.id}
      center={center}
      zoom={15}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", background: "transparent" }}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
      <Polyline positions={[cto, home]} pathOptions={{ color: "#3b82f6", weight: 2, dashArray: "6 6" }} />
      <Marker position={cto} icon={pin("#3b82f6", customer.cto.name)}>
        <Tooltip>{`${customer.cto.olt} — ${customer.cto.pon}`}</Tooltip>
      </Marker>
      <Marker position={home} icon={pin("#22c55e", customer.name)}>
        <Tooltip>{`${customer.address.street}, ${customer.address.number}`}</Tooltip>
      </Marker>
    </MapContainer>
  );
}