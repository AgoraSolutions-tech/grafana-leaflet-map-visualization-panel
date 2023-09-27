
import React, { useState } from 'react';
import { DatePicker, useStyles2 } from '@grafana/ui';
import { MapOptions, MovingObject } from 'types';
import { CustomControlsStyles } from './style';
import show from '../img/show.png';
import hide from '../img/hide.png';
import { format } from 'date-fns';

interface Props {
  options: MapOptions;
  onOptionsChange:  (options: MapOptions) => void;
  objects: MovingObject[];
}

const TODAY = new Date();
const TODAY_STRING = TODAY.toDateString();

export const CustomControls = (props: Props) => {
  const [ isCalendarOpen, setIsCalendarOpen ] = useState(false);

  const styles = useStyles2(CustomControlsStyles);
  const tailVisibility = props.options.isTailVisible;
  const dateToDisplay = props.options.dateToDisplay || TODAY_STRING;
  const selectedObjectId = props.options.selectedObjectId;

  return (
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
              const chosenObject = props.objects.find(object => String(object.id) === e.target.value);
              props.onOptionsChange({
              ...props.options, 
              lat: chosenObject?.positions[0].lat || props.options.lat,
              lng:chosenObject?.positions[0].lng || props.options.lng,
              selectedObjectId: e.target.value
            })
          }}
            className={`leaflet-control ${styles.styledButton} ${styles.styledSelect}`}
          >
            <option value="all" selected={selectedObjectId === 'all'}>See all objects</option>
            {props.objects.map((object, index) => {
              return (
                <option key={index} value={object.id} selected={selectedObjectId === String(object.id)}>
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
          {format(new Date(dateToDisplay), 'dd-MM-yyyy')}
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
  );
};
