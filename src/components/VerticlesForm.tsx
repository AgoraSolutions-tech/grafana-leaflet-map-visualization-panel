import React, { useState } from 'react';
import { Button, HorizontalGroup, Input, Label, useStyles2 } from '@grafana/ui';
import { css } from '@emotion/css';
import { uniqueId } from 'helpers';
import { Control, useFieldArray } from 'react-hook-form';
import { Area } from 'types';

interface Props {
  control: Control<{ areas: Area[]; isTooltipSticky: boolean }>;
  register: any;
  index: number;
  initialIsOpen?: boolean;
}

const getSyles = () => {
  return {
    styledLabel: css`
      margin: 10px 0;
    `,
    firstVertex: css`
      position: relative;
      top: 20px;
    `,
    verticlesLabel: css`
      position: relative;
      left: -25px;
    `
  };
};

export const VerticlesForm = ({ control, register, index, initialIsOpen = false }: Props) => {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const styles = useStyles2(getSyles);

  const verticlesButtonText = isOpen ? 'Verticles:' : 'Show verticles';

  const { append, fields, remove } = useFieldArray({ control, name: `areas.${index}.verticles`})

  return (
    <>
      <Button
        variant="secondary"
        size="xs"
        fill={isOpen ? 'text' : 'outline'}
        onClick={() => setIsOpen(!isOpen)}
        icon={isOpen ? 'angle-up' : 'angle-down'}
        tooltip={isOpen ? 'Hide verticles' : ''}
        className={isOpen ? styles.verticlesLabel : ''}
      >
        {verticlesButtonText}
      </Button>
      <div style={{ display: isOpen ? 'block' : 'none' }}>
              <div style={{ marginBottom: '1rem' }}>
                {fields.map((vertex, vertexIndex) => (
                  <div key={vertex.id}>
                    <div key={vertexIndex}>
                      <input type="hidden" {...register(`areas.${index}.verticles.${vertexIndex}.id` as const)} />
                      <HorizontalGroup>
                        <Label className={vertexIndex === 0 ? styles.firstVertex : ''}>{vertexIndex + 1}</Label>
                        <div>
                          {vertexIndex === 0 && <Label className={styles.styledLabel}>Latitude: </Label>}
                            <Input
                              {...register(`areas.${index}.verticles.${vertexIndex}.lat` as const, {
                                valueAsNumber: true,
                              })}
                              defaultValue={vertex.lat}
                            />                        
                        </div>
                        <div>
                          {vertexIndex === 0 && <Label className={styles.styledLabel}>Longitude: </Label>}
                            <Input
                              {...register(`areas.${index}.verticles.${vertexIndex}.lng` as const, {
                                valueAsNumber: true,
                              })}
                              defaultValue={vertex.lng}
                            />
                        </div>
                        <Button
                          icon="trash-alt"
                          onClick={() => {
                            if (fields.length >= 4) {
                              remove(vertexIndex);
                            }
                          }}
                          variant="secondary"
                          size="sm"
                          fill="text"
                          className={vertexIndex === 0 ? styles.firstVertex : ''}
                        />
                      </HorizontalGroup>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                style={{ marginRight: '1rem' }}
                onClick={() =>
                  append({
                    id: uniqueId(),
                    lat: fields[fields.length - 1].lat,
                    lng: fields[fields.length - 1].lng,
                  })
                }
                variant="secondary"
                size="sm"
                icon="plus"
              >
                Add vertex
              </Button>
      </div>
    </>
  );
};
