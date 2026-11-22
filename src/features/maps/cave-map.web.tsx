import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Map as MapLibreMap, Marker as MapLibreMarker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { BrandColors, Colors } from "@/constants/theme";
import { CaveMapShell, type MapCanvasProps } from "./cave-map-shell";
import { MAP_STYLE_URL, validCoordinate, type CaveMapProps } from "./map-data";

const PITCH_3D = 55;
const BEARING_3D = -20;
const ZOOM_3D = 15;

function WebMapCanvas({ center, units, selectedId, onUnitPress, is3D }: MapCanvasProps) {
  const centerLatitude = center?.latitude;
  const centerLongitude = center?.longitude;
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const markers = useRef<MapLibreMarker[]>([]);
  const is3DRef = useRef(is3D);
  const first3DRun = useRef(true);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);
  const onUnitPressRef = useRef(onUnitPress);
  useEffect(() => { onUnitPressRef.current = onUnitPress; }, [onUnitPress]);
  useEffect(() => { is3DRef.current = is3D; }, [is3D]);
  const initial = useRef({
    center: validCoordinate(center)
      ? [center.longitude, center.latitude] as [number, number]
      : units.length ? [units[0].longitude, units[0].latitude] as [number, number] : [-46.6333, -23.5505] as [number, number],
    zoom: !center && !units.length ? 3 : is3D ? ZOOM_3D : 11,
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
        pitch: is3DRef.current ? PITCH_3D : 0,
        bearing: is3DRef.current ? BEARING_3D : 0,
        maxPitch: 70,
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
    const pitch = is3DRef.current ? PITCH_3D : 0;
    const bearing = is3DRef.current ? BEARING_3D : 0;
    if (validCoordinate({ latitude: latitude ?? NaN, longitude: longitude ?? NaN })) {
      instance.flyTo({ center: [longitude!, latitude!], zoom: is3DRef.current ? ZOOM_3D : 13, pitch, bearing });
    } else if (units.length) {
      const bounds = units.reduce<[number, number, number, number]>((box, unit) => [
        Math.min(box[0], unit.longitude), Math.min(box[1], unit.latitude),
        Math.max(box[2], unit.longitude), Math.max(box[3], unit.latitude),
      ], [Infinity, Infinity, -Infinity, -Infinity]);
      instance.fitBounds([[bounds[0], bounds[1]], [bounds[2], bounds[3]]], {
        padding: 30,
        maxZoom: is3DRef.current ? ZOOM_3D : 13,
        pitch,
        bearing,
      });
    }
  }, [ready, latitude, longitude, units]);

  useEffect(() => {
    const instance = map.current;
    if (!instance || !ready) return;
    if (first3DRun.current) {
      first3DRun.current = false;
      if (!is3D) return;
    }
    instance.easeTo({
      pitch: is3D ? PITCH_3D : 0,
      bearing: is3D ? BEARING_3D : 0,
      ...(is3D ? { zoom: Math.max(instance.getZoom(), ZOOM_3D) } : {}),
      duration: 700,
    });
  }, [is3D, ready]);

  return <View style={styles.canvas}>
    <div ref={host} style={{ width: "100%", height: "100%" }} />
    {!validCoordinate(center) && units.length === 0 && <View style={styles.empty}>
      <Text style={{ color: Colors.light.textSecondary }}>Selecione um endereço ou busque uma caverna para visualizar o mapa.</Text>
    </View>}
    {error && <View style={styles.failure}>
      <Text accessibilityRole="alert" style={styles.failureText}>Mapa indisponível. Continue pela lista.</Text>
    </View>}
  </View>;
}

const styles = StyleSheet.create({
  canvas: { flex: 1, backgroundColor: Colors.light.backgroundElement },
  empty: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: "center",
    padding: 16,
    backgroundColor: Colors.light.backgroundElement,
  },
  failure: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.backgroundElement,
  },
  failureText: { color: Colors.light.textSecondary },
});

export function CaveMap(props: CaveMapProps) {
  return <CaveMapShell {...props} Canvas={WebMapCanvas} />;
}
