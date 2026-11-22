import { Camera, Map, Marker, type CameraRef } from "@maplibre/maplibre-react-native";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { BrandColors, Colors } from "@/constants/theme";
import { CaveMapShell, type MapCanvasProps } from "./cave-map-shell";
import { MAP_STYLE_URL, validCoordinate, type CaveMapProps } from "./map-data";

const PITCH_3D = 55;
const BEARING_3D = -20;
const ZOOM_3D = 15;

function NativeMapCanvas({ center, units, selectedId, onUnitPress, is3D }: MapCanvasProps) {
  const camera = useRef<CameraRef>(null);
  const is3DRef = useRef(is3D);
  const first3DRun = useRef(true);
  const [failed, setFailed] = useState(false);
  const first = validCoordinate(center) ? center : units[0];
  const latitude = first?.latitude;
  const longitude = first?.longitude;
  const hasCenter = validCoordinate(center);
  const initialZoom = first ? (hasCenter ? 13 : 11) : 3;
  const zoom = useRef(initialZoom);

  useEffect(() => { is3DRef.current = is3D; }, [is3D]);

  useEffect(() => {
    if (latitude !== undefined && longitude !== undefined) {
      const targetZoom = is3DRef.current ? Math.max(hasCenter ? 13 : 11, ZOOM_3D) : hasCenter ? 13 : 11;
      camera.current?.flyTo({
        center: [longitude, latitude],
        zoom: targetZoom,
        pitch: is3DRef.current ? PITCH_3D : 0,
        bearing: is3DRef.current ? BEARING_3D : 0,
        duration: 400,
      });
    }
  }, [latitude, longitude, hasCenter]);

  useEffect(() => {
    if (first3DRun.current) {
      first3DRun.current = false;
      if (!is3D) return;
    }
    const targetZoom = is3D && zoom.current < ZOOM_3D ? ZOOM_3D : undefined;
    void camera.current?.setStop({
      pitch: is3D ? PITCH_3D : 0,
      bearing: is3D ? BEARING_3D : 0,
      ...(targetZoom === undefined ? {} : { zoom: targetZoom }),
      duration: 600,
    });
  }, [is3D]);

  return <View style={styles.canvas}>
    <Map
      mapStyle={MAP_STYLE_URL}
      style={StyleSheet.absoluteFill}
      onDidFailLoadingMap={() => setFailed(true)}
      onRegionDidChange={(event) => { zoom.current = event.nativeEvent.zoom; }}
    >
      <Camera ref={camera} initialViewState={{
        center: first ? [first.longitude, first.latitude] as [number, number] : [-46.6333, -23.5505] as [number, number],
        zoom: is3D ? Math.max(initialZoom, ZOOM_3D) : initialZoom,
        pitch: is3D ? PITCH_3D : 0,
        bearing: is3D ? BEARING_3D : 0,
      }} />
      {validCoordinate(center) && <Marker id="origin" lngLat={[center.longitude, center.latitude]}>
        <View style={[styles.dot, styles.origin]} />
      </Marker>}
      {units.map((unit) => <Marker key={unit.id} id={unit.id} lngLat={[unit.longitude, unit.latitude]} onPress={() => onUnitPress?.(unit)}>
        <View style={[styles.dot, unit.id === selectedId && styles.selected]} accessibilityLabel={`${unit.caveName} — ${unit.unitName}`} />
      </Marker>)}
    </Map>
    <Text style={styles.credit}>OpenFreeMap · © OpenMapTiles · © OpenStreetMap</Text>
    {!hasCenter && units.length === 0 && <View style={[StyleSheet.absoluteFill, styles.empty]}>
      <Text style={{ color: Colors.light.textSecondary }}>Selecione um endereço ou busque uma caverna para visualizar o mapa.</Text>
    </View>}
    {failed && <Text accessibilityRole="alert" style={styles.failure}>Mapa indisponível. Continue pela lista.</Text>}
  </View>;
}

const styles = StyleSheet.create({
  canvas: { flex: 1, backgroundColor: Colors.light.backgroundElement },
  dot: { width: 24, height: 24, borderRadius: 12, borderWidth: 3, borderColor: Colors.light.text, backgroundColor: BrandColors.secondary },
  selected: { backgroundColor: BrandColors.borderSecondary },
  origin: { backgroundColor: BrandColors.borderSecondary },
  credit: { position: "absolute", right: 4, bottom: 3, fontSize: 9, color: Colors.light.text, backgroundColor: Colors.light.backgroundElement },
  failure: { position: "absolute", top: 4, left: 4, padding: 6, color: Colors.light.text, backgroundColor: Colors.light.backgroundElement },
  empty: { justifyContent: "center", padding: 16, backgroundColor: Colors.light.backgroundElement },
});

export function CaveMap(props: CaveMapProps) {
  return <CaveMapShell {...props} Canvas={NativeMapCanvas} />;
}
