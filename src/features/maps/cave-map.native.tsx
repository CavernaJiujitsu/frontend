import { Camera, Map, Marker, type CameraRef } from "@maplibre/maplibre-react-native";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { BrandColors, Colors } from "@/constants/theme";
import { MAP_STYLE_URL, validCoordinate, type CaveMapProps } from "./map-data";

export function CaveMap({ center, units, selectedId, onUnitPress, height = 210 }: CaveMapProps) {
  const camera = useRef<CameraRef>(null);
  const [failed, setFailed] = useState(false);
  const first = validCoordinate(center) ? center : units[0];
  const latitude = first?.latitude;
  const longitude = first?.longitude;
  const hasCenter = validCoordinate(center);
  useEffect(() => {
    if (latitude !== undefined && longitude !== undefined) {
      camera.current?.flyTo({ center: [longitude, latitude], zoom: hasCenter ? 13 : 11, duration: 400 });
    }
  }, [latitude, longitude, hasCenter]);
  return <View style={{ height, borderRadius: 14, overflow: "hidden", backgroundColor: Colors.light.backgroundElement }}>
    <Map mapStyle={MAP_STYLE_URL} style={StyleSheet.absoluteFill} onDidFailLoadingMap={() => setFailed(true)}>
      <Camera ref={camera} initialViewState={{
        center: first ? [first.longitude, first.latitude] : [-46.6333, -23.5505],
        zoom: first ? 11 : 3,
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
  dot: { width: 24, height: 24, borderRadius: 12, borderWidth: 3, borderColor: Colors.light.text, backgroundColor: BrandColors.secondary },
  selected: { backgroundColor: BrandColors.borderSecondary },
  origin: { backgroundColor: BrandColors.borderSecondary },
  credit: { position: "absolute", right: 4, bottom: 3, fontSize: 9, color: Colors.light.text, backgroundColor: Colors.light.backgroundElement },
  failure: { position: "absolute", top: 4, left: 4, padding: 6, color: Colors.light.text, backgroundColor: Colors.light.backgroundElement },
  empty: { justifyContent: "center", padding: 16, backgroundColor: Colors.light.backgroundElement },
});
