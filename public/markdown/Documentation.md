
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
    4.1 <a href='#geometry_polygon'>*/geometry/polygon*</a><br/>
    4.2 <a href='#geometry_tile'>*/geometry/tile*</a>
5. <a href='#visual'>**/visual**</a>
6. <a href='#tileLayer'>**/tileLayer**</a>
7. <a href='#download'>**/download**</a>

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
JSON with an array of maps. Each element has a map uuid, a map name, a bounding box of the map and whether the map is public or not.<br/>

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

#### Post polygonsCount


```python
url = 'https://api.ellipsis-earth.com/metadata/polygonsCount'
```

Request to obtain the amount of polygons in a boundingbox.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
timestamp: The number of the timestamp.<br/>
layer: The name of the polygon layer. <br/>
xMin: Minimum x coordinate. <br />
xMax: Maximum x coordinate. <br />
yMin: Minimum y coordinate. <br />
yMax: Maximum y coordinate. <br />
**Returns**<br/>
JSON with a count.

#### Post tilesCount


```python
url = 'https://api.ellipsis-earth.com/metadata/tilesCount'
```

Request to obtain the amount of tiles in a boundingbox.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
timestamp: A timestamp number.<br/>
xMin: Minimum x coordinate. <br />
xMax: Maximum x coordinate. <br />
yMin: Minimum y coordinate. <br />
yMax: Maximum y coordinate. <br />
**Returns**<br/>
JSON with a count.

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
coords: A list of coordinates describing the polygon.<br/>
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
coords: A list of coordinates describing the polygon.<br/>
**Returns**<br/>
CSV with columns tileX, tileY, [columns of area per class], total area, date from and date to.

<a id='data_class_polygon'></a>
### /data/class/polygon
#### Post polygons


```python
url = 'https://api.ellipsis-earth.com/data/class/polygon/polygons'
```

Request to obtain the surface area of each class for each polygon for a certain timestamp.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
timestamp: An integer identifying the timestamp.<br/>
layer: A string indicating the polygonslayer<br/>
**Returns**<br/>
CSV with columns polygon ids, [columns of area per class] and total area.

#### Post timestamps


```python
url = 'https://api.ellipsis-earth.com/data/polygon/timestamps'
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
CSV with columns tileX, tileY, [columns of area per class] and total area.

<a id='data_class_tile'></a>
### data/class/tile
#### Post tiles


```python
url = 'https://api.ellipsis-earth.com/data/class/tile/timestamps'
```

Request to obtain the surface area of each class for a standard tile for all timestamps.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
timestamp: An integer identifying the timestamp.<br/>
**Returns**<br/>
CSV with columns tileX, tileY, [columns of area per class] and total area.

#### Post timestamps


```python
url = 'https://api.ellipsis-earth.com/data/class/tile/tiles'
```

Request to obtain the surface area of each class for each polygon for a certain timestamp.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
tileX: The x position of the tile..<br/>
tileY: The y position of the tile.<br/>
**Returns**<br/>
CSV with columns polygon, [columns of area per class], total area date from and date to.

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
coords: A list of coordinates describing the polygon.<br/>
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
coords: A list of coordinates describing the polygon.<br/>
**Returns**<br/>
CSV with columns tileX, tileY, [columns of mean per index] and total area.

### data/spectral/polygon
<a id='data_index_polygon'></a>
#### Post polygons


```python
url = 'https://api.ellipsis-earth.com/data/spectral/polygon/polygons'
```

Request to obtain the mean indices of each index over a certain class for each polygon for a certain timestamp.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
timestamp: An integer identifying the timestamp.<br/>
layer: A string indicating the polygonslayer
class: name of the class to take the mean over, in case means are not saved per class fill in all 'classes'<br/>
**Returns**<br/>
CSV with columns polygon ids, [columns of mean per index] and total area.

#### Post timestamps


```python
url = 'https://api.ellipsis-earth.com/data/spectral/polygons/timestamps'
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
CSV with columns tileX, tileY, [columns of mean per index] and total area.

### data/spectral/tile
<a id='data_index_tile'></a>
#### Post tiles


```python
url = 'https://api.ellipsis-earth.com/data/spectral/tile/tiles'
```

Request to obtain the mean indices of each index over a certain class for all tiles at a certain timestamp.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
class: name of the class to take the mean over, in case means are not saved per class fill in all 'classes'<br/>
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
tileX: The x position of the tile..<br/>
tileY: The y position of the tile.<br/>
**Returns**<br/>
CSV with columns tileX, tileY, [columns of mean per index], total area, date from and date to.

<a id='geometry'></a>
# /geometry
<a id='geometry_polygon'></a>
## /geometry/polygon
#### Post all


```python
url = 'https://api.ellipsis-earth.com/geometry/polygon/all'
```

Request to obtain all polygons in a layer.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
timestamp: The number of the timestamp.<br/>
layer: The name of the polygon layer. <br/>
**Returns**<br/>
GeoJSON of polygons.

#### Post bounds


```python
url = 'https://api.ellipsis-earth.com/geometry/polygon/bounds'
```

Request to obtain all polygons in a boundingbox.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
timestamp: The number of the timestamp.<br/>
xMin: Minimum x coordinate.<br/>
xMax: Maximum x coordinate.<br/>
yMin: Minimum y coordinate.<br/>
yMax: Maximum y coordinate.<br/>
layer: The name of the polygon layer. <br/>
**Returns**<br/>
GeoJSON of polygons.

#### Post ids


```python
url = 'https://api.ellipsis-earth.com/geometry/polygon/ids'
```

Request to obtain all polygons by a list of id's.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
timestamp: The number of the timestamp.<br/>
polygonIds: List of polygon id's.<br/>
**Returns**<br/>
GeoJSON of polygons.

<a id='geometry_tile'></a>
## geometry/tile
#### Post all


```python
url = 'https://api.ellipsis-earth.com/geometry/tile/all'
```

Request to obtain all standard tiles in a layer.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
timestamp: The number of the timestamp.<br/>
layer: The name of the polygon layer. <br/>
**Returns**<br/>
GeoJSON of polygons.

#### Post bounds


```python
url = 'https://api.ellipsis-earth.com/geometry/tile/bounds'
```

Request to obtain all standard tiles in a boundingbox.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
timestamp: The number of the timestamp.<br/>
xMin: Minimum x coordinate.<br/>
xMax: Maximum x coordinate.<br/>
yMin: Minimum y coordinate.<br/>
yMax: Maximum y coordinate.<br/>
layer: The name of the polygon layer. <br/>
**Returns**<br/>
GeoJSON of polygons.

#### Post ids


```python
url = 'https://api.ellipsis-earth.com/geometry/tile/ids'
```

Request to obtain all standard tiles by a list of id's.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
timestamp: The number of the timestamp.<br/>
ids: An array of arrays of the form ['tileX': tileX, 'tileY': tileY] <br/>
layer: The name of the polygon layer. <br/>
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
A Web Mercator projected PNG image of no more than 1024 by 1024 pixels.

<a id='tileLayer'></a>
# /tileLayer


```python
url = 'https://api.ellipsis-earth.com/tileLayer/[mapUuid]/[timestamp]/[layerName]/[tileZoom]/[tileX]/[tileY]'
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

<a id='download'></a>
# /download
#### Post /shape/token


```python
url =  'https://api.ellipsis-earth.com/download/shape/token'
```

Request to obtain a dowload token.<br/>
**Parameters**<br/>
mapId: The uuid of the particular map. <br/>
timestamp: An integer identifying the timestamp.<br/>
**Returns**<br/>
JSON with a token for downloading the shape file.

#### Get /shape/get


```python
url = 'https://api.ellipsis-earth.com/download/shape/get/{token}'
```

Request to download the shapefile. <br/>
**Parameters**<br/>
token: The download token that was obtained via the post download token request.<br/>
**Returns**<br/>
Starts the download of the shape.
