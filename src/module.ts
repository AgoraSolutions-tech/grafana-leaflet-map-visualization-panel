import { PanelPlugin } from '@grafana/data';
import { MapOptions } from './types';
import { MapComponent } from 'components/MapComponent';
import { PolygonEditor } from 'components/PolygonEditor';

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
    .addNestedOptions({
      category: ['Areas'],
      path: 'areasEditor',
      build: (builder) => {
        builder
        .addCustomEditor({
          id: 'areas',
          path: 'areas',
          editor: PolygonEditor,
          name: ''
        })
      }
    })
});
