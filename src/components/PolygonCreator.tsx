import { uniqueId } from 'helpers';
import { FeatureGroup, Polygon, Tooltip } from 'react-leaflet';
import React from 'react';
import { EditControl } from 'react-leaflet-draw';
import { Area, MapOptions, MovingObject, Vertex } from 'types';
import { urlUtil } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';
import { PolygonCreatorStyles } from './style';

interface Props {
  onOptionsChange: (options: MapOptions) => void;
  options: MapOptions;
  objects: MovingObject[];
  controlKey: number;
}

export const PolygonCreator = (props: Props) => {
  const styles = useStyles2(PolygonCreatorStyles);
  const areas = props.options.areas?.areas;
  const params = urlUtil.getUrlSearchParams();
  const isEditMode = !!params.editPanel;

  const onCreated = (e: any) => {
    const { layerType, layer } = e;
    if (layerType === 'polygon') {
      const { _latlngs } = layer;
      if (!_latlngs[0]) {
        return;
      }

      const newVerticles = _latlngs[0];
      props.onOptionsChange({
        ...props.options,
        controlKey: uniqueId(),
        areas: {
          ...props.options.areas,
          areas: [
            ...areas || [],
            {
              id: uniqueId(),
              name:  `Area ${props.options.areas?.areas ? props.options.areas?.areas.length + 1 : 1}`,
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

    props.onOptionsChange({
      ...props.options,
      controlKey: uniqueId(),
      areas: {
        ...props.options.areas,
        areas: newAreas,
      },
    });
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
    const newAreas = (areas || []).filter((area) => {
      if (removedPoligonsIds.includes(area.id)) {
        return false;
      }
      return true;
    });

    props.onOptionsChange({
      ...props.options,
      controlKey: uniqueId(),
      areas: {
        ...props.options.areas,
        areas: newAreas,
      },
    });
  };

  return (
    <FeatureGroup  key={props.controlKey}>
      {isEditMode && (
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
      )}
      {(areas || []).map((area: Area) => {   
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
              {props.options.zoom >= 15 && (
                <Tooltip
                  key={props.options.areas.isTooltipSticky ? 1 : 0}
                  sticky={!props.options.areas.isTooltipSticky}
                  permanent={props.options.areas.isTooltipSticky}
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
  );
};
