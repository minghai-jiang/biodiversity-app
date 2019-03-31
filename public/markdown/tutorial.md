
Our database stores a treasure of GeoData aqcuired by our cluster. We suport a large number of requests rendering data, geometries and visualisations on this database. This tutorial, meant for people who want to start using the Ellipsis-Earth API for analysis or reporting purposes. It will take you through all relevant requests you can make to our server.

This document is meant as a quick tutorial to get you started. It will show you all the options without going into depth or specifics. To see the full potential and power of the API when applied to specific use cases, please visit one of our demo-notebooks in the Ellipsis-Gallery. This tutorial is directed to Python users, but should be readable for people using other languages as well.

Some of the for analysis lesser relevant API calls in the documentation are skipped.

# Contents

1. <a href='#Ellipsis'>**Ellipsis Data**</a>
2. <a href='#setup'>**Setting things up**</a>
3. <a href='#requests'>**The requests package**</a>
4. <a href='#login'>**Acces**</a> <br/>
5. <a href='#metadata'>**Acquiring metadata**</a> <br/>
6. <a href='#data'>**Acquiring data**</a> <br/>
    6.1 <a href='#data/class'> *Data for classes*</a> <br/>
     6.1.1 <a href='#data/class/custom'> for custom polygons</a> <br/>
     6.1.2 <a href='#data/class/polygon'> for predefined polygons</a> <br/>
     6.1.3 <a href='#data/class/tile'> for standard tiles</a> <br/>
    6.2 <a href='#data/index'> *Data for indices*</a><br/>
     6.2.1 <a href='#data/index/custom'> for custom polygons</a> <br/>
     6.2.2 <a href='#data/index/polygon'> for predefined polygons</a> <br/>
     6.2.3 <a href='#data/index/tile'> for standard tiles</a> <br/>
7. <a href='#geometry'>**Acquiring geometries**</a><br/>
8. <a href='#visual'>**Acquiring visualisations**</a>

<a id='Ellipsis'></a>
# Ellipsis-Earth Data

Ellipsis-Earth data is always connected to a map. When we refer to map, we mean a single montiroring project. Maps consist of multiple timestamps, each of which contain all data and visualisations of that map acquired at a certain period.

## Standard tiles and predefined polygons

Ellipsis-Earth uses a large set of predefined standard tiles covering the entire globe. In fact the same  covering is used as the webmercator projected open street map on zoomlevel 14. A tile can be uniquely identified by a tile_x and tile_y, identifying the respectieve x and y positions on the map.

On top of these standard tiles each map can have specific predined polygons. These can be everything from agricultural plots to administrative districts. These polygons are grouped into layers. Polygons in the same layer are of the same type (for example all provinces of a country would form a layer).

## Aggregation

Data is always both aggregated to standard tiles as well as to predefined polygons. That is to say spectral indices and the areas of land cover types are always saved for all polygons and tiles. 

In case of predefined polygons the data is actually saved per tile per polygon. This means that in larger polygons you also have a sense of 'where' something occured.

In case of land cover classes,  aggregations are made by taking the total surface area of each class within the aggregated region. In case of spectral indices, means are taken over the whole area.

## Map layers
All timestamps of a map consist of map layers. Each layer contains a certain type of visualization of the timestamp. There are four types of layers:

1.	**Images**: Visualizations of the raw satellite data, for example, RGB, false color or infrared.
2.	**Indices**: Heatmaps of the spectral indices.
3.	**Labels**: Maps in which each land cover type has a certain color.
4.	**Changes**: Maps in which each pixel that underwent a certain type of change is colored red.

## Request types

<a id='thedestination'></a>
Ellipsis supports a large number of requests to our API. We categorise them in the following way:

1. <a href='#login'>**account**</a>: All requests regarding accesing information.<br/>
2. <a href='#metadata'>**metadata**</a>: All requests that gather information about what data is available in a certain map.<br/>
3. <a href='#data/class'>**data/class**</a>: All requests that gather surface areas of land cover classes<br/>
4. <a href='#data/index'>**data/index**</a>: All requests that gather mean spectral indices<br/>
5. <a href='#geometry'>**geometries**</a>: All requests for obtaining geometries of predefined polygons or tiles.
6. <a href='#visual'>**visual**</a>: All requests for obtaining visualisations.<br/>

This categorisation is somewhat, but not completley, reflected in the sections below.

<a id='setup'></a>
# Setting things up
## Required packages

We will be requiring the following python packages. The Requests package allows us to make post and get requests to the API. Pandas, Matplotlib and Geopandas help us to interpret responses as sensible Python objects.The io package allows us to directly interpret a requested PNG, GeoJSON or CSV as a Python object instead of saving it to our local disk first.


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
url = 'https://api.ellipsis-earth.com'
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

The ellipsis API returns data in JSON, CSV and PNG. We can interpret these as Python objects as follows.


```python
#python_dictionary = r.json()

#python_dataFrame = pd.read_csv(StringIO(r.text))

#img = mpimg.imread(BytesIO(response.content))
```

<a id='login'></a>
# Access

## Loging in

Some maps are public and can be accessed without a token. However, if you want to access maps that are private, meaning accessible only to specific people or organizations, you will need to send a token with your request. We can obtain this token by sending a post request with a username and password. In case you are interested in public maps only, you can skip this step.

For this tutorial we will use the account demo_user.

#### account/login


```python
r =requests.post(url + '/account/login',
                 json = {'username':'demo_user', 'password':'demo_user'} )
print(r.text)
```

    {"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRlbW9fdXNlciIsImlhdCI6MTU1Mzk4NjA5MywiZXhwIjoxNTU0MDcyNDkzfQ.f3tYmKEdd7-omZ5MpdrQQpOzCmRBWO6MRBE-XKz3Q_A"}


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

    Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRlbW9fdXNlciIsImlhdCI6MTU1Mzk4NjA5MywiZXhwIjoxNTU0MDcyNDkzfQ.f3tYmKEdd7-omZ5MpdrQQpOzCmRBWO6MRBE-XKz3Q_A


To test whether our token is working, we send a get request with this token to the following authentication testing URL.

#### account/validate


```python
r = requests.get(url + '/account/validate', 
                 headers = {"Authorization":token} )
print(r)
```

    <Response [200]>


We get 200 as a response code, which means that our request was succesfull and therfore our token valid. The token we got will only remain valid for a limited amount of time, the expiration time of a token is currently set to 12 hours. After that you will need to request a new token via the same procedure.

In this tutorial we are using public maps only, so for now, we leave this token for what it is.

## Available maps

To see what maps are available we can make the MyMaps request. In case we sent a token we get both the public maps as well as our personal ones.

Let's request a JSON and print all keys.

#### account/myMaps


```python
r = requests.get(url + '/account/myMaps')

r = r.json()

map_names = [map['name'] for map in r]
map_names
```




    ['Suriname',
     'Belgium Clouds',
     'Chaco Demo',
     'Gran Chaco',
     'Santarem Sentinel2',
     'Yucatan Coast',
     'Netherlands plots']



Seems there are quite some maps available. Lets have a look at the Suriname map. To this end we store the mapId of this map in a variable.


```python
mapId = [map['uuid'] for map in r if map['name'] == 'Suriname'][0]
mapId
```




    '810b31c3-6335-45fe-8120-972e2d1c7da8'



<a id='metadata'></a>
# Acquiring metadata

Now we found the maps we have access to we can start looking at what data is available for these maps. To do this the Ellipsis API supports a couple of metadata requests.

All responses to metadata requests are in JSON format.


We already stored the map id of our map of interest in the variable mapId for convenience. Let's see what timestamps are available for this map.

#### metadata/timestamps


```python
r = requests.post(url + '/metadata/timestamps',
                 json = {"mapId":  mapId })

r = r.json()
r[1:4]
```




    [{'timestampNumber': 1,
      'dateFrom': '2018-02-01T00:00:00.000Z',
      'dateTo': '2018-02-15T00:00:00.000Z'},
     {'timestampNumber': 2,
      'dateFrom': '2018-03-01T00:00:00.000Z',
      'dateTo': '2018-03-15T00:00:00.000Z'},
     {'timestampNumber': 3,
      'dateFrom': '2018-04-01T00:00:00.000Z',
      'dateTo': '2018-04-15T00:00:00.000Z'}]



There seem to be a couple of timestamps available! Let's have a look at what data has been acquired in these timestamps. For this we will be requesting the classes and indices that have been measured in each timestamp.

#### metadata/class


```python
r1 = requests.post(url + '/metadata/classes',
                 json = {"mapId":  mapId })

r1 = r1.json()

r1[1:3]
```




    [{'timestampNumber': 1,
      'modelVersion': 1,
      'classes': [{'name': 'disturbance', 'color': 'ff0000ff'},
       {'name': 'no class', 'color': '00000000'},
       {'name': 'mask', 'color': '00000000'},
       {'name': 'blanc', 'color': '00000000'}]},
     {'timestampNumber': 2,
      'modelVersion': 1,
      'classes': [{'name': 'disturbance', 'color': 'ff0000ff'},
       {'name': 'no class', 'color': '00000000'},
       {'name': 'mask', 'color': '00000000'},
       {'name': 'blanc', 'color': '00000000'}]}]



#### metadata/spectral


```python
r2 = requests.post(url + '/metadata/spectral',
                 json = {"mapId":  mapId })

r2 = r2.json()
r2[1:3]
```




    [{'timestampNumber': 1,
      'indices': [{'name': 'NDVI', 'color': '00ff00ff', 'version': 1},
       {'name': 'NDWI', 'color': '0000ffff', 'version': 1}]},
     {'timestampNumber': 2,
      'indices': [{'name': 'NDVI', 'color': '00ff00ff', 'version': 1},
       {'name': 'NDWI', 'color': '0000ffff', 'version': 1}]}]



For each timestamp we are given the classes or indices that have been measured. We are also given the model version under which conclusions have been drawn and the legend color in the Ellpsis-Earth Viewer.

As classes and spectral indices usually do not change from timstamp to timestamp it makes sense to just print the classes of the first timestamp.


```python
print([ cl['name'] for cl in r1[0]['classes']])
print([ index['name'] for index in r2[0]['indices']])
```

    ['disturbance', 'no class', 'mask', 'blanc']
    ['NDVI', 'NDWI']


Next we could wonder about what type of predefined polygons are available for this map.

#### metadata/polygonLayer


```python
r = requests.post(url + '/metadata/polygonLayers',
                 json = {"mapId":  mapId })

r = r.json()
r[1:3]
```




    [{'timestampNumber': 1,
      'polygonVersion': 0,
      'layers': [{'name': 'Reserve', 'color': 'ff0000ff'},
       {'name': 'Mine', 'color': 'ff0000ff'},
       {'name': 'polygon', 'color': 'ff0000ff'}]},
     {'timestampNumber': 2,
      'polygonVersion': 0,
      'layers': [{'name': 'Reserve', 'color': 'ff0000ff'},
       {'name': 'Mine', 'color': 'ff0000ff'},
       {'name': 'polygon', 'color': 'ff0000ff'}]}]



We get all polygon layers per timestamp. Overall these layers should not change to much over time so it might be sensible to just take the layers of the first timestamp and print them.

In case the processed property of a polygon layer is marked as True, it means that data in the database has been aggregated to these polygons and that we can use the polygon queries to request information. If it is marked as false we must obtain data about these polygon using the customPolygon requests.


```python
[ layer['name'] for layer in r[0]['layers']]
```




    ['Reserve', 'Mine', 'polygon']



Now we know the polygon layers we can request the id's of the polygons within that layer. Based on these id's we can request the available data and geometries of these polygons.
#### metadata/polygons


```python
r = requests.post(url + '/metadata/polygons',
                 json = {"mapId":  mapId, 'layer': 'Mine' })

r = r.json()
r
```




    {'count': 7, 'ids': [1, 2, 3, 4, 5, 6, 7]}



Optionally we can restrict to a bounding box of wgs84 coordinates.


```python
r = requests.post(url + '/metadata/polygons',
                 json = {"mapId":  mapId, 'layer': 'Mine', 'xMin': -55 ,'xMax':-53, 'yMin':4, 'yMax':5})

r = r.json()
r
```




    {'count': 2, 'ids': [1, 4]}



We can do the same thing for the available standard tiles, again we could optionally restrict to a bounding box.
#### metadata/tiles


```python
r = requests.post(url + '/metadata/tiles',
                 json = {"mapId":  mapId})
r = r.json()
r['ids'][1:4]
```




    [{'tileX': 5658, 'tileY': 7971, 'zoom': 14},
     {'tileX': 5658, 'tileY': 7972, 'zoom': 14},
     {'tileX': 5658, 'tileY': 7973, 'zoom': 14}]



Lastly we should request what visualisation layers are available at each timestamp.

#### metadata/tileLayer


```python
r = requests.post(url + '/metadata/tileLayers',
                 json = {"mapId":  mapId })

r = r.json()
r[1:3]
```




    [{'timestampNumber': 1,
      'layers': [{'name': 'ndvi', 'type': 'indices'},
       {'name': 'ndwi', 'type': 'indices'},
       {'name': 'rgb', 'type': 'images'},
       {'name': 'label', 'type': 'labels'}]},
     {'timestampNumber': 2,
      'layers': [{'name': 'label', 'type': 'labels'},
       {'name': 'rgb', 'type': 'images'},
       {'name': 'ndvi', 'type': 'indices'},
       {'name': 'ndwi', 'type': 'indices'}]}]



So we have the following tile layers available:


```python
[ layer['name'] for layer in r[0]['layers']]
```




    ['label', 'rgb', 'ndvi', 'ndwi']



<a id='data'></a>
# Acquiring data

Now we know what data is available in our map we can start requesting actual information from it. In this section we have a look at retrieving tabular data concerining both the classes and the spectral indices. This tabular data is always returned in CSV format.

We can request tabular data for custom polygons defined by the user, predefined polygons and standard tiles.

<a id='data/class'></a>
## Data for classes
As mentioned we can obtain data for the classes based on custom polygons, predefined polygons or standard tiles. We treat these three cases sepretely in the below. The data returned is always expressed as the area of a class in square kilometers.
<a id='data/class/custom'></a>
### For a custom polygon

We can define an arbitrary polygon using a geoJSON as follows:


```python
geometry = {'type': 'FeatureCollection' , 'features':[{ 'properties':{}, 'geometry': {'type': 'Polygon',
    'coordinates': [[[-55,4.1], [-55.5,4.2], [-55.2,4.2],[-52.3,5.15], [-52,5]]]} }]}
```

If we are interested in information about the surface area of landcover classes on this polygon, we have two queries at our disposal.

First off we can obtain the aggregated surface area of each class for this polygon for all timestamps.
#### data/class/cutomPolygon/timestamps


```python
r = requests.post(url + '/data/class/customPolygon/timestamps',
                 json = {"mapId":  mapId, 'geometry': geometry })

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
      <td>124.488598</td>
      <td>10.598003</td>
      <td>1190.759627</td>
      <td>216.817771</td>
      <td>1542.664</td>
      <td>2018-01-01</td>
      <td>2018-01-15</td>
    </tr>
    <tr>
      <th>1</th>
      <td>1</td>
      <td>124.488598</td>
      <td>25.381730</td>
      <td>784.431065</td>
      <td>608.362607</td>
      <td>1542.664</td>
      <td>2018-02-01</td>
      <td>2018-02-15</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2</td>
      <td>124.488598</td>
      <td>27.846718</td>
      <td>689.946937</td>
      <td>700.381747</td>
      <td>1542.664</td>
      <td>2018-03-01</td>
      <td>2018-03-15</td>
    </tr>
    <tr>
      <th>3</th>
      <td>3</td>
      <td>124.488598</td>
      <td>27.846718</td>
      <td>685.075506</td>
      <td>705.253178</td>
      <td>1542.664</td>
      <td>2018-04-01</td>
      <td>2018-04-15</td>
    </tr>
    <tr>
      <th>4</th>
      <td>4</td>
      <td>124.488598</td>
      <td>28.363239</td>
      <td>634.804199</td>
      <td>755.007964</td>
      <td>1542.664</td>
      <td>2018-05-01</td>
      <td>2018-05-15</td>
    </tr>
    <tr>
      <th>5</th>
      <td>5</td>
      <td>124.488598</td>
      <td>30.364747</td>
      <td>537.709792</td>
      <td>850.100863</td>
      <td>1542.664</td>
      <td>2018-06-01</td>
      <td>2018-06-15</td>
    </tr>
    <tr>
      <th>6</th>
      <td>6</td>
      <td>124.488598</td>
      <td>44.976240</td>
      <td>175.924769</td>
      <td>1197.274393</td>
      <td>1542.664</td>
      <td>2018-07-01</td>
      <td>2018-07-15</td>
    </tr>
    <tr>
      <th>7</th>
      <td>7</td>
      <td>124.488598</td>
      <td>49.115222</td>
      <td>64.710806</td>
      <td>1304.349374</td>
      <td>1542.664</td>
      <td>2018-08-01</td>
      <td>2018-08-15</td>
    </tr>
    <tr>
      <th>8</th>
      <td>8</td>
      <td>124.488598</td>
      <td>52.222326</td>
      <td>15.179718</td>
      <td>1350.773358</td>
      <td>1542.664</td>
      <td>2018-09-01</td>
      <td>2018-09-15</td>
    </tr>
    <tr>
      <th>9</th>
      <td>9</td>
      <td>124.488598</td>
      <td>57.116250</td>
      <td>0.372243</td>
      <td>1360.686909</td>
      <td>1542.664</td>
      <td>2018-10-01</td>
      <td>2018-10-15</td>
    </tr>
  </tbody>
</table>
</div>



As these are custom polygons, the given surface areas are not precise. The custom polygon has been fully covered by standard tiles whose surface areas of land cover classes have been summed over.

Secondly, we can get these surface areas per land cover class for each tile covering the custom polygon at a certain timestamp.
#### data/class/customPolygon/tiles


```python
r = requests.post(url + '/data/class/customPolygon/tiles',
                 json = {"mapId":  mapId, 'timestamp':0, 'geometry':geometry })

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
      <th>x</th>
      <th>y</th>
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
      <td>5666</td>
      <td>8000</td>
      <td>0.0</td>
      <td>0.000000</td>
      <td>5.318601</td>
      <td>0.592399</td>
      <td>5.911</td>
    </tr>
    <tr>
      <th>1</th>
      <td>5667</td>
      <td>8000</td>
      <td>0.0</td>
      <td>0.016506</td>
      <td>5.270618</td>
      <td>0.623877</td>
      <td>5.911</td>
    </tr>
    <tr>
      <th>2</th>
      <td>5667</td>
      <td>8001</td>
      <td>0.0</td>
      <td>0.155702</td>
      <td>3.118198</td>
      <td>2.638100</td>
      <td>5.912</td>
    </tr>
    <tr>
      <th>3</th>
      <td>5668</td>
      <td>8000</td>
      <td>0.0</td>
      <td>0.157660</td>
      <td>5.192419</td>
      <td>0.560921</td>
      <td>5.911</td>
    </tr>
    <tr>
      <th>4</th>
      <td>5668</td>
      <td>8001</td>
      <td>0.0</td>
      <td>0.051329</td>
      <td>4.907602</td>
      <td>0.953068</td>
      <td>5.912</td>
    </tr>
    <tr>
      <th>5</th>
      <td>5669</td>
      <td>8000</td>
      <td>0.0</td>
      <td>0.344544</td>
      <td>3.046957</td>
      <td>2.519499</td>
      <td>5.911</td>
    </tr>
    <tr>
      <th>6</th>
      <td>5669</td>
      <td>8001</td>
      <td>0.0</td>
      <td>0.021560</td>
      <td>4.652489</td>
      <td>1.237951</td>
      <td>5.912</td>
    </tr>
    <tr>
      <th>7</th>
      <td>5670</td>
      <td>8000</td>
      <td>0.0</td>
      <td>0.019572</td>
      <td>4.782213</td>
      <td>1.109214</td>
      <td>5.911</td>
    </tr>
    <tr>
      <th>8</th>
      <td>5670</td>
      <td>8001</td>
      <td>0.0</td>
      <td>0.000000</td>
      <td>5.495230</td>
      <td>0.416770</td>
      <td>5.912</td>
    </tr>
    <tr>
      <th>9</th>
      <td>5671</td>
      <td>8000</td>
      <td>0.0</td>
      <td>0.000000</td>
      <td>5.387871</td>
      <td>0.523129</td>
      <td>5.911</td>
    </tr>
  </tbody>
</table>
</div>



<a id='data/class/polygon'></a>
### For predefined polygons

Instead of defining cutom polygons we can also make use of the predefined polygons of this map. As oposed to custom polygons, the land cover areas for these predefined areas are precise.

Thanks to the metadata/polygonIds request we know the id's of the available polygons. Using these id's we can start requesting data concerining these polygons.

If we are interested in the geometry of these polygons we can use the /geometry/polygon request discussed in the <a href='#geometry'>**geometry section.**</a>.

There are three queries available for land cover classes on predefined polygons First of all, we can retrieve polygons at a certain timestamp by their id's.

#### data/class/polygon/polygonIds


```python
r = requests.post(url + '/data/class/polygon/polygonIds',
                 json = {"mapId":  mapId, 'timestamp':1, 'polygonIds': [1,5,4] })
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
      <td>3.581839</td>
      <td>19.940976</td>
      <td>15.135185</td>
      <td>38.658</td>
    </tr>
    <tr>
      <th>1</th>
      <td>4</td>
      <td>0.0</td>
      <td>3.657095</td>
      <td>20.714430</td>
      <td>14.863475</td>
      <td>39.235</td>
    </tr>
    <tr>
      <th>2</th>
      <td>5</td>
      <td>0.0</td>
      <td>0.330621</td>
      <td>0.093677</td>
      <td>0.353702</td>
      <td>0.778</td>
    </tr>
  </tbody>
</table>
</div>



The resulting data frame has a row for each polygon, describing the total area in square kilometers for each particular class.

Secondly, we can request all timestamps for a particular polygon.

#### data/class/polygon/timestamps


```python
r = requests.post(url + '/data/class/polygon/timestamps',
                 json = {"mapId":  mapId, 'polygonId':4})
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
      <td>0.0</td>
      <td>1.449953</td>
      <td>35.478269</td>
      <td>2.306778</td>
      <td>39.235</td>
      <td>2018-01-01</td>
      <td>2018-01-15</td>
    </tr>
    <tr>
      <th>1</th>
      <td>1</td>
      <td>0.0</td>
      <td>3.657095</td>
      <td>20.714430</td>
      <td>14.863475</td>
      <td>39.235</td>
      <td>2018-02-01</td>
      <td>2018-02-15</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2</td>
      <td>0.0</td>
      <td>3.657095</td>
      <td>20.573790</td>
      <td>15.004115</td>
      <td>39.235</td>
      <td>2018-03-01</td>
      <td>2018-03-15</td>
    </tr>
    <tr>
      <th>3</th>
      <td>3</td>
      <td>0.0</td>
      <td>3.657095</td>
      <td>20.573790</td>
      <td>15.004115</td>
      <td>39.235</td>
      <td>2018-04-01</td>
      <td>2018-04-15</td>
    </tr>
    <tr>
      <th>4</th>
      <td>4</td>
      <td>0.0</td>
      <td>3.657095</td>
      <td>20.573790</td>
      <td>15.004115</td>
      <td>39.235</td>
      <td>2018-05-01</td>
      <td>2018-05-15</td>
    </tr>
    <tr>
      <th>5</th>
      <td>5</td>
      <td>0.0</td>
      <td>4.014701</td>
      <td>15.391037</td>
      <td>19.829262</td>
      <td>39.235</td>
      <td>2018-06-01</td>
      <td>2018-06-15</td>
    </tr>
    <tr>
      <th>6</th>
      <td>6</td>
      <td>0.0</td>
      <td>5.568670</td>
      <td>1.303989</td>
      <td>32.362341</td>
      <td>39.235</td>
      <td>2018-07-01</td>
      <td>2018-07-15</td>
    </tr>
    <tr>
      <th>7</th>
      <td>7</td>
      <td>0.0</td>
      <td>5.624018</td>
      <td>0.041097</td>
      <td>33.569885</td>
      <td>39.235</td>
      <td>2018-08-01</td>
      <td>2018-08-15</td>
    </tr>
    <tr>
      <th>8</th>
      <td>8</td>
      <td>0.0</td>
      <td>5.758523</td>
      <td>0.000000</td>
      <td>33.476477</td>
      <td>39.235</td>
      <td>2018-09-01</td>
      <td>2018-09-15</td>
    </tr>
    <tr>
      <th>9</th>
      <td>9</td>
      <td>0.0</td>
      <td>6.076213</td>
      <td>0.000000</td>
      <td>33.158787</td>
      <td>39.235</td>
      <td>2018-10-01</td>
      <td>2018-10-15</td>
    </tr>
    <tr>
      <th>10</th>
      <td>10</td>
      <td>0.0</td>
      <td>6.297776</td>
      <td>0.000000</td>
      <td>32.937224</td>
      <td>39.235</td>
      <td>2018-11-01</td>
      <td>2018-11-15</td>
    </tr>
    <tr>
      <th>11</th>
      <td>11</td>
      <td>0.0</td>
      <td>6.219074</td>
      <td>0.000000</td>
      <td>33.015926</td>
      <td>39.235</td>
      <td>2018-12-01</td>
      <td>2018-12-15</td>
    </tr>
  </tbody>
</table>
</div>



This time each row belongs to a certain timestamp of the requested polygon.

Lastly, we can request the area of the classes for each tile within a certain polygon on a certain timestamp.
#### data/class/polygon/tiles


```python
r = requests.post(url + '/data/class/polygon/tiles',
                 json = {"mapId":  mapId, 'timestamp':5, 'polygonId':3 })

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
      <th>tileX</th>
      <th>tileY</th>
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
      <td>5691</td>
      <td>7959</td>
      <td>0.0</td>
      <td>0.058146</td>
      <td>0.525839</td>
      <td>0.135015</td>
      <td>0.719</td>
    </tr>
    <tr>
      <th>1</th>
      <td>5691</td>
      <td>7960</td>
      <td>0.0</td>
      <td>0.481033</td>
      <td>0.135625</td>
      <td>0.495342</td>
      <td>1.112</td>
    </tr>
    <tr>
      <th>2</th>
      <td>5692</td>
      <td>7959</td>
      <td>0.0</td>
      <td>0.063063</td>
      <td>1.079176</td>
      <td>0.393761</td>
      <td>1.536</td>
    </tr>
    <tr>
      <th>3</th>
      <td>5692</td>
      <td>7960</td>
      <td>0.0</td>
      <td>2.385504</td>
      <td>0.131453</td>
      <td>2.710043</td>
      <td>5.227</td>
    </tr>
    <tr>
      <th>4</th>
      <td>5692</td>
      <td>7961</td>
      <td>0.0</td>
      <td>0.083273</td>
      <td>0.000000</td>
      <td>0.212727</td>
      <td>0.296</td>
    </tr>
    <tr>
      <th>5</th>
      <td>5693</td>
      <td>7960</td>
      <td>0.0</td>
      <td>0.295953</td>
      <td>0.007021</td>
      <td>0.762026</td>
      <td>1.065</td>
    </tr>
  </tbody>
</table>
</div>



This time we receive all information per standard tile. The standard tiles are intersected with the polygon, so they can greatly vary in size.

<a id='data/class/tile'></a>
## For standard tiles
The predefined polygons may vary from map to map, but in each and every map data is aggregated to the same standard Web Mercator tiles that cover the globe. These tiles can be uniquely identified by their tileX and tileY position. Using the metadata/tileIds request you can see what tiles are available.

If we are interested in the geometry of these tiles we can use the /geometry/polygon request discussed in the <a href='#geometry'>**geometry section.**</a>.

There are two requests we can make for standard tiles. First off we can request tiles for a timestamp using their id's.

#### data/class/tile/tileIds


```python
r = requests.post(url + '/data/class/tile/tileIds',
                 json = {"mapId":  mapId, 'timestamp':3, 'tileIds': [{'tileX':5691, 'tileY':7959},{'tileX':5691,'tileY':7960, 'zoom':14},{'tileX':5692,'tileY':7959, 'zoom':14}]})

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
      <td>5691</td>
      <td>7959</td>
      <td>0.0</td>
      <td>0.096370</td>
      <td>5.255255</td>
      <td>0.545375</td>
      <td>5.897</td>
    </tr>
    <tr>
      <th>1</th>
      <td>5691</td>
      <td>7960</td>
      <td>0.0</td>
      <td>0.587756</td>
      <td>1.956099</td>
      <td>3.353145</td>
      <td>5.897</td>
    </tr>
    <tr>
      <th>2</th>
      <td>5692</td>
      <td>7959</td>
      <td>0.0</td>
      <td>0.136861</td>
      <td>3.903199</td>
      <td>1.856940</td>
      <td>5.897</td>
    </tr>
  </tbody>
</table>
</div>



Secondly we can request all timestamps for a specific tile

#### data/class/tile/timestamps


```python
r = requests.post(url + '/data/class/tile/timestamps',
                 json = {"mapId":  mapId, 'tileX':5658, 'tileY': 7970, 'zoom':14})

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
      <th>timestamp</th>
      <th>blanc</th>
      <th>disturbance</th>
      <th>mask</th>
      <th>no class</th>
      <th>area</th>
      <th>date_to</th>
      <th>date_from</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>0</td>
      <td>5.364169</td>
      <td>0.0</td>
      <td>0.374125</td>
      <td>0.162706</td>
      <td>5.901</td>
      <td>2018-01-15</td>
      <td>2018-01-01</td>
    </tr>
    <tr>
      <th>1</th>
      <td>1</td>
      <td>5.364169</td>
      <td>0.0</td>
      <td>0.273008</td>
      <td>0.263823</td>
      <td>5.901</td>
      <td>2018-02-15</td>
      <td>2018-02-01</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2</td>
      <td>5.364169</td>
      <td>0.0</td>
      <td>0.273008</td>
      <td>0.263823</td>
      <td>5.901</td>
      <td>2018-03-15</td>
      <td>2018-03-01</td>
    </tr>
    <tr>
      <th>3</th>
      <td>3</td>
      <td>5.364169</td>
      <td>0.0</td>
      <td>0.273008</td>
      <td>0.263823</td>
      <td>5.901</td>
      <td>2018-04-15</td>
      <td>2018-04-01</td>
    </tr>
    <tr>
      <th>4</th>
      <td>4</td>
      <td>5.364169</td>
      <td>0.0</td>
      <td>0.273008</td>
      <td>0.263823</td>
      <td>5.901</td>
      <td>2018-05-15</td>
      <td>2018-05-01</td>
    </tr>
    <tr>
      <th>5</th>
      <td>5</td>
      <td>5.364169</td>
      <td>0.0</td>
      <td>0.273008</td>
      <td>0.263823</td>
      <td>5.901</td>
      <td>2018-06-15</td>
      <td>2018-06-01</td>
    </tr>
    <tr>
      <th>6</th>
      <td>6</td>
      <td>5.364169</td>
      <td>0.0</td>
      <td>0.000000</td>
      <td>0.536831</td>
      <td>5.901</td>
      <td>2018-07-15</td>
      <td>2018-07-01</td>
    </tr>
    <tr>
      <th>7</th>
      <td>7</td>
      <td>5.364169</td>
      <td>0.0</td>
      <td>0.000000</td>
      <td>0.536831</td>
      <td>5.901</td>
      <td>2018-08-15</td>
      <td>2018-08-01</td>
    </tr>
    <tr>
      <th>8</th>
      <td>8</td>
      <td>5.364169</td>
      <td>0.0</td>
      <td>0.000000</td>
      <td>0.536831</td>
      <td>5.901</td>
      <td>2018-09-15</td>
      <td>2018-09-01</td>
    </tr>
    <tr>
      <th>9</th>
      <td>9</td>
      <td>5.364169</td>
      <td>0.0</td>
      <td>0.000000</td>
      <td>0.536831</td>
      <td>5.901</td>
      <td>2018-10-15</td>
      <td>2018-10-01</td>
    </tr>
  </tbody>
</table>
</div>



<a id='data/index'></a>
## For data of spectral indices
In the same way as for the classes we can obtain data concerning spectral indices based on custom polygons, predefined polygons or standard tiles. The situation this time is however a little bit more nuanced. An aggregated spectral index is always the mean spectral index of all pixels of a certain land cover class within a given geometry that were not covered by clouds.

For this reason you always need to specify the class over which you want to have the mean spectral indices. (For example you can restrict to the class forest or agriculture). In some maps indices are not save per class, in this case you should specify the class parameters as 'all classes'.

As all clouded pixels are simply discarded there is always a cloudcover column in the table that represtents the percentatge of pixels that have been left out.

<a id='data/index/custom'></a>
### For a custom polygon

We start out with specifying some polygon that we might be interested in.


```python
geometry = {'type': 'FeatureCollection' , 'features':[{ 'properties':{}, 'geometry': {'type': 'Polygon',
    'coordinates': [[[-55,4.1], [-55.5,4.2], [-55.2,4.2],[-52.3,5.15], [-52,5]]]} }]}
```

Now let's request the mean of all spectral indices of the standard tiles intersecting our polygon.

#### data/spectral/customPolygon/timestamps


```python
r = requests.post(url + '/data/spectral/customPolygon/timestamps',
                 json = {"mapId":  mapId, 'class': 'disturbance', 'geometry': geometry })

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
      <th>timestamp</th>
      <th>NDVI</th>
      <th>NDWI</th>
      <th>cloud_cover</th>
      <th>area</th>
      <th>date_from</th>
      <th>date_to</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>0</td>
      <td>0.993101</td>
      <td>0.478672</td>
      <td>0.852675</td>
      <td>1542.664</td>
      <td>2018-01-01</td>
      <td>2018-01-15</td>
    </tr>
    <tr>
      <th>1</th>
      <td>1</td>
      <td>0.962001</td>
      <td>0.469612</td>
      <td>0.683103</td>
      <td>1542.664</td>
      <td>2018-02-01</td>
      <td>2018-02-15</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2</td>
      <td>0.476266</td>
      <td>0.218599</td>
      <td>0.898113</td>
      <td>1542.664</td>
      <td>2018-03-01</td>
      <td>2018-03-15</td>
    </tr>
    <tr>
      <th>3</th>
      <td>3</td>
      <td>0.020386</td>
      <td>-0.007053</td>
      <td>0.992451</td>
      <td>1542.664</td>
      <td>2018-04-01</td>
      <td>2018-04-15</td>
    </tr>
    <tr>
      <th>4</th>
      <td>4</td>
      <td>0.337877</td>
      <td>0.092783</td>
      <td>0.936130</td>
      <td>1542.664</td>
      <td>2018-05-01</td>
      <td>2018-05-15</td>
    </tr>
    <tr>
      <th>5</th>
      <td>5</td>
      <td>0.527262</td>
      <td>0.177563</td>
      <td>0.877889</td>
      <td>1542.664</td>
      <td>2018-06-01</td>
      <td>2018-06-15</td>
    </tr>
    <tr>
      <th>6</th>
      <td>6</td>
      <td>0.971997</td>
      <td>0.413940</td>
      <td>0.403466</td>
      <td>1542.664</td>
      <td>2018-07-01</td>
      <td>2018-07-15</td>
    </tr>
    <tr>
      <th>7</th>
      <td>7</td>
      <td>0.989275</td>
      <td>0.388528</td>
      <td>0.387444</td>
      <td>1542.664</td>
      <td>2018-08-01</td>
      <td>2018-08-15</td>
    </tr>
    <tr>
      <th>8</th>
      <td>8</td>
      <td>0.997145</td>
      <td>0.437617</td>
      <td>0.219172</td>
      <td>1542.664</td>
      <td>2018-09-01</td>
      <td>2018-09-15</td>
    </tr>
    <tr>
      <th>9</th>
      <td>9</td>
      <td>0.996576</td>
      <td>0.372065</td>
      <td>0.130757</td>
      <td>1542.664</td>
      <td>2018-10-01</td>
      <td>2018-10-15</td>
    </tr>
  </tbody>
</table>
</div>



Next we request the spectral indices for all tiles intersecting with our polygon for a certain fixed timestamp.

#### data/spectral/customPolygon/tiles


```python
r = requests.post(url + '/data/spectral/customPolygon/tiles',
                 json = {"mapId":  mapId, 'timestamp': 1, 'class': 'disturbance', 'geometry': geometry })

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
      <th>NDVI</th>
      <th>NDWI</th>
      <th>cloud_cover</th>
      <th>area</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>5666</td>
      <td>8000</td>
      <td>1.000</td>
      <td>0.759</td>
      <td>0.77</td>
      <td>5.911</td>
    </tr>
    <tr>
      <th>1</th>
      <td>5667</td>
      <td>8000</td>
      <td>1.000</td>
      <td>0.654</td>
      <td>0.71</td>
      <td>5.911</td>
    </tr>
    <tr>
      <th>2</th>
      <td>5667</td>
      <td>8001</td>
      <td>0.616</td>
      <td>0.449</td>
      <td>0.93</td>
      <td>5.912</td>
    </tr>
    <tr>
      <th>3</th>
      <td>5668</td>
      <td>8000</td>
      <td>1.000</td>
      <td>0.696</td>
      <td>0.65</td>
      <td>5.911</td>
    </tr>
    <tr>
      <th>4</th>
      <td>5668</td>
      <td>8001</td>
      <td>0.997</td>
      <td>0.768</td>
      <td>0.67</td>
      <td>5.912</td>
    </tr>
    <tr>
      <th>5</th>
      <td>5669</td>
      <td>8000</td>
      <td>0.998</td>
      <td>0.596</td>
      <td>0.64</td>
      <td>5.911</td>
    </tr>
    <tr>
      <th>6</th>
      <td>5669</td>
      <td>8001</td>
      <td>0.976</td>
      <td>0.708</td>
      <td>0.34</td>
      <td>5.912</td>
    </tr>
    <tr>
      <th>7</th>
      <td>5670</td>
      <td>8000</td>
      <td>1.000</td>
      <td>0.730</td>
      <td>0.27</td>
      <td>5.911</td>
    </tr>
    <tr>
      <th>8</th>
      <td>5670</td>
      <td>8001</td>
      <td>1.000</td>
      <td>0.692</td>
      <td>0.87</td>
      <td>5.912</td>
    </tr>
    <tr>
      <th>9</th>
      <td>5687</td>
      <td>7997</td>
      <td>1.000</td>
      <td>0.609</td>
      <td>0.79</td>
      <td>5.910</td>
    </tr>
  </tbody>
</table>
</div>



<a id='data/index/polygon'></a>
### For predefined polygons

Similar to the case of the classes there are three requests we can make in case of predefined polygons.

Again see <a href='#geometry'>**geometry section**</a> in case you would like to retrieve the geometries of these polygons. 

Let's start with requesting all spectral indices for some polygons at a certain timestamp.
#### data/spectral/polygon/polygonIds


```python
r = requests.post(url + '/data/spectral/polygon/polygonIds',
                 json = {"mapId":  mapId, 'timestamp':1, 'polygonIds': [1,5,4], 'class': 'disturbance' })
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
      <th>NDVI</th>
      <th>NDWI</th>
      <th>cloud_cover</th>
      <th>area</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>1</td>
      <td>0.989887</td>
      <td>0.505977</td>
      <td>0.529641</td>
      <td>38.658</td>
    </tr>
    <tr>
      <th>1</th>
      <td>4</td>
      <td>0.995728</td>
      <td>0.468509</td>
      <td>0.593817</td>
      <td>39.235</td>
    </tr>
    <tr>
      <th>2</th>
      <td>5</td>
      <td>1.000000</td>
      <td>0.632000</td>
      <td>0.120000</td>
      <td>0.778</td>
    </tr>
  </tbody>
</table>
</div>



In the same manner we can request all timestamps for some particular polygon.

#### data/spectral/polygon/timestamps


```python
r = requests.post(url + '/data/spectral/polygon/timestamps',
                 json = {"mapId":  mapId, 'polygonId': 4, 'class': 'disturbance'})

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
      <th>timestamp</th>
      <th>NDVI</th>
      <th>NDWI</th>
      <th>cloud_cover</th>
      <th>area</th>
      <th>date_from</th>
      <th>date_to</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>0</td>
      <td>0.970152</td>
      <td>0.330398</td>
      <td>0.905335</td>
      <td>39.235</td>
      <td>2018-01-01</td>
      <td>2018-01-15</td>
    </tr>
    <tr>
      <th>1</th>
      <td>1</td>
      <td>0.995728</td>
      <td>0.468509</td>
      <td>0.593817</td>
      <td>39.235</td>
      <td>2018-02-01</td>
      <td>2018-02-15</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.996004</td>
      <td>39.235</td>
      <td>2018-03-01</td>
      <td>2018-03-15</td>
    </tr>
    <tr>
      <th>3</th>
      <td>3</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>1.000000</td>
      <td>39.235</td>
      <td>2018-04-01</td>
      <td>2018-04-15</td>
    </tr>
    <tr>
      <th>4</th>
      <td>4</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>1.000000</td>
      <td>39.235</td>
      <td>2018-05-01</td>
      <td>2018-05-15</td>
    </tr>
    <tr>
      <th>5</th>
      <td>5</td>
      <td>0.795593</td>
      <td>0.231363</td>
      <td>0.660828</td>
      <td>39.235</td>
      <td>2018-06-01</td>
      <td>2018-06-15</td>
    </tr>
    <tr>
      <th>6</th>
      <td>6</td>
      <td>0.997588</td>
      <td>0.403357</td>
      <td>0.053883</td>
      <td>39.235</td>
      <td>2018-07-01</td>
      <td>2018-07-15</td>
    </tr>
    <tr>
      <th>7</th>
      <td>7</td>
      <td>1.000000</td>
      <td>0.363662</td>
      <td>0.038336</td>
      <td>39.235</td>
      <td>2018-08-01</td>
      <td>2018-08-15</td>
    </tr>
    <tr>
      <th>8</th>
      <td>8</td>
      <td>1.000000</td>
      <td>0.408166</td>
      <td>0.003560</td>
      <td>39.235</td>
      <td>2018-09-01</td>
      <td>2018-09-15</td>
    </tr>
    <tr>
      <th>9</th>
      <td>9</td>
      <td>0.999556</td>
      <td>0.339575</td>
      <td>0.039668</td>
      <td>39.235</td>
      <td>2018-10-01</td>
      <td>2018-10-15</td>
    </tr>
  </tbody>
</table>
</div>



We get highly similar information, only this time per timestamp for the particular polygon.

Lastly we can retrieve the information per standard tile.
#### data/spectral/polygon/tiles


```python
r = requests.post(url + '/data/spectral/polygon/tiles',
                 json = {"mapId":  mapId, 'timestamp':2, 'polygonId': 1, 'class': 'disturbance'})

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
      <th>NDVI</th>
      <th>NDWI</th>
      <th>cloud_cover</th>
      <th>area</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>5704</td>
      <td>7971</td>
      <td>1.0</td>
      <td>0.387</td>
      <td>0.70</td>
      <td>3.304</td>
    </tr>
    <tr>
      <th>1</th>
      <td>5705</td>
      <td>7971</td>
      <td>1.0</td>
      <td>0.386</td>
      <td>0.42</td>
      <td>4.308</td>
    </tr>
    <tr>
      <th>2</th>
      <td>5706</td>
      <td>7970</td>
      <td>1.0</td>
      <td>0.659</td>
      <td>0.95</td>
      <td>2.034</td>
    </tr>
  </tbody>
</table>
</div>



Only the section of the tile intersected with the field is considered. For this reason the area of each tile can vary.

<a id='data/index/tile'></a>
### For standard tiles
Predefined polygons can vary from map to map. But data is always aggregated to the same standard Web Mercator tiles. 

In case you are intersted in the geometry of these tiles, have a look at the <a href='#geometry'>**geometry section.**</a>.

There are two queries available to retrieve data about these tiles. First off we can simply request all tiles for a certain timestamp.
#### data/spectral/tile/tileIds


```python
r = requests.post(url + '/data/spectral/tile/tileIds',
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
      <td>0.828</td>
      <td>0.455</td>
      <td>0.98</td>
      <td>5.897</td>
    </tr>
    <tr>
      <th>1</th>
      <td>5691</td>
      <td>7960</td>
      <td>1.000</td>
      <td>0.364</td>
      <td>0.97</td>
      <td>5.897</td>
    </tr>
    <tr>
      <th>2</th>
      <td>5692</td>
      <td>7959</td>
      <td>1.000</td>
      <td>0.648</td>
      <td>0.92</td>
      <td>5.897</td>
    </tr>
  </tbody>
</table>
</div>



Of course we can also request all timestamps for a specific tile.
#### data/spectral/tile/timestamps


```python
r = requests.post(url + '/data/spectral/tile/timestamps',
                 json = {"mapId":  mapId, 'tileX': 5659, 'tileY':7974, 'zoom':14, 'class': 'disturbance' })

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
      <th>timestamp</th>
      <th>NDVI</th>
      <th>NDWI</th>
      <th>area</th>
      <th>date_from</th>
      <th>date_to</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>1</td>
      <td>1.0</td>
      <td>0.660</td>
      <td>5.902</td>
      <td>2018-02-01</td>
      <td>2018-02-15</td>
    </tr>
    <tr>
      <th>1</th>
      <td>2</td>
      <td>1.0</td>
      <td>0.659</td>
      <td>5.902</td>
      <td>2018-03-01</td>
      <td>2018-03-15</td>
    </tr>
    <tr>
      <th>2</th>
      <td>7</td>
      <td>1.0</td>
      <td>0.569</td>
      <td>5.902</td>
      <td>2018-08-01</td>
      <td>2018-08-15</td>
    </tr>
    <tr>
      <th>3</th>
      <td>9</td>
      <td>1.0</td>
      <td>0.511</td>
      <td>5.902</td>
      <td>2018-10-01</td>
      <td>2018-10-15</td>
    </tr>
    <tr>
      <th>4</th>
      <td>10</td>
      <td>1.0</td>
      <td>0.506</td>
      <td>5.902</td>
      <td>2018-11-01</td>
      <td>2018-11-15</td>
    </tr>
  </tbody>
</table>
</div>



<a id='geometry'></a>
# Acquiring geometries
In the previous section we saw how we could retrieve data aggregated to predefined polygons and standard tiles. Of course it is also important to know the geometries of these polygons and tiles. These geometries can be requested using a list of id's. The geometries are always returend as GeoJSON.

We can request the geometries and features of predefined polygons as follows.
#### geometry/polygons


```python
r = requests.post(url + '/geometry/polygons',
                 json = {"mapId":  mapId, 'polygonIds':[1,2]})
r.json()
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
      <td>POLYGON Z ((-54.8214295 5.1544714 0, -54.81791...</td>
      <td>2</td>
      <td>Mine</td>
      <td>Mine2</td>
    </tr>
  </tbody>
</table>
</div>




![png](output_115_1.png)


We can request standard tiles by specifying their tileX and tileY coordinates.
#### geometry/tiles


```python
r = requests.post(url + '/geometry/tiles',
                 json = {"mapId":  mapId, 'tileIds':[{'tileX':5704,'tileY':7971, 'zoom':14}, {'tileX':5705,'tileY':7973, 'zoom':14}]})

r  = gpd.GeoDataFrame.from_features(r.json()['features'])
r.plot()
```




    <matplotlib.axes._subplots.AxesSubplot at 0x7ff852b821d0>




![png](output_117_1.png)


<a id='visual'></a>
# Acquiring visualisations

Aside from raw data it is of course also handy to have visualisations. We can obtain these visualisations for all tile layers that we found in the metadata section.

It is very easy to obtain an image of an area. You can simply specify the boudning box coordinates of your area of interest, the timerange over which you want to mosaic and the layer that you want to visualise.
#### visual/bounds


```python
r = requests.post(url + '/visual/bounds',
                 json = {"mapId":  mapId, 'timestampMin':1, 'timestampMax':8, 'layerName':'rgb', 'xMin': -55 ,'xMax':-53, 'yMin':4, 'yMax':5 })


img = mpimg.imread(BytesIO(r.content))
plt.imshow(img)
```




    <matplotlib.image.AxesImage at 0x7ff8564448d0>




![png](output_120_1.png)


The API always makes sure that the resolution of the returned image is addapted to your level of zoom. It prevents the largest dimension of your image to be over 2048 pixels.

A response image is in PNG format and has four channels. Red, green, blue and transperant.

The API mosaics the images from more recent to less recent. In case no cloudless footage is found that area of the map will rendered as transparent.
