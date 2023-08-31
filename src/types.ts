import { DataQuery } from '@grafana/schema';

export type Vertex = {
  id: number;
  lat: number;
  lng: number;
};
export interface ItemCollection {
  id: string;
  name: string;
  timestamp: string;
  lat: number;
  lng: number;
}

export interface Boat {
  id: number;
  name: string;
  positions: {
    timestamp: Date;
    lat: number;
    lng: number;
  }[];
}
export interface Area {
  id: number;
  name: string;
  color: string;
  verticles: Vertex[];
}

export interface MapOptions {
  lat: number;
  lng: number;
  boatQuery: string;
  areas: {
    isTooltipSticky: boolean;
    areas: Area[];
  };
}

export interface MyQuery extends DataQuery {
  id: number;
  name: string;
  latiutiude: number;
  longitude: number;
  timestamp: Date;
}
