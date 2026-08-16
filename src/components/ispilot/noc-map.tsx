import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, Tooltip } from "react-leaflet";
import L from "leaflet";
import {
  CABLE_ROUTES,
  CTOS,
  FIBER_BREAKS,
  HEALTH_HEX,
  HEALTH_LABEL,
  NET_CLIENTS,
  POPS,
  SPLICE_BOXES,
  fiberLinks,
  oltIdByName,
  type NodeHealth,
} from "@/lib/network";

export type MapLayers = {
  pops: boolean;
  ctos: boolean;
  fiber: boolean;
  clients: boolean;
  spliceBoxes: boolean;
  cableRoutes: boolean;
  breaks: boolean;
  onlyFaulty: boolean;
  noSignalOnly: boolean;
  district: string;
  olt: string;
  pon: string;
  cto: string;
};

export const DEFAULT_MAP_LAYERS: MapLayers = {
  pops: true,
  ctos: true,
  fiber: true,
  clients: true,
  spliceBoxes: true,
  cableRoutes: true,
  breaks: true,
  onlyFaulty: false,
  noSignalOnly: false,
  district: "Todos",
  olt: "Todas",
  pon: "Todas",
  cto: "Todas",
};

function rackIcon(health: NodeHealth, label: string) {
  const color = HEALTH_HEX[health];
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:3px">
      <span style="position:relative;display:grid;place-items:center;width:22px;height:22px;border-radius:6px;background:#0d0d0fee;border:1px solid ${color};box-shadow:0 0 14px ${color}88">
        <span style="width:8px;height:8px;border-radius:2px;background:${color};animation:ispilot-pulse 1.6s ease-in-out infinite"></span>
      </span>
      <span style="font:700 9px/1 ui-sans-serif;letter-spacing:.06em;color:#fafafa;background:#09090bdd;padding:2px 5px;border-radius:5px;white-space:nowrap">${label}</span>
    </div>`,
    iconSize: [22, 36],
    iconAnchor: [11, 11],
  });
}

function ctoIcon(health: NodeHealth, label: string, ratio: number) {
  const color = HEALTH_HEX[health];
  const pct = Math.round(Math.min(1, ratio) * 100);
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px">
      <span style="width:12px;height:12px;border-radius:3px;background:${color};box-shadow:0 0 0 4px ${color}33,0 0 10px ${color}"></span>
      <span style="font:600 9px/1 ui-sans-serif;color:#fafafa;background:#09090bcc;padding:2px 4px;border-radius:5px;white-space:nowrap">${label}</span>
      <span style="width:36px;height:3px;border-radius:2px;background:#27272a;overflow:hidden"><span style="display:block;height:3px;width:${pct}%;background:${color}"></span></span>
    </div>`,
    iconSize: [36, 34],
    iconAnchor: [6, 6],
  });
}

function ceIcon(health: NodeHealth, label: string) {
  const color = HEALTH_HEX[health];
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px">
      <span style="display:grid;place-items:center;width:16px;height:16px;transform:rotate(45deg);border-radius:3px;background:#0d0d0fee;border:1px solid ${color};box-shadow:0 0 10px ${color}88">
        <span style="width:6px;height:6px;border-radius:1px;background:${color}"></span>
      </span>
      <span style="font:600 8px/1 ui-sans-serif;color:#fafafa;background:#09090bcc;padding:2px 4px;border-radius:5px;white-space:nowrap">${label}</span>
    </div>`,
    iconSize: [16, 28],
    iconAnchor: [8, 8],
  });
}

function breakIcon(label: string) {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px">
      <span style="display:grid;place-items:center;width:26px;height:26px;border-radius:9999px;background:#ef444422;border:1px solid #ef4444;box-shadow:0 0 0 6px #ef444422,0 0 18px #ef4444;animation:ispilot-pulse 1.2s ease-in-out infinite">
        <span style="font:800 12px/1 ui-sans-serif;color:#ef4444">!</span>
      </span>
      <span style="font:700 9px/1 ui-sans-serif;color:#fecaca;background:#450a0add;padding:2px 5px;border-radius:5px;white-space:nowrap">${label}</span>
    </div>`,
    iconSize: [26, 40],
    iconAnchor: [13, 13],
  });
}

export default function NocMap({ layers }: { layers: MapLayers }) {
  const districtOk = (district: string) => layers.district === "Todos" || layers.district === district;
  const oltId = layers.olt === "Todas" ? null : oltIdByName(layers.olt);
  const { backbone, drops } = fiberLinks();

  const ctos = CTOS.filter(
    (cto) =>
      districtOk(cto.district) &&
      (!layers.onlyFaulty || cto.health !== "ok") &&
      (!oltId || cto.oltId === oltId) &&
      (layers.pon === "Todas" || cto.pon === layers.pon) &&
      (layers.cto === "Todas" || cto.name === layers.cto),
  );
  const visibleCtoIds = new Set(ctos.map((cto) => cto.id));
  const pops = POPS.filter(
    (pop) =>
      districtOk(pop.district) &&
      (!layers.onlyFaulty || pop.health !== "ok") &&
      (!oltId || pop.id === oltId),
  );
  const clients = NET_CLIENTS.filter(
    (client) =>
      districtOk(client.district) &&
      visibleCtoIds.has(client.ctoId) &&
      (!layers.noSignalOnly || client.status === "Offline" || client.rx <= -30),
  );
  const spliceBoxes = SPLICE_BOXES.filter(
    (box) => districtOk(box.district) && (!layers.onlyFaulty || box.health !== "ok") && (!oltId || box.oltId === oltId),
  );
  const cables = CABLE_ROUTES.filter(
    (cable) => districtOk(cable.district) && (!oltId || cable.oltId === oltId),
  );
  const breaks = FIBER_BREAKS.filter((item) => districtOk(item.district));

  return (
    <MapContainer
      center={[-23.5535, -46.6455]}
      zoom={13}
      scrollWheelZoom
      style={{ height: "100%", width: "100%", background: "transparent" }}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

      {layers.cableRoutes
        ? cables.map((cable) => (
            <Polyline
              key={cable.id}
              positions={cable.path}
              pathOptions={{ color: HEALTH_HEX[cable.health], weight: 5, opacity: 0.35, lineCap: "round" }}
            >
              <Tooltip sticky>{`${cable.name} · ${cable.fibers} FO · ${HEALTH_LABEL[cable.health]}`}</Tooltip>
            </Polyline>
          ))
        : null}

      {layers.fiber
        ? backbone
            .filter((link) => visibleCtoIds.has(link.id.replace("bb-", "")))
            .map((link) => (
              <Polyline
                key={link.id}
                positions={[link.from, link.to]}
                pathOptions={{ color: HEALTH_HEX[link.health], weight: 3, opacity: 0.75 }}
              />
            ))
        : null}

      {layers.fiber && layers.clients
        ? drops
            .filter((link) => clients.some((client) => link.id === `drop-${client.id}`))
            .map((link) => (
              <Polyline
                key={link.id}
                positions={[link.from, link.to]}
                pathOptions={{ color: "#3b82f6", weight: 1.5, dashArray: "5 6", opacity: 0.8 }}
              />
            ))
        : null}

      {layers.pops
        ? pops.map((pop) => (
            <Marker key={pop.id} position={[pop.lat, pop.lng]} icon={rackIcon(pop.health, pop.name)}>
              <Tooltip>{`${pop.vendor} — ${pop.clients.toLocaleString("pt-BR")} clientes · ${pop.note}`}</Tooltip>
            </Marker>
          ))
        : null}

      {layers.spliceBoxes
        ? spliceBoxes.map((box) => (
            <Marker
              key={box.id}
              position={[box.lat, box.lng]}
              icon={ceIcon(box.health, `${box.name} [${box.fusionsUsed}/${box.fusionsTotal}]`)}
            >
              <Tooltip>{`Caixa de emenda · ${HEALTH_LABEL[box.health]} · ${box.note}`}</Tooltip>
            </Marker>
          ))
        : null}

      {layers.ctos
        ? ctos.map((cto) => (
            <Marker
              key={cto.id}
              position={[cto.lat, cto.lng]}
              icon={ctoIcon(
                cto.health,
                `${cto.name} [${cto.usedPorts}/${cto.totalPorts}]`,
                cto.usedPorts / cto.totalPorts,
              )}
            >
              <Tooltip>{`${HEALTH_LABEL[cto.health]} · RX médio ${cto.avgRx} dBm · ${cto.pon} · ocupação ${cto.usedPorts}/${cto.totalPorts}`}</Tooltip>
            </Marker>
          ))
        : null}

      {layers.clients
        ? clients.map((client) => (
            <CircleMarker
              key={client.id}
              center={[client.lat, client.lng]}
              radius={4}
              pathOptions={{
                color: client.status === "Online" ? "#22c55e" : "#ef4444",
                fillColor: client.status === "Online" ? "#22c55e" : "#ef4444",
                fillOpacity: 0.9,
                weight: 1,
              }}
            >
              <Tooltip>{`${client.name} · ${client.plan} · RX ${client.rx} dBm`}</Tooltip>
            </CircleMarker>
          ))
        : null}

      {layers.breaks
        ? breaks.map((item) => (
            <Marker key={item.id} position={[item.lat, item.lng]} icon={breakIcon("ROMPIMENTO")}>
              <Tooltip>{`${item.label} · OTDR ${item.otdrDistanceKm} km · ${item.affected.toLocaleString("pt-BR")} clientes · ${item.detectedAt}`}</Tooltip>
            </Marker>
          ))
        : null}
    </MapContainer>
  );
}
