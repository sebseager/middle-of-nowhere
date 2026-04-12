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

  const tileUrl = 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';
  const attribution = '&copy; OpenStreetMap contributors &copy; CARTO';

  const baseMarkerStyle = {
    radius: 8,
    color: '#ffffff',
    weight: 2,
    fillColor: '#e63946',
    fillOpacity: 0.95
  };

  onMount(() => {
    if (!mapEl || typeof window === 'undefined') return;

    map = L.map(mapEl, {
      center: [target.lat, target.lng],
      zoom: ZOOM_STEPS[0],
      minZoom,
      maxZoom: 14,
      zoomControl: false,
      attributionControl: true
    });

    L.tileLayer(tileUrl, {
      attribution,
      subdomains: 'abcd',
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
    map.setMinZoom(ZOOM_STEPS[0]);
    map.setView([target.lat, target.lng], ZOOM_STEPS[0], { animate: false });
  });

  // Zoom unlock progression while playing.
  $effect(() => {
    if (!map || !marker || showResult) return;
    map.setMinZoom(minZoom);
    map.flyTo([target.lat, target.lng], minZoom, { duration: 0.8 });
  });

  // Final reveal behavior.
  $effect(() => {
    if (!map || !marker || !showResult) return;
    map.setMinZoom(6);
    map.flyTo([target.lat, target.lng], 6, { duration: 0.8 });
    marker.setStyle({ ...baseMarkerStyle, radius: 12 });
    marker.bindPopup(resultLabel, { autoClose: false, closeButton: false, closeOnClick: false }).openPopup();
  });
</script>

<div bind:this={mapEl} class="map" aria-label="City map"></div>
