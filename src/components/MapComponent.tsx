import React from "react";
import { PanelProps } from "@grafana/data";
import { TileLayer, MapContainer, Tooltip, Polygon } from "react-leaflet";
import { LatLngExpression } from 'leaflet';
import { Area, MapOptions } from "types"
import { cx, css } from "@emotion/css";
import { useStyles2 } from "@grafana/ui";

import "leaflet/dist/leaflet.css";
import { MapContainerDescendant } from "./MapContainerDescendant";


interface Props extends PanelProps<MapOptions> { }

const getStyles = () => {
  return {
    wrapper: css`
      font-family: Open Sans;
    `,
  }
};

export const MapComponent: React.FC<Props> = ({ options, width, height }) => {
  const mapCenter: LatLngExpression = [options.lat, options.lng];
  const styles = useStyles2(getStyles);
  const areas = options.areas.areas || [];
  const isSticky = options.areas.isTooltipSticky;

  const handleMapPositionChange = (position: { lng: number, lat: number }) => {
    options.lat = position.lat;
    options.lng = position.lng;
  };
 
  console.log('map options: ', options);
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
      <MapContainerDescendant onPositionChange={handleMapPositionChange} />
      {areas.map((area: Area, index: number) => {
        return (
          <div key={index}>
            <Polygon positions={area.verticles} pathOptions={{ color: area.color }}>
              <Tooltip sticky={isSticky} permanent={!isSticky}>{area.name}</Tooltip>
            </Polygon>
          </div>
        )
      })}
    </MapContainer>
  )
};
