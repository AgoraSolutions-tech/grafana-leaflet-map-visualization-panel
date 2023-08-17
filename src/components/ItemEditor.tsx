import { StandardEditorProps } from "@grafana/data";
import { Button } from "@grafana/ui";
import { mockBoats } from "mock/boats";
import React from "react";
import { ItemCollection } from "types";

type EditorProps = StandardEditorProps<ItemCollection[]>


export const ItemEditor = ({ value, onChange, context }: EditorProps) => {
  const options = mockBoats;
  
  const handleRemoveItem = (id: string) => {
    if(value.length === 1){
      onChange([]);
    }
    onChange(value.filter(item => item.id !== id));
  }

  return (
    <>
      <div>
        <select
          value={''}
          onChange={e => {
            const selectedItem = options.find(item => item.name === e.target.value);
            if (selectedItem) {
              onChange([...(value || []), selectedItem])      
             }
          }}
        >
          <option value="">Select an item</option>
          {options.filter(option => !value.some(selected => selected.id === option.id )).map(item => (
            <option key={item.name} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <ul>
        {value?.map(item => (
          <li key={item.name}>
            {item.name}
            <Button size="sm" icon="minus" variant="secondary" onClick={() => handleRemoveItem(item.id)} />
          </li>
        ))}
      </ul>
    </> 
  )
}
