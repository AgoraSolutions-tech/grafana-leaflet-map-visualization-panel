import { PanelPlugin } from '@grafana/data';
import { MapOptions } from './types';
import { MapComponent } from 'components/MapComponent';
import { PolygonEditor } from 'components/PolygonEditor';

export const plugin = new PanelPlugin<MapOptions>(MapComponent).setPanelOptions((builder) => {
  builder
    .addNumberInput({
      path: 'lat',
      name: 'Latitude',
      defaultValue: 51.11030747949518,
    })
    .addNumberInput({
      path: 'lng',
      name: 'Longitude',
      defaultValue: 17.03483998297049
    })
    .addCustomEditor({
      category: ['Areas'],
      id: 'areas',
      path: 'areas',
      editor: PolygonEditor,
      name: ''
    })
});
