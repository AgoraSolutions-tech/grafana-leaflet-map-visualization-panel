import React, { useState } from 'react';
import { PanelProps, urlUtil } from '@grafana/data';
import { TileLayer, MapContainer, Tooltip, Polygon, Marker, Polyline, Popup, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L, { LatLngExpression } from 'leaflet';
import { Area, Boat, MapOptions, Vertex } from 'types';
import { cx, css } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';
import { MapContainerDescendant } from './MapContainerDescendant';
import { uniqueId } from 'helpers';
import show from '../img/show.png';
import hide from '../img/hide.png';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

interface Props extends PanelProps<MapOptions> {}

const getStyles = () => {
  return {
    wrapper: css`
      font-family: Open Sans;
    `,
    styledTooltip: css`
      background: none !important;
      border: none !important;
      box-shadow: none !important;
      font-weight: 800;
      font-size: 18px;
      text-shadow: 1px 1px 2px white;
    `,
    styledButton: css`
      background-color: white;
      color: black;
      font-size: 14px;
      border-radius: 4px;
      border: 2px solid rgba(0, 0, 0, 0.2);
      background-clip: padding-box;
      cursor: pointer !important;
    `,
    styledImg: css`
      width: 20px;
      margin: 5px;
    `,
  };
};
export const MapComponent: React.FC<Props> = ({ options, width, height, data, onOptionsChange }) => {
  const styles = useStyles2(getStyles);
  const [historyVisibility, setHistoryVisibility] = useState(false);
  const [editContolKey, setEditControlKey] = useState(uniqueId());

  const mapCenter: LatLngExpression = [options.lat, options.lng];
  const areas = options.areas?.areas || [];
  const zoomValue = options.zoom;
  const isTooltipSticky = options.areas.isTooltipSticky;
  const boatIcon = L.icon({
    iconUrl: require('../img/boat-pin.svg'),
    iconSize: [50, 50],
    iconAnchor: [25, 45],
  });

  const params = urlUtil.getUrlSearchParams();
  const isEditMode = !!params.editPanel;

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

  const onCreated = (e: any) => {
    const { layerType, layer } = e;
    if (layerType === 'polygon') {
      const { _latlngs } = layer;
      if (!_latlngs[0]) {
        return;
      }

      const newVerticles = _latlngs[0];
      onOptionsChange({
        ...options,
        areas: {
          ...options.areas,
          areas: [
            ...areas,
            {
              id: uniqueId(),
              name: `Area ${areas.length + 1}`,
              color: 'red',
              verticles: newVerticles.map((vertex: Vertex) => ({
                id: uniqueId(),
                lat: vertex.lat,
                lng: vertex.lng,
              })),
            },
          ],
        },
      });
      setEditControlKey(uniqueId());
    }
  };

  const onEdited = (e: any) => {
    const { layers } = e;
    const layerIds = Object.keys(layers._layers);

    if (!layerIds[0]) {
      return;
    }

    const polygonLayerId = layerIds[0];
    const polygon = layers._layers[polygonLayerId];

    const polygonId = polygon.options.id;
    const newVerticles = polygon._latlngs[0];

    const area = areas.find((area) => area.id === polygonId);

    if (!area) {
      return;
    }

    const newAreas = areas.map((area) => {
      if (area.id !== polygonId) {
        return area;
      }

      return {
        ...area,
        verticles: newVerticles.map((vertex: Vertex) => ({
          id: uniqueId(),
          lat: vertex.lat,
          lng: vertex.lng,
        })),
      };
    });

    onOptionsChange({
      ...options,
      areas: {
        ...options.areas,
        areas: newAreas,
      },
    });
    setEditControlKey(uniqueId());
  };

  const onDeleted = (e: any) => {
    const { layers } = e;
    const layerIds = Object.keys(layers._layers).map((id) => Number(id));

    if (!layerIds[0]) {
      return;
    }

    const removedLayers = layers._layers;
    let removedPoligonsIds: any = [];
    for (let i = 0; i < layerIds.length; i++) {
      const id: number = removedLayers[layerIds[i]].options.id;
      removedPoligonsIds.push(id);
    }
    const newAreas = areas.filter((area) => {
      if (removedPoligonsIds.includes(area.id)) {
        return false;
      }
      return true;
    });

    onOptionsChange({
      ...options,
      areas: {
        ...options.areas,
        areas: newAreas,
      },
    });
    setEditControlKey(uniqueId());
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
      <FeatureGroup>
        {isEditMode && (
          <EditControl
            key={editContolKey}
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
        )}
        {areas.map((area: Area, index: number) => {
          return (
            <div key={area.id}>
              <Polygon
                positions={area.verticles}
                pathOptions={{
                  color: area.color,
                  // @ts-ignore
                  id: area.id,
                }}
              >
                {options.zoom >= 15 && (
                  <Tooltip
                    key={isTooltipSticky ? 1 : 0}
                    sticky={!isTooltipSticky}
                    permanent={isTooltipSticky}
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
      </FeatureGroup>
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
      <div className="leaflet-bottom leaflet-left">
        <button
          className={'leaflet-control' + ' ' + styles.styledButton}
          onClick={() => setHistoryVisibility(!historyVisibility)}
        >
          <img src={historyVisibility ? show : hide} className={styles.styledImg} />
          {'trail'.toUpperCase()}
        </button>
      </div>
    </MapContainer>
  );
};
