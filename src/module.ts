import { PanelPlugin } from '@grafana/data';
import { MapOptions } from './types';
import { MapComponent } from 'components/MapComponent';
import { PolygonEditor } from 'components/PolygonEditor';
import { ItemEditor } from 'components/ItemEditor';


export const plugin = new PanelPlugin<MapOptions>(MapComponent).setPanelOptions((builder) => {
  builder
    .addNumberInput({
      path: 'lat',
      name: 'Latitude',
      defaultValue: 51.102622400211935,

    })
    .addNumberInput({
      path: 'lng',
      name: 'Longitude',
      defaultValue: 17.022015194482723
    })
    .addCustomEditor({
      id: 'item',
      path: 'items',
      name: 'Item',
      editor: ItemEditor,
    })
    .addCustomEditor({
      id: 'polygons',
      path: 'polygons',
      name: 'Polygons',
      editor: PolygonEditor,
    })
});
