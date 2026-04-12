<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import L, { type CircleMarker, type Map as LeafletMap } from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import type { City } from './cities';
  import { ZOOM_STEPS } from './gameStore';

  interface Props {
    target: City;
    minZoom: number;
    showResult: boolean;
    resultLabel: string;
  }

  let { target, minZoom, showResult, resultLabel }: Props = $props();

  let mapEl: HTMLDivElement | null = null;
  let map: LeafletMap | null = null;
  let marker: CircleMarker | null = null;

  const tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  const attribution = 'Tiles &copy; Esri';

  const baseMarkerStyle = {
    radius: 8,
    color: '#ffffff',
    weight: 2,
    fillColor: '#e63946',
    fillOpacity: 0.95
  };

  function computeBounds(lat: number, lng: number, zoom: number): L.LatLngBounds {
    const containerSize = mapEl?.clientWidth ?? 400;
    const degreesPerPixel = 360 / (256 * Math.pow(2, zoom));
    const viewportDeg = containerSize * degreesPerPixel;
    const halfSpan = viewportDeg;
    return L.latLngBounds(
      [lat - halfSpan, lng - halfSpan],
      [lat + halfSpan, lng + halfSpan]
    );
  }

  onMount(() => {
    if (!mapEl || typeof window === 'undefined') return;

    map = L.map(mapEl, {
      center: [target.lat, target.lng],
      zoom: ZOOM_STEPS[0],
      minZoom,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: true,
      maxBounds: computeBounds(target.lat, target.lng, ZOOM_STEPS[0]),
      maxBoundsViscosity: 1.0
    });

    L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 20
    }).addTo(map);

    map.attributionControl.setPosition('bottomright');

    marker = L.circleMarker([target.lat, target.lng], baseMarkerStyle).addTo(map);
  });

  onDestroy(() => {
    map?.remove();
    map = null;
    marker = null;
  });

  // New round: hard reset to closest zoom with no animation.
  $effect(() => {
    if (!map || !marker) return;
    target;
    marker.setLatLng([target.lat, target.lng]);
    marker.setStyle(baseMarkerStyle);
    marker.closePopup();
    map.setMaxBounds(computeBounds(target.lat, target.lng, ZOOM_STEPS[0]));
    map.setMinZoom(ZOOM_STEPS[0]);
    map.setView([target.lat, target.lng], ZOOM_STEPS[0], { animate: false });
  });

  // Zoom unlock progression while playing.
  $effect(() => {
    if (!map || !marker || showResult) return;
    map.setMaxBounds(computeBounds(target.lat, target.lng, minZoom));
    map.setMinZoom(minZoom);
    map.flyTo([target.lat, target.lng], minZoom, { duration: 0.8 });
  });

  // Final reveal behavior.
  $effect(() => {
    if (!map || !marker || !showResult) return;
    (map as any).setMaxBounds(null);
    map.setMinZoom(4);
    map.flyTo([target.lat, target.lng], 6, { duration: 0.8 });
    marker.setStyle({ ...baseMarkerStyle, radius: 12 });
    marker.bindPopup(resultLabel, { autoClose: false, closeButton: false, closeOnClick: false }).openPopup();
  });
</script>

<div bind:this={mapEl} class="map" aria-label="City map"></div>
