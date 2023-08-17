import React from "react";
import { StandardEditorProps } from "@grafana/data"
import { mockPolygons } from "mock/poligons";
import { PolygonCollection } from "types"
import { Button } from "@grafana/ui";

type PolygonEditorProps = StandardEditorProps<PolygonCollection[]>;

export const PolygonEditor = ({ value, onChange, }: PolygonEditorProps) => {
  const options = mockPolygons;
  
  const handleRemovePolygon = (id: string) => {
    if (value.length === 1) {
      onChange([]);
    }
    onChange(value.filter(polygon => polygon.id !== id))
  };

  return (
    <>
      <div>
        <select
          value=''
          onChange={e => {
            const selectedPolygon = options.find(polygon => polygon.id === e.target.value);
            console.log(e.target.value, selectedPolygon)
            if (selectedPolygon) {
              onChange([...(value || []), selectedPolygon])
            }
          }}
        >
          <option value="">Select a polygon</option>
          {options.filter(option => !value.some(selected => selected.id === option.id )).map(polygon => (
            <option key={polygon.id} value={polygon.id}>
              {polygon.name}
            </option>
          ))}
        </select>
      </div>
      <ul>
        {value?.map(polygon => (
          <li key={polygon.id}>
            {polygon.name}
            <Button size="sm" icon="minus" variant="secondary" onClick={() => handleRemovePolygon(polygon.id)} />
          </li>
        ))}
      </ul>
    </>
  )
};
