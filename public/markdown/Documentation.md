
This brief documentation outlines all post and get requests that can be sent to the Ellipsis API. It is meant as a reference book for people wanting to develop their own applications on the Ellipsis API.

People wanting to use the API for analysis purposes can best visit the tutorial instead or read the more elaborate examples in the Galery.

# Contents

0. <a href='#privileges'>**Access**</a>
1. <a href='#account'>**/account**</a>
2. <a href='#settings'>**/settings**</a>
3. <a href='#metadata'>**/metadata**</a>
4. <a href='#data'>**/data**</a> <br/>
     4.1 <a href='#data_class'>*/data/class*</a> <br/>
      4.1.1 <a href='#data_class_custom'>/data/class/customPolygon</a> <br/>
      4.1.2 <a href='#data_class_polygon'>/data/class/polygon</a> <br/>
      4.1.3 <a href='#data_class_tile'>/data/class/tile</a> <br/>
     4.2 <a href='#data_index'>*/data/spectral*</a><br/>
      4.2.1 <a href='#data_index'>/data/spectral/customPolygon</a> <br/>
      4.2.2 <a href='#data_index'>/data/spectral/polygon</a> <br/>
      4.2.3 <a href='#data_index'>/data/spectral/tile</a> <br/>
5. <a href='#geometry'>**/geometry**</a><br/>
6. <a href='#visual'>**/visual**</a>
7. <a href='#tileService'>**/tileService**</a> 
8. <a href='#geoMessage'>**/geoMessage**</a> <br/>
     8.1 <a href='#forms'>*/geoMessage/forms*</a> <br/>
     8.2 <a href='#message_tile'>*/geoMessage/tile*</a> <br/>
     8.3 <a href='#message_polygon'>*/geoMessage/polygon*</a> <br/>
     8.4 <a href='#message_customPolygon'>*/geoMessage/customPolygon*</a> <br/>    

<a id='privaliges'></a>
# Access
All map related API calls requires a certain access level. There are currently 10 levels in total. Each access level implies all lower access levels. Each user can have different level of access for different maps.

level 100: The right to view the map <br/>
level 200: The right to access aggregated data of a map<br/>
level 300: The right to view geoMessages<br/>
level 400: The right to add geoMessages<br/>
level 410: The right to include photos in geoMessages<br/>
level 500: The right to add custom polygons <br/>
level 600: The right to delete geoMessages<br/>
level 700: The right to alter or delete custom polygons<br/>
level 750: The right to add or delete forms <br/>
level 800: The right to alter custom polygon layers<br/>
level 900: The right to add users to user groups up till degree 900<br/>
level 1000: The right to make content public and to create or alter user groups<br/>

Access levels 1, 2 and 3 can be set to public for map, meaning that all users (even unregistered users) have this level of access.

Access levels 4 and 5 can also be set to public. Although you still have to be logged in to use API calls requiring access level 4 and 5, any logged in user would be able to access API calls requiring them.

The required access level is mentioned for each API call that requires them in this documentation.

The API is throttled. Each user has a limited number of credits each minute. You can find the credit costs for each call in the documentation below. Credit is refilled each minute on the minute.

<a id='account'></a>
# /account
#### Post login


```python
url = 'https://api.ellipsis-earth.com/account/login'
```

Request to obtain a token to access restricted information. (no access level, credits: 1)<br/>
**Parameters**<br/>
username: Your username.<br/>
password: Your password.<br/>
**Returns**<br/>
JSON with token.

#### Get myMaps


```python
url = 'https://api.ellipsis-earth.com/account/myMaps'
```

Request to obtain all maps that a user has access to. (no access level, credits: 1)<br/>
**Parameters**<br/>
None<br/>
**Returns**<br/>
JSON with all to the user available maps and metadata of these maps.

#### Post register


```python
url = 'https://api.ellipsis-earth.com/account/register'
```

Register a new account. Sents an email with a token that can be used to call /validateEmail to validate the new email. (no access level, credits 1000)<br/>
**Parameters**<br/>
username: The desired username<br/>
password: The desired password.<br/>
email: Email address to associate with this account.<br/>
**Returns**<br/>
Status 200 if registration was succesful.

#### Post changePassword


```python
url = 'https://api.ellipsis-earth.com/account/changePassword'
```

Change the password of a logged in user (No access level, requires login, credits 1).<br/>
**Parameters**<br/>
newPassword: The desired new password.<br/>
**Returns**<br/>
Status 200 if password was changed.

#### Post resetPassword


```python
url = 'https://api.ellipsis-earth.com/account/resetPassword'
```

Resets a user's password. A new password is generated and sent to the email of the user along with a validation token. The new password is only active after calling /validateResetPassword with the token, or by following the link in the email. (No access level, requires login, credits 1)<br/>
**Parameters**<br/>
email: The email of the user to reset the password for.<br/>
**Returns**<br/>
Status 200 if a new password is generated and validation email sent. 

#### Post changeEmail


```python
url = 'https://api.ellipsis-earth.com/account/changeEmail'
```

Change the email of a logged in user. Sents an email with a token that can be used to call /validateEmail to validate the new email. (No access level, requires login, credits 1)<br/>
**Parameters**<br/>
newEmail: New email for the user.<br/>
**Returns**<br/>
Status 200 if email was updated.

#### Get validateResetPassword


```python
url = 'https://api.ellipsis-earth.com/account/validateResetPassword?token=[token]'
```

Request to validate a pasword change. (no access level, credits 1)<br/>
**Parameters**<br/>
token: The token provided in the email sent by the /resetPassword request.<br/>
**Returns**<br/>
Status 200 if password got updated.

#### Get validateEmail


```python
url = 'https://api.ellipsis-earth.com/account/validateEmail?token=[token]'
```

Request to confirm an email address. (No access level, credits 1)<br/>
**Parameters**<br/>
token: The token provided in the email sent by one of the other requests.<br/>
**Returns**<br/>
Status 200 if validation was successful.

#### Get validateLogin


```python
url = 'https://api.ellipsis-earth.com/account/validateLogin'
```

Request check whether a login token is valid. (No acess level, credits 1)<br/>
**Parameters**<br/>
None<br/>
**Returns**<br/>
Status 200 if your token is valid. 

<a id='settings'></a>
# /settings
#### Post createGroup


```python
url = 'https://api.ellipsis-earth.com/settings/createGroup'
```

Create a new group for a map. (Access level: 1000, credits 1)<br/>
**Parameters**<br/>
mapId: The id of the map to which to add the group.<br/>
groupName: The name of the group to be created.<br/>
accessLevel: The access level to the map of the new group.<br/>
**Returns**<br/>
Response 200 if the group has been added.

#### Post deleteGroup


```python
url = 'https://api.ellipsis-earth.com/settings/deleteGroup'
```

Deletes a group (Access level: 1000, credits 1).<br/>
**Parameters**<br/>
mapId: The id of the map to which the group belongs to.<br/>
groupName: The name of the group to be deleted.<br/>
**Returns**<br/>
Response 200 if the group was deleted.

#### Post addUser


```python
url = 'https://api.ellipsis-earth.com/settings/addUser'
```

Request to add a user to a group (Access level: 900 or 1000 if you are adding to a group with access level 1000, credits 1).<br/>
**Parameters**<br/>
mapId: The id of the map to which the group belongs to.<br/>
groupName: The name of the group to add the user to.<br/>
username: The username of the user to add to the group.<br/>
**Returns**<br/>
Response 200 if the user was added.

#### Post removeUser


```python
url = 'https://api.ellipsis-earth.com/settings/removeUser'
```

Request to remove a user from a group (Access level: 900 or 1000 if you are adding to a group with access level 1000, credits 1).<br/>
**Parameters**<br/>
mapId: The id of the map to which the group belongs to.<br/>
groupName: The name of the group to add the user to.<br/>
username: The username of the user to add to the group.<br/>
**Returns**<br/>
Response 200 if the user was removed.

#### Post updateGroup


```python
url = 'https://api.ellipsis-earth.com/settings/updateGroup'
```

Request to change a group (Access level: 1000, credits 1).<br/>
**Parameters**<br/>
mapId: The id of the map to which the group belongs to.<br/>
groupName: The name of the group to update.<br/>
newGroupName: The new name of the group. (optional)<br/>
newAccessLevel: The new accesslevel for the group. (optional)<br/>
**Returns**<br/>
Response 200 if the group was updated.

#### Post updateMap


```python
url = 'https://api.ellipsis-earth.com/settings/updateMap'
```

Request to change the public access level of a map. (Access level: 1000, credits 1)<br/>
**Parameters**<br/>
mapId: The id of the map to which the group belongs to.<br/>
newPublicAccessLevel: New public access level for the map. <br/>
**Returns**<br/>
Response 200 if the new public access level was changed.

#### Post users


```python
url = 'https://api.ellipsis-earth.com/settings/users'
```

Request to get all users of a certain group. (Access level: 900, credits 10)<br/>
**Parameters**<br/>
mapId: The id of the map to which the group belongs to.<br/>
groupName: The name of the group to retrieve the users for.<br/>
**Returns**<br/>
JSON with all users of the given group.

#### Post mapAccess


```python
url = 'https://api.ellipsis-earth.com/settings/mapAccess'
```

Request to get the public access level of a map and the access level of all groups (Access level: 100, credits 1).<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
**Returns**<br/>
JSON with the access levels.

<a id='metadata'></a>
# /metadata

#### Post timestamps


```python
url = 'https://api.ellipsis-earth.com/metadata/timestamps'
```

Request to obtain all available timestamps of a map.  (Access level: 100, credits 1)<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
**Returns**<br/>
JSON with all timestamps for the given map.

#### Post classes


```python
url = 'https://api.ellipsis-earth.com/metadata/classes'
```

Request to obtain all metadata about the classes of a map. (Access level: 100, credits 1)<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
**Returns**<br/>
JSON with all classes for each timestamp of the given map.

#### Post spectral


```python
url = 'https://api.ellipsis-earth.com/metadata/spectral'
```

Request to obtain all metadata about the spectral indices of a map. (Access level: 100, credits 1)<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
**Returns**<br/>
JSON with all spectral indices for each timestamp of the given map.

#### Post tileLayers


```python
url = 'https://api.ellipsis-earth.com/metadata/tileLayers'
```

Request to obtain all available tilelayers. (Access level: 100, credits 1)<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
**Returns**<br/>
JSON with all tile layers for each timestamp of the given map.

#### Post polygonLayers


```python
url = 'https://api.ellipsis-earth.com/metadata/polygonLayers'
```

Request to obtain all layers of the shape a map is made with. (Access level: 100, credits 1)<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
**Returns**<br/>
JSON with all polygon layers of all timestamps of a given map. 

#### Post polygons


```python
url = 'https://api.ellipsis-earth.com/metadata/polygons'
```

Request to obtain the id's of predefined polygons. (Access level: 100, credits 100)<br/>
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

Request to obtain the tiles of a map. (Access level: 100, credits 100)<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
timestamp: A timestamp number, default is 0.<br/>
limit: maximum amount of id's to return, default is infinity. <br />
xMin: Minimum x coordinate in wgs84 (optional). <br />
xMax: Maximum x coordinate wgs84 (optional). <br />
yMin: Minimum y coordinate wgs84 (optional). <br />
yMax: Maximum y coordinate wgs84 (optional). <br />
zoom: the zoomlevel of the tiles (default 14). <br />
**Returns**<br/>
JSON with a count of the number of tiles within the given bounds and list of triples (tileX,tileY,zoom) of these tiles. In case the number of tiles exceeds the specified max the list of triples is undefined. In case no bounds are given all tiles present in the map are returend.

<a id='data'></a>
# /data
<a id='data_class'></a>
The following requests require viewing privaliges on the maps. In case of non public maps, the owner of a map can grant these privaliges.
## /data/class
<a id='data_class_custom'></a>
### /data/class/customPolygon
#### Post timestamps


```python
url = 'https://api.ellipsis-earth.com/data/class/customPolygon/timestamps'
```

Request to obtain the surface area of each class for each timestamp for a certain custom polygon.(Access level: 200, credits 2000)<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
geometry: A geojson describing the polygon.<br/>
**Returns**<br/>
CSV with columns timestamp, [columns of area per class], total area, date from and date to.

#### Post tiles


```python
url = 'https://api.ellipsis-earth.com/data/class/custommPolygon/tiles'
```

Request to obtain the surface area of each class for each standard tile covering a custom polygon for a certain timestamp.(Access level: 200, credits 1000)<br/>
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

Request to obtain the surface area of each class for each polygon for a certain timestamp.(Access level: 200, credits 1000)<br/>
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

Request to obtain the surface area of each classes for each timestamps for a certain polygon.(Access level: 200, credits 500)<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
polygonId: An integer identifying the polygon.<br/>
**Returns**<br/>
A CSV with columns timestamp, [columns of area per class], total area, date from and date to.

#### Post tiles


```python
url = 'https://api.ellipsis-earth.com/data/class/polygon/tiles'
```

Request to obtain the surface area of each class for each standard tile covering a polygon for a certain timestamp.(Access level: 200, credits 500)<br/>
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

Request to obtain the surface area of each class for each tile for a certain timestamp.(Access level: 200, credits 500)<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
tileIds: a list of key value pairs with keys tileX, tileY and optionally zoom, cannot be longer than 3000.<br/>
**Returns**<br/>
CSV with columns tileX, tileY, zoom, [columns of area per class], total area date from and date to.

#### Post timestamps


```python
url = 'https://api.ellipsis-earth.com/data/class/tile/timestamps'
```

Request to obtain the surface area of each class for a standard tile for all timestamps.(Access level: 200, credits 500)<br/>
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

Request to obtain the mean indices of each measurement over a certain class for each timestamp for a certain custom polygon.(Access level: 200, credits 2000)<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
class: name of the class to take the mean over, in case means are not saved per class fill in all 'classes'<br/>
geometry: A geoJSON describing the polygon.<br/>
**Returns**<br/>
CSV with columns timestamp, [columns of mean per measurement], total area, date from and date to.

#### Post tiles


```python
url = 'https://api.ellipsis-earth.com/data/spectral/customPolygon/tiles'
```

Request to obtain the mean indices of each measurement over a certain class for a certain timestamp of all tiles for a custom polygon.(Access level: 200, credits 1000)<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
timestamp: An integer identifying the timestamp.<br/>
class: name of the class to take the mean over, in case means are not saved per class fill in all 'classes'<br/>
geometry: A geoJSON describing the polygon.<br/>
**Returns**<br/>
CSV with columns tileX, tileY, zoom, [columns of mean per measurement] and total area.

### data/spectral/polygon
<a id='data_index_polygon'></a>
#### Post polygonIds


```python
url = 'https://api.ellipsis-earth.com/data/spectral/polygon/polygonIds'
```

Request to obtain the surface area of each class for each polygon for a certain timestamp.(Access level: 200, credits 1000)<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
timestamp: An integer identifying the timestamp.<br/>
class: name of the class to take the mean over, in case means are not saved per class fill in all 'classes'<br/>
ids: A list of polygon ids, cannot be longer than 3000. <br/>
**Returns**<br/>
CSV with columns polygon ids, [columns of mean per measurement] and total area.

#### Post timestamps


```python
url = 'https://api.ellipsis-earth.com/data/spectral/polygon/timestamps'
```

Request to obtain the mean indices of each measurement over a certain classs for each timestamp for a certain polygon.(Access level: 200, creidts 500)<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
polygonId: An integer identifying the polygon.<br/>
class: name of the class to take the mean over, in case means are not saved per class fill in all 'classes'<br/>
**Returns**<br/>
CSV with columns timestamp, [columns of mean per measurement], total area, date from and date to.

#### Post tiles


```python
url = 'https://api.ellipsis-earth.com/data/spectral/polygons/tiles'
```

Request to obtain the mean measurements over a certain class for each standard tile covering a polygon for a certain timestamp.(Access level: 200, credits 500)<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
timestamp: An integer identifying the timestamp.<br/>
polygonId: An integer identifying the polygon.<br/>
class: name of the class to take the mean over, in case means are not saved per class fill in all 'classes'<br/>
**Returns**<br/>
CSV with columns tileX, tileY, zoom, [columns of mean per measurement] and total area.

### data/spectral/tile
<a id='data_index_tile'></a>
#### Post tileIds


```python
url = 'https://api.ellipsis-earth.com/data/spectral/tile/tileIds'
```

Request to obtain the mean indices of each measurement over a certain class for all tiles at a certain timestamp.(Access level: 200, credits 500)<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
class: name of the class to take the mean over, in case means are not saved per class fill in all 'classes'<br/>
tileIds: List of key value pairs with key TileX, tileY and optionally zoom, cannot be longer than 3000.<br/>
**Returns**<br/>
CSV with columns polygon, [columns of mean per measurement] and total area.

#### Post timestamps


```python
url = 'https://api.ellipsis-earth.com/data/spectral/tile/timestamps'
```

Request to obtain the mean indices of each measurement over a certain class for a standard tile for all timestamps.(Access level: 200, credits 500)<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
class: name of the class to take the mean over, in case means are not saved per class fill in all 'classes'<br/>
tileX: An integer identifying the x-location of the tile<br/>
tileY: An integer identifying the y-location of the tile<br/>
zoom: An integer indicating the zoomlevel of the tile <br/>
**Returns**<br/>
CSV with columns tileX, tileY, [columns of mean per measurement], total area, date from and date to.

<a id='geometry'></a>
# /geometry
The following requests require viewing privaliges on the maps. In case of non public maps, the owner of a map can grant these privaliges.

#### Post polygons


```python
url = 'https://api.ellipsis-earth.com/geometry/polygons'
```

Request to obtain all polygons by a list of id's.(Access level: 100, credits 500)<br/>
**Parameters**<br/>
mapId: The id of the particular map.<br/>
timestamp: The number of the timestamp, default is 0.<br/>
polygonIds: List of polygon id's, cannot be longer than 3000.<br/>
**Returns**<br/>
GeoJSON of polygons.

#### Post tiles


```python
url = 'https://api.ellipsis-earth.com/geometry/tiles'
```

Request to obtain all standard tiles by a list of id's.(Access level: 100, credits 500)<br/>
**Parameters**<br/>
mapId: The id of the particular map.<br/>
timestamp: The number of the timestamp, default is 0.<br/>
tileIds: An array of arrays of the form ['tileX': tileX, 'tileY': tileY], cannot be longer than 3000 <br/>
**Returns**<br/>
GeoJSON of polygons.

<a id='visual'></a>
# /visual
The following requests require viewing privaliges on the maps. In case of non public maps, the owner of a map can grant these privaliges.

#### Post bounds


```python
url = 'https://api.ellipsis-earth.com/geometry/visual/bounds'
```

Request to obtain an image of a certain layer within a bounding box.(Access level: 200, credits 2000)<br/>
**Parameters**<br/>
mapId: The uuid of the particular map.<br/>
timestampMin: The date from which to start the mosaic.<br/>
timestampMax: The date at which to end the mosaic.<br/>
layerName: Name of the layer that you wish to visualise<br/>
**Returns**<br/>
A Web Mercator projected PNG image of no more than 2048 by 2048 pixels.

<a id='tileService'></a>
# /tileService
The following requests require viewing privaliges on the maps. In case of non public maps, the owner of a map can grant these privaliges.


```python
url = 'https://api.ellipsis-earth.com/tileService/[mapUuid]/[timestamp]/[layerName]/[tileZoom]/[tileX]/[tileY]'
```

Request to obtain a png image of tile layer [layerName] of standard tile [tileX], [tileY] at zoom level [tileZoom] for a certain timestamp [timestamp].(Access level: 100, credits 5)<br/>
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
#### Post /feed


```python
url = 'https://api.ellipsis-earth.com/geoMessage/feed'
```

Gets all geoMessages of a certain page. (Access level: 300, credits 10)<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
page: The number of the page. Page 1 being the most recent. <br/>
userGroups: List of userGroups whose messages to include. Default is all. <br/>
**Returns**<br/>
JSON with all geomessages on that page.

#### Post /userMessages


```python
url = 'https://api.ellipsis-earth.com/geoMessage/userMessages'
```

Gets all geoMessages of a user of a certain page. (Access level: 300, credits 10)<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
user: The username.<br/>
page: The number of the page. Page 1 being the most recent. <br/>
**Returns**<br/>
JSON with all geomessages on that page.

#### Post /image


```python
url = 'https://api.ellipsis-earth.com/geoMessage/image'
```

Gets the image of a certain geoMessage. (Access level: 300, credits 10)<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
geoMessageId: The id of the geoMessage.<br/>
type: The type of the geoMessage. Must be one of 'tile', 'polygon' or 'custom polygon'.<br/>
**Returns**<br/>
Image in base64 format of the geoMessage.

<a id='forms'></a>
## /geoMessage/forms
#### NEW Post /addForm


```python
url = 'https://api.ellipsis-earth.com/geoMessage/forms/addForm'
```

Creates a new form. (Access level: 750, credits 10)<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
formName: The name of the form.<br/>
properties: list of properties that need to be filled. <br/>
isRequired: whether a property must be filled. <br/>
type: Whether the property is boolean, numeric of character. <br/>
**Returns**<br/>
status 200 if form was added.

#### NEW Post /deleteForm


```python
url = 'https://api.ellipsis-earth.com/geoMessage/forms/deleteForm'
```

Deletes an excisting form. (Access level: 750, credits 10)<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
formName: The name of the form to be deleted. <br/>
**Returns**<br/>
status 200 if form was deleted.

#### NEW Post /alterForm


```python
url = 'https://api.ellipsis-earth.com/geoMessage/forms/alterForm'
```

Alters an excisting form. (Access level: 750, credits 10)<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
formName: The name of the form to be deleted. <br/>
properties: list of properties that need to be filled. <br/>
isRequired: whether a property must be filled. <br/>
type: Whether the property is boolean, numeric of character. <br/>
**Returns**<br/>
status 200 if form was deleted.

#### NEW Post /getForms


```python
url = 'https://api.ellipsis-earth.com/geoMessage/forms/getForms'
```

Retrieves all excisting forms of a map with properties. (Access level: 400, credits 10)<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
**Returns**<br/>
Returns a JSON with form names and properties.

<a id='message_tile'></a>
## /geoMessage/tile
#### Post /addMessage


```python
url = 'https://api.ellipsis-earth.com/geoMessage/tile/addMessage'
```

Adds a message for a certain standard tile.(Access level: 400, credits 10)<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
timestamp: The number of the timestamp.<br/>
tileX: The x of the tile in web mercator projection.<br/>
tileY: The y of the tile in web mercator projection<br/>
zoom: The zoom level of the tile.<br/>
isMask: If true, indicates that the message mask related.<br/>
isClassification: If true, indicates that the error is classification related.<br/>
message: A custom message.<br/>
form: (opitional) A JSON with submitted form.<br/>
photo: (optional) A photo.<br/>
**Returns**<br/>
Status 200 if the submission was successful.

#### Post /deleteMessage


```python
url = 'https://api.ellipsis-earth.com/geoMessage/tile/deleteMessage'
```

Deletes a specific tile message. (Access level: 600, or 400 when deleting a user's own message, credits 10)<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
id: id of the message to be deleted.<br/>
**Returns**<br/>
Status 200 if the removal was successful.

#### Post /ids


```python
url = 'https://api.ellipsis-earth.com/geoMessage/tile/ids'
```

Gets tile ids for which there are messages.(Access level: 300, credits 10)<br/>
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

Gets the tile messages with the given ids.(Access level: 300, credits 10)<br/>
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

Adds a message for a certain polygon.(Access level: 400, credits 10)<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
timestamp: The number of the timestamp.<br/>
polygonId: Id of the polygon.<br/>
isMask: If true, indicates that the message mask related.<br/>
isClassification: If true, indicates that the error is classification related.<br/>
message: A custom message.<br/>
form: (opitional) A JSON with submitted form.<br/>
photo: (optional) A photo.<br/>
**Returns**<br/>
Status 200 if the submission was successful.

#### Post /deleteMessage


```python
url = 'https://api.ellipsis-earth.com/geoMessage/polygon/deleteMessage'
```

Deletes a message of a polygon. (Access level: 600, or 400 when deleting a user's own message, credits 10)<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
id: Id of the messge to be deleted.<br/>
**Returns**<br/>
Status 200 if the removal was successful.

#### Post /ids


```python
url = 'https://api.ellipsis-earth.com/geoMessage/polygon/ids'
```

Gets the polygon ids for which there are messages. (Access level: 300, credits 10)<br/>
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

Gets all messages of the polygons with the given ids.(Access level: 300, credits 10)<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
polygonIds: list of polygon ids. <br/>
**Returns**<br/>
Json with all reports.

<a id='message_customPolygon'></a>
## /geoMessage/customPolygon
#### Post /layers


```python
url = 'https://api.ellipsis-earth.com/geoMessage/customPolygon/layers'
```

Requests the custom polygon layers of a certain map.(Access level: 300, credits 10)<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
**Returns**<br/>
JSON with layer names, colors and the available polygon properties for each layer.

#### Post /addPolygon


```python
url = 'https://api.ellipsis-earth.com/geoMessage/customPolygon/addPolygon'
```

Submits a certain customly defined polygon. (Access level: 500, credits 10)<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
timestamp: The number of the timestamp.<br/>
geometry: GeoJSON of the polygon to be added. The feature must be of type 'MultiPolygon'.<br/>
layer: the name of the layer to which to add the polygon.<br/>
**Returns**<br/>
Status 200 if the submission was successful.

#### Post /addMessage


```python
url = 'https://api.ellipsis-earth.com/geoMessage/customPolygon/addMessage'
```

Adds a message for a certain custom polygon. (Access level: 400, credits 10)<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
timestamp: The number of the timestamp.<br/>
customPolygonId: Id of the custom polygon.<br/>
isMask: If true, indicates that the message mask related.<br/>
isClassification: If true, indicates that the error is classification related.<br/>
message: A custom message.<br/>
form: (opitional) A JSON with submitted form.<br/>
photo: (optional) A photo.<br/>
**Returns**<br/>
Status 200 if the submission was successful.

#### Post /deleteMessage


```python
url = 'https://api.ellipsis-earth.com/geoMessage/customPolygon/deleteMessage'
```

Deletes a message of a custom polygon. (Access level: 600, or 400 when deleting a user's own message, credits 10)<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
id: Id of the messge to be deleted.<br/>
**Returns**<br/>
Status 200 if the removal was successful.

#### Post /deletePolygon


```python
url = 'https://api.ellipsis-earth.com/geoMessage/customPolygon/deletePolygon'
```

Deletes a custom polygon. (Access level: 700, credits 10)<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
customPolygonId: Id of the custom polygon to be deleted.<br/>
**Returns**<br/>
Status 200 if the removeal was successful.

#### Post /ids


```python
url = 'https://api.ellipsis-earth.com/geoMessage/customPolygon/ids'
```

Gets the custom polygon ids for which there are messages. (Access level: 300, credits 100)<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
layer: The name of the custom polygon layer. <br />
xMin: Minimum x coordinate wgs84 (optional). <br />
xMax: Maximum x coordinate wgs84 (optional). <br />
yMin: Minimum y coordinate wgs84 (optional). <br />
yMax: Maximum y coordinate wgs84 (optional). <br />
limit: maximum number of ids to return (default is infinity). <br />

**Returns**<br/>
Json with a count and list of ids. In case the number of ids exceeds the limit, only a count is returned.

#### Post geometries


```python
url = 'https://api.ellipsis-earth.com/geoMessage/customPolygon/geometries'
```

Returns the custom polygons with the given ids in GeoJSON format. (Access level: 300,, credits 100)<br/>
**Parameters**<br/>
mapId: The id of the particular map.<br/>
customPolygonIds: An array of custom polygon ids.. <br/>
**Returns**<br/>
GeoJSON of the custom polygons.

#### Post /getMessages


```python
url = 'https://api.ellipsis-earth.com/geoMessage/customPolygon/getMessages'
```

Gets all reports of the customPolygons with the given ids. (Access level: 300, credits 10)<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
customPolygonIds: list of ids. <br/>
**Returns**<br/>
Json with all messages.

#### Post /alterLayer


```python
url = 'https://api.ellipsis-earth.com/geoMessage/customPolygon/alterLayer'
```

Alters a custom polygon layer. (Access level: 800, credits 10)<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
layerName: The name of the layer to change. <br/>
newLayerName: The new name of the layer. <br/>
color: Hexagon code of the new color. <br/>
**Returns**<br/>
Status 200 of the layer has been altered.

#### Post /addLayer


```python
url = 'https://api.ellipsis-earth.com/geoMessage/customPolygon/addLayer'
```

Adds a custom polygon layer. (Access level: 800, credits 10)<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
layerName: Name of the layer to add.<br/>
color: Color for the layer in hexadecimal RGBA.<br/>
properties: Object with property name and values.<br/>
**Returns**<br/>
Status 200 of the layer has been added.

#### Post /deleteLayer


```python
url = 'https://api.ellipsis-earth.com/geoMessage/customPolygon/deleteLayer'
```

Deletes a customPolygonLayer. (Access level: 800, credits 10)<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
layerName: Name of the layer to delete. <br/>
**Returns**<br/>
Status 200 of the layer has been deleted. 401 if not.

#### Post /alterPolygon


```python
url = 'https://api.ellipsis-earth.com/geoMessage/customPolygon/alterPolygon'
```

Alters the properies and/or the layer of a customPolygon. (Access level: 700, credits 10)<br/>
**Parameters**<br/>
mapId: The id of the map.<br/>
customPolygonId: the id of the polygon to alter.<br/>
properties: Object with property name and values.<br/>
newLayerName: new layer name.<br/>
**Returns**<br/>
Status 200 if the custom polygon was altered.

#### Post addProperty


```python
url = 'https://api.ellipsis-earth.com/geoMessage/customPolygon/addProperty'
```

Adds a property to a custom polygon layer (Access level: 800, credits 10)<br/>
**Parameters**<br/>
mapId: The id of the particular map.<br/>
layerName: Name of the custom polygon layer. <br/>
propertyName: Name of the new property. <br/>
**Returns**<br/>
Status 200 if property was added.

#### Post deleteProperty


```python
url = 'https://api.ellipsis-earth.com/geoMessage/customPolygon/deleteProperty'
```

Deletes an existing property from a custom polygon layer. (Access level: 800, credits 10)<br/>
**Parameters**<br/>
mapId: The id of the particular map.<br/>
layerName: Name of the custom polygon layer. <br/>
propertyName: Name of the property to be deleted. <br/>
**Returns**<br/>
Status 200 if removal was succesful.
