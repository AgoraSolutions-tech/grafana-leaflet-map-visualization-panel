import React, { useState } from 'react';
import { PanelProps } from '@grafana/data';
import { TileLayer, MapContainer, Tooltip, Polygon, Marker, Polyline, Popup } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
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
    styledTooltip: css`
      background: none;
      font-size: 15px;
    `,
  };
};

export const MapComponent: React.FC<Props> = ({ options, width, height, data, onOptionsChange }) => {
  const styles = useStyles2(getStyles);
  const [historyVisibility, setHistoryVisibility] = useState(false);

  const mapCenter: LatLngExpression = [options.lat, options.lng];
  const areas = options.areas?.areas || [];
  const zoomValue = options.zoom;

  const boatIcon = L.icon({
    iconUrl: require('../img/boat-pin.svg'),
    iconSize: [40, 40],
  });
  

  const query = options.boatQuery;
  const boatsData = data.series.find((s) => s.refId === query)?.fields || [];

  const queryBoats = boatsData[0]?.values.map((record, index) => ({
    id: boatsData.find((field) => field.name === 'id')?.values.map((id) => id)[index],
    name: boatsData.find((field) => field.name === 'name')?.values.map((name) => name)[index],
    latitude: boatsData.find((field) => field.name === 'latitude')?.values.map((latitude) => latitude)[index],
    longitude: boatsData.find((field) => field.name === 'longitude')?.values.map((longitude) => longitude)[index],
    timestamp: boatsData.find((field) => field.name === 'timestamp')?.values.map((timestamp) => timestamp)[index],
  }));

  const boats = (queryBoats || []).reduce((acc: Boat[], currBoat) => {
    const newPosition = {
      timestamp: new Date(currBoat.timestamp),
      lat: currBoat.latitude,
      lng: currBoat.longitude,
    };
    const existingBoat = acc.find((boat) => boat.id === currBoat.id);
    if (existingBoat) {
      existingBoat.positions.unshift(newPosition);
      return acc;
    }
    const newBoat = {
      id: currBoat.id,
      name: currBoat.name,
      positions: [newPosition],
    };
    return [...acc, newBoat];
  }, []);

  const handleMapEventTrigger = (position: { lng: number; lat: number }, newValue: number) => {
    onOptionsChange({ ...options, lat: position.lat, lng: position.lng, zoom: newValue });
  };

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoomValue}
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
      <MapContainerDescendant onMapEventTrigger={handleMapEventTrigger} />
      {areas.map((area: Area, index: number) => {
        return (
          <div key={index}>
            <Polygon positions={area.verticles} pathOptions={{ color: area.color }}>
              {options.zoom >= 14 && (
                <Tooltip
                  sticky={!options.areas.isTooltipSticky}
                  permanent={options.areas.isTooltipSticky}
                  direction="center"
                  className={styles.styledTooltip}
                >
                  {area.name}
                </Tooltip>
              )}
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
          const linePoints = boat.positions.map((position) => [position.lat, position.lng]) as Array<LatLngExpression>;
          return (
            <>
              <Marker key={boat.id} position={position} icon={boatIcon}>
                <Popup maxWidth={20}>
                  <h2>{boat.name}</h2>
                  current position: {boat.positions[boat.positions.length - 1].lat},{' '}
                  {boat.positions[boat.positions.length - 1].lng}
                </Popup>
              </Marker>
              {historyVisibility &&
                linePoints.map((point, index) => {
                  if (index + 1 >= linePoints.length) {
                    return;
                  }
                  return (
                    <Polyline
                      key={index}
                      positions={[point, linePoints[index + 1]]}
                      weight={5}
                      opacity={1 / (linePoints.length / (index + 2))}
                      color={'green'}
                    />
                  );
                })}
            </>
          );
        })}
      <div className="leaflet-bottom leaflet-right">
        <button className="leaflet-control" onClick={() => setHistoryVisibility(!historyVisibility)}>
          click
        </button>
      </div>
    </MapContainer>
  );
};
