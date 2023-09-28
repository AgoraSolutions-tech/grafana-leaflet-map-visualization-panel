import React, { useState } from 'react';
import { Button, ConfirmModal, HorizontalGroup, Input, Label, useStyles2 } from '@grafana/ui';
import { uniqueId } from 'helpers';
import { Control, FormState, UseFormGetFieldState, useFieldArray } from 'react-hook-form';
import { Area } from 'types';
import { ErrorMessage } from '@hookform/error-message';
import { VerticlesFormStyles } from './style';

interface Props {
  control: Control<{ areas: Array<Area>; isTooltipSticky: boolean }>;
  register: any;
  index: number;
  initialIsOpen?: boolean;
  formState: FormState<{ areas: Array<Area>; isTooltipSticky: boolean }>;
  getFieldState: UseFormGetFieldState<{ areas: Array<Area>; isTooltipSticky: boolean }>;
  setShowSuccessAlert: (boolean: boolean) => void
}

export const VerticlesForm = ({ control, register, index, initialIsOpen = false, formState, getFieldState, setShowSuccessAlert }: Props) => {
  const [ isOpen, setIsOpen ] = useState(initialIsOpen);
  const [ isModalOpen, setIsModalOpen ] = useState(false);
  const [ currentVertexIndex, setCurrentVertexIndex ] = useState<number>();
  
  const styles = useStyles2(VerticlesFormStyles);
  const errors = formState.errors;

  const verticlesButtonText = isOpen ? 'Verticles:' : 'Show verticles';

  const { append, fields, remove } = useFieldArray({ control, name: `areas.${index}.verticles` });

  const isFieldInvalid = (index: number, vertexIndex: number, value: 'lat' | 'lng') => {
    const fieldState = getFieldState(`areas.${index}.verticles.${vertexIndex}.${value}`);
    return fieldState.invalid;
  };

  return (
    <>
      <Button
        variant="secondary"
        size="xs"
        fill={isOpen ? 'text' : 'outline'}
        onClick={() => {
          setShowSuccessAlert(false);
          setIsOpen(!isOpen);
        }}
        icon={isOpen ? 'angle-up' : 'angle-down'}
        tooltip={isOpen ? 'Hide verticles' : "Show all area's verticles"}
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
                    <div>
                      <div className={styles.errorMessage}>
                        <ErrorMessage name={`areas.${index}.verticles.${vertexIndex}.lat`} errors={errors} />
                      </div>
                      <Input
                        invalid={isFieldInvalid(index, vertexIndex, 'lat')}
                        {...register(`areas.${index}.verticles.${vertexIndex}.lat` as const, {
                          required: 'Enter vertex latitiude',
                          pattern: {
                            value: /^-?\d+(\.\d+)?$/,
                            message: 'Invalid latitiude format',
                          },
                          maxLenght: 255,
                        })}
                      />
                    </div>
                  </div>
                  <div>
                    {vertexIndex === 0 && <Label className={styles.styledLabel}>Longitude: </Label>}
                    <div>
                      <div className={styles.errorMessage}>
                        <ErrorMessage name={`areas.${index}.verticles.${vertexIndex}.lng`} errors={errors} />
                      </div>
                      <Input
                        invalid={isFieldInvalid(index, vertexIndex, 'lng')}
                        {...register(`areas.${index}.verticles.${vertexIndex}.lng` as const, {
                          required: 'Enter vertex longitiude',
                          pattern: {
                            value: /^-?\d+(\.\d+)?$/,
                            message: 'Invalid longitude format',
                          },
                          maxLenght: 255,
                        })}
                      />
                    </div>
                  </div>
                  {fields.length >= 4 && (
                    <Button
                      icon="trash-alt"
                      onClick={() => {
                        setShowSuccessAlert(false);
                        setCurrentVertexIndex(vertexIndex);
                        setIsModalOpen(true);
                      }}
                      variant="secondary"
                      size="sm"
                      fill="text"
                      tooltip={'Remove this vertex'}
                      className={vertexIndex === 0 ? styles.firstVertex : ''}
                    />
                  )}
                  <ConfirmModal
                    isOpen={isModalOpen}
                    title={'Delete vertex'}
                    body={'Are you sure that you want to delete this vertex'}
                    confirmText={'Delete'}
                    onConfirm={() => {
                      if (fields.length >= 4) {
                        remove(currentVertexIndex);
                      }
                      setCurrentVertexIndex(undefined);
                      setIsModalOpen(false);
                    }}
                    onDismiss={() => {
                      setCurrentVertexIndex(undefined);
                      setIsModalOpen(false);
                    }}
                  />
                </HorizontalGroup>
              </div>
            </div>
          ))}
        </div>
        <Button
          style={{ marginRight: '1rem' }}
          onClick={() => {
            setShowSuccessAlert(false);
            append({
              id: uniqueId(),
              lat: fields[fields.length - 1].lat,
              lng: fields[fields.length - 1].lng,
            });
          }}
          variant="secondary"
          size="sm"
          icon="plus"
          tooltip={'Add a new vertex'}
        >
          Add vertex
        </Button>
      </div>
    </>
  );
};
