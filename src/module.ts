import { PanelPlugin } from '@grafana/data';
import { MapOptions } from './types';
import { MapComponent } from 'components/MapComponent';
import { PolygonEditor } from 'components/PolygonEditor';

export const plugin = new PanelPlugin<MapOptions>(MapComponent).setPanelOptions((builder) => {
  builder
    .addTextInput({
      category: ['Query'],
      path: 'objectQuery',
      name: 'Object query name'
    })
    .addCustomEditor({
      category: ['Areas'],
      id: 'areas',
      path: 'areas',
      editor: PolygonEditor,
      name: ''
    })
});
