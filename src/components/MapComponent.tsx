import React from 'react';
import { PanelProps } from '@grafana/data';
import { TileLayer, MapContainer, Marker, Polyline, Popup, LayersControl } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import { MovingObject, MapOptions, Area, Vertex } from 'types';
import { useStyles2 } from '@grafana/ui';
import { MapContainerDescendant } from './MapContainerDescendant';
import { colorValues, isPointInPoly } from 'helpers';
import { format, isSameDay } from 'date-fns';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './styles.css';
import { MapContainesStyles } from './style';
import { PolygonCreator } from './PolygonCreator';
import { CustomControls } from './CustomControls';

interface Props extends PanelProps<MapOptions> {}

const TODAY = new Date();
const TODAY_STRING = TODAY.toDateString();

export const MapComponent: React.FC<Props> = ({ options, width, height, data, onOptionsChange }) => {
  const styles = useStyles2(MapContainesStyles);
  const selectedObjectId = options.selectedObjectId || 'all';

  const dateToDisplay = options.dateToDisplay || TODAY_STRING;
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
    const existingObject = acc.find((boat) => boat.id === currBoat.id);
    if (existingObject) {
      existingObject.positions.unshift(newPosition);
      return acc;
    }
    const newObject = {
      id: currBoat.id,
      name: currBoat.name,
      positions: [newPosition],
    };
    return [...acc, newObject];
  }, []);

  const currentObjects = objects
    .map((object) => ({
      ...object,
      positions: object.positions.filter((position) => isSameDay(position.timestamp, new Date(dateToDisplay))),
    }))
    .filter((object) => object.positions.length > 0)
    .filter(object => selectedObjectId === 'all' ? object : String(object.id) === selectedObjectId
    );

  const handleMapEventTrigger = (position: { lng: number; lat: number }, newValue: number) => {
    onOptionsChange({ ...options, lat: position.lat, lng: position.lng, zoom: newValue });
  };
  return (
    <>
      <MapContainer center={mapCenter} zoom={zoomValue} scrollWheelZoom={true} className={styles.wrapper} attributionControl	>
        
        <LayersControl>
          <LayersControl.BaseLayer name="OpenStreetMap" checked={true}>
            <TileLayer
              attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a>OpenStreetMap</a>OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Esri.WorldImagery">
            <TileLayer
              maxZoom={17}
              attribution="Powered by <a href='https://www.esri.com/en-us/home'>Esri</a> &mdash; Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="OpenTopoMap">
            <TileLayer
              maxZoom={17}
              attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        <MapContainerDescendant onMapEventTrigger={handleMapEventTrigger} options={options}/>
        <PolygonCreator onOptionsChange={onOptionsChange} options={options} objects={objects} controlKey={controlKey} />
        {currentObjects &&
          currentObjects.length > 0 &&
          currentObjects.map((object) => {
            const position = [object?.positions[0].lat, object.positions[0].lng] as LatLngExpression;
            const currentTimestamp = new Date(object.positions[0].timestamp);
            const currDate = format(currentTimestamp, 'dd-MM-yyyy');

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
          <CustomControls 
            options={options} 
            onOptionsChange={onOptionsChange} 
            objects={objects}
          />
      </MapContainer>
    </>
  );
};
