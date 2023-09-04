import React from 'react';
import { PanelProps } from '@grafana/data';
import { TileLayer, MapContainer, Tooltip, Polygon, Marker, FeatureGroup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { EditControl } from 'react-leaflet-draw';
import { Area, Boat, MapOptions, Vertex } from 'types';
import { cx, css } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';


import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { MapContainerDescendant } from './MapContainerDescendant';
import { uniqueId } from 'helpers';

interface Props extends PanelProps<MapOptions> {}

const getStyles = () => {
  return {
    wrapper: css`
      font-family: Open Sans;
    `,
  };
};

export const MapComponent: React.FC<Props> = ({ options, width, height, data, onOptionsChange, ...rest }) => {
  // console.log('rest:', rest)
  const mapCenter: LatLngExpression = [options.lat, options.lng];
  const mapZoom: number = options.zoom;
  const styles = useStyles2(getStyles);
  const areas = options.areas?.areas || [];
  const isSticky = options.areas?.isTooltipSticky;
  console.log(options.areas);
  const handleMapPositionChange = (position: { lng: number; lat: number }) => {
    options.lat = position.lat;
    options.lng = position.lng;
  };
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

  const onCreated = (e: any) => {
    const { layerType, layer } = e;

    if (layerType === 'polygon') {
      const { _latlngs } = layer;
      if (!_latlngs[0]) {
        return;
      }
      const newVerticles = _latlngs[0];
      onOptionsChange({...options, areas: {
        ...options.areas,
        areas: [
          ...options.areas.areas,
          {
            id: uniqueId(),
            name: `Area ${options.areas.areas.length + 1}`,
            color: 'red',
            verticles: newVerticles.map((vertex: Vertex) => ({
              id: uniqueId(),
              lat: vertex.lat,
              lng: vertex.lng,
            })),
          }
        ]
      } })
    }''
  };

  const onEdited = (e: any) => {
    // console.log(e);
    const { layers } = e;
    const layerIds = Object.keys(layers._layers);

    if (!layerIds[0]) {
      return;
    }

    const polygonLayerId = layerIds[0];
    const polygon = layers._layers[polygonLayerId];
    console.log('pol: ', polygon);

    const polygonId = polygon.options.id;
    const newVerticles = polygon._latlngs[0];

    const area = options.areas.areas.find((area) => area.id === polygonId);

    if (!area) {
      return;
    }
    onOptionsChange({...options, areas: {
      ...options.areas,
      areas: [
        ...options.areas.areas.filter(a => a.id !== area.id),
        {
          id: area.id,
          name: area.name,
          color: area.color,
          verticles: newVerticles.map((vertex: Vertex) => ({
            id: uniqueId(),
            lat: vertex.lat,
            lng: vertex.lng,
          })),
        }
      ]
    } })
  };

  const onDeleted = (e: any) => {
    console.log(e);
  };

  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
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
      <FeatureGroup>
        <EditControl
          position="topright"
          onCreated={onCreated}
          onEdited={onEdited}
          onDeleted={onDeleted}
          draw={{
            polyline: false,
            rectangle: false,
            circle: false,
            marker: false,
            circlemarker: false,
          }}
        />
        {areas.map((area: Area, index: number) => {
          if (!area) {
            return null;
          }
          return (
            <div key={index}>
              <Polygon
                positions={area.verticles || []}
                pathOptions={{
                  color: area.color,
                  // @ts-ignore
                  id: area.id,
                }}
              >
                <Tooltip sticky={isSticky} permanent={!isSticky}>
                  {area.name}
                </Tooltip>
              </Polygon>
            </div>
          );
        })}
      </FeatureGroup>

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
