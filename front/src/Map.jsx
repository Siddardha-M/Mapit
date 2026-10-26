import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const STYLE =
  "https://demotiles.maplibre.org/style.json";

const CENTER = [83.6616457236, 18.4680201328];

const VIEW_BOUNDS = [
  [83.6501369861, 18.4563513944],
  [83.6731544611, 18.4796888712],
];

const DATA = {
  boundary: "/data/campus_boundary.geojson",
  areas: "/data/areas.geojson",
  paths: "/data/campus_paths.geojson",
  buildings: "/data/buildings.geojson",
  entrances: "/data/building_entrances.geojson",
};

const load = (url) => fetch(url).then((r) => r.json());

const LAYERS = [
  ["boundary", "fill", "boundary", {
    "fill-color": "#d9e26a",
    "fill-opacity": 0.5,
  }],
  ["boundary-line", "line", "boundary", {
    "line-color": "#c82e2e",
    "line-width": 2,
  }],
  ["areas-fill", "fill", "areas", {
    "fill-color": "#f59e0b",
    "fill-opacity": 0.12,
  }],
  ["areas-line", "line", "areas", {
    "line-color": "#d97706",
    "line-width": 2,
    "line-opacity": 0.7,
  }],
  ["paths", "line", "paths", {
    "line-color": "#737373",
    "line-width": 2,
  }],
  ["buildings", "fill", "buildings", {
    "fill-color": "#ffffff",
    "fill-opacity": 0.95,
  }],
  ["buildings-line", "line", "buildings", {
    "line-color": "#374151",
    "line-width": 1.5,
  }],
  ["entrances", "circle", "entrances", {
    "circle-radius": 5,
    "circle-color": "#f59e0b",
    "circle-stroke-color": "#ffffff",
    "circle-stroke-width": 2,
  }],
];

export default function Map() {
  const container = useRef(null);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: container.current,
      style: STYLE,
      center: CENTER,
      zoom: 14,
      bearing: 10,
    });

    map.addControl(
      new maplibregl.NavigationControl(),
      "top-right"
    );

    map.on("load", async () => {
      const data = await Promise.all(
        Object.entries(DATA).map(async ([key, url]) => [
          key,
          await load(url),
        ])
      );

      data.forEach(([id, sourceData]) => {
        map.addSource(id, {
          type: "geojson",
          data: sourceData,
        });
      });

      const bounds = new maplibregl.LngLatBounds(
        VIEW_BOUNDS[0],
        VIEW_BOUNDS[1]
      );

      map.fitBounds(bounds, {
        padding: 0,
        duration: 0,
      });

      map.setBearing(10);
      map.setMinZoom(map.getZoom());
      map.setMaxBounds(bounds);

      LAYERS.forEach(([id, type, source, paint]) => {
        map.addLayer({
          id,
          type,
          source,
          paint,
        });
      });
    });

    return () => map.remove();
  }, []);

  return <div ref={container} className="map-container" />;
}