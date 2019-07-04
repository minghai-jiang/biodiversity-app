
This tutorial is meant to help you get started using the Ellipsis API. This tutorial should give you the basic understanding that you need in order to start developing your own apps and monitoring systems.

The Ellipsis API supports a multitude of calls. In order to keep this tutorial concise it will not treat every call seperately. Instead it will glance over a subset of representative calls and try to get the general idea of the API across. See the API documentation if you wish to see a complete list of all possible API calls.

In case you are looking for more in depth use cases for the API, please have a look at the Galery. 

This tutorial is directed to Python users, but should be readable for people using other languages as well.

# Contents

1. <a href='#Ellipsis'>**Ellipsis-Earht Data**</a>
2. <a href='#setup'>**Setting things up**</a>
3. <a href='#requests'>**The requests package**</a>
4. <a href='#login'>**Loggin in**</a>
5. <a href='#content'>**Acquiring metadata**</a>
6. <a href='#data'>**Acquiring data**</a>
7. <a href='#geometry'>**Acquiring geometries**</a>
8. <a href='#visual'>**Acquiring visualisations**</a>
9. <a href='#geomessage'>**Acquiring geoMessaging**</a>

<a id='Ellipsis'></a>
# Ellipsis-Earth Data

Ellipsis-Earth data is always connected to a map. Maps consist of multiple timestamps, each of which contains all data and visualisations of that map acquired at that particular time.

## Standard tiles, predefined polygons and custom polygons

Ellipsis-Earth uses a large set of predefined standard tiles covering the entire globe on different zoomlevels. In fact we use the same  covering as the webmercator projected open street map. A tile can be uniquely identified by a tile_x, tile_y and zoom.

On top of these standard tiles each map can have specific predined polygons. These can be everything from agricultural plots to administrative districts. These polygons are grouped into layers (for example all provinces of a country would form a layer).

Aside from predefined polygons there can also be custom polygons that have been defined by users or bots.

## Aggregation

Data is always both aggregated to standard tiles as well as to predefined polygons. That is to say measurements and land cover types are always saved for all polygons and tiles. 

In case of predefined polygons the data is actually saved per tile per polygon. This means that in larger polygons you also have a sense of 'where' something occured.

In case of land cover classes,  aggregations are made by taking the total surface area of each class within the region. In case of measurements, means are taken over the whole area.

Means of measurements can be taken per landcover class or over all classes. Which strategy was used depends on the map.

## GeoMessage

Ellipsis-Earth supports an elaborate chat service within it's API. In this chat service users and bots can submit messages to exsisting polygons, custom polygons or standard tiles. Optionally they can include forms or photos 

Users can also submit new custom polygons to the map via this route.

## Map layers
Each map consist of map layers. Each layer contains a certain type of visualization of the map. There are three types of layers:

1.	**Images**: Visualizations that are not see-through and in which missing data is transparent.
2.	**Images2**: Visualizations that are see-through and in which missing data is transparent.
3.	**Labels**: See-through visualisation in which each land cover type has a certain color.

Layers of type **Images** can be stacked in order to fill gaps of missing data, layers of type **Images2** cannot be stacked as they are see-through.

## Request types

<a id='thedestination'></a>
Ellipsis supports a large number of requests to our API. We categorise them in the following way:

1. **/account** All requests regarding accesing information.<br/>
2. **/metadata**: All requests that gather information about what data is available in a certain map.<br/>
3. **/data**: All requests that gather data of geometries.<br/>
4. **/geometries**: All requests for obtaining geometries of predefined polygons or tiles.
6. **/visual**: All requests for obtaining visualisations.<br/>
7. **/geoMessage**: All requests relating to the geoMessage chat service.<br/>

## Response objects

Raw data is always returned in csv, visualisation in PNG, Geometries in geoJSON. All other responses are always in JOSN format.

<a id='setup'></a>
# Setting things up
## Required packages

We will be requiring the following python packages. The Requests package allows us to make post and get requests to the API. Pandas, Matplotlib and Geopandas help us to interpret responses as sensible Python objects. The io package allows us to directly interpret a requested PNG, GeoJSON or CSV as a Python object instead of saving it to our local disk first.


```python
import requests

import pandas as pd
import geopandas as gpd
from matplotlib import pyplot as plt
from matplotlib import image as mpimg

from io import BytesIO
from io import StringIO
```

## API adress

All requests to the Ellipsis API should be sent to the following webadress, that we now store in the varialbe url.


```python
url = 'https://api.ellipsis-earth.com/v1'
```

<a id='requests'></a>
# The requests package

With the pyton requests package we can make post and get requests to url's. The get request is meant for requests without parameters. The post requests allows for sending parameters along with the request.

Get and post requests in python look as follows:


```python
r = requests.get('http://www.example.com')
```


```python
r = requests.post('http://www.example.com', 
                  json = {'parameter1':'value1','parameter2':'value2'})
```

In case we are accessing information for which we need to be logged in, we should add a token to our request. We can do this by using the header argument of these functions.


```python
r = requests.get('http://www.example.com', 
                 headers = {"Authorization":'Your_token'})
```


```python
r = requests.post('http://www.example.com', 
                  json = {'key':'value'}, 
                  headers = {"Authorization":'Your_token'})
```

In case we do not want to wait forever for a return from the server we can add an additional timeout argument to the request. This argument should be a float indicating the number of seconds that you are willing to wait for the response.

## Interpreting responses

Now let's have a look at the response r. If we print it directly we get the response code of our request.


```python
print(r)
```

    <Response [200]>


We get response code 200. This means that our request was succesfull. That's great and all, but overall we are moslty interested in the data that the API returns us.

The ellipsis API returns data in JSON, geoJSON, CSV and PNG. We can interpret these as Python objects as follows.


```python
#python_dictionary = r.json()

#python_dataFrame = pd.read_csv(StringIO(r.text))

#python_geoDataFrame = gpd.read_file(StringIO(r.text))

#python_image = mpimg.imread(BytesIO(response.content))
```

<a id='login'></a>
# Loging in

Some maps are public and can be accessed without a token. However, if you want to access maps that are private or if you want to do operations on a public map that require a higher authorization level, you may need to authenticate.

You authenticate yourself by sending a token with your request.

To obtain this token you will need to login. In this tutorial we use the demo_user account.


```python
r =requests.post(url + '/account/login',
                 json = {'username':'demo_user', 'password':'demo_user'} )
print(r.text)
```

    {"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRlbW9fdXNlciIsImlhdCI6MTU2MjE1ODQ1OSwiZXhwIjoxNTYyMjQ0ODU5fQ.JCcWVs88dDU0r-in2GXHcKLzZ_8uXY4N9IDGdix2jbU"}


Our token is quite long, so let's save the token to a variable that we can send with our other requests.


```python
token = r.json()
token = token['token']
```

The authentication procedure that Ellipsis-Earth uses is of type 'Bearer' so we need to concatenate that to the start of our token string.


```python
token = 'Bearer ' + token
print(token)
```

    Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRlbW9fdXNlciIsImlhdCI6MTU2MjE1ODQ1OSwiZXhwIjoxNTYyMjQ0ODU5fQ.JCcWVs88dDU0r-in2GXHcKLzZ_8uXY4N9IDGdix2jbU


Now let's quickly test wether our token is valid.


```python
r = requests.get(url + '/account/validateLogin', 
                 headers = {"Authorization":token} )
print(r)
```

    <Response [200]>


We get 200 as a response code, which means that our request was succesfull and therfore our token valid. The token we got will only remain valid for a limited amount of time, the expiration time of a token is currently set to 12 hours. After that you will need to request a new token via the same procedure.

<a id='content'></a>
# Acquiring metadata

To see what maps are available we can make the MyMaps request. The response will give us all maps to which we have at least parital access.


```python
r = requests.get(url + '/account/myMaps',headers = {"Authorization":token})

r = r.json()

map_names = [map['name'] for map in r]
map_names[1:4]
```




    ['Earthquake Palu', 'verkeer Rotterdam', 'Suriname']



Seems there are quite some maps available. Lets have a look at the Suriname map. To this end we store the mapId of this map in a variable.


```python
mapId = [map['id'] for map in r if map['name'] == 'Suriname'][0]
mapId
```




    '810b31c3-6335-45fe-8120-972e2d1c7da8'



Now we fixed our map we can start discovering what kind of data it houses. We can for example have a look at which predefined polygon layers are present, which timestamps are available or what measurements are available.


```python
r = requests.post(url + '/metadata/polygonLayers',
                 json = {"mapId":  mapId })

r = r.json()
r[0]
```




    {'timestampNumber': 0,
     'polygonVersion': 0,
     'layers': [{'name': 'province',
       'color': 'ffff00ff',
       'hasAggregatedData': False},
      {'name': 'polygon', 'color': 'ffff00ff', 'hasAggregatedData': True},
      {'name': 'Reserve', 'color': 'ffff00ff', 'hasAggregatedData': True},
      {'name': 'Mine', 'color': 'ffff00ff', 'hasAggregatedData': True}]}




```python
r = requests.post(url + '/metadata/timestamps',
                 json = {"mapId":  mapId })

r = r.json()
r[0:3]
```




    [{'timestampNumber': 0,
      'dateFrom': '2018-01-01T00:00:00.000Z',
      'dateTo': '2018-01-15T00:00:00.000Z'},
     {'timestampNumber': 1,
      'dateFrom': '2018-02-01T00:00:00.000Z',
      'dateTo': '2018-02-15T00:00:00.000Z'},
     {'timestampNumber': 2,
      'dateFrom': '2018-03-01T00:00:00.000Z',
      'dateTo': '2018-03-15T00:00:00.000Z'}]




```python
r = requests.post(url + '/metadata/measurements',
                 json = {"mapId":  mapId })


r = r.json()
print([ m['name'] for m in r[0]['measurements']])
```

    ['NDVI', 'NDWI']


See the metadata section in the API documentation for a complete list of all metadata calls.

<a id='data'></a>
# Acquiring data

Now we know what data is available in our map we can start requesting actual information from it.

We can start out with defining some custom polygon


```python
geometry = {'type': 'FeatureCollection' , 'features':[{ 'properties':{}, 'geometry': {'type': 'Polygon',
    'coordinates': [[[-55,4.1], [-55.5,4.2], [-55.2,4.2],[-52.3,5.15], [-52,5]]]} }]}
```

We can now request the data for all timestamps for this custom polygon. The API will collect all standard tiles intersecting with our polygon and aggregate the information.


```python
r = requests.post(url + '/data/class/customPolygon/timestamps',
                 json = {"mapId":  mapId, 'geometry': geometry })

r = pd.read_csv(StringIO(r.text))
r.head(5)
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>timestamp</th>
      <th>blanc</th>
      <th>disturbance</th>
      <th>mask</th>
      <th>no class</th>
      <th>area</th>
      <th>date_from</th>
      <th>date_to</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>0</td>
      <td>124.489</td>
      <td>10.598</td>
      <td>1190.760</td>
      <td>216.818</td>
      <td>1542.664</td>
      <td>2018-01-01</td>
      <td>2018-01-15</td>
    </tr>
    <tr>
      <th>1</th>
      <td>1</td>
      <td>124.489</td>
      <td>25.382</td>
      <td>784.431</td>
      <td>608.363</td>
      <td>1542.664</td>
      <td>2018-02-01</td>
      <td>2018-02-15</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2</td>
      <td>124.489</td>
      <td>27.847</td>
      <td>689.947</td>
      <td>700.382</td>
      <td>1542.664</td>
      <td>2018-03-01</td>
      <td>2018-03-15</td>
    </tr>
    <tr>
      <th>3</th>
      <td>3</td>
      <td>124.489</td>
      <td>27.847</td>
      <td>685.076</td>
      <td>705.253</td>
      <td>1542.664</td>
      <td>2018-04-01</td>
      <td>2018-04-15</td>
    </tr>
    <tr>
      <th>4</th>
      <td>4</td>
      <td>124.489</td>
      <td>28.363</td>
      <td>634.804</td>
      <td>755.008</td>
      <td>1542.664</td>
      <td>2018-05-01</td>
      <td>2018-05-15</td>
    </tr>
  </tbody>
</table>
</div>



We can also request data for predefined polygons. An advantage of predefined polygons is that the call is faster and the information is better (Since the data was aggregated to this polygon in a precise manner).

We could for example request the data for timestamp 6 for polygon 1 and 5


```python
r = requests.post(url + '/data/class/polygon/polygonIds',
                 json = {"mapId":  mapId, 'timestamp':6, 'polygonIds': [1,5] })
r = pd.read_csv(StringIO(r.text))
r
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>id</th>
      <th>blanc</th>
      <th>disturbance</th>
      <th>mask</th>
      <th>no class</th>
      <th>area</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>1</td>
      <td>0.0</td>
      <td>7.779</td>
      <td>0.591</td>
      <td>30.288</td>
      <td>38.658</td>
    </tr>
    <tr>
      <th>1</th>
      <td>5</td>
      <td>0.0</td>
      <td>0.401</td>
      <td>0.033</td>
      <td>0.343</td>
      <td>0.778</td>
    </tr>
  </tbody>
</table>
</div>



Aside from class information we also have measurement information laying around. Let's request all measurements of a certain standard tile for all timestamps.


```python
r = requests.post(url + '/data/measurement/tile/tileIds',
                 json = {"mapId":  mapId,  'class': 'disturbance', 'timestamp':3, 'tileIds': [{'tileX':5691, 'tileY':7959},{'tileX':5691,'tileY':7960, 'zoom':14},{'tileX':5692,'tileY':7959, 'zoom':14}]})

r = pd.read_csv(StringIO(r.text))
r.head(10)
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>tileX</th>
      <th>tileY</th>
      <th>zoom</th>
      <th>NDVI</th>
      <th>NDWI</th>
      <th>cloud_cover</th>
      <th>area</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>5691</td>
      <td>7959</td>
      <td>14</td>
      <td>0.828</td>
      <td>0.455</td>
      <td>0.98</td>
      <td>5.897</td>
    </tr>
    <tr>
      <th>1</th>
      <td>5691</td>
      <td>7960</td>
      <td>14</td>
      <td>1.000</td>
      <td>0.364</td>
      <td>0.97</td>
      <td>5.897</td>
    </tr>
    <tr>
      <th>2</th>
      <td>5692</td>
      <td>7959</td>
      <td>14</td>
      <td>1.000</td>
      <td>0.648</td>
      <td>0.92</td>
      <td>5.897</td>
    </tr>
  </tbody>
</table>
</div>



For custom polygons, standard tiles and polygons you can make both requests for information of classes and measurements. For each of these case you have multiple options resutling in 14 calls. See the API documentation for a complete list of all possibilities.

<a id='geometry'></a>
# Acquiring geometries
Now suppose that we did some interesting analytics on the data that we requested in the previous section. The result of our analysis was that something is going on with polygons 5 and 7. It would make sense to now want the geometries of these polygons.


```python
r = requests.post(url + '/geometry/polygons',
                 json = {"mapId":  mapId, 'polygonIds':[5,7]})

r  = gpd.GeoDataFrame.from_features(r.json()['features'])
r.plot()
r.head(5)
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>geometry</th>
      <th>id</th>
      <th>layer</th>
      <th>name</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>POLYGON Z ((-55.4031899 4.3819095 0, -55.40044...</td>
      <td>5</td>
      <td>Mine</td>
      <td>Mine5</td>
    </tr>
    <tr>
      <th>1</th>
      <td>POLYGON Z ((-55.2059509 5.1604273 0, -55.14827...</td>
      <td>7</td>
      <td>Mine</td>
      <td>Mine7</td>
    </tr>
  </tbody>
</table>
</div>




![png](output_64_1.png)


In our search for geometries we can also first find all polygon ids within a boundng box and then request those ids.


```python
r = requests.post(url + '/metadata/polygons',
                 json = {"mapId":  mapId, 'layer': 'Mine', 'xMin': -55 ,'xMax':-53, 'yMin':4, 'yMax':5})

r = r.json()
ids = r['ids']

r = requests.post(url + '/geometry/polygons',
                 json = {"mapId":  mapId, 'polygonIds':ids})
r  = gpd.GeoDataFrame.from_features(r.json()['features'])
r.plot()
r.head(5)

```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>geometry</th>
      <th>id</th>
      <th>layer</th>
      <th>name</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>POLYGON Z ((-54.6555203 4.889224 0, -54.650542...</td>
      <td>1</td>
      <td>Mine</td>
      <td>Mine1</td>
    </tr>
    <tr>
      <th>1</th>
      <td>POLYGON Z ((-54.7134545 4.3750631 0, -54.74607...</td>
      <td>4</td>
      <td>Mine</td>
      <td>Mine4</td>
    </tr>
  </tbody>
</table>
</div>




![png](output_66_1.png)


<a id='visual'></a>
# Acquiring visualisations

It might be intersesting to also have a visual aid to help us asses what is going on in a region.  We could for example request an rgb image for a given bounding box. We can define a timestampMin and timestampMax over which the data should be stacked.


```python
r = requests.post(url + '/visual/bounds',
                 json = {"mapId":  mapId, 'timestampMin':1, 'timestampMax':8, 'layerName':'rgb', 'xMin': -55 ,'xMax':-53, 'yMin':4, 'yMax':5 })


img = mpimg.imread(BytesIO(r.content))
plt.imshow(img)
```




    <matplotlib.image.AxesImage at 0x7f2ba29dd208>




![png](output_69_1.png)


The API always makes sure that the resolution of the returned image is addapted to your level of zoom. It prevents the largest dimension of your image to be over 2048 pixels.

A response image is in PNG format and has four channels. Red, green, blue and transperant.

The API mosaics the images from more recent to less recent. In case no cloudless footage is found that area of the map will rendered as transparent.

<a id='tilelayers'></a>
## Tile service

For visualisations withing applications you are more likely to want to use the tile layers. A tile layer is a base url that specifies a certain visualisation of the map. If you add the parameters tileX, tileY and zoom to the url you can specify a specific tile in the layer. Many frameworks such as Leaflet ar ArcGIS can reconstruct an interactive map from all of these tiles if you feed it the url of the tile layer.

The url structure of the tile layers is as follows:


```python
'/tileService/[mapUuid]/[timestamp]/[layerName]/[tileZoom]/[tileX]/[tileY]'
```

<a id='geomessage'></a>
# GeoMessaging

Lastly you can also request information from the chatservice.

Let's for example request the latest messages that were added to the map. We can do this by requesting page 1 of the feed.


```python
r = requests.post(url + '/geoMessage/feed', json = {'mapId': mapId,  'page':1 })
r.json()[0]
```




    {'id': '5acb3380-ac3e-4939-a085-2c6cd6a2c0d6',
     'timestamp': 11,
     'date': '2019-07-03T09:32:37.000Z',
     'user': 'admin',
     'userGroups': ['admin'],
     'message': '',
     'image': None,
     'form': {'answers': [{'type': 'boolean',
        'answer': False,
        'question': 'Boolean question'},
       {'type': 'text', 'answer': '32', 'question': 'Text question'},
       {'type': 'numeric', 'answer': '2', 'question': 'Numeric question'}],
      'formName': 'Test form 2'},
     'processed': False,
     'type': 'custom_polygon',
     'layer': 'mine expansions',
     'elementId': '6974d79e-9b58-4d46-9ca1-83cbc7f9d9e4'}



We can also request the id's of the added custom polygons and their geometries.


```python
r = requests.post(url + '/geoMessage/customPolygon/ids', json = {'mapId': mapId,  'layer':'mine expansions' })
r.json()
ids = r.json()['ids']

r = requests.post(url + '/geoMessage/customPolygon/geometries', json = {'mapId': mapId,  'customPolygonIds':ids })
r  = gpd.GeoDataFrame.from_features(r.json()['features'])
r.plot()
```




    <matplotlib.axes._subplots.AxesSubplot at 0x7f2ba1b99128>




![png](output_78_1.png)


<a id='geomessagesent'></a>
## Sending geoMessages

We can also use the geoMessage functionality to actively post our analysis resutls. Suppose we found some interesting results about polygon 3. We can create a form describing our conclusion and add it to this polygon as a message.


```python
form = {"answers":[ {"type":"numeric","answer": 1 ,"question":"Numeric question"},{"type":"text","answer":"test" ,"question":"Text question"},{"type":"boolean","answer":True ,"question":"Boolean question"}], "formName":"Test form"}

requests.post(url + '/geoMessage/polygon/addMessage', json = {'mapId': mapId, 'timestamp': 0, 'polygonId': 3, 'message': 'test message', 'isClassification':False, 'isMask':False, 'form': form }  ,headers = {"Authorization":token})
```




    <Response [200]>



Note that we needed to authenticate with our token to sent this request.
