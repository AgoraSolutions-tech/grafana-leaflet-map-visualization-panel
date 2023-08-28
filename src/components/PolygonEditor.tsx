import React, { useMemo } from 'react';
import { StandardEditorProps } from '@grafana/data';
import { Area } from 'types';
import { Button, ColorPicker, FieldArray, Form, HorizontalGroup, InlineSwitch, Input, Label } from '@grafana/ui';
import { FieldValues } from 'react-hook-form';
import { VerticlesForm } from './VerticlesForm';

type PolygonEditorProps = StandardEditorProps<{ isTooltipSticky: boolean; areas: Area[] }>;

export const PolygonEditor = ({ value, onChange, context }: PolygonEditorProps) => {
  console.log('value: ', value);
  const initialValues = useMemo<FieldValues>(() => {
    return ({
      areas: (value.areas || []).map((area) => ({
          id: area.id,
          name: area.name,
          color: area.color,
          verticles: area.verticles,
        })),
        isTooltipSticky: value.isTooltipSticky
      });
  }, [value]);

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
    <Form
      defaultValues={initialValues}
      onSubmit={(values) => {
        console.log('values: ', values);
        onChange({
          isTooltipSticky: values.isTooltipSticky,
          areas: values.areas.map((v: Area) => ({
            id: v.id,
            name: v.name,
            color: v.color,
            verticles: v.verticles,
          })),
        });
      }}
    >
      {({ control, register, watch, setValue }) => (
        <div>
          <InlineSwitch showLabel={true} label={value.isTooltipSticky ? 'Sticky tooltip' : 'Pernament tooltip'} {...register(`isTooltipSticky` as const)} />
          <FieldArray control={control} name="areas">
            {({ append, fields, remove }) => (
              <>
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
                      id: Math.random(),
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
              </>
            )}
          </FieldArray>
          <Button type="submit" variant="secondary" size="sm">
            Save
          </Button>
        </div>
      )}
    </Form>
  );
};
