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
  const boatsData = data.series.find((s) => s.refId === query)?.fields || [];

  const queryBoats = boatsData[0].values.map((record, index) => ({
    id: boatsData.find((field) => field.name === 'id')?.values.map((id) => id)[index],
    name: boatsData.find((field) => field.name === 'name')?.values.map((name) => name)[index],
    latitude: boatsData.find((field) => field.name === 'latitude')?.values.map((latitude) => latitude)[index],
    longitude: boatsData.find((field) => field.name === 'longitude')?.values.map((longitude) => longitude)[index],
    timestamp: boatsData.find((field) => field.name === 'timestamp')?.values.map((timestamp) => timestamp)[index],
  }));

  const boats = queryBoats.reduce((acc: Boat[], currBoat) => {
    const newPosition = {
      timestamp: new Date(currBoat.timestamp),
      lat: currBoat.latitude,
      lng: currBoat.longitude,
    };

    const existingBoat = acc.find((boat) => boat.id === currBoat.id);
    if (existingBoat) {
      acc;
      existingBoat.positions.push(newPosition);
      return acc;
    }

    const newBoat = {
      id: currBoat.id,
      name: currBoat.name,
      positions: [newPosition],
    };

    return [...acc, newBoat];
  }, []);

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
          const position = [
            boat.positions[boat.positions.length - 1].lat,
            boat.positions[boat.positions.length - 1].lng,
          ] as LatLngExpression;
          return <Marker key={boat.id} position={position} />;
        })}
    </MapContainer>
  );
};
