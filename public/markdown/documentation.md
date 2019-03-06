
# Contents

<a href='#accounts'>**/accounts**</a>

<a href='#metadata'>**/metadata**</a>

<a href='#data'>**/data**</a>

<a href='#data_index'>/data/index</a>

<a href='#data_class'>/data/class</a>

<a href='#geometry'>**/geometry**</a>

<a href='#geometry_polygon'>/geometry/polygon</a>

<a href='#geometry_tile'>/geometry/tile</a>

<a href='#visual'>**/visual**</a>

<a href='#tileLayer'>**/tileLayer**</a>

<a href='#download'>**/download**</a>

<a id='account'></a>
# /account

### Post login


```python
url = 'https://api.ellipsis-earth.com/account/login'
```

Request to obtain a token to access user-specific maps.

**Parameters**

username: Your username.
    
password: Your password.

**Returns**

A JSON with token.

<a id='metadata'></a>
# /metadata

#### Post timestamps


```python
url = 'https://api.ellipsis-earth.com/queries/timestamps_map'
```

Request to obtain all available timestamps of a map.

**Parameters**

map_id: The uuid of the particular map.

**Returns**

A CSV with entries: timestamp,date_from,date_to

#### Post classes


```python
url = 'https://api.ellipsis-earth.com/queries/labels_map'
```

Request to obtain all metadata about the classes of a map.

**Parameters**

map_id: The uuid of the particular map.

**Returns**

A CSV with entries: timestamp,version,class,color

#### Post indices


```python
url = 'https://api.ellipsis-earth.com/queries/indices_map'
```

Request to obtain all metadata about the spectral indices of a map.

**Parameters**

map_id: The uuid of the particular map.

**Returns**

A CSV with entries: timestamp,version,index,color

#### Post tileLayers


```python
url = 'https://api.ellipsis-earth.com/queries/wmsLayers_map'
```

Request to obtain all layers of the WMS.

**Parameters**

map_id: The uuid of the particular map.

**Returns**

A CSV with entries: timestamp,type,name

#### Post polygonLayers


```python
url = 'https://api.ellipsis-earth.com/queries/polygonsLayers_map'
```

Request to obtain all layers of the shape a map is made with.

**Parameters**

map_id: The uuid of the particular map.

**Returns**

A CSV with entries: timestamp,version,layer,color

# /data

## /data/class

### /data/class/customPolygon

#### Post timestamps


```python
url = 'https://api.ellipsis-earth.com/queries/classes_timestamps_customPolygon'
```

Request to obtain the surface area of each class for each timestamp for a certain custom polygon.

**Parameters**

map_id: The uuid of the particular map.

coords: A list of coordinates describing the polygon.

**Returns**

A CSV with entries: timestamp,[classes columns],total_area,date_to, date_from

#### Post tiles


```python
url = 'https://api.ellipsis-earth.com/queries/classes_tiles_timestamp_customPolygon'
```

Request to obtain the surface area of each class for each standard tile covering a custom polygon for a certain timestamp.

**Parameters**

map_id: The uuid of the particular map.

coords: A list of coordinates describing the polygon.

timestamp: An integer identifying the timestamp.

**Returns**

A CSV with entries: tile_x,tile_y,tile_zoom,xmin,xmax,ymin,ymax,[classes columns],total_area

### /data/class/polygon

#### post polygons


```python
url = 'https://api.ellipsis-earth.com/queries/classes_polygons_timestamp'
```

Request to obtain the surface area of each class for each polygon for a certain timestamp.

**Parameters**

map_id: The uuid of the particular map.

timestamp: An integer identifying the timestamp.

layer: A string indicating the polygonslayer

**Returns**

A CSV with entries: polygon,[classes columns],total_area

#### Post timestamps


```python
url = 'https://api.ellipsis-earth.com/queries/classes_timestamps_polygon'
```

Request to obtain the surface area of each classes for each timestamps for a certain polygon.

**Parameters**

map_id: The uuid of the particular map.

polygon: An integer identifying the polygon.

**Returns**

A CSV with entries: timestamp,[classes columns],total_area,date_to,date_from

#### Post tiles


```python
url = 'https://api.ellipsis-earth.com/queries/classes_tiles_timestamp_polygon'
```

Request to obtain the surface area of each class for each standard tile covering a polygon for a certain timestamp.

**Parameters**

map_id: The uuid of the particular map.

polygon: An integer identifying the polygon.

timestamp: An integer identifying the timestamp.


**Returns**

A CSV with entries: tile_x,tile_y,tile_zoom,xmin,xmax,ymin,ymax,[classes columns],total_area

### data/class/tile

#### Post tiles

#### Post timestamps

## /data/index

### /data/index/customPolygon

#### Post timestamps


```python
url = 'https://api.ellipsis-earth.com/queries/indices_timestamps_customPolygon'
```

Request to obtain the mean of each spectral index for each timestamp over a certain class in a custom polygon.

**Parameters**

map_id: The uuid of the particular map.

coords: A list of coordinates describing the polygon.


**Returns**

A CSV with entries: timestamp,[indices columns],total_area,date_from,date_to

#### Post tiles


```python
url = 'https://api.ellipsis-earth.com/queries/indices_tiles_timestamp_customPolygon'
```

Request to obtain the mean of each spectral index for each standard tile covering a cutom polygon over a certain class for a certain timestamp.

**Parameters**

map_id: The uuid of the particular map.

coords: A list of coordinates describing the polygon.
    
timestamp: An integer identifying the timestamp.


**Returns**

A CSV with entries: tile_x, tile_y, tile_zoom, xmin,xmax,ymin,ymax,[classes columns],total_area

### data/index/polygon

#### Post polygons


```python
url = 'https://api.ellipsis-earth.com/queries/indices_polygons_timestamp_class'
```

Request to obtain the mean of each spectral index over a certain class for each polygons for a certain timestamp.

**Parameters**

map_id: The uuid of the particular map.

timestamp: An integer identifying the timestamp.
    
class: Name of the specific class.

layer: A string indicating the polygonslayer

**Returns**

A CSV with entries: polygon,[indices columns],total_area

#### Post timestamps


```python
url = 'https://api.ellipsis-earth.com/queries/indices_timestamps_polygon_class'
```

Request to obtain the mean of each spectral index over a certain class of a certain polygon for all timestamps.

**Parameters**

map_id: The uuid of the particular map.

coords: A list of coordinates describing the polygon.

polygon: An integer identifying the timestamp.
    
class:  Name of the specific class.

**Returns**

A CSV: timestamp, [indices columns] ,total_area, date_from, date_to

#### Post tiles


```python
url = 'https://api.ellipsis-earth.com/queries/indices_tiles_polygon_timestamp_class'
```

Request to obtain the mean of each spectral index over a certain class for each standard tiles covering a polygon for a certain timestamp.

**Parameters**

map_id: The uuid of the particular map.

coords: A list of coordinates describing the polygon.

polygon: An integer identifying the polygon.
    
timestamp: An integer identifying the timestamp
    
class: Name of the specific class.

**Returns**

A CSV with entries: tile_x, tile_y, tile_zoom, xmin,xmax,ymin,ymax,[classes columns],total_area

### data/index/tile

#### Post tiles

#### Post timestamps

# /geometry

## /geometry/polygon

## geometry/tile

# /visual

# /tileLayer

### Get tile


```python
url = 'https://dev.api.ellipsis-earth.com/wms/ + \
       [map_name]/[timestamp]/[layer_type]/[layer_name]/[tile_zoom]/[tile_x]/[tile_y]'
```

Request to obtain a png image of a visualistion of layer [layer_type],[layer_name] of standard tile [tile_zoom],[tile_x],[tile_y] at a certain timestamp [timestamp].

**Parameters**

[map_name]: Name of the particular map. 

[timestamp]: An integer identifying the timestamp.

[layer_type],[layer_name]: Specifying layer type and name.

[tile_zoom],[tile_x],[tile_y]: Specifying the standard tile.

# /download

### Post download token


```python
url =  'https://api.ellipsis-earth.com/utilities/requestShapeDownload'
```

**Parameters**

map_id: The uuid of the particular map.
    
timestamp: An integer identifying the timestamp.

**Returns**

A token for downloading the shapefile.

### Get download shape


```python
url = 'https://api.ellipsis-earth.com/utilities/downloadShape/{token}'
```

**Parameters**

token: The download token that was obtained via the post download token request.

**Returns**

Starts the download of the shape.

### Post polygons for boundingbox


```python
url =  'https://api.ellipsis-earth.com/utilities/getPolygonsJsonBounds'
```

**Parameters**

map_id: The uuid of the particular map.

timestampNumber: The number of the particular timestamp.

layer: Layer from which you want to retrieve the polygons.

x1: Minimal x value of bounding box.

x2: Maximal x value of bounding box.

y1: Minimal y value of bounding box.

y2: Maximal y value of bounding box.

**Returns**

Retrieves a geoJSON of all polygons within a certain bounding box. If the number of polygons exceeds a certain threshold, no polygons are rendered.

### Post request polygons


```python
url =  'https://api.ellipsis-earth.com/utilities/getPolygonsJsonIds'
```

**Parameters**

map_id: The uuid of the particular map.

timestampNumber: The number of the particular timestamp.

polygons: Array of polygon id's to be retrieved.

**Returns**

Retrieves a geoJSON of all polygons with the given id's.
