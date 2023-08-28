export interface ItemCollection {
  id: string;
  name: string;
  timestamp: string;
  lat: number;
  lng: number;
}
export type Vertex = {
  id: number;
  lat: number;
  lng: number;
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
  items: ItemCollection[];
  areas: {
    isTooltipSticky: boolean;
    areas: Area[];
  }
}
