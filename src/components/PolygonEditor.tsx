import React, { useEffect, useMemo } from 'react';
import { StandardEditorProps } from '@grafana/data';
import { Area } from 'types';
import { Button, ColorPicker, HorizontalGroup, InlineSwitch, Input, Label, useStyles2 } from '@grafana/ui';
import { FieldValues, useFieldArray, useForm } from 'react-hook-form';
import { VerticlesForm } from './VerticlesForm';
import { css } from '@emotion/css';
import { uniqueId } from 'helpers';

type PolygonEditorProps = StandardEditorProps<{ isTooltipSticky: boolean; areas: Area[] }>;

const getSyles = () => {
  return {
    tooltipWrapper: css`
      margin-bottom: 25px;
    `,
  };
};

export const PolygonEditor = ({ value, onChange, context, ...rest }: PolygonEditorProps) => {
  const styles = useStyles2(getSyles);

  const initialValues = useMemo<FieldValues>(() => {
    return {
      areas: (value?.areas || []).map((area) => {
        if (!area) {
          return null;
        }
        return {
          id: area.id,
          name: area.name,
          color: area.color,
          verticles: area.verticles,
        };
      }),
      isTooltipSticky: value?.isTooltipSticky || false,
    };
  }, [value]);

  const { control, register, watch, setValue, handleSubmit } = useForm<{ areas: Area[]; isTooltipSticky: boolean }>({
    defaultValues: initialValues,
  });

  const { append, fields, remove } = useFieldArray({ control, name: 'areas' });

  const calculatePolygonVerticles = (lat: number, lng: number) => {
    const diff = 0.001;
    return [
      { lat: lat - diff, lng: lng + diff, id: Math.random() },
      { lat: lat - diff, lng: lng - diff, id: Math.random() },
      { lat: lat + diff, lng: lng - diff, id: Math.random() },
      { lat: lat + diff, lng: lng + diff, id: Math.random() },
    ];
  };

  // useEffect(() => {
  //   setValue('areas', value.areas);
  // }, [value]);

  return (
    <form
      onSubmit={handleSubmit((values) => {
        onChange({
          isTooltipSticky: values.isTooltipSticky,
          areas: values.areas.map((v: Area) => ({
            id: v.id,
            name: v.name,
            color: v.color,
            verticles: v.verticles,
          })),
        });
      })}
    >
      <div>
        <div className={styles.tooltipWrapper}>
          <InlineSwitch showLabel={true} {...register(`isTooltipSticky` as const)} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          {fields.map((field, index) => (
            <div key={field.id}>
              <input {...register(`areas.${index}.id` as const)} defaultValue={field.id} type="hidden" />
              <HorizontalGroup>
                <div>
                  <Label>Name</Label>
                  <Input {...register(`areas.${index}.name` as const)} defaultValue={field.name} />
                </div>
                <div>
                  <Label>Color</Label>
                  <Input
                    prefix={
                      <ColorPicker
                        color={watch(`areas.${index}.color`) || 'red'}
                        onChange={(color) => {
                          setValue(`areas.${index}.color`, color);
                        }}
                      />
                    }
                    {...register(`areas.${index}.color` as const)}
                    defaultValue={field.color}
                  />
                </div>
                <Button variant="secondary" size="lg" fill="text" icon="x" onClick={() => remove(index)} />
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
