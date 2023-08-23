import React from "react";
import { PanelProps } from "@grafana/data";
import { Marker, Popup, TileLayer, MapContainer, Circle } from "react-leaflet";
import { Icon, LatLngExpression } from 'leaflet';
import { MapOptions } from "types"
import { cx, css } from "@emotion/css";
import { useStyles2 } from "@grafana/ui";

import "leaflet/dist/leaflet.css";


interface Props extends PanelProps<MapOptions> { }

const getStyles = () => {
  return {
    wrapper: css`
      font-family: Open Sans;
      position: relative;
    `,
  }
}

export const MapComponent: React.FC<Props> = ({ options, width, height, data }) => {
  const center: LatLngExpression = [options.lat, options.lng];
  const styles = useStyles2(getStyles);

  const boats = options.items;
  const areas = options.areasEditor.areas;


  const pinIcon = new Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/128/9101/9101314.png',
    iconSize: [30, 30]
  });

  return (
    <MapContainer
      center={center}
      zoom={15}
      scrollWheelZoom={true}
      className={cx(
        styles.wrapper,
        css`
            width: ${width}px;
            height: ${height}px;
          `
      )}>
      <TileLayer attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a>OpenStreetMap</a>OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {boats.map(boat => (
        <Marker key={boat.id} position={[boat.lat, boat.lng]} icon={pinIcon}>
          <Popup>
           {boat.name} -  lat: {boat.lat}, lng: {boat.lng}
          </Popup>
        </Marker>
      ))
      }
      {areas.map((area: any, index: number) => {
        const center = [area.positionX, area.positionY] as LatLngExpression
        return (
        <Circle key={index} center={center} radius={200} pathOptions={ {fillColor: area.color, color: area.color} }></Circle>
      )} )}
    </MapContainer>
  )
};
