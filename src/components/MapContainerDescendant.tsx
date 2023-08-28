import { useMapEvents } from 'react-leaflet';

interface Props {
  onPositionChange(position: { lng: number; lat: number }): void;
}

export const MapContainerDescendant = (props: Props) => {
  const map = useMapEvents({
    moveend: () => {
      const newCenter = map.getCenter();
      props.onPositionChange({ lng: newCenter.lng, lat: newCenter.lat });
    },
  });
  return null;
};
