import { useEffect, useRef } from "react";
import L, { type CircleMarker, type Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { City } from "./cities";
import { COLOR_PALETTE } from "./color-palette";
import type { GuessResult } from "./game-store";
import { ZOOM_STEPS } from "./game-store";
import {
  createCheckedTileLayer,
  probeMaxZoom,
  type CheckedTileLayerHandle,
} from "./checked-tile-layer";

interface MapProps {
  target: City;
  guesses: GuessResult[];
  minZoom: number;
  showResult: boolean;
  resultLabel: string;
}

const DEFAULT_MAX_TILE_ZOOM = 20;

const tileUrl =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

const baseMarkerStyle: L.CircleMarkerOptions = {
  radius: 8,
  color: "#ffffff",
  weight: 2,
  fillColor: COLOR_PALETTE.currentPinBlue,
  fillOpacity: 0.95,
};

const guessMarkerBaseStyle: L.CircleMarkerOptions = {
  radius: 7,
  color: "#ffffff",
  weight: 2,
  fillOpacity: 0.95,
};

const guessFillColor = (guess: GuessResult): string => {
  if (guess.correct) {
    return COLOR_PALETTE.correctGuessGreen;
  }

  return guess.milesAway < 1000
    ? COLOR_PALETTE.nearGuessOrange
    : COLOR_PALETTE.farGuessRed;
};

function Map({ target, guesses, minZoom, showResult, resultLabel }: MapProps) {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<CircleMarker | null>(null);
  const guessMarkersRef = useRef<L.LayerGroup | null>(null);
  const markerRendererRef = useRef<L.Renderer | null>(null);
  const tileLayerRef = useRef<CheckedTileLayerHandle | null>(null);
  const maxZoomProbeIdRef = useRef(0);
  const allowAnimatedZoomRef = useRef(false);

  const runMaxZoomProbe = (lat: number, lng: number) => {
    const probeId = ++maxZoomProbeIdRef.current;

    // Probe the tile server for this location and ignore stale async results.
    probeMaxZoom(lat, lng, tileUrl, DEFAULT_MAX_TILE_ZOOM).then((maxZ) => {
      if (mapRef.current && probeId === maxZoomProbeIdRef.current) {
        mapRef.current.setMaxZoom(maxZ);
      }
    });
  };

  const computeBounds = (
    lat: number,
    lng: number,
    zoom: number,
  ): L.LatLngBounds => {
    const containerSize = Math.max(mapElRef.current?.clientWidth ?? 0, 320);
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
      maxZoom: DEFAULT_MAX_TILE_ZOOM,
      bounceAtZoomLimits: false,
      zoomControl: false,
      attributionControl: false,
      maxBounds: computeBounds(target.lat, target.lng, ZOOM_STEPS[0]),
      maxBoundsViscosity: 1,
    });

    // A padded renderer plus noClip helps keep the marker visible while panning.
    markerRendererRef.current = L.svg({ padding: 1.5 });

    const tileHandle = createCheckedTileLayer(tileUrl, {
      maxZoom: DEFAULT_MAX_TILE_ZOOM,
      maxNativeZoom: DEFAULT_MAX_TILE_ZOOM,
    });
    tileHandle.layer.addTo(map);
    tileLayerRef.current = tileHandle;

    runMaxZoomProbe(target.lat, target.lng);

    const marker = L.circleMarker([target.lat, target.lng], {
      ...baseMarkerStyle,
      renderer: markerRendererRef.current,
    }).addTo(map);

    guessMarkersRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;
    markerRef.current = marker;

    map.whenReady(() => {
      map.invalidateSize(false);
    });

    return () => {
      maxZoomProbeIdRef.current += 1;
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      guessMarkersRef.current = null;
      markerRendererRef.current = null;
      tileLayerRef.current = null;
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
    marker.unbindPopup();
    marker.bringToFront();
    map.setMaxZoom(DEFAULT_MAX_TILE_ZOOM);
    map.setMaxBounds(computeBounds(target.lat, target.lng, ZOOM_STEPS[0]));
    map.setMinZoom(ZOOM_STEPS[0]);
    map.setView([target.lat, target.lng], ZOOM_STEPS[0], { animate: false });
    allowAnimatedZoomRef.current = false;

    runMaxZoomProbe(target.lat, target.lng);
  }, [target.abbr, target.city, target.lat, target.lng]);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    const guessMarkers = guessMarkersRef.current;

    if (!map || !marker || !guessMarkers) {
      return;
    }

    guessMarkers.clearLayers();

    guesses.forEach((guess) => {
      L.circleMarker([guess.lat, guess.lng], {
        ...guessMarkerBaseStyle,
        fillColor: guessFillColor(guess),
        renderer: markerRendererRef.current ?? undefined,
      }).addTo(guessMarkers);
    });

    marker.bringToFront();
  }, [guesses]);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;

    if (!map || !marker || showResult) {
      return;
    }

    marker.closePopup();
    marker.unbindPopup();

    const center = map.getCenter();
    const sameCenter =
      Math.abs(center.lat - target.lat) < 0.000001 &&
      Math.abs(center.lng - target.lng) < 0.000001;
    const sameZoom = Math.abs(map.getZoom() - minZoom) < 0.000001;
    const shouldAnimate =
      allowAnimatedZoomRef.current && (!sameCenter || !sameZoom);

    map.setMaxBounds(computeBounds(target.lat, target.lng, minZoom));
    map.setMinZoom(minZoom);

    if (shouldAnimate) {
      map.flyTo([target.lat, target.lng], minZoom, { duration: 0.8 });
    } else {
      map.setView([target.lat, target.lng], minZoom, { animate: false });
    }

    allowAnimatedZoomRef.current = true;
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

    marker.unbindPopup();
    marker.setStyle({ ...baseMarkerStyle, radius: 12 });
    marker
      .bindPopup(resultLabel, {
        autoClose: false,
        closeButton: false,
        closeOnClick: false,
      })
      .openPopup();
  }, [resultLabel, showResult, target.lat, target.lng]);

  return (
    <div
      ref={mapElRef}
      className="h-full w-full bg-slate-300 dark:bg-slate-800"
      aria-label="City map"
    />
  );
}

export default Map;
