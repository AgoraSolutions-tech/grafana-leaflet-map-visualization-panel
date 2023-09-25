import React, { useCallback } from 'react';
import { StandardEditorProps } from '@grafana/data';
import { Area } from 'types';
import { Button, ColorPickerInput, HorizontalGroup, InlineSwitch, Input, Label, useStyles2 } from '@grafana/ui';
import { useFieldArray, useForm } from 'react-hook-form';
import { VerticlesForm } from './VerticlesForm';
import { calculatePolygonVerticles, uniqueId } from 'helpers';
import { PolygonEditorStyles } from './style';
import { ErrorMessage } from '@hookform/error-message';

type PolygonEditorProps = StandardEditorProps<{ isTooltipSticky: boolean; areas: Array<Area> }>;

export const PolygonEditor = ({ value, onChange, context }: PolygonEditorProps) => {
  const styles = useStyles2(PolygonEditorStyles);

  const { control, register, watch, setValue, handleSubmit, formState, getFieldState } = useForm<{
    areas: Array<Area>;
    isTooltipSticky: boolean;
  }>({values: { areas: value?.areas || [], isTooltipSticky: !!value?.isTooltipSticky} });

  const { append, fields, remove } = useFieldArray({ control, name: 'areas' });

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

  const isFieldInvalid = (index: number) => {
    const fieldState = getFieldState(`areas.${index}.name`);
    return fieldState.invalid;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <div className={styles.tooltipWrapper}>
          <InlineSwitch
            showLabel={true}
            {...register(`isTooltipSticky` as const)}
            label={watch(`isTooltipSticky`) ? 'Always show area names' : 'Show area names on hover'}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          {fields.map((field, index) => (
            <div key={field.id}>
              <input {...register(`areas.${index}.id` as const)} type="hidden" />
              <HorizontalGroup>
                <div>
                  <Label>Name</Label>
                  <Input
                    invalid={isFieldInvalid(index)}
                    {...register(`areas.${index}.name` as const, { required: 'Enter area name', maxLength: 255 })}
                    placeholder="Enter the area name"
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <ColorPickerInput
                    value={watch(`areas.${index}.color`)}
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
              <div className={styles.errorMessage}>
                <ErrorMessage name={`areas.${index}.name`} errors={formState.errors} />
              </div>
              <br />
              <VerticlesForm
                initialIsOpen={field.isNew}
                control={control}
                register={register}
                index={index}
                formState={formState}
                getFieldState={getFieldState}
              />
              <div style={{ margin: '10px 0 20px', height: '1px', width: '100%' }} />
            </div>
))}
        </div>
        <Button
          style={{ marginRight: '1rem' }}
          type='button'
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
