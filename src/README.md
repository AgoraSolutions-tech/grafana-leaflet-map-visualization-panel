# Leaflet Map Vizualization
![Dashboard](https://raw.githubusercontent.com/AgoraSolutions-tech/grafana-leaflet-map-visualization-panel/main/src/docs/dashboard.png)

![Edit-panel](https://raw.githubusercontent.com/AgoraSolutions-tech/grafana-leaflet-map-visualization-panel/main/src/docs/edit-panel.png)
## About 

Leaflet Map Visualization is a panel used for creating polygons on a world map and displaying moving objects. Location of the objects over time comes from a query.

## Supported Grafana version

This grafana plugin is tested with the following grafana versions:
- Grafana version >=9.5.3

## Get started

In order to display a moving object on the map, the plugin requires the following data in a .csv format:
  - Object ID
  - Object Name
  - Longitude
  - Latitude
  - Timestamp indicating when the object was at the specified location

```csv
  id,name,timestamp,latitude,longitude
  object-id,object-name,2023-09-18 00:00:00,54.075505722248174,1.9995117187500002
```
### Query settings

**Object query name**
These settings are responsible for connecting the plugin to the query. There should be exactly the same name as the query name with information about the object's location.


### Areas settings
![Areas tab](https://raw.githubusercontent.com/AgoraSolutions-tech/grafana-leaflet-map-visualization-panel/main/src/docs/areas-tab.png)

After making changes in the area settings, they should be finalized by clicking the 'Save' button on the areas tab and then saving the dashboard and refreshing the page.

If you have started creating/editing areas through the area creation form, you cannot edit/create new areas using the controls located on the map. First, you should save the form, save the dashboard, and then refresh the page.

**Area names tooltip**
The setting "Always show area names" means that the area name will be displayed whenever the zoom level is greater than 14.

If the setting is changed to "Show area names on hover", the tooltip will only be visible when you hover the mouse over a specific area, and the zoom level is greater than 14.

**Add area**
After clicking the "Add area" button, a rectangle will be automatically created in the center of the current view. You can change the number of vertices by adding them using the "Add vertex" button or remove a specific vertex by clicking the trash icon next to it.

After making the changes, click on the "Save" button in the Areas tab.

**Show Vertiles**
When you open the editing panel with existing areas, their vertices will be hidden. To view and edit them, you should click the "Show vertices" button. This will reveal a list of vertices that you can edit by changing their coordinates, delete using the trash icon, or add a new vertex using the "Add vertex" button. After finishing the vertex editing, you can hide the list by clicking on the "Vertices" header.

After making the changes, click on the "Save" button in the Areas tab.

### Areas creator 

Areas can also be created, edited, and deleted using controls on the map. 

All changes made using the area creator should be finalized by clicking the "save" button in the areas tab and refreshing the page.

**Create new area**
Clicking on the polygon icon initiates the process of creating a new area. By clicking on the map, you can add new vertices to the polygon. To finish creating, click on the first vertex or press the 'Finish' button. After this action, the area will be automatically added to the list of areas in the panel.

You can also remove the last drawn vertex by selecting the 'Delete last point' option or discard changes with the 'Cancel' button.

If you have started creating/editing areas through this panel, you cannot edit/create new areas through the area creation form. First, you should save the dashboard and refresh the page.

**Edit areas**
You can add new vertices and move or delete existing ones for all areas by clicking on the edit icon. 

This option allows you to edit multiple areas at once. After finishing the editing, click the 'Save' button. You can also discard changes by clicking the 'Cancel' button.

**Remove areas**
By clicking on the trash can icon, you can select the areas you want to delete. You can also choose the 'Clear all' option to remove all areas from the list. After selecting the 'Save' button, the changes will be updated. To discard the changes, choose the 'Cancel' option.

### Trail visibility

After pressing the 'Trail' button, you can toggle the visibility of historical positions of objects on and off. This button will also be visible from the dashboard.

### Object list 

Możesz wybrać jeden obiekt, którego pozycję chcesz obserwować. Wyboru tego możesz również dokonać z dashbordu. Jeśli będziesz chciał ponownie widzieć wszystkie obiekty wybierz opcję "See all objects".

### Date picker

You can change the day to see how the position of a specific object has changed. This option is also available from the dashboard.