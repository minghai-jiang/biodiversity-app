
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
    6.2 <a href='#data/index'> *Data for measurements*</a><br/>
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

Data is always both aggregated to standard tiles as well as to predefined polygons. That is to say measurements and the areas of land cover types are always saved for all polygons and tiles. 

In case of predefined polygons the data is actually saved per tile per polygon. This means that in larger polygons you also have a sense of 'where' something occured.

In case of land cover classes,  aggregations are made by taking the total surface area of each class within the aggregated region. In case of measurements, means are taken over the whole area.

## Map layers
All timestamps of a map consist of map layers. Each layer contains a certain type of visualization of the timestamp. There are four types of layers:

1.	**Images**: Visualizations of the raw satellite data, for example, RGB, false color or infrared.
2.	**Measurements**: Heatmaps of the measurements.
3.	**Labels**: Maps in which each land cover type has a certain color.
4.	**Changes**: Maps in which each pixel that underwent a certain type of change is colored red.

## Request types

<a id='thedestination'></a>
Ellipsis supports a large number of requests to our API. We categorise them in the following way:

1. <a href='#login'>**account**</a>: All requests regarding accesing information.<br/>
2. <a href='#metadata'>**metadata**</a>: All requests that gather information about what data is available in a certain map.<br/>
3. <a href='#data/class'>**data/class**</a>: All requests that gather surface areas of land cover classes<br/>
4. <a href='#data/measurement'>**data/measurement**</a>: All requests that gather mean measurements<br/>
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

    {"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRlbW9fdXNlciIsImlhdCI6MTU2MDQzODIzNCwiZXhwIjoxNTYwNTI0NjM0fQ.uUJiEaG-9OyMSLRknqRRcXStWM4ku1ewQ-kwauMBldg"}


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

    Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRlbW9fdXNlciIsImlhdCI6MTU2MDQzODIzNCwiZXhwIjoxNTYwNTI0NjM0fQ.uUJiEaG-9OyMSLRknqRRcXStWM4ku1ewQ-kwauMBldg


To test whether our token is working, we send a get request with this token to the following authentication testing URL.

#### account/validate


```python
r = requests.get(url + '/account/validate', 
                 headers = {"Authorization":token} )
print(r)
```

    <Response [404]>


We get 200 as a response code, which means that our request was succesfull and therfore our token valid. The token we got will only remain valid for a limited amount of time, the expiration time of a token is currently set to 12 hours. After that you will need to request a new token via the same procedure.

In this tutorial we are using public maps only, so for now, we leave this token for what it is.

## Available maps

To see what maps are available we can make the MyMaps request. In case we sent a token we get both the public maps as well as our personal ones.

Let's request a JSON and print all keys.

#### account/myMaps


```python
r = requests.get(url + '/account/myMaps',headers = {"Authorization":token})

r = r.json()

map_names = [map['name'] for map in r]
map_names
```




    ['Suriname',
     'Belgium Clouds',
     'Chaco Demo',
     'Cartagena',
     'LNV boomranden',
     'LNV radar',
     'verkeer Rotterdam',
     'WNF biodiversiteitsmonitor',
     'Insar Japan',
     'Gran Chaco',
     'LNV maai en oogst kaart',
     'Verzakking Groningen']



Seems there are quite some maps available. Lets have a look at the Suriname map. To this end we store the mapId of this map in a variable.


```python
mapId = [map['uuid'] for map in r if map['name'] == 'Verzakking Groningen'][0]
mapId
```




    'bceac3e8-40a1-4476-bd30-c3d901448c2e'



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
      'classes': [{'name': 'mask', 'color': 'ffffffff'},
       {'name': 'disturbance', 'color': 'ff0000ff'},
       {'name': 'no class', 'color': '00000000'},
       {'name': 'blanc', 'color': '00000000'}]},
     {'timestampNumber': 2,
      'modelVersion': 1,
      'classes': [{'name': 'mask', 'color': 'ffffffff'},
       {'name': 'disturbance', 'color': 'ff0000ff'},
       {'name': 'no class', 'color': '00000000'},
       {'name': 'blanc', 'color': '00000000'}]}]



#### metadata/measurements


```python
r2 = requests.post(url + '/metadata/measurements',
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

As classes and measurements usually do not change from timstamp to timestamp it makes sense to just print the classes of the first timestamp.


```python
print([ cl['name'] for cl in r1[0]['classes']])
print([ index['name'] for index in r2[0]['indices']])
```

    ['mask', 'disturbance', 'no class', 'blanc']
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
      'layers': [{'name': 'province',
        'color': 'ffff00ff',
        'hasAggregatedData': False},
       {'name': 'polygon', 'color': 'ffff00ff', 'hasAggregatedData': True},
       {'name': 'Reserve', 'color': 'ffff00ff', 'hasAggregatedData': True},
       {'name': 'Mine', 'color': 'ffff00ff', 'hasAggregatedData': True}]},
     {'timestampNumber': 2,
      'polygonVersion': 0,
      'layers': [{'name': 'province',
        'color': 'ffff00ff',
        'hasAggregatedData': False},
       {'name': 'polygon', 'color': 'ffff00ff', 'hasAggregatedData': True},
       {'name': 'Reserve', 'color': 'ffff00ff', 'hasAggregatedData': True},
       {'name': 'Mine', 'color': 'ffff00ff', 'hasAggregatedData': True}]}]



We get all polygon layers per timestamp. Overall these layers should not change to much over time so it might be sensible to just take the layers of the first timestamp and print them.

In case the hasAggregatedData property of a polygon layer is marked as True, it means that data in the database has been aggregated to these polygons and that we can use the polygon queries to request information. If it is marked as false we must obtain data about these polygon using the customPolygon requests.


```python
[ layer['name'] for layer in r[0]['layers']]
```




    ['province', 'polygon', 'Reserve', 'Mine']



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

Now we know what data is available in our map we can start requesting actual information from it. In this section we have a look at retrieving tabular data concerining both the classes and the measurements. This tabular data is always returned in CSV format.

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
    <tr>
      <th>5</th>
      <td>5</td>
      <td>124.489</td>
      <td>30.365</td>
      <td>537.710</td>
      <td>850.101</td>
      <td>1542.664</td>
      <td>2018-06-01</td>
      <td>2018-06-15</td>
    </tr>
    <tr>
      <th>6</th>
      <td>6</td>
      <td>124.489</td>
      <td>44.976</td>
      <td>175.925</td>
      <td>1197.274</td>
      <td>1542.664</td>
      <td>2018-07-01</td>
      <td>2018-07-15</td>
    </tr>
    <tr>
      <th>7</th>
      <td>7</td>
      <td>124.489</td>
      <td>49.115</td>
      <td>64.711</td>
      <td>1304.349</td>
      <td>1542.664</td>
      <td>2018-08-01</td>
      <td>2018-08-15</td>
    </tr>
    <tr>
      <th>8</th>
      <td>8</td>
      <td>124.489</td>
      <td>52.222</td>
      <td>15.180</td>
      <td>1350.773</td>
      <td>1542.664</td>
      <td>2018-09-01</td>
      <td>2018-09-15</td>
    </tr>
    <tr>
      <th>9</th>
      <td>9</td>
      <td>124.489</td>
      <td>57.116</td>
      <td>0.372</td>
      <td>1360.687</td>
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
      <th>tileX</th>
      <th>tileY</th>
      <th>zoom</th>
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
      <td>14</td>
      <td>0.0</td>
      <td>0.000</td>
      <td>5.319</td>
      <td>0.592</td>
      <td>5.911</td>
    </tr>
    <tr>
      <th>1</th>
      <td>5667</td>
      <td>8000</td>
      <td>14</td>
      <td>0.0</td>
      <td>0.017</td>
      <td>5.271</td>
      <td>0.624</td>
      <td>5.911</td>
    </tr>
    <tr>
      <th>2</th>
      <td>5667</td>
      <td>8001</td>
      <td>14</td>
      <td>0.0</td>
      <td>0.156</td>
      <td>3.118</td>
      <td>2.638</td>
      <td>5.912</td>
    </tr>
    <tr>
      <th>3</th>
      <td>5668</td>
      <td>8000</td>
      <td>14</td>
      <td>0.0</td>
      <td>0.158</td>
      <td>5.192</td>
      <td>0.561</td>
      <td>5.911</td>
    </tr>
    <tr>
      <th>4</th>
      <td>5668</td>
      <td>8001</td>
      <td>14</td>
      <td>0.0</td>
      <td>0.051</td>
      <td>4.908</td>
      <td>0.953</td>
      <td>5.912</td>
    </tr>
    <tr>
      <th>5</th>
      <td>5669</td>
      <td>8000</td>
      <td>14</td>
      <td>0.0</td>
      <td>0.345</td>
      <td>3.047</td>
      <td>2.519</td>
      <td>5.911</td>
    </tr>
    <tr>
      <th>6</th>
      <td>5669</td>
      <td>8001</td>
      <td>14</td>
      <td>0.0</td>
      <td>0.022</td>
      <td>4.652</td>
      <td>1.238</td>
      <td>5.912</td>
    </tr>
    <tr>
      <th>7</th>
      <td>5670</td>
      <td>8000</td>
      <td>14</td>
      <td>0.0</td>
      <td>0.020</td>
      <td>4.782</td>
      <td>1.109</td>
      <td>5.911</td>
    </tr>
    <tr>
      <th>8</th>
      <td>5670</td>
      <td>8001</td>
      <td>14</td>
      <td>0.0</td>
      <td>0.000</td>
      <td>5.495</td>
      <td>0.417</td>
      <td>5.912</td>
    </tr>
    <tr>
      <th>9</th>
      <td>5671</td>
      <td>8000</td>
      <td>14</td>
      <td>0.0</td>
      <td>0.000</td>
      <td>5.388</td>
      <td>0.523</td>
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
                 json = {"mapId":  mapId, 'timestamp':6, 'polygonIds': [1] })
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
  </tbody>
</table>
</div>



The resulting data frame has a row for each polygon, describing the total area in square kilometers for each particular class.

Secondly, we can request all timestamps for a particular polygon.

#### data/class/polygon/timestamps


```python
r = requests.post(url + '/data/class/polygon/timestamps',
                 json = {"mapId":  mapId, 'polygonId':3})
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
      <td>0.978</td>
      <td>7.760</td>
      <td>1.217</td>
      <td>9.955</td>
      <td>2018-01-01</td>
      <td>2018-01-15</td>
    </tr>
    <tr>
      <th>1</th>
      <td>1</td>
      <td>0.0</td>
      <td>3.195</td>
      <td>2.914</td>
      <td>3.846</td>
      <td>9.955</td>
      <td>2018-02-01</td>
      <td>2018-02-15</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2</td>
      <td>0.0</td>
      <td>3.200</td>
      <td>2.701</td>
      <td>4.055</td>
      <td>9.955</td>
      <td>2018-03-01</td>
      <td>2018-03-15</td>
    </tr>
    <tr>
      <th>3</th>
      <td>3</td>
      <td>0.0</td>
      <td>3.194</td>
      <td>2.584</td>
      <td>4.178</td>
      <td>9.955</td>
      <td>2018-04-01</td>
      <td>2018-04-15</td>
    </tr>
    <tr>
      <th>4</th>
      <td>4</td>
      <td>0.0</td>
      <td>3.367</td>
      <td>1.879</td>
      <td>4.709</td>
      <td>9.955</td>
      <td>2018-05-01</td>
      <td>2018-05-15</td>
    </tr>
    <tr>
      <th>5</th>
      <td>5</td>
      <td>0.0</td>
      <td>3.367</td>
      <td>1.879</td>
      <td>4.709</td>
      <td>9.955</td>
      <td>2018-06-01</td>
      <td>2018-06-15</td>
    </tr>
    <tr>
      <th>6</th>
      <td>6</td>
      <td>0.0</td>
      <td>3.787</td>
      <td>0.320</td>
      <td>5.848</td>
      <td>9.955</td>
      <td>2018-07-01</td>
      <td>2018-07-15</td>
    </tr>
    <tr>
      <th>7</th>
      <td>7</td>
      <td>0.0</td>
      <td>3.881</td>
      <td>0.000</td>
      <td>6.074</td>
      <td>9.955</td>
      <td>2018-08-01</td>
      <td>2018-08-15</td>
    </tr>
    <tr>
      <th>8</th>
      <td>8</td>
      <td>0.0</td>
      <td>3.687</td>
      <td>0.000</td>
      <td>6.268</td>
      <td>9.955</td>
      <td>2018-09-01</td>
      <td>2018-09-15</td>
    </tr>
    <tr>
      <th>9</th>
      <td>9</td>
      <td>0.0</td>
      <td>3.848</td>
      <td>0.000</td>
      <td>6.107</td>
      <td>9.955</td>
      <td>2018-10-01</td>
      <td>2018-10-15</td>
    </tr>
    <tr>
      <th>10</th>
      <td>10</td>
      <td>0.0</td>
      <td>3.956</td>
      <td>0.000</td>
      <td>5.999</td>
      <td>9.955</td>
      <td>2018-11-01</td>
      <td>2018-11-15</td>
    </tr>
    <tr>
      <th>11</th>
      <td>11</td>
      <td>0.0</td>
      <td>3.758</td>
      <td>0.000</td>
      <td>6.197</td>
      <td>9.955</td>
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
      <th>zoom</th>
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
      <td>14</td>
      <td>0.0</td>
      <td>0.058</td>
      <td>0.526</td>
      <td>0.135</td>
      <td>0.719</td>
    </tr>
    <tr>
      <th>1</th>
      <td>5691</td>
      <td>7960</td>
      <td>14</td>
      <td>0.0</td>
      <td>0.481</td>
      <td>0.136</td>
      <td>0.495</td>
      <td>1.112</td>
    </tr>
    <tr>
      <th>2</th>
      <td>5692</td>
      <td>7959</td>
      <td>14</td>
      <td>0.0</td>
      <td>0.063</td>
      <td>1.079</td>
      <td>0.394</td>
      <td>1.536</td>
    </tr>
    <tr>
      <th>3</th>
      <td>5692</td>
      <td>7960</td>
      <td>14</td>
      <td>0.0</td>
      <td>2.386</td>
      <td>0.131</td>
      <td>2.710</td>
      <td>5.227</td>
    </tr>
    <tr>
      <th>4</th>
      <td>5692</td>
      <td>7961</td>
      <td>14</td>
      <td>0.0</td>
      <td>0.083</td>
      <td>0.000</td>
      <td>0.213</td>
      <td>0.296</td>
    </tr>
    <tr>
      <th>5</th>
      <td>5693</td>
      <td>7960</td>
      <td>14</td>
      <td>0.0</td>
      <td>0.296</td>
      <td>0.007</td>
      <td>0.762</td>
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
                 json = {"mapId":  mapId, 'timestamp':3, 'tileIds': [{'tileX':5691, 'tileY':7959, 'zoom':14},{'tileX':5691,'tileY':7960, 'zoom':14},{'tileX':5692,'tileY':7959, 'zoom':14}]})

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
      <td>14</td>
      <td>0.0</td>
      <td>0.096</td>
      <td>5.255</td>
      <td>0.545</td>
      <td>5.897</td>
    </tr>
    <tr>
      <th>1</th>
      <td>5691</td>
      <td>7960</td>
      <td>14</td>
      <td>0.0</td>
      <td>0.588</td>
      <td>1.956</td>
      <td>3.353</td>
      <td>5.897</td>
    </tr>
    <tr>
      <th>2</th>
      <td>5692</td>
      <td>7959</td>
      <td>14</td>
      <td>0.0</td>
      <td>0.137</td>
      <td>3.903</td>
      <td>1.857</td>
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
      <td>5.364</td>
      <td>0.0</td>
      <td>0.374</td>
      <td>0.163</td>
      <td>5.901</td>
      <td>2018-01-15</td>
      <td>2018-01-01</td>
    </tr>
    <tr>
      <th>1</th>
      <td>1</td>
      <td>5.364</td>
      <td>0.0</td>
      <td>0.273</td>
      <td>0.264</td>
      <td>5.901</td>
      <td>2018-02-15</td>
      <td>2018-02-01</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2</td>
      <td>5.364</td>
      <td>0.0</td>
      <td>0.273</td>
      <td>0.264</td>
      <td>5.901</td>
      <td>2018-03-15</td>
      <td>2018-03-01</td>
    </tr>
    <tr>
      <th>3</th>
      <td>3</td>
      <td>5.364</td>
      <td>0.0</td>
      <td>0.273</td>
      <td>0.264</td>
      <td>5.901</td>
      <td>2018-04-15</td>
      <td>2018-04-01</td>
    </tr>
    <tr>
      <th>4</th>
      <td>4</td>
      <td>5.364</td>
      <td>0.0</td>
      <td>0.273</td>
      <td>0.264</td>
      <td>5.901</td>
      <td>2018-05-15</td>
      <td>2018-05-01</td>
    </tr>
    <tr>
      <th>5</th>
      <td>5</td>
      <td>5.364</td>
      <td>0.0</td>
      <td>0.273</td>
      <td>0.264</td>
      <td>5.901</td>
      <td>2018-06-15</td>
      <td>2018-06-01</td>
    </tr>
    <tr>
      <th>6</th>
      <td>6</td>
      <td>5.364</td>
      <td>0.0</td>
      <td>0.000</td>
      <td>0.537</td>
      <td>5.901</td>
      <td>2018-07-15</td>
      <td>2018-07-01</td>
    </tr>
    <tr>
      <th>7</th>
      <td>7</td>
      <td>5.364</td>
      <td>0.0</td>
      <td>0.000</td>
      <td>0.537</td>
      <td>5.901</td>
      <td>2018-08-15</td>
      <td>2018-08-01</td>
    </tr>
    <tr>
      <th>8</th>
      <td>8</td>
      <td>5.364</td>
      <td>0.0</td>
      <td>0.000</td>
      <td>0.537</td>
      <td>5.901</td>
      <td>2018-09-15</td>
      <td>2018-09-01</td>
    </tr>
    <tr>
      <th>9</th>
      <td>9</td>
      <td>5.364</td>
      <td>0.0</td>
      <td>0.000</td>
      <td>0.537</td>
      <td>5.901</td>
      <td>2018-10-15</td>
      <td>2018-10-01</td>
    </tr>
  </tbody>
</table>
</div>



<a id='data/index'></a>
## For data of measurements
In the same way as for the classes we can obtain data concerning measurements based on custom polygons, predefined polygons or standard tiles. The situation this time is however a little bit more nuanced. An aggregated measurement is always the mean measurements of all pixels of a certain land cover class within a given geometry that were not covered by clouds.

For this reason you always need to specify the class over which you want to have the mean measurements. (For example you can restrict to the class forest or agriculture). In some maps indices are not save per class, in this case you should specify the class parameters as 'all classes'.

As all clouded pixels are simply discarded there is always a cloudcover column in the table that represtents the percentatge of pixels that have been left out.

<a id='data/index/custom'></a>
### For a custom polygon

We start out with specifying some polygon that we might be interested in.


```python
geometry = {"type": "FeatureCollection", "features":[{ "properties":{"id":0}, "geometry": {"type": "Polygon",
    "coordinates": [[[-55,4.1], [-55.5,4.2], [-55.2,4.2],[-52.3,5.15], [-52,5]]]} }]}
```

Now let's request the mean of all measurements of the standard tiles intersecting our polygon.

#### data/measurement/customPolygon/timestamps


```python
r = requests.post(url + '/data/measurement/customPolygon/timestamps',
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
      <td>0.993</td>
      <td>0.479</td>
      <td>0.853</td>
      <td>1542.664</td>
      <td>2018-01-01</td>
      <td>2018-01-15</td>
    </tr>
    <tr>
      <th>1</th>
      <td>1</td>
      <td>0.962</td>
      <td>0.470</td>
      <td>0.683</td>
      <td>1542.664</td>
      <td>2018-02-01</td>
      <td>2018-02-15</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2</td>
      <td>0.476</td>
      <td>0.219</td>
      <td>0.898</td>
      <td>1542.664</td>
      <td>2018-03-01</td>
      <td>2018-03-15</td>
    </tr>
    <tr>
      <th>3</th>
      <td>3</td>
      <td>0.020</td>
      <td>-0.007</td>
      <td>0.992</td>
      <td>1542.664</td>
      <td>2018-04-01</td>
      <td>2018-04-15</td>
    </tr>
    <tr>
      <th>4</th>
      <td>4</td>
      <td>0.338</td>
      <td>0.093</td>
      <td>0.936</td>
      <td>1542.664</td>
      <td>2018-05-01</td>
      <td>2018-05-15</td>
    </tr>
    <tr>
      <th>5</th>
      <td>5</td>
      <td>0.527</td>
      <td>0.178</td>
      <td>0.878</td>
      <td>1542.664</td>
      <td>2018-06-01</td>
      <td>2018-06-15</td>
    </tr>
    <tr>
      <th>6</th>
      <td>6</td>
      <td>0.972</td>
      <td>0.414</td>
      <td>0.403</td>
      <td>1542.664</td>
      <td>2018-07-01</td>
      <td>2018-07-15</td>
    </tr>
    <tr>
      <th>7</th>
      <td>7</td>
      <td>0.989</td>
      <td>0.389</td>
      <td>0.387</td>
      <td>1542.664</td>
      <td>2018-08-01</td>
      <td>2018-08-15</td>
    </tr>
    <tr>
      <th>8</th>
      <td>8</td>
      <td>0.997</td>
      <td>0.438</td>
      <td>0.219</td>
      <td>1542.664</td>
      <td>2018-09-01</td>
      <td>2018-09-15</td>
    </tr>
    <tr>
      <th>9</th>
      <td>9</td>
      <td>0.997</td>
      <td>0.372</td>
      <td>0.131</td>
      <td>1542.664</td>
      <td>2018-10-01</td>
      <td>2018-10-15</td>
    </tr>
  </tbody>
</table>
</div>



Next we request the measurements for all tiles intersecting with our polygon for a certain fixed timestamp.

#### data/measurement/customPolygon/tiles


```python
r = requests.post(url + '/data/measurement/customPolygon/tiles',
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
      <td>5666</td>
      <td>8000</td>
      <td>14</td>
      <td>1.000</td>
      <td>0.759</td>
      <td>0.77</td>
      <td>5.911</td>
    </tr>
    <tr>
      <th>1</th>
      <td>5667</td>
      <td>8000</td>
      <td>14</td>
      <td>1.000</td>
      <td>0.654</td>
      <td>0.71</td>
      <td>5.911</td>
    </tr>
    <tr>
      <th>2</th>
      <td>5667</td>
      <td>8001</td>
      <td>14</td>
      <td>0.616</td>
      <td>0.449</td>
      <td>0.93</td>
      <td>5.912</td>
    </tr>
    <tr>
      <th>3</th>
      <td>5668</td>
      <td>8000</td>
      <td>14</td>
      <td>1.000</td>
      <td>0.696</td>
      <td>0.65</td>
      <td>5.911</td>
    </tr>
    <tr>
      <th>4</th>
      <td>5668</td>
      <td>8001</td>
      <td>14</td>
      <td>0.997</td>
      <td>0.768</td>
      <td>0.67</td>
      <td>5.912</td>
    </tr>
    <tr>
      <th>5</th>
      <td>5669</td>
      <td>8000</td>
      <td>14</td>
      <td>0.998</td>
      <td>0.596</td>
      <td>0.64</td>
      <td>5.911</td>
    </tr>
    <tr>
      <th>6</th>
      <td>5669</td>
      <td>8001</td>
      <td>14</td>
      <td>0.976</td>
      <td>0.708</td>
      <td>0.34</td>
      <td>5.912</td>
    </tr>
    <tr>
      <th>7</th>
      <td>5670</td>
      <td>8000</td>
      <td>14</td>
      <td>1.000</td>
      <td>0.730</td>
      <td>0.27</td>
      <td>5.911</td>
    </tr>
    <tr>
      <th>8</th>
      <td>5670</td>
      <td>8001</td>
      <td>14</td>
      <td>1.000</td>
      <td>0.692</td>
      <td>0.87</td>
      <td>5.912</td>
    </tr>
    <tr>
      <th>9</th>
      <td>5687</td>
      <td>7997</td>
      <td>14</td>
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

Let's start with requesting all measurements for some polygons at a certain timestamp.
#### data/measurement/polygon/polygonIds


```python
r = requests.post(url + '/data/measurement/polygon/polygonIds',
                 json = {"mapId":  mapId, 'timestamp':4, 'polygonIds': [3,2], 'class': 'disturbance' })
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
      <td>2</td>
      <td>0.998</td>
      <td>0.238</td>
      <td>0.351</td>
      <td>5.312</td>
    </tr>
    <tr>
      <th>1</th>
      <td>3</td>
      <td>0.958</td>
      <td>0.392</td>
      <td>0.447</td>
      <td>9.955</td>
    </tr>
  </tbody>
</table>
</div>



In the same manner we can request all timestamps for some particular polygon.

#### data/measurement/polygon/timestamps


```python
r = requests.post(url + '/data/measurement/polygon/timestamps',
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
      <td>0.970</td>
      <td>0.330</td>
      <td>0.905</td>
      <td>39.235</td>
      <td>2018-01-01</td>
      <td>2018-01-15</td>
    </tr>
    <tr>
      <th>1</th>
      <td>1</td>
      <td>0.996</td>
      <td>0.469</td>
      <td>0.594</td>
      <td>39.235</td>
      <td>2018-02-01</td>
      <td>2018-02-15</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.996</td>
      <td>39.235</td>
      <td>2018-03-01</td>
      <td>2018-03-15</td>
    </tr>
    <tr>
      <th>3</th>
      <td>3</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>1.000</td>
      <td>39.235</td>
      <td>2018-04-01</td>
      <td>2018-04-15</td>
    </tr>
    <tr>
      <th>4</th>
      <td>4</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>1.000</td>
      <td>39.235</td>
      <td>2018-05-01</td>
      <td>2018-05-15</td>
    </tr>
    <tr>
      <th>5</th>
      <td>5</td>
      <td>0.796</td>
      <td>0.231</td>
      <td>0.661</td>
      <td>39.235</td>
      <td>2018-06-01</td>
      <td>2018-06-15</td>
    </tr>
    <tr>
      <th>6</th>
      <td>6</td>
      <td>0.998</td>
      <td>0.403</td>
      <td>0.054</td>
      <td>39.235</td>
      <td>2018-07-01</td>
      <td>2018-07-15</td>
    </tr>
    <tr>
      <th>7</th>
      <td>7</td>
      <td>1.000</td>
      <td>0.364</td>
      <td>0.038</td>
      <td>39.235</td>
      <td>2018-08-01</td>
      <td>2018-08-15</td>
    </tr>
    <tr>
      <th>8</th>
      <td>8</td>
      <td>1.000</td>
      <td>0.408</td>
      <td>0.004</td>
      <td>39.235</td>
      <td>2018-09-01</td>
      <td>2018-09-15</td>
    </tr>
    <tr>
      <th>9</th>
      <td>9</td>
      <td>1.000</td>
      <td>0.340</td>
      <td>0.040</td>
      <td>39.235</td>
      <td>2018-10-01</td>
      <td>2018-10-15</td>
    </tr>
  </tbody>
</table>
</div>



We get highly similar information, only this time per timestamp for the particular polygon.

Lastly we can retrieve the information per standard tile.
#### data/measurement/polygon/tiles


```python
r = requests.post(url + '/data/measurement/polygon/tiles',
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
      <td>5704</td>
      <td>7971</td>
      <td>14</td>
      <td>1.0</td>
      <td>0.387</td>
      <td>0.70</td>
      <td>3.304</td>
    </tr>
    <tr>
      <th>1</th>
      <td>5705</td>
      <td>7971</td>
      <td>14</td>
      <td>1.0</td>
      <td>0.386</td>
      <td>0.42</td>
      <td>4.308</td>
    </tr>
    <tr>
      <th>2</th>
      <td>5706</td>
      <td>7970</td>
      <td>14</td>
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
#### data/measurement/tile/tileIds


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



Of course we can also request all timestamps for a specific tile.
#### data/measurement/tile/timestamps


```python
r = requests.post(url + '/data/measurement/tile/timestamps',
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
      <th>cloud_cover</th>
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
      <td>0.24</td>
      <td>2018-02-01</td>
      <td>2018-02-15</td>
    </tr>
    <tr>
      <th>1</th>
      <td>2</td>
      <td>1.0</td>
      <td>0.659</td>
      <td>5.902</td>
      <td>0.71</td>
      <td>2018-03-01</td>
      <td>2018-03-15</td>
    </tr>
    <tr>
      <th>2</th>
      <td>7</td>
      <td>1.0</td>
      <td>0.569</td>
      <td>5.902</td>
      <td>0.00</td>
      <td>2018-08-01</td>
      <td>2018-08-15</td>
    </tr>
    <tr>
      <th>3</th>
      <td>9</td>
      <td>1.0</td>
      <td>0.511</td>
      <td>5.902</td>
      <td>0.04</td>
      <td>2018-10-01</td>
      <td>2018-10-15</td>
    </tr>
    <tr>
      <th>4</th>
      <td>10</td>
      <td>1.0</td>
      <td>0.506</td>
      <td>5.902</td>
      <td>0.49</td>
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




    <matplotlib.axes._subplots.AxesSubplot at 0x7f13c6e50320>




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




    <matplotlib.image.AxesImage at 0x7f31ce78bac8>




![png](output_120_1.png)


The API always makes sure that the resolution of the returned image is addapted to your level of zoom. It prevents the largest dimension of your image to be over 2048 pixels.

A response image is in PNG format and has four channels. Red, green, blue and transperant.

The API mosaics the images from more recent to less recent. In case no cloudless footage is found that area of the map will rendered as transparent.
