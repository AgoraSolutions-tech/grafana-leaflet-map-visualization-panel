import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { StandardEditorProps } from '@grafana/data';
import { Area } from 'types';
import { Button, ColorPickerInput, HorizontalGroup, InlineSwitch, Input, Label, useStyles2 } from '@grafana/ui';
import { FieldValues, useFieldArray, useForm } from 'react-hook-form';
import { VerticlesForm } from './VerticlesForm';
import { uniqueId } from 'helpers';
import { css } from '@emotion/css';

type PolygonEditorProps = StandardEditorProps<{ isTooltipSticky: boolean; areas: Array<Area> }>;

const getSyles = () => {
  return {
    tooltipWrapper: css`
      margin-bottom: 25px;
    `,
  };
};

export const PolygonEditor = ({ value, onChange, context }: PolygonEditorProps) => {
  const styles = useStyles2(getSyles);
  const prevValue = useRef<any>();

  const initialValues = useMemo<FieldValues>(() => {
    return {
      areas: (value?.areas || [])
        .map((area) => {
          if (!area) {
            return null;
          }
          return {
            id: area.id,
            name: area.name,
            color: area.color,
            verticles: area.verticles,
          };
        })
        .filter((area) => area !== null),
      isTooltipSticky: value?.isTooltipSticky || false,
    };
  }, [value]);

  const { control, register, watch, setValue, handleSubmit } = useForm<{
    areas: Array<Area>;
    isTooltipSticky: boolean;
  }>({
    defaultValues: initialValues,
    mode: 'all',
  });

  const { append, fields, remove, replace } = useFieldArray({ control, name: 'areas' });

  useEffect(() => {
    prevValue.current = value?.areas;
    replace(value?.areas);
  }, [value, replace]);

  const onSubmit = useCallback(
    (values: { areas: Array<Area>; isTooltipSticky: boolean }) => {
      onChange({
        isTooltipSticky: values.isTooltipSticky,
        areas: values.areas.map((v: Area) => ({
          id: v.id,
          name: v.name,
          color: v.color,
          verticles: v.verticles,
        })),
      });
    },
    [onChange]
  );

  const calculatePolygonVerticles = (lat: number, lng: number) => {
    const diff = 0.001;
    return [
      { lat: lat - diff, lng: lng + diff, id: Math.random() },
      { lat: lat - diff, lng: lng - diff, id: Math.random() },
      { lat: lat + diff, lng: lng - diff, id: Math.random() },
      { lat: lat + diff, lng: lng + diff, id: Math.random() },
    ];
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <div className={styles.tooltipWrapper}>
          <InlineSwitch showLabel={true} {...register(`isTooltipSticky` as const)} label="Show area names" />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          {fields.map((field, index) => (
            <div key={field.id}>
              <input {...register(`areas.${index}.id` as const)} defaultValue={field.id} type="hidden" />
              <HorizontalGroup>
                <div>
                  <Label>Name</Label>
                  <Input
                    {...register(`areas.${index}.name` as const)}
                    defaultValue={field.name}
                    placeholder="Enter the area name"
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <ColorPickerInput
                    value={watch(`areas.${index}.color`)}
                    defaultValue={field.color}
                    {...register(`areas.${index}.color` as const)}
                    onChange={(color) => {
                      setValue(`areas.${index}.color`, color);
                    }}
                  />
                </div>
                <Button
                  variant="secondary"
                  size="lg"
                  fill="text"
                  icon="x"
                  onClick={() => remove(index)}
                  tooltip="Remove the area"
                />
              </HorizontalGroup>
              <br />
              <VerticlesForm initialIsOpen={field.isNew} control={control} register={register} index={index} />
              <div style={{ margin: '10px 0 20px', height: '1px', width: '100%' }} />
            </div>
          ))}
        </div>
        <Button
          style={{ marginRight: '1rem' }}
          onClick={() => {
            append({
              id: uniqueId(),
              isNew: true,
              name: `Area ${fields ? fields.length + 1 : 1}`,
              color: 'red',
              verticles: calculatePolygonVerticles(context.options.lat, context.options.lng),
            });
          }}
          variant="secondary"
          size="sm"
          icon="plus"
          tooltip={'Add new area on the center of map'}
        >
          Add area
        </Button>
        <Button type="submit" variant="secondary" size="sm">
          Save
        </Button>
      </div>
    </form>
  );
};
