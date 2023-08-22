import React from "react";
import { StandardEditorProps } from "@grafana/data"
import { Area } from "types"
import { Button, ColorPicker, FieldArray, Form, HorizontalGroup, Input, Label } from "@grafana/ui";

type PolygonEditorProps = StandardEditorProps<Area[]>;

export const PolygonEditor = ({ value, onChange }: PolygonEditorProps) => {
  console.log(value)
  return (
    <Form onSubmit={(values) => 
      onChange(values.areas.map((v: any) => ({
        name: v.name,
        color: v.color,
        positionX: v.positionX,
        positionY: v.positionY
      }) ))
    }>
      {({ control, register,  watch, setValue }) => (
        <div>
          <FieldArray control={control} name="areas">
            {({ fields, append, remove }) => (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  {fields.map((field, index) => (
                    <div key={index}>
                      <HorizontalGroup >
                        <div>
                          <Label>Name</Label>
                          <Input
                            key={`areas.${index}.name`}
                            {...register(`areas.${index}.name` as const)}
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
                            key={`areas.${index}.color`}
                            {...register(`areas.${index}.color` as const)}
                          />
                        </div>
                        <Button variant="secondary" size='lg' fill="text" icon="x" onClick={() => remove(index)} />
                      </HorizontalGroup>
                      <HorizontalGroup>
                        <div>
                          <Label>Position X</Label>
                          <Input
                            key={field.positionX}
                            {...register(`areas.${index}.positionX` as const)}
                          />
                        </div>
                        <div>
                          <Label>Position Y</Label>
                          <Input
                            key={field.positionY}
                            {...register(`areas.${index}.positionY` as const)}
                          />
                        </div>
                      </HorizontalGroup>
                    </div>
                  ))}
                </div>
                <Button
                  style={{ marginRight: '1rem' }}
                  onClick={() => append({ name: '', color: '', positionX: '', positionY: '' })}
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
