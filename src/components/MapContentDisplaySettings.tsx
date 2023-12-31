
import React, { useState } from 'react';
import { DatePicker, useStyles2 } from '@grafana/ui';
import { MapOptions, MovingObject } from 'types';
import { CustomControlsStyles } from './style';
import show from '../img/show.png';
import hide from '../img/hide.png';
import { formatDistance, isSameDay } from 'date-fns';
import { useMap } from 'react-leaflet';

interface Props {
  options: MapOptions;
  currentSelectedbjects: MovingObject[];
  currentObjects: MovingObject[];
  onOptionsChange:  (options: MapOptions) => void;
}

const TODAY = new Date();
const TODAY_STRING = TODAY.toDateString();

export const MapContentDisplaySettings = (props: Props) => {
  const [ isCalendarOpen, setIsCalendarOpen ] = useState(false);
  const map = useMap();

  const styles = useStyles2(CustomControlsStyles);
  const tailVisibility = props.options.isTailVisible;
  const dateToDisplay = props.options.dateToDisplay || TODAY_STRING;
  const selectedObjectId = props.options.selectedObjectId;

  return (
    <>
    <div className="leaflet-bottom leaflet-left">
      <div className={styles.buttonWrapper}>
        <button
          className={'leaflet-control' + ' ' + styles.styledButton}
          onClick={() => props.onOptionsChange({ ...props.options, isTailVisible: !tailVisibility })}
        >
          <img src={tailVisibility ? show : hide} className={styles.styledImg} />
          {'trail'.toUpperCase()}
        </button>
        <div className={'leaflet-control' + ' ' + styles.controlWrapper}>
          <select
            onChange={e => {
              const selectedObject = props.currentObjects.find(object => String(object.id) === e.target.value);
            
              if(!selectedObject){
                props.onOptionsChange({
                  ...props.options,
                  selectedObjectId: e.target.value
                })
                return
              };

              props.onOptionsChange({ 
              ...props.options, 
              lat: selectedObject?.positions[0].lat || props.options.lat,
              lng: selectedObject?.positions[0].lng || props.options.lng,
              selectedObjectId: e.target.value
            })
            map.flyTo([selectedObject.positions[0].lat, selectedObject.positions[0].lng])
          }}
            className={`leaflet-control ${styles.styledButton} ${styles.styledSelect}`}
          >
            <option value="all" selected={selectedObjectId === 'all'}>See all objects</option>
            {props.currentObjects.map(object => {
              return (
                <option 
                  key={object.id} 
                  value={object.id} 
                  selected={selectedObjectId === String(object.id)}
                >
                  {object.name}
                </option>
              );
            })}
          </select>
        </div>
        <button
          type="button"
          onClick={() => setIsCalendarOpen(true)}
          className={'leaflet-control' + ' ' + styles.styledButton}
        >
          {isSameDay(TODAY, new Date(dateToDisplay)) ? 'today'.toLocaleUpperCase() : `${formatDistance(TODAY, new Date(dateToDisplay))} ago` }
        </button>
        <div className={'leaflet-control' + ' ' + styles.controlWrapper}>
          <DatePicker
            onClose={() => {
              setIsCalendarOpen(false);
            }}
            onChange={(newDate) => {props.onOptionsChange({ 
              ...props.options, 
              dateToDisplay: newDate.toDateString() 
            });
              setIsCalendarOpen(false);
            }}
            value={new Date(dateToDisplay)}
            isOpen={isCalendarOpen}
            maxDate={TODAY}
          />
        </div>
      </div>
    </div>
    </>
  );
};
