import { TileLayer, type TileLayerOptions } from "leaflet";

/** No-data placeholder tiles are far smaller than real satellite imagery. */
export const NO_DATA_SIZE_THRESHOLD = 5_000;

export interface ProbeMaxZoomDependencies {
  fetchImpl?: typeof fetch;
}

/**
 * Convert lat/lng to tile x/y at a given zoom level.
 * Uses the standard Slippy Map tile numbering.
 */
export function latLngToTileCoords(
  lat: number,
  lng: number,
  zoom: number,
): { x: number; y: number } {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n,
  );
  return { x, y };
}

/**
 * Probe a tile server to find the highest zoom level that has real satellite
 * data for a given location. Works by fetching single tiles from maxZoom
 * downward and checking the response size — no-data placeholder tiles are
 * far smaller than actual imagery.
 */
export async function probeMaxZoom(
  lat: number,
  lng: number,
  tileUrlTemplate: string,
  maxZoom: number,
  minZoom: number = 1,
  deps: ProbeMaxZoomDependencies = {},
): Promise<number> {
  const fetchFn = deps.fetchImpl ?? fetch;

  for (let z = maxZoom; z >= minZoom; z--) {
    const { x, y } = latLngToTileCoords(lat, lng, z);
    const url = tileUrlTemplate
      .replace("{z}", String(z))
      .replace("{y}", String(y))
      .replace("{x}", String(x));
    try {
      const response = await fetchFn(url);
      if (response.ok) {
        const blob = await response.blob();
        if (blob.size >= NO_DATA_SIZE_THRESHOLD) {
          return z;
        }
      }
    } catch {
      // Network/CORS error at this zoom — try a lower level.
    }
  }

  return minZoom;
}

export interface CheckedTileLayerHandle {
  layer: TileLayer;
}

export function createCheckedTileLayer(
  url: string,
  options: TileLayerOptions,
): CheckedTileLayerHandle {
  const layer = new TileLayer(url, options);
  return { layer };
}
