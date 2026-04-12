import { useEffect, useRef } from "react";
import L, { type CircleMarker, type Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { City } from "./cities";
import { ZOOM_STEPS } from "./gameStore";

interface MapProps {
  target: City;
  minZoom: number;
  showResult: boolean;
  resultLabel: string;
}

const tileUrl =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const attribution = "Tiles &copy; Esri";

const baseMarkerStyle: L.CircleMarkerOptions = {
  radius: 8,
  color: "#ffffff",
  weight: 2,
  fillColor: "#e63946",
  fillOpacity: 0.95,
};

function Map({ target, minZoom, showResult, resultLabel }: MapProps) {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<CircleMarker | null>(null);

  const computeBounds = (
    lat: number,
    lng: number,
    zoom: number,
  ): L.LatLngBounds => {
    const containerSize = mapElRef.current?.clientWidth ?? 400;
    const degreesPerPixel = 360 / (256 * Math.pow(2, zoom));
    const viewportDeg = containerSize * degreesPerPixel;
    const halfSpan = viewportDeg;

    return L.latLngBounds(
      [lat - halfSpan, lng - halfSpan],
      [lat + halfSpan, lng + halfSpan],
    );
  };

  useEffect(() => {
    if (!mapElRef.current || typeof window === "undefined") {
      return;
    }

    const map = L.map(mapElRef.current, {
      center: [target.lat, target.lng],
      zoom: ZOOM_STEPS[0],
      minZoom,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: true,
      maxBounds: computeBounds(target.lat, target.lng, ZOOM_STEPS[0]),
      maxBoundsViscosity: 1,
    });

    L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 20,
    }).addTo(map);

    map.attributionControl.setPosition("bottomright");

    const marker = L.circleMarker(
      [target.lat, target.lng],
      baseMarkerStyle,
    ).addTo(map);

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;

    if (!map || !marker) {
      return;
    }

    marker.setLatLng([target.lat, target.lng]);
    marker.setStyle(baseMarkerStyle);
    marker.closePopup();
    map.setMaxBounds(computeBounds(target.lat, target.lng, ZOOM_STEPS[0]));
    map.setMinZoom(ZOOM_STEPS[0]);
    map.setView([target.lat, target.lng], ZOOM_STEPS[0], { animate: false });
  }, [target.abbr, target.city, target.lat, target.lng]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || showResult) {
      return;
    }

    map.setMaxBounds(computeBounds(target.lat, target.lng, minZoom));
    map.setMinZoom(minZoom);
    map.flyTo([target.lat, target.lng], minZoom, { duration: 0.8 });
  }, [minZoom, showResult, target.lat, target.lng]);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;

    if (!map || !marker || !showResult) {
      return;
    }

    (map as unknown as { setMaxBounds: (value: null) => void }).setMaxBounds(
      null,
    );
    map.setMinZoom(4);
    map.flyTo([target.lat, target.lng], 6, { duration: 0.8 });

    marker.setStyle({ ...baseMarkerStyle, radius: 12 });
    marker
      .bindPopup(resultLabel, {
        autoClose: false,
        closeButton: false,
        closeOnClick: false,
      })
      .openPopup();
  }, [resultLabel, showResult, target.lat, target.lng]);

  return <div ref={mapElRef} className="map" aria-label="City map" />;
}

export default Map;
