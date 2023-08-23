import { LatLngTuple } from "leaflet";


export interface ItemCollection {
  id: string;
  name: string;
  timestamp: string;
  lat: number;
  lng: number;
}

export interface Area {
  id: number;
  name: string;
  color: string;
  positionX: number;
  positionY: number;
}

export interface PolygonCollection {
  id: string;
  name: string;
  vertices: LatLngTuple[];
}

export interface MapOptions {
  lat: number;
  lng: number;
  items: ItemCollection[];
  polygons: PolygonCollection[];
  areas: Area[];
}
