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
 export interface MovingObject {
  id: number;
  name: string;
  positions: Array<{
    timestamp: Date;
    lat: number;
    lng: number;
  }>;
}
export interface Area {
  id: number;
  name: string;
  color: string;
  isNew?: boolean;
  verticles: Array<Vertex>;
}

export interface MapOptions {
  lat: number;
  lng: number;
  objectQuery: string;
  zoom: number;
  isTailVisible: boolean;
  areas: {
    isTooltipSticky: boolean;
    areas: Array<Area>;
  };
} 

export interface MyQuery extends DataQuery {
  id: number;
  name: string;
  latiutiude: number;
  longitude: number;
  zoom: number;
  timestamp: Date;
}
