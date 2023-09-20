import React from 'react';
import { PanelProps } from '@grafana/data';
import { TileLayer, MapContainer, Marker, Polyline, Popup, LayersControl } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import { MovingObject, MapOptions, Area, Vertex } from 'types';
import { cx, css } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';
import { MapContainerDescendant } from './MapContainerDescendant';
import { colorValues, isPointInPoly, shoulAddZero } from 'helpers';
import show from '../img/show.png';
import hide from '../img/hide.png';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './styles.css';
import { MapContainesStyles } from './style';
import { PolygonCreator } from './PolygonCreator';

interface Props extends PanelProps<MapOptions> {}

export const MapComponent: React.FC<Props> = ({ options, width, height, data, onOptionsChange }) => {
  const styles = useStyles2(MapContainesStyles);

  const mapCenter: LatLngExpression = [options.lat, options.lng];
  const tailVisibility = options.isTailVisible;
  const zoomValue = options.zoom;
  const controlKey = options.controlKey;
  const boatIcon = L.icon({
    iconUrl: require('../img/boat-pin.svg'),
    iconSize: [50, 50],
    iconAnchor: [25, 45],
  });
  const query = options.objectQuery;
  const objectData = data.series.find((s) => s.refId === query)?.fields || [];

  const queryObjects = objectData[0]?.values.map((record, index) => ({
    id: objectData.find((field) => field.name === 'id')?.values.map((id) => id)[index],
    name: objectData.find((field) => field.name === 'name')?.values.map((name) => name)[index],
    latitude: objectData.find((field) => field.name === 'latitude')?.values.map((latitude) => latitude)[index],
    longitude: objectData.find((field) => field.name === 'longitude')?.values.map((longitude) => longitude)[index],
    timestamp: objectData.find((field) => field.name === 'timestamp')?.values.map((timestamp) => timestamp)[index],
  }));

  const objects = (queryObjects || []).reduce((acc: MovingObject[], currBoat) => {
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
      <LayersControl>
        <LayersControl.BaseLayer name="OpenStreetMap" checked={true}>
          <TileLayer
            attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a>OpenStreetMap</a>OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Esri.WorldImagery">
          <TileLayer
            attribution="Powered by <a href='https://www.esri.com/en-us/home'>Esri</a> &mdash; Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      <MapContainerDescendant onMapEventTrigger={handleMapEventTrigger} />
      {objects && <PolygonCreator onOptionsChange={onOptionsChange} options={options} objects={objects} controlKey={controlKey} />}
      {objects &&
        objects.map((object) => {
          const position = [object.positions[0].lat, object.positions[0].lng] as LatLngExpression;
          const currentTimestamp = new Date(object.positions[0].timestamp);
          const currDate =
            shoulAddZero(currentTimestamp.getHours()) +
            ':' +
            shoulAddZero(currentTimestamp.getMinutes()) +
            ', ' +
            shoulAddZero(currentTimestamp.getDate()) +
            '-' +
            shoulAddZero(currentTimestamp.getMonth()) +
            '-' +
            currentTimestamp.getFullYear();

          const linePoints = object.positions.map((position) => [
            position.lat,
            position.lng,
          ]) as Array<LatLngExpression>;
          let areasArr: String[] = [];
          options.areas?.areas.map((area: Area) => {
            const areaVerticles = area.verticles.map((vertex: Vertex) => [vertex.lat, vertex.lng]);
            if (isPointInPoly(areaVerticles, [object.positions[0].lat, object.positions[0].lng])) {
              areasArr.push(area.name);
            }
          });
          return (
            <>
              <Marker key={object.id} position={position} icon={boatIcon}>
                <Popup offset={[0, -20]} className={styles.styledPopup}>
                  <p className={styles.title + ' ' + styles.text}>{object.name}</p>
                  <p className={styles.headerText + ' ' + styles.text}>Status on:</p>
                  <p className={styles.text}>{currDate}</p>
                  <p className={styles.headerText + ' ' + styles.text}>Lat.:</p>
                  <p className={styles.text}>{object.positions[0].lat}</p>
                  <p className={styles.headerText + ' ' + styles.text}>Lng.:</p>
                  <p className={styles.text}>{object.positions[0].lng}</p>
                  {areasArr.length > 0 && (
                    <>
                      <span className={styles.headerText + ' ' + styles.text}>Inside: </span>
                      <span className={styles.text}>{areasArr.join(', ')}</span>
                    </>
                  )}
                </Popup>
              </Marker>
              {tailVisibility &&
                linePoints.map((point, index) => {
                  if (index + 1 >= linePoints.length) {
                    return;
                  }
                  return (
                    <Polyline
                      key={index}
                      positions={[point, linePoints[index + 1]]}
                      weight={5}
                      opacity={0.6}
                      color={colorValues[index]}
                    />
                  );
                })}
            </>
          );
        })}
      <div className="leaflet-bottom leaflet-left">
        <button
          className={'leaflet-control' + ' ' + styles.styledButton}
          onClick={() => onOptionsChange({ ...options, isTailVisible: !tailVisibility })}
        >
          <img src={tailVisibility ? show : hide} className={styles.styledImg} />
          {'trail'.toUpperCase()}
        </button>
      </div>
    </MapContainer>
  );
};
