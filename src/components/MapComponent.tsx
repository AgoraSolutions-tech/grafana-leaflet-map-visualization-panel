import React from "react";
import { PanelProps } from "@grafana/data";
import { TileLayer, MapContainer, Circle, Tooltip } from "react-leaflet";
import { LatLngExpression } from 'leaflet';
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
};

export const MapComponent: React.FC<Props> = ({ options, width, height }) => {
  const mapCenter: LatLngExpression = [options.lat, options.lng];
  const styles = useStyles2(getStyles);

  const areas = options.areas || [];
 
  return (
    <MapContainer
      center={mapCenter}
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
      
      {areas.map((area: any, index: number) => {
        const center = [area.positionX, area.positionY] as LatLngExpression
        return (
          <div key={index}>
            <Circle center={center} radius={200} pathOptions={{ fillColor: area.color, color: area.color }}>
              <Tooltip sticky>{area.name}</Tooltip>
            </Circle>
          </div>
        )
      })}
    </MapContainer>
  )
};
