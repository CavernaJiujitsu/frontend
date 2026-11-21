import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import type { Map as MapLibreMap, Marker as MapLibreMarker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { BrandColors, Colors } from "@/constants/theme";
import { MAP_STYLE_URL, validCoordinate, type CaveMapProps } from "./map-data";

export function CaveMap({ center, units, selectedId, onUnitPress, height = 210 }: CaveMapProps) {
  const centerLatitude = center?.latitude;
  const centerLongitude = center?.longitude;
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const markers = useRef<MapLibreMarker[]>([]);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);
  const onUnitPressRef = useRef(onUnitPress);
  useEffect(() => { onUnitPressRef.current = onUnitPress; }, [onUnitPress]);
  const initial = useRef({
    center: validCoordinate(center)
      ? [center.longitude, center.latitude] as [number, number]
      : units.length ? [units[0].longitude, units[0].latitude] as [number, number] : [-46.6333, -23.5505] as [number, number],
    zoom: center || units.length ? 11 : 3,
  });

  useEffect(() => {
    if (!host.current) return;
    let alive = true;
    let instance: MapLibreMap | undefined;
    import("maplibre-gl").then(({ Map, setWorkerUrl }) => {
      if (!alive || !host.current) return;
      // Metro does not serve MapLibre's default worker path; use the versioned local asset.
      setWorkerUrl("/maplibre-gl-worker.mjs");
      instance = new Map({
        container: host.current,
        style: MAP_STYLE_URL,
        center: initial.current.center,
        zoom: initial.current.zoom,
      });
      instance.on("error", (event) => {
        if (event.error) setError(true);
      });
      map.current = instance;
      setReady(true);
    }).catch(() => { if (alive) setError(true); });
    return () => {
      alive = false;
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];
      try {
        instance?.remove();
      } catch {
        // MapLibre can throw when React unmounts before pending tile requests finish.
      }
      map.current = null;
    };
  }, []); // The map instance is created once; subsequent changes update its markers and camera.

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    let active = true;
    import("maplibre-gl").then(({ Marker }) => {
      if (!active) return;
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];
      for (const unit of units) {
        const el = document.createElement("button");
        el.type = "button";
        el.title = `${unit.caveName} — ${unit.unitName}`;
        el.setAttribute("aria-label", el.title);
        el.style.cssText = `width:25px;height:25px;border-radius:50%;border:3px solid white;background:${unit.id === selectedId ? BrandColors.borderSecondary : BrandColors.secondary};cursor:pointer;box-shadow:0 2px 8px #0009`;
        el.onclick = () => onUnitPressRef.current?.(unit);
        markers.current.push(new Marker({ element: el }).setLngLat([unit.longitude, unit.latitude]).addTo(instance));
      }
      if (validCoordinate({ latitude: centerLatitude ?? NaN, longitude: centerLongitude ?? NaN })) {
        markers.current.push(new Marker({ color: BrandColors.borderSecondary }).setLngLat([centerLongitude!, centerLatitude!]).addTo(instance));
      }
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [ready, centerLatitude, centerLongitude, units, selectedId]);

  const latitude = centerLatitude;
  const longitude = centerLongitude;
  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    if (validCoordinate({ latitude: latitude ?? NaN, longitude: longitude ?? NaN })) {
      instance.flyTo({ center: [longitude!, latitude!], zoom: 13 });
    } else if (units.length) {
      const bounds = units.reduce<[number, number, number, number]>((box, unit) => [
        Math.min(box[0], unit.longitude), Math.min(box[1], unit.latitude),
        Math.max(box[2], unit.longitude), Math.max(box[3], unit.latitude),
      ], [Infinity, Infinity, -Infinity, -Infinity]);
      instance.fitBounds([[bounds[0], bounds[1]], [bounds[2], bounds[3]]], { padding: 30, maxZoom: 13 });
    }
  }, [ready, latitude, longitude, units]);

  return <View style={{ height, overflow: "hidden", borderRadius: 14, backgroundColor: Colors.light.backgroundElement }}>
    <div ref={host} style={{ width: "100%", height: "100%" }} />
    {!validCoordinate(center) && units.length === 0 && <View style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, justifyContent: "center", padding: 16, backgroundColor: Colors.light.backgroundElement }}>
      <Text style={{ color: Colors.light.textSecondary }}>Selecione um endereço ou busque uma caverna para visualizar o mapa.</Text>
    </View>}
    {error && <Text accessibilityRole="alert" style={{ color: Colors.light.textSecondary }}>Mapa indisponível. Continue pela lista.</Text>}
  </View>;
}
