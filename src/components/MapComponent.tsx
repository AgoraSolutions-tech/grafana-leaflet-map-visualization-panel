import React from 'react';
import { PanelProps } from '@grafana/data';
import { TileLayer, MapContainer, Tooltip, Polygon, Marker } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { Area, Boat, MapOptions } from 'types';
import { cx, css } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';

import 'leaflet/dist/leaflet.css';
import { MapContainerDescendant } from './MapContainerDescendant';

interface Props extends PanelProps<MapOptions> {}

const getStyles = () => {
  return {
    wrapper: css`
      font-family: Open Sans;
    `,
  };
};

export const MapComponent: React.FC<Props> = ({ options, width, height, data }) => {
  const mapCenter: LatLngExpression = [options.lat, options.lng];
  const styles = useStyles2(getStyles);
  const areas = options.areas.areas || [];
  const isSticky = options.areas.isTooltipSticky;
  const handleMapPositionChange = (position: { lng: number; lat: number }) => {
    options.lat = position.lat;
    options.lng = position.lng;
  };
  
  const query = options.boatQuery;

  const boatsData = data.series.find(s => s.refId === query)?.fields || [];
  const boatIds = boatsData.find((field) => field.name === 'id')?.values.map((id) => id) || [];
  const boatNames = boatsData.find((field) => field.name === 'name')?.values.map((name) => name) || [];
  const boatLatitudes = boatsData.find((field) => field.name === "latitude")?.values.map((latitude) => latitude) || [];
  const boatLongitudes = boatsData.find((field) => field.name === 'longitude')?.values.map((longitude) => longitude) || [];
  const boatTimestamp = boatsData.find((field) => field.name === 'timestamp')?.values.map((timestamp) => timestamp) || [];

  const boats: Boat[] = [];
  for(let i = 0; i < boatIds.length; i++) {
    const existingBoat = boats.find(boat => boat.id === boatIds[i]);

    if (!existingBoat) {
      const boat: Boat = {
        id: boatIds[i],
        name: boatNames[i],
        positions: [{
          timestamp: new Date(boatTimestamp[i]),
          lat: boatLatitudes[i],
          lng: boatLongitudes[i]
        }]
      }
      boats.push(boat)
    };

    if(existingBoat) {
      boats.find(boat =>boat.id === existingBoat.id)?.positions.push({
      timestamp: new Date(boatTimestamp[i]),
      lat: boatLatitudes[i],
      lng: boatLongitudes[i]
    })
    }
  };

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
      )}
    >
      <TileLayer
        attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a>OpenStreetMap</a>OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapContainerDescendant onPositionChange={handleMapPositionChange} />
      {areas.map((area: Area, index: number) => {
        return (
          <div key={index}>
            <Polygon positions={area.verticles} pathOptions={{ color: area.color }}>
              <Tooltip sticky={isSticky} permanent={!isSticky}>
                {area.name}
              </Tooltip>
            </Polygon>
          </div>
        );
      })}
      {boats &&
        boats.map((boat) => {
          const position = [boat.positions[boat.positions.length - 1].lat, boat.positions[boat.positions.length - 1].lng] as LatLngExpression;
          return <Marker key={boat.id} position={position} />;
        })}
    </MapContainer>
  );
};
