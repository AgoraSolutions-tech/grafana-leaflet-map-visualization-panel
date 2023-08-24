import { PanelPlugin } from '@grafana/data';
import { MapOptions } from './types';
import { MapComponent } from 'components/MapComponent';
import { PolygonEditor } from 'components/PolygonEditor';

export const plugin = new PanelPlugin<MapOptions>(MapComponent).setPanelOptions((builder) => {
  builder
    .addNumberInput({
      path: 'lat',
      name: 'Latitude',
    })
    .addNumberInput({
      path: 'lng',
      name: 'Longitude',
    })
    .addCustomEditor({
      category: ['Areas'],
      id: 'areas',
      path: 'areas',
      editor: PolygonEditor,
      name: ''
    })
});
