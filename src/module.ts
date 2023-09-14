import { PanelPlugin } from '@grafana/data';
import { MapOptions } from './types';
import { MapComponent } from 'components/MapComponent';
import { PolygonEditor } from 'components/PolygonEditor';

export const plugin = new PanelPlugin<MapOptions>(MapComponent).setPanelOptions((builder) => {
  builder
    .addNumberInput({
      path: 'lat',
      name: 'Center latitude',
      defaultValue: 51.11030747949518,
    })
    .addNumberInput({
      path: 'lng',
      name: 'Center longitude',
      defaultValue: 17.03483998297049
    })
    .addNumberInput({
      path: 'zoom',
      name: 'Zoom',
      defaultValue: 15
    })
    .addTextInput({
      category: ['Query'],
      path: 'boatQuery',
      name: 'Named boat query'
    })
    .addCustomEditor({
      category: ['Areas'],
      id: 'areas',
      path: 'areas',
      editor: PolygonEditor,
      name: ''
    })
});
