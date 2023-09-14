import { useMapEvents } from 'react-leaflet';

interface Props {
  onMapEventTrigger(position: { lng: number; lat: number }, zoom: number): void;
}

export const MapContainerDescendant = (props: Props) => {
  const map = useMapEvents({
    moveend: () => {
      const newCenter = map.getCenter();
      const newZoomValue = map.getZoom();
      props.onMapEventTrigger({ lng: newCenter.lng, lat: newCenter.lat }, newZoomValue);
    },
    zoomend: () => {
      const newZoomValue = map.getZoom();
      const newCenter = map.getCenter();
      props.onMapEventTrigger({ lng: newCenter.lng, lat: newCenter.lat }, newZoomValue);
    },
  });
  return null;
};
