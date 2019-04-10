
This brief documentation outlines all post and get requests that can be sent to the Ellipsis API. It is meant as a reference book, for more elaborate examples on how to use the API please visit the tutorial or galery pages.

# Contents

1. <a href='#account'>**/account**</a>
2. <a href='#metadata'>**/metadata**</a>
3. <a href='#data'>**/data**</a> <br/>
     3.1 <a href='#data_class'>*/data/class*</a> <br/>
      3.1.1 <a href='#data_class_custom'>/data/class/customPolygon</a> <br/>
      3.1.2 <a href='#data_class_polygon'>/data/class/polygon</a> <br/>
      3.1.3 <a href='#data_class_tile'>/data/class/tile</a> <br/>
     3.2 <a href='#data_index'>*/data/spectral*</a><br/>
      3.2.1 <a href='#data_index'>/data/spectral/customPolygon</a> <br/>
      3.2.2 <a href='#data_index'>/data/spectral/polygon</a> <br/>
      3.2.3 <a href='#data_index'>/data/spectral/tile</a> <br/>
4. <a href='#geometry'>**/geometry**</a><br/>
5. <a href='#visual'>**/visual**</a>
6. <a href='#tileService'>**/tileService**</a> 
7. <a href='#geoMessage'>**/geoMessage**</a> <br/>
     7.1 <a href='#message_tile'>*/geoMessage/tile*</a> <br/>
     7.2 <a href='#message_polygon'>*/geoMessage/polygon*</a> <br/>
     7.3 <a href='#message_customPolygon'>*/geoMessage/customPolygon*</a> <br/>
          

<a id='account'></a>
# /account
#### Post login


```python
url = 'https://api.ellipsis-earth.com/account/login'
```

Request to obtain a token to access restricted information.<br/>
**Parameters**<br/>
username: Your username.<br/>
password: Your password.<br/>
**Returns**<br/>
JSON with token.

#### Get myMaps


```python
url = 'https://api.ellipsis-earth.com/account/myMaps'
```

Request to obtain all maps that a user has access to.<br/>
**Parameters**<br/>
None<br/>
**Returns**<br/>
JSON with all to the user available maps and metadata of these maps.

#### Get validate


```python
url = 'https://api.ellipsis-earth.com/account/validate'
```

Request to check whether a token is valid.<br/>
**Parameters**<br/>
None<br/>
**Returns**<br/>
Status 200 if your token is valid. 401 if not.

<a id='metadata'></a>
# /metadata
#### Post timestamps


```python
url = 'https://api.ellipsis-earth.com/metadata/timestamps'
```

Request to obtain all available timestamps of a map.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
**Returns**<br/>
JSON with all timestamps for the given map.

#### Post classes


```python
url = 'https://api.ellipsis-earth.com/metadata/classes'
```

Request to obtain all metadata about the classes of a map.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
**Returns**<br/>
JSON with all classes for each timestamp of the given map.

#### Post spectral


```python
url = 'https://api.ellipsis-earth.com/metadata/spectral'
```

Request to obtain all metadata about the spectral indices of a map.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
**Returns**<br/>
JSON with all spectral indices for each timestamp of the given map.

#### Post tileLayers


```python
url = 'https://api.ellipsis-earth.com/metadata/tileLayers'
```

Request to obtain all available tilelayers.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
**Returns**<br/>
JSON with all tile layers for each timestamp of the given map.

#### Post polygonLayers


```python
url = 'https://api.ellipsis-earth.com/metadata/polygonLayers'
```

Request to obtain all layers of the shape a map is made with.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
**Returns**<br/>
JSON with all polygon layers of all timestamps of a given map. 

#### Post polygons


```python
url = 'https://api.ellipsis-earth.com/metadata/polygons'
```

Request to obtain the id's of predefined polygons.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
timestamp: The number of the timestamp, default is 0.<br/>
limit: maximum amount of id's to return, default is infinity. <br />
layer: The name of the polygon layer. <br/>
xMin: Minimum x coordinate wgs84 (optional). <br />
xMax: Maximum x coordinate wgs84 (optional). <br />
yMin: Minimum y coordinate wgs84 (optional). <br />
yMax: Maximum y coordinate wgs84 (optional). <br />
**Returns**<br/>
JSON with a count of the number of polygons within the given bounds and list of id's of these polygons. In case the number of polygons exceeds the specified limit the list of id's is left undefined. In case no bounding box is given all polygon id's within the layer are returned.

#### Post tiles


```python
url = 'https://api.ellipsis-earth.com/metadata/tiles'
```

Request to obtain the tiles of a map.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
timestamp: A timestamp number, default is 0.<br/>
limit: maximum amount of id's to return, default is infinity. <br />
xMin: Minimum x coordinate in wgs84 (optional). <br />
xMax: Maximum x coordinate wgs84 (optional). <br />
yMin: Minimum y coordinate wgs84 (optional). <br />
yMax: Maximum y coordinate wgs84 (optional). <br />
**Returns**<br/>
JSON with a count of the number of tiles within the given bounds and list of triples (tileX,tileY,zoom) of these tiles. In case the number of tiles exceeds the specified max the list of triples is undefined. In case no bounds are given all tiles present in the map are returend.

<a id='data'></a>
# /data
<a id='data_class'></a>
## /data/class
<a id='data_class_custom'></a>
### /data/class/customPolygon
#### Post timestamps


```python
url = 'https://api.ellipsis-earth.com/data/class/customPolygon/timestamps'
```

Request to obtain the surface area of each class for each timestamp for a certain custom polygon.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
geometry: A geojson describing the polygon.<br/>
**Returns**<br/>
CSV with columns timestamp, [columns of area per class], total area, date from and date to.

#### Post tiles


```python
url = 'https://api.ellipsis-earth.com/data/class/custommPolygon/tiles'
```

Request to obtain the surface area of each class for each standard tile covering a custom polygon for a certain timestamp.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
timestamp: An integer identifying the timestamp.<br/>
geometry: A geoJson describing the polygon.<br/>
**Returns**<br/>
CSV with columns tileX, tileY, zoom, [columns of area per class], total area, date from and date to.

<a id='data_class_polygon'></a>
### /data/class/polygon
#### Post polygonIds


```python
url = 'https://api.ellipsis-earth.com/data/class/polygon/polygonIds'
```

Request to obtain the surface area of each class for each polygon for a certain timestamp.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
timestamp: An integer identifying the timestamp.<br/>
polygonIds: A list of polygon ids, cannot be longer than 3000.<br/>
**Returns**<br/>
CSV with columns polygon ids, [columns of area per class] and total area.

#### Post timestamps


```python
url = 'https://api.ellipsis-earth.com/data/class/polygon/timestamps'
```

Request to obtain the surface area of each classes for each timestamps for a certain polygon.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
polygonId: An integer identifying the polygon.<br/>
**Returns**<br/>
A CSV with columns timestamp, [columns of area per class], total area, date from and date to.

#### Post tiles


```python
url = 'https://api.ellipsis-earth.com/data/class/polygon/tiles'
```

Request to obtain the surface area of each class for each standard tile covering a polygon for a certain timestamp.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
timestamp: An integer identifying the timestamp.<br/>
polygonId: An integer identifying the polygon.<br/>
**Returns**<br/>
CSV with columns tileX, tileY, zoom, [columns of area per class] and total area.

<a id='data_class_tile'></a>
### data/class/tile
#### Post tileIds


```python
url = 'https://api.ellipsis-earth.com/data/class/tile/tileIds'
```


Request to obtain the surface area of each class for each tile for a certain timestamp.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
tileIds: a list of key value pairs with keys tileX, tileY and optionally zoom, cannot be longer than 3000.<br/>
**Returns**<br/>
CSV with columns tileX, tileY, zoom, [columns of area per class], total area date from and date to.

#### Post timestamps


```python
url = 'https://api.ellipsis-earth.com/data/class/tile/timestamps'
```

Request to obtain the surface area of each class for a standard tile for all timestamps.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
tileX: An integer identifying the x-location of the tile<br/>
tileY: An integer identifying the y-location of the tile<br/>
zoom: AN integer indicating the zoomlevel of the tile <br/>
**Returns**<br/>
CSV with columns tileX, tileY, zoom, [columns of area per class] and total area.

<a id='data_index'></a>
## /data/spectral
<a id='data_index_custom'></a>
### /data/spectral/customPolygon
#### Post timestamps


```python
url = 'https://api.ellipsis-earth.com/data/spectral/customPolygon/timestamps'
```

Request to obtain the mean indices of each index over a certain class for each timestamp for a certain custom polygon.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
class: name of the class to take the mean over, in case means are not saved per class fill in all 'classes'<br/>
geometry: A geoJSON describing the polygon.<br/>
**Returns**<br/>
CSV with columns timestamp, [columns of mean per index], total area, date from and date to.

#### Post tiles


```python
url = 'https://api.ellipsis-earth.com/data/spectral/customPolygon/tiles'
```

Request to obtain the mean indices of each index over a certain class for a certain timestamp of all tiles for a custom polygon.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
timestamp: An integer identifying the timestamp.<br/>
class: name of the class to take the mean over, in case means are not saved per class fill in all 'classes'<br/>
geometry: A geoJSON describing the polygon.<br/>
**Returns**<br/>
CSV with columns tileX, tileY, zoom, [columns of mean per index] and total area.

### data/spectral/polygon
<a id='data_index_polygon'></a>
#### Post polygonIds


```python
url = 'https://api.ellipsis-earth.com/data/spectral/polygon/polygonIds'
```

Request to obtain the surface area of each class for each polygon for a certain timestamp.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
timestamp: An integer identifying the timestamp.<br/>
class: name of the class to take the mean over, in case means are not saved per class fill in all 'classes'<br/>
ids: A list of polygon ids, cannot be longer than 3000. <br/>
**Returns**<br/>
CSV with columns polygon ids, [columns of mean per index] and total area.

#### Post timestamps


```python
url = 'https://api.ellipsis-earth.com/data/spectral/polygon/timestamps'
```

Request to obtain the mean indices of each index over a certain classs for each timestamp for a certain polygon.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
polygonId: An integer identifying the polygon.<br/>
class: name of the class to take the mean over, in case means are not saved per class fill in all 'classes'<br/>
**Returns**<br/>
CSV with columns timestamp, [columns of mean per index], total area, date from and date to.

#### Post tiles


```python
url = 'https://api.ellipsis-earth.com/data/spectral/polygons/tiles'
```

Request to obtain the mean indices of each index over a certain class for each standard tile covering a polygon for a certain timestamp.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
timestamp: An integer identifying the timestamp.<br/>
polygonId: An integer identifying the polygon.<br/>
class: name of the class to take the mean over, in case means are not saved per class fill in all 'classes'<br/>
**Returns**<br/>
CSV with columns tileX, tileY, zoom, [columns of mean per index] and total area.

### data/spectral/tile
<a id='data_index_tile'></a>
#### Post tileIds


```python
url = 'https://api.ellipsis-earth.com/data/spectral/tile/tileIds'
```

Request to obtain the mean indices of each index over a certain class for all tiles at a certain timestamp.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
class: name of the class to take the mean over, in case means are not saved per class fill in all 'classes'<br/>
tileIds: List of key value pairs with key TileX, tileY and optionally zoom, cannot be longer than 3000.<br/>
**Returns**<br/>
CSV with columns polygon, [columns of mean per index] and total area.

#### Post timestamps


```python
url = 'https://api.ellipsis-earth.com/data/spectral/tile/timestamps'
```

Request to obtain the mean indices of each index over a certain class for a standard tile for all timestamps.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
class: name of the class to take the mean over, in case means are not saved per class fill in all 'classes'<br/>
tileX: An integer identifying the x-location of the tile<br/>
tileY: An integer identifying the y-location of the tile<br/>
zoom: An integer indicating the zoomlevel of the tile <br/>
**Returns**<br/>
CSV with columns tileX, tileY, [columns of mean per index], total area, date from and date to.

<a id='geometry'></a>
# /geometry

#### Post polygons


```python
url = 'https://api.ellipsis-earth.com/geometry/polygons'
```

Request to obtain all polygons by a list of id's.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
timestamp: The number of the timestamp, default is 0.<br/>
polygonIds: List of polygon id's, cannot be longer than 3000.<br/>
**Returns**<br/>
GeoJSON of polygons.

#### Post tiles


```python
url = 'https://api.ellipsis-earth.com/geometry/tiles'
```

Request to obtain all standard tiles by a list of id's.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
timestamp: The number of the timestamp, default is 0.<br/>
TileIds: An array of arrays of the form ['tileX': tileX, 'tileY': tileY], cannot be longer than 3000 <br/>
**Returns**<br/>
GeoJSON of polygons.

<a id='visual'></a>
# /visual

#### Post bounds


```python
url = 'https://api.ellipsis-earth.com/geometry/visual/bounds'
```

Request to obtain an image of a certain layer within a bounding box.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
timestampMin: The date from which to start the mosaic.<br/>
timestampMax: The date at which to end the mosaic.<br/>
layerName: Name of the layer that you wish to visualise<br/>
**Returns**<br/>
A Web Mercator projected PNG image of no more than 2048 by 2048 pixels.

<a id='tileService'></a>
# /tileService


```python
url = 'https://api.ellipsis-earth.com/tileService/[mapUuid]/[timestamp]/[layerName]/[tileZoom]/[tileX]/[tileY]'
```

Request to obtain a png image of tile layer [layerName] of standard tile [tileX], [tileY] at zoom level [tileZoom] for a certain timestamp [timestamp].<br/>
**Parameters**<br/>
[mapName]: Name of the particular map.<br/> 
[timestamp]: An integer identifying the timestamp.<br/>
[layerName]: Specifying layer name.<br/>
[tileZoom], [tileX], [tileY]: Specifying the standard tile.<br/>
**Returns**<br/>
A PNG image.

### Note on the tile layer
Ellipsis-Earth tiles work in the same way as Open Street Map tiles. That is to say, the globe between 85 degrees south and north of the Equator is projected to a square in a way that preserves angles. After that the zoom levels 0,1,2,...,14 are defined. For each zoom level, the (now square) world map is divided into $2^{zoomlevel}$ by $2^{zoomlevel}$ tiles. The tile in the upper left corner has tileX = 0 and tileY = 0 and the tile in the lower right corner has tileX = $2^{zoomlevel}$ -1 and tileY = $2^{zoomlevel}$-1.


As this is a standard way of working, you can quickly visualise the tile layer as an interactive map in a framework such as Leaflet or arcGIS once you supplied it with the correct base URL.

<a id='geoMessage'></a>
# /geoMessage
<a id='message_tile'></a>
## /geoMessage/tile
#### Post /addMessage


```python
url = 'https://api.ellipsis-earth.com/geoMessage/tile/addMessage'
```

Adds a message for a certain standard tile.<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
timestamp: The number of the timestamp.<br/>
tileX: The x of the tile in web mercator projection.<br/>
tileY: The y of the tile in web mercator projection<br/>
zoom: The zoom level of the tile.<br/>
isMask: If true, indicates that the message mask related.<br/>
isClassification: If true, indicates that the error is classification related.<br/>
message: A custom message.<br/>
**Returns**<br/>
Status 200 if the submission was successful.

#### Post /deleteMessage


```python
url = 'https://api.ellipsis-earth.com/geoMessage/tile/deleteMessage'
```

Deletes a specific tile message.<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
messageId: id of the message to be retracted.<br/>
**Returns**<br/>
Status 200 if the removal was successful.

#### Post /ids


```python
url = 'https://api.ellipsis-earth.com/geoMessage/tile/ids'
```

Gets tile ids for which there are messages.<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
xMin: Minimum x coordinate wgs84 (optional). <br />
xMax: Maximum x coordinate wgs84 (optional). <br />
yMin: Minimum y coordinate wgs84 (optional). <br />
yMax: Maximum y coordinate wgs84 (optional). <br />
zoom: The zoom level of the tile. (optional)<br/>
limit: maximum number of ids to return (optional, default is infinity). <br />

NOTE: Except for limit, all other optional arguments are used together. If you define one of them, you also need to define the others.<br/>

**Returns**<br/>
Json with a count and list of tile ids. In case the number of ids exceeds the limit, only a count is returned.

#### Post /getMessages


```python
url = 'https://api.ellipsis-earth.com/geoMessage/tile/getMessages'
```

Gets the tile messages with the given ids.<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
tileIds: Array of triples with keys 'tileX', 'tileY' and 'zoom'. <br/>
**Returns**<br/>
Json with all the messages.

<a id='message_polygon'></a>
## /geoMessage/polygon
#### Post /addMessage


```python
url = 'https://api.ellipsis-earth.com/geoMessage/polygon/addMessage'
```

Adds a message for a certain polygon.<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
timestamp: The number of the timestamp.<br/>
polygonId: Id of the polygon.<br/>
isMask: If true, indicates that the message mask related.<br/>
isClassification: If true, indicates that the error is classification related.<br/>
message: A custom message.<br/>
**Returns**<br/>
Status 200 if the submission was successful.

#### Post /deleteMessage


```python
url = 'https://api.ellipsis-earth.com/geoMessage/polygon/deleteMessage'
```

Deletes a message of a polygon.<br/>
**Parameters**<br/>
mapId: The id of the map.
messageId: Id of the messge to be deleted.<br/>
**Returns**<br/>
Status 200 if the removal was successful.

#### Post /ids


```python
url = 'https://api.ellipsis-earth.com/geoMessage/polygon/ids'
```

Gets the polygon ids for which there are messages .<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
xMin: Minimum x coordinate wgs84 (optional). <br />
xMax: Maximum x coordinate wgs84 (optional). <br />
yMin: Minimum y coordinate wgs84 (optional). <br />
yMax: Maximum y coordinate wgs84 (optional). <br />
limit: maximum number of ids to return (default is infinity). <br />

NOTE: Except for limit, all other optional arguments are used together. If you define one of them, you also need to define the others.<br/><br/>
**Returns**<br/>
Json with a count and list of polygon ids. In case the number of ids exceeds the limit, only a count is returned.

#### Post /getMessages


```python
url = 'https://api.ellipsis-earth.com/geoMessage/polygon/getMessages'
```

Gets all messages of the polygons with the given ids.<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
timestamp: The number of the timestamp.<br/>
polygonIds: list of ids. <br/>
**Returns**<br/>
Json with all reports.

<a id='message_customPolygon'></a>
## /geoMessage/customPolygon
#### Post /layers


```python
url = 'https://api.ellipsis-earth.com/geoMessage/customPolygon/layers'
```

Requests the customPolygon layers of a certai map.<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
**Returns**<br/>
JSON with layer names and colors.

#### Post /addPolygon


```python
url = 'https://api.ellipsis-earth.com/geoMessage/customPolygon/addPolygon'
```

Submits a certain customly defined polygon.<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
timestamp: The number of the timestamp.<br/>
geometry: GeoJSON.<br/>
features: A JSON with features.<br/>
layer: the name of the layer to which to add.<br/>
**Returns**<br/>
Status 200 if the submission was successful.

#### Post /addMessage


```python
url = 'https://api.ellipsis-earth.com/geoMessage/customPolygon/addMessage'
```

Submits a report for a certain polygon.<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
customPolygonId: The id of the customPolygon.<br/>
timestamp: The number of the timestamp.<br/>
errorMask: If true, indicates that the error is a mask related error.<br/>
errorClass: If true, indicates that the error is a classification related error.<br/>
message: A custom message.<br/>
**Returns**<br/>
Status 200 if the submission was successful.

#### Post /deleteMessage


```python
url = 'https://api.ellipsis-earth.com/geoMessage/customPolygon/deleteMessage'
```

Deletes a customPolygon.<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
messageId: Id of the messge to be retracted.<br/>
**Returns**<br/>
Status 200 if the removeal was successful.

#### Post /deletePolygon


```python
url = 'https://api.ellipsis-earth.com/geoMessage/customPolygon/deletePolygon'
```

Deletes a customPolygon.<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
customPolygonId: Id of the customPolygon to be retracted.<br/>
**Returns**<br/>
Status 200 if the removeal was successful.

#### Post /ids


```python
url = 'https://api.ellipsis-earth.com/geoMessage/customPolygon/ids'
```

Gets customPolygon ids for which there are reports.<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
xMin: Minimum x coordinate wgs84 (optional). <br />
xMax: Maximum x coordinate wgs84 (optional). <br />
yMin: Minimum y coordinate wgs84 (optional). <br />
yMax: Maximum y coordinate wgs84 (optional). <br />
limit: maximum number of ids to return (default is infinity). <br />
layer: The name of the layer of which to retrieve the id's. <br />
**Returns**<br/>
Json with a count and list of ids. In case the number of ids exceeds the limit, only a count is returned.

#### Post /getMessages


```python
url = 'https://api.ellipsis-earth.com/geoMessage/customPolygon/getMessages'
```

Gets all reports of the customPolygons with the given ids.<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
customPolygonIds: list of ids. <br/>
**Returns**<br/>
Json with all reports.
