import React, { useMemo } from "react";
import { StandardEditorProps } from "@grafana/data"
import { Area } from "types"
import { Button, ColorPicker, FieldArray, Form, HorizontalGroup, Input, Label } from "@grafana/ui";
import { FieldValues } from "react-hook-form";

type PolygonEditorProps = StandardEditorProps<Area[]>;

export const PolygonEditor = ({ value, onChange, context }: PolygonEditorProps) => {
  const initialValues = useMemo<FieldValues>(() => {
    return ({
      areas: (value || []).map(area => ({
        id: area.id,
        name: area.name,
        color: area.color,
        positionX: area.positionX,
        positionY: area.positionY
      }))
    })
  }, [value]);

  return (
    <Form defaultValues={initialValues} onSubmit={(values) => {
      onChange(values.areas.map((v: Area) => ({
        id: v.id,
        name: v.name,
        color: v.color,
        positionX: v.positionX,
        positionY: v.positionY
      })))}
    }>
      {({ control, register, watch, setValue }) => (
        <div>
          <FieldArray control={control} name="areas">
            {({ append, fields, remove }) => (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  {fields.map((field, index) => (
                    <div key={field.id}>
                      <HorizontalGroup >
                        <div>
                          <Label>Name</Label>
                          <Input
                            {...register(`areas.${index}.name` as const)}
                            defaultValue={field.name}
                          />
                        </div>
                        <div>
                          <Label>Color</Label>
                          <Input
                            prefix={
                              <ColorPicker color={watch(`areas.${index}.color`) || 'red'} onChange={(color) => {
                                setValue(`areas.${index}.color`, color);
                              }} />
                            }
                            {...register(`areas.${index}.color` as const)}
                            defaultValue={field.color}
                          />
                        </div>
                        <Button variant="secondary" size='lg' fill="text" icon="x" onClick={() => remove(index)} />
                      </HorizontalGroup>

                      <HorizontalGroup>
                        <div>
                          <Label>Position X</Label>
                          <Input
                            {...register(`areas.${index}.positionX` as const)}
                            defaultValue={field.positionX}
                          />
                        </div>
                        <div>
                          <Label>Position Y</Label>
                          <Input
                            {...register(`areas.${index}.positionY` as const)}
                            defaultValue={field.positionY}
                          />
                        </div>
                      </HorizontalGroup>
                      <br />
                    </div>
                  ))}
                </div>
                <Button
                  style={{ marginRight: '1rem' }}
                  onClick={() => append({
                    id: Math.random(),
                    name: `Area ${fields ? fields.length + 1 : 1}`,
                    color: 'red',
                    positionX: context.options.lat,
                    positionY: context.options.lng
                  })}
                  variant="secondary" size='sm' icon='plus'
                >
                  Add area
                </Button>
              </>
            )}
          </FieldArray>
          <Button type="submit" variant="secondary" size='sm'>Save</Button>
        </div>
      )}
    </Form>
  )
};
