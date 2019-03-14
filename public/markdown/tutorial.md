
This document is meant as a brief tutorial for anyone who wants to use Ellipsis-Earth data through our API for analysis. 

Our database stores a treasure of GeoData aqcuired by our cluster and we suport a large number of requests rendering data, geometries and visualisations. In this tutorial we will step by step go through all possible requests you can make to our server.

This document is meant as a quick tutorial to get you started. It will show you all the options without going into depth or specifics. To see the full potential and power of the API when applied to certain use cases, please visit one of our demo-notebooks in the Ellipsis-Gallery. The tutorial is directed to Python users, but should be readeble for people using other languages as well.

The Ellipsis API suports a number of feedback and download requests, as well as tile layers for all maps. As these are meant for app developers and not for analists, these are not treated in the tutorial. See the documentation for more information on this topic.

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
    6.1 <a href='#geometry/polygon'>*Geometries for polygons*</a><br/>
    6.2 <a href='#geometry/tile'>*Geometries for standard tiles*</a>
8. <a href='#visual'>**Acquiring visualisations**</a>

<a id='Ellipsis'></a>
# Ellipsis Data

Ellipsis data is always connected to a map. When we refer to a map, we mean all available data and visualisations of a certain monitoring project. Maps consist of multiple timestamps, each of which contain all data and visualisations of that map acquired at a certain period.

## Standard tiles and custom polygons

Ellipsis-Earth uses a large set of predefined standard tiles covering the entire globe. In fact we use the same covering into standard tiles as the webmercator projected open street map on zoomlevel 14.  A tile can be uniquely identified by a tile_x and tile_y, identifying the respectieve x and y positions on the map.

On top of this specific custom polygons can be defined on maps. These can be everything from agricultural parcels or administrative districts. These polygons are grouped into layers, polygons in the same layer are of the same type (for example all provinces of a country would form a layer).

## Aggregation

Data is always both aggregated to standard tiles as well as to predefined polygons. In case of predefined polygons the data is actually saved per tile per polygon. This means that in larger polygons you also have a sense of 'where' something occured.

In case of land cover classes,  aggregations are made by taking the total surface area of each class within the aggregated region. In case of spectral indices, means are taken over the whole area.

## Map layers
All timestamps consist of map layers. Each layer contains a certain type of visualization of the timestamp. There are four types of layers:

1.	**Images**: Visualizations of the raw satellite data, for example, RGB, false color or infrared.
2.	**Indices**: Heatmaps of the indices.
3.	**Labels**: Maps in which each class has a certain color.
4.	**Changes**: Maps in which each pixel that underwent a certain change has a certain color.

## Request types

<a id='thedestination'></a>
Ellipsis supports a large number of requests to our API. We categorise them in the following way:

1. <a href='#login'>**account**</a>: All requests that gather information about what data is available.<br/>
2. <a href='#metadata'>**metadata**</a>: All requests that gather information about what data is available.<br/>
3. <a href='#data/class'>**data/class**</a>: All requests that gather surface areas of classes<br/>
4. <a href='#data/index'>**data/index**</a>: All requests that gather mean spectral indices<br/>
5. <a href='#geometry/polygon'>**geometries/polygon**</a>: All requests that gather mean spectral indices when restricted to a specific class.<br/>
6. <a href='#geometry/tile'>**geometries/tile**</a>: All requests that retrieve PNG images.<br/>
7. <a href='#visual'>**visual**</a>: All requests that collect the geometries of predefined polygons.<br/>

This categorisation is reflected in the sections below.

<a id='setup'></a>
# Setting things up
## Required packages

We will be requiring the following python packages. The Requests package allows us to make post and get requests to the API. Pandas, Geopandas and raserio is meant to help us handling data comming from the API. Matplotlib helps us with handling images. the io package allows us to directly get a requested PNG or CSV as a Python object instead of saving it to our local disk first.


```python
import requests

import pandas as pd
import geopandas as gpd
import rasterio

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
# Acces

## Loging in

Some maps are public and can be accessed without a token. However, if you want to access maps that are private, meaning accessible only to specific people or organizations, you will need to send a token with your request. We can obtain this token by sending a post request with a username and password as parameters. In case you are interested in public maps only, you can skip this step.

For this tutorial we will use the account demo_user.

#### account/login


```python
r =requests.post(url + '/account/login',
                 json = {'username':'demo_user', 'password':'demo_user'} )
print(r.text)
```

    {"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRlbW9fdXNlciIsImlhdCI6MTU1MjQ4MTY2OSwiZXhwIjoxNTUyNTY4MDY5fQ.X7dXfcjE62pGg8IBA2cn5jiDqskt9sIgORpgse5dxz8"}


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

    Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRlbW9fdXNlciIsImlhdCI6MTU1MjQ4MTY2OSwiZXhwIjoxNTUyNTY4MDY5fQ.X7dXfcjE62pGg8IBA2cn5jiDqskt9sIgORpgse5dxz8


To test whether our token is working, we send a get request with this token to the following authentication testing URL.

#### account/validate


```python
r = requests.get(url + '/account/validate', 
                 headers = {"Authorization":token} )
print(r)
```

    <Response [200]>


We get 200 as a response code which means that our request was valid and that we can use it perform actions that require authentication! The token we got will remain valid for a limited amount of time, the expiration time of a token is currently set to 12 hours. After that you will need to request a new token.

## Available maps

To see what maps are available we can make the MyMaps request. In case we sent a token we get both the public maps as well as our personal ones.

Let's request a JSON and print all keys.

#### account/myMaps


```python
r = requests.get(url + '/account/myMaps')

r = r.json()
r
map_names = [map['name'] for map in r]
map_names
```




    ['Suriname', 'Belgium Clouds', 'Chaco Demo', 'Gran Chaco']



Seems there are quite some maps available. Lets have a look at the Suriname map.


```python
mapId = [map['uuid'] for map in r if map['name'] == 'Suriname'][0]
mapId
```




    '810b31c3-6335-45fe-8120-972e2d1c7da8'



<a id='metadata'></a>
# Acquiring metadata

Now we found what maps we have access to we can start looking at what data is available for these maps. To do this the Ellipsis API supports a couple of metadata requests.

All responses to metadata requests are in JSON format.


We already stored the map id of our map of interest in the variable map_id Let's see what timestamps are available for this map.

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
r = requests.post(url + '/metadata/classes',
                 json = {"mapId":  mapId })

r = r.json()

r[1:3]
```




    [{'timestampNumber': 10,
      'modelVersion': 1,
      'classes': [{'name': 'blanc', 'color': '00000000'},
       {'name': 'mask', 'color': '00000000'},
       {'name': 'no class', 'color': '00000000'},
       {'name': 'disturbance', 'color': 'ff0000ff'}]},
     {'timestampNumber': 9,
      'modelVersion': 1,
      'classes': [{'name': 'blanc', 'color': '00000000'},
       {'name': 'mask', 'color': '00000000'},
       {'name': 'no class', 'color': '00000000'},
       {'name': 'disturbance', 'color': 'ff0000ff'}]}]



#### metadata/spectral


```python
r = requests.post(url + '/metadata/spectral',
                 json = {"mapId":  mapId })

r = r.json()
r[1:3]
```




    [{'timestampNumber': 1,
      'indices': [{'name': 'NDVI', 'color': '00ff00ff', 'version': 1},
       {'name': 'NDWI', 'color': '0000ffff', 'version': 1}]},
     {'timestampNumber': 2,
      'indices': [{'name': 'NDVI', 'color': '00ff00ff', 'version': 1},
       {'name': 'NDWI', 'color': '0000ffff', 'version': 1}]}]



For each timestamp we are also given version of the model under which conclusions have been drawn. The color is the standard legend color that is used in the Ellipsis Viewer.

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



<a id='data'></a>
## Acquiring data

Now we know what data is available in our map we can start requesting information from it. In this section we have a look at all tabular data that we can request for both the classes and the indices. This tabular data is always returned in CSV format.

We can request tabular data for custom polygons defined by the user, predefined polygons and standard tiles.

<a id='data/class'></a>
## Data for classes
We can obtain data for the classes based on custom polygons, predefined polygons or standard tiles. The data returned is always expressed as the area of a class in square kilometers.
<a id='data/class/custom'></a>
### For a custom polygon

We can define an arbitrary polygon by specifying a sequence of coordinate tuples as follows:


```python
coords = [[-55,4.1], [-55.5,4.2], [-55.2,4.2],[-52.3,5.15], [-52,5]]
```

If we are interested in information about the surface area of landcover classes on this polygon, we have two queries at our disposal.

First off we can obtain the aggregated surface area of each class for this polygon for all timestamps.
#### data/cutomPolygon/timestamps


```python
r = requests.post(url + '/data/class/customPolygon/timestamps',
                 json = {"mapId":  mapId, 'coords': coords })

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



As these are custom polygons, these surface areas are not precise. The custom polygon has been covered fully by standard tiles whose land covers have been summed over.

Secondly, we can get these surface areas per tile for a certain timestamp. Say in this case timestamp 0.
#### data/customPolygon/tiles


```python
r = requests.post(url + '/data/class/customPolygon/tiles',
                 json = {"mapId":  mapId, 'timestamp':0, 'coords':coords })

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

There are also predefined polygons available for a map. As oposed to predefined polygons land cover areas for these predefined areas are exact.

See the /geometry/polygon section for how to retrieve the geometry of these polygons.

There are three queries available for land cover classes on predefined polygons First of all, we can retrieve all polygons for a certain timestamp.

#### data/class/polygon/polygons


```python
r = requests.post(url + '/data/class/polygon/polygons',
                 json = {"mapId":  mapId, 'timestamp':1, 'layer': 'Mine' })
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
      <th>polygon</th>
      <th>blanc</th>
      <th>disturbance</th>
      <th>mask</th>
      <th>no class</th>
      <th>area</th>
      <th>layer</th>
      <th>name</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>1</td>
      <td>0.000000</td>
      <td>3.581839</td>
      <td>19.940976</td>
      <td>15.135185</td>
      <td>38.658</td>
      <td>Mine</td>
      <td>Mine1</td>
    </tr>
    <tr>
      <th>1</th>
      <td>2</td>
      <td>0.000000</td>
      <td>1.891067</td>
      <td>2.164558</td>
      <td>1.256375</td>
      <td>5.312</td>
      <td>Mine</td>
      <td>Mine2</td>
    </tr>
    <tr>
      <th>2</th>
      <td>3</td>
      <td>0.000000</td>
      <td>3.194770</td>
      <td>2.913799</td>
      <td>3.846431</td>
      <td>9.955</td>
      <td>Mine</td>
      <td>Mine3</td>
    </tr>
    <tr>
      <th>3</th>
      <td>4</td>
      <td>0.000000</td>
      <td>3.657095</td>
      <td>20.714430</td>
      <td>14.863475</td>
      <td>39.235</td>
      <td>Mine</td>
      <td>Mine4</td>
    </tr>
    <tr>
      <th>4</th>
      <td>5</td>
      <td>0.000000</td>
      <td>0.330621</td>
      <td>0.093677</td>
      <td>0.353702</td>
      <td>0.778</td>
      <td>Mine</td>
      <td>Mine5</td>
    </tr>
    <tr>
      <th>5</th>
      <td>6</td>
      <td>0.321840</td>
      <td>4.467514</td>
      <td>27.034183</td>
      <td>11.970464</td>
      <td>43.794</td>
      <td>Mine</td>
      <td>Mine6</td>
    </tr>
    <tr>
      <th>6</th>
      <td>7</td>
      <td>10.391874</td>
      <td>16.971280</td>
      <td>135.943489</td>
      <td>37.206357</td>
      <td>200.513</td>
      <td>Mine</td>
      <td>Mine7</td>
    </tr>
  </tbody>
</table>
</div>



The resulting data frame has a row for each polygon, describing the total area in square kilometers for each particular class. Additional metadata is appended on the right side and is specific to the map we are studying.

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
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>0</td>
      <td>0.0</td>
      <td>0.977871</td>
      <td>7.760044</td>
      <td>1.217085</td>
      <td>9.955</td>
    </tr>
    <tr>
      <th>1</th>
      <td>1</td>
      <td>0.0</td>
      <td>3.194770</td>
      <td>2.913799</td>
      <td>3.846431</td>
      <td>9.955</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2</td>
      <td>0.0</td>
      <td>3.199635</td>
      <td>2.700752</td>
      <td>4.054613</td>
      <td>9.955</td>
    </tr>
    <tr>
      <th>3</th>
      <td>3</td>
      <td>0.0</td>
      <td>3.193522</td>
      <td>2.583946</td>
      <td>4.177531</td>
      <td>9.955</td>
    </tr>
    <tr>
      <th>4</th>
      <td>4</td>
      <td>0.0</td>
      <td>3.366972</td>
      <td>1.879114</td>
      <td>4.708914</td>
      <td>9.955</td>
    </tr>
    <tr>
      <th>5</th>
      <td>5</td>
      <td>0.0</td>
      <td>3.366972</td>
      <td>1.879114</td>
      <td>4.708914</td>
      <td>9.955</td>
    </tr>
    <tr>
      <th>6</th>
      <td>6</td>
      <td>0.0</td>
      <td>3.786952</td>
      <td>0.319638</td>
      <td>5.848410</td>
      <td>9.955</td>
    </tr>
    <tr>
      <th>7</th>
      <td>7</td>
      <td>0.0</td>
      <td>3.880725</td>
      <td>0.000000</td>
      <td>6.074275</td>
      <td>9.955</td>
    </tr>
    <tr>
      <th>8</th>
      <td>8</td>
      <td>0.0</td>
      <td>3.687068</td>
      <td>0.000000</td>
      <td>6.267932</td>
      <td>9.955</td>
    </tr>
    <tr>
      <th>9</th>
      <td>9</td>
      <td>0.0</td>
      <td>3.848149</td>
      <td>0.000000</td>
      <td>6.106851</td>
      <td>9.955</td>
    </tr>
    <tr>
      <th>10</th>
      <td>10</td>
      <td>0.0</td>
      <td>3.955575</td>
      <td>0.000000</td>
      <td>5.999425</td>
      <td>9.955</td>
    </tr>
    <tr>
      <th>11</th>
      <td>11</td>
      <td>0.0</td>
      <td>3.758150</td>
      <td>0.000000</td>
      <td>6.196850</td>
      <td>9.955</td>
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
The predefined polygons may vary from map to map, but in each and every map data is aggregated to standard Web Mercator tiles. These tiles can be uniquely identified by their tileX and tileY position.

See the /geometry/tile section to learn how to retrieve the geometry of these tiles.

There are two requests we can make for standard tiles. First off we can request all availabel tiles for a timestamp

#### data/class/tile/tiles


```python
r = requests.post(url + '/data/class/tile/tiles',
                 json = {"mapId":  mapId, 'timestamp':3})

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
      <td>5658</td>
      <td>7970</td>
      <td>5.364169</td>
      <td>0.00000</td>
      <td>0.273008</td>
      <td>0.263823</td>
      <td>5.901</td>
    </tr>
    <tr>
      <th>1</th>
      <td>5658</td>
      <td>7971</td>
      <td>5.277008</td>
      <td>0.00000</td>
      <td>0.170000</td>
      <td>0.453992</td>
      <td>5.901</td>
    </tr>
    <tr>
      <th>2</th>
      <td>5658</td>
      <td>7972</td>
      <td>5.325363</td>
      <td>0.00000</td>
      <td>0.000000</td>
      <td>0.576637</td>
      <td>5.902</td>
    </tr>
    <tr>
      <th>3</th>
      <td>5658</td>
      <td>7973</td>
      <td>5.372733</td>
      <td>0.00018</td>
      <td>0.000000</td>
      <td>0.529087</td>
      <td>5.902</td>
    </tr>
    <tr>
      <th>4</th>
      <td>5658</td>
      <td>7974</td>
      <td>5.419923</td>
      <td>0.00000</td>
      <td>0.000000</td>
      <td>0.482077</td>
      <td>5.902</td>
    </tr>
    <tr>
      <th>5</th>
      <td>5658</td>
      <td>7975</td>
      <td>5.468309</td>
      <td>0.00000</td>
      <td>0.220948</td>
      <td>0.213742</td>
      <td>5.903</td>
    </tr>
    <tr>
      <th>6</th>
      <td>5658</td>
      <td>7976</td>
      <td>5.515688</td>
      <td>0.00000</td>
      <td>0.310751</td>
      <td>0.076562</td>
      <td>5.903</td>
    </tr>
    <tr>
      <th>7</th>
      <td>5658</td>
      <td>7977</td>
      <td>5.562796</td>
      <td>0.00000</td>
      <td>0.202213</td>
      <td>0.137991</td>
      <td>5.903</td>
    </tr>
    <tr>
      <th>8</th>
      <td>5658</td>
      <td>7978</td>
      <td>5.611214</td>
      <td>0.00000</td>
      <td>0.196482</td>
      <td>0.096304</td>
      <td>5.904</td>
    </tr>
    <tr>
      <th>9</th>
      <td>5658</td>
      <td>7979</td>
      <td>5.679501</td>
      <td>0.00000</td>
      <td>0.075764</td>
      <td>0.148735</td>
      <td>5.904</td>
    </tr>
  </tbody>
</table>
</div>



Secondly we can request all timestamps for a specific tile

#### data/class/tile/timestamps


```python
r = requests.post(url + '/data/class/tile/tiles',
                 json = {"mapId":  mapId, 'timestamp':3})

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
      <td>5658</td>
      <td>7970</td>
      <td>5.364169</td>
      <td>0.00000</td>
      <td>0.273008</td>
      <td>0.263823</td>
      <td>5.901</td>
    </tr>
    <tr>
      <th>1</th>
      <td>5658</td>
      <td>7971</td>
      <td>5.277008</td>
      <td>0.00000</td>
      <td>0.170000</td>
      <td>0.453992</td>
      <td>5.901</td>
    </tr>
    <tr>
      <th>2</th>
      <td>5658</td>
      <td>7972</td>
      <td>5.325363</td>
      <td>0.00000</td>
      <td>0.000000</td>
      <td>0.576637</td>
      <td>5.902</td>
    </tr>
    <tr>
      <th>3</th>
      <td>5658</td>
      <td>7973</td>
      <td>5.372733</td>
      <td>0.00018</td>
      <td>0.000000</td>
      <td>0.529087</td>
      <td>5.902</td>
    </tr>
    <tr>
      <th>4</th>
      <td>5658</td>
      <td>7974</td>
      <td>5.419923</td>
      <td>0.00000</td>
      <td>0.000000</td>
      <td>0.482077</td>
      <td>5.902</td>
    </tr>
    <tr>
      <th>5</th>
      <td>5658</td>
      <td>7975</td>
      <td>5.468309</td>
      <td>0.00000</td>
      <td>0.220948</td>
      <td>0.213742</td>
      <td>5.903</td>
    </tr>
    <tr>
      <th>6</th>
      <td>5658</td>
      <td>7976</td>
      <td>5.515688</td>
      <td>0.00000</td>
      <td>0.310751</td>
      <td>0.076562</td>
      <td>5.903</td>
    </tr>
    <tr>
      <th>7</th>
      <td>5658</td>
      <td>7977</td>
      <td>5.562796</td>
      <td>0.00000</td>
      <td>0.202213</td>
      <td>0.137991</td>
      <td>5.903</td>
    </tr>
    <tr>
      <th>8</th>
      <td>5658</td>
      <td>7978</td>
      <td>5.611214</td>
      <td>0.00000</td>
      <td>0.196482</td>
      <td>0.096304</td>
      <td>5.904</td>
    </tr>
    <tr>
      <th>9</th>
      <td>5658</td>
      <td>7979</td>
      <td>5.679501</td>
      <td>0.00000</td>
      <td>0.075764</td>
      <td>0.148735</td>
      <td>5.904</td>
    </tr>
  </tbody>
</table>
</div>



<a id='data/index'></a>
## For data of indices
In the same way as for the classes we can obtain data for the indices based on custom polygons, predefined polygons or standard tiles. The situation this time is however a little bit more nuanced. An aggregated index is always the mean index of all pixels of a certain class that were not covered by clouds.

For this reason you always need to specify the class over which you want to have the mean spectral indices. (For example you can restrict to the class forest or agriculture). In some maps indices are not save per class, in this case you should specify the class parameters as 'all classes'.

As all clouded pixels are simply discarded there is always a cloudcover column present that represtents the percentatge of pixels that was not visible.

<a id='data/index/custom'></a>
### For a custom polygon

We we start out with specifying some polygon that we might be interested in.


```python
coords = [ [-55,4.1], [-55.5,4.2], [-55.2,4.2],[-52.3,5.15], [-52,5]]
```

Now let's request the mean of all spectral indices of the standard tiles intersecting our polygon.

#### data/spectral/customPolygon/timestamps


```python
r = requests.post(url + '/data/spectral/customPolygon/timestamps',
                 json = {"mapId":  mapId, 'class': 'disturbance', 'coords': coords })

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
    </tr>
    <tr>
      <th>1</th>
      <td>1</td>
      <td>0.962001</td>
      <td>0.469612</td>
      <td>0.683103</td>
      <td>1542.664</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2</td>
      <td>0.476266</td>
      <td>0.218599</td>
      <td>0.898113</td>
      <td>1542.664</td>
    </tr>
    <tr>
      <th>3</th>
      <td>3</td>
      <td>0.020386</td>
      <td>-0.007053</td>
      <td>0.992451</td>
      <td>1542.664</td>
    </tr>
    <tr>
      <th>4</th>
      <td>4</td>
      <td>0.337877</td>
      <td>0.092783</td>
      <td>0.936130</td>
      <td>1542.664</td>
    </tr>
    <tr>
      <th>5</th>
      <td>5</td>
      <td>0.527262</td>
      <td>0.177563</td>
      <td>0.877889</td>
      <td>1542.664</td>
    </tr>
    <tr>
      <th>6</th>
      <td>6</td>
      <td>0.971997</td>
      <td>0.413940</td>
      <td>0.403466</td>
      <td>1542.664</td>
    </tr>
    <tr>
      <th>7</th>
      <td>7</td>
      <td>0.989275</td>
      <td>0.388528</td>
      <td>0.387444</td>
      <td>1542.664</td>
    </tr>
    <tr>
      <th>8</th>
      <td>8</td>
      <td>0.997145</td>
      <td>0.437617</td>
      <td>0.219172</td>
      <td>1542.664</td>
    </tr>
    <tr>
      <th>9</th>
      <td>9</td>
      <td>0.996576</td>
      <td>0.372065</td>
      <td>0.130757</td>
      <td>1542.664</td>
    </tr>
  </tbody>
</table>
</div>



Next we request the spectral indices for all tiles intersecting with our polygon for a certain fixed timestamp.

#### data/spectral/customPolygon/tiles


```python
r = requests.post(url + '/data/spectral/customPolygon/tiles',
                 json = {"mapId":  mapId, 'timestamp': 1, 'class': 'disturbance', 'coords': coords })

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

Similar to the case of the classes there are three requests we can make in case of predefine polygons.

See the /geometry/polygon section to learn how you can retrieve the geometry of these predefined polygons.

Let's start with requesting all spectral indices for all polygons in a certain timestamp.
#### data/spectral/polygon/polygons


```python
r = requests.post(url + '/data/spectral/polygon/polygons',
                 json = {"mapId":  mapId, 'timestamp': 1, 'layer': 'Mine', 'class': 'disturbance'})

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
      <th>polygon</th>
      <th>NDVI</th>
      <th>NDWI</th>
      <th>layer</th>
      <th>name</th>
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
      <td>Mine</td>
      <td>Mine1</td>
      <td>0.529641</td>
      <td>38.658</td>
    </tr>
    <tr>
      <th>1</th>
      <td>2</td>
      <td>1.000000</td>
      <td>0.309390</td>
      <td>Mine</td>
      <td>Mine2</td>
      <td>0.495851</td>
      <td>5.312</td>
    </tr>
    <tr>
      <th>2</th>
      <td>3</td>
      <td>0.998866</td>
      <td>0.491174</td>
      <td>Mine</td>
      <td>Mine3</td>
      <td>0.311504</td>
      <td>9.955</td>
    </tr>
    <tr>
      <th>3</th>
      <td>4</td>
      <td>0.995728</td>
      <td>0.468509</td>
      <td>Mine</td>
      <td>Mine4</td>
      <td>0.593817</td>
      <td>39.235</td>
    </tr>
    <tr>
      <th>4</th>
      <td>5</td>
      <td>1.000000</td>
      <td>0.632000</td>
      <td>Mine</td>
      <td>Mine5</td>
      <td>0.120000</td>
      <td>0.778</td>
    </tr>
    <tr>
      <th>5</th>
      <td>6</td>
      <td>0.984245</td>
      <td>0.429537</td>
      <td>Mine</td>
      <td>Mine6</td>
      <td>0.622045</td>
      <td>43.794</td>
    </tr>
    <tr>
      <th>6</th>
      <td>7</td>
      <td>0.960538</td>
      <td>0.330776</td>
      <td>Mine</td>
      <td>Mine7</td>
      <td>0.777421</td>
      <td>200.513</td>
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
    </tr>
    <tr>
      <th>1</th>
      <td>1</td>
      <td>0.995728</td>
      <td>0.468509</td>
      <td>0.593817</td>
      <td>39.235</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.996004</td>
      <td>39.235</td>
    </tr>
    <tr>
      <th>3</th>
      <td>3</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>1.000000</td>
      <td>39.235</td>
    </tr>
    <tr>
      <th>4</th>
      <td>4</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>1.000000</td>
      <td>39.235</td>
    </tr>
    <tr>
      <th>5</th>
      <td>5</td>
      <td>0.795593</td>
      <td>0.231363</td>
      <td>0.660828</td>
      <td>39.235</td>
    </tr>
    <tr>
      <th>6</th>
      <td>6</td>
      <td>0.997588</td>
      <td>0.403357</td>
      <td>0.053883</td>
      <td>39.235</td>
    </tr>
    <tr>
      <th>7</th>
      <td>7</td>
      <td>1.000000</td>
      <td>0.363662</td>
      <td>0.038336</td>
      <td>39.235</td>
    </tr>
    <tr>
      <th>8</th>
      <td>8</td>
      <td>1.000000</td>
      <td>0.408166</td>
      <td>0.003560</td>
      <td>39.235</td>
    </tr>
    <tr>
      <th>9</th>
      <td>9</td>
      <td>0.999556</td>
      <td>0.339575</td>
      <td>0.039668</td>
      <td>39.235</td>
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
Predefined polygons can vary from map to map. But data is always aggregated to standard Web Mercator tiles. 

In case you are intersted in the geometry of these tiles, have a look at the /geometry/tile section.

There are two queries available to retrieve data about these tiles. First off we can simply request all tiles for a certain timestamp.
#### data/spectral/tile/tiles


```python
r = requests.post(url + '/data/spectral/tile/tiles',
                 json = {"mapId":  mapId, 'timestamp':1, 'class': 'disturbance' })

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
      <td>5659</td>
      <td>7974</td>
      <td>1.0</td>
      <td>0.660</td>
      <td>0.24</td>
      <td>5.902</td>
    </tr>
    <tr>
      <th>1</th>
      <td>5659</td>
      <td>7990</td>
      <td>1.0</td>
      <td>0.592</td>
      <td>0.75</td>
      <td>5.908</td>
    </tr>
    <tr>
      <th>2</th>
      <td>5659</td>
      <td>7991</td>
      <td>1.0</td>
      <td>0.766</td>
      <td>0.83</td>
      <td>5.908</td>
    </tr>
    <tr>
      <th>3</th>
      <td>5659</td>
      <td>7996</td>
      <td>1.0</td>
      <td>0.842</td>
      <td>0.55</td>
      <td>4.411</td>
    </tr>
    <tr>
      <th>4</th>
      <td>5660</td>
      <td>7990</td>
      <td>1.0</td>
      <td>0.634</td>
      <td>0.10</td>
      <td>5.908</td>
    </tr>
    <tr>
      <th>5</th>
      <td>5660</td>
      <td>7991</td>
      <td>1.0</td>
      <td>0.660</td>
      <td>0.84</td>
      <td>5.908</td>
    </tr>
    <tr>
      <th>6</th>
      <td>5660</td>
      <td>7969</td>
      <td>1.0</td>
      <td>0.393</td>
      <td>0.09</td>
      <td>4.640</td>
    </tr>
    <tr>
      <th>7</th>
      <td>5660</td>
      <td>7970</td>
      <td>1.0</td>
      <td>0.506</td>
      <td>0.41</td>
      <td>5.901</td>
    </tr>
    <tr>
      <th>8</th>
      <td>5660</td>
      <td>7971</td>
      <td>1.0</td>
      <td>0.443</td>
      <td>0.68</td>
      <td>5.901</td>
    </tr>
    <tr>
      <th>9</th>
      <td>5660</td>
      <td>7972</td>
      <td>1.0</td>
      <td>0.741</td>
      <td>0.68</td>
      <td>5.902</td>
    </tr>
  </tbody>
</table>
</div>



Of course we can also request all timestamps for a specific tile.
#### data/spectral/tile/timestamps


```python
r = requests.post(url + '/data/spectral/tile/timestamps',
                 json = {"mapId":  mapId, 'tileX': 5659, 'tileY':7974, 'class': 'disturbance' })

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
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>1</td>
      <td>1.0</td>
      <td>0.660</td>
      <td>5.902</td>
    </tr>
    <tr>
      <th>1</th>
      <td>1</td>
      <td>1.0</td>
      <td>0.660</td>
      <td>5.902</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2</td>
      <td>1.0</td>
      <td>0.659</td>
      <td>5.902</td>
    </tr>
    <tr>
      <th>3</th>
      <td>2</td>
      <td>1.0</td>
      <td>0.659</td>
      <td>5.902</td>
    </tr>
    <tr>
      <th>4</th>
      <td>7</td>
      <td>1.0</td>
      <td>0.569</td>
      <td>5.902</td>
    </tr>
    <tr>
      <th>5</th>
      <td>7</td>
      <td>1.0</td>
      <td>0.569</td>
      <td>5.902</td>
    </tr>
    <tr>
      <th>6</th>
      <td>9</td>
      <td>1.0</td>
      <td>0.511</td>
      <td>5.902</td>
    </tr>
    <tr>
      <th>7</th>
      <td>9</td>
      <td>1.0</td>
      <td>0.511</td>
      <td>5.902</td>
    </tr>
    <tr>
      <th>8</th>
      <td>10</td>
      <td>1.0</td>
      <td>0.506</td>
      <td>5.902</td>
    </tr>
    <tr>
      <th>9</th>
      <td>10</td>
      <td>1.0</td>
      <td>0.506</td>
      <td>5.902</td>
    </tr>
  </tbody>
</table>
</div>



<a id='geometry'></a>
# Acquiring geometries
As we saw in the above data is aggregated to predefined polygons and standard tiles. It is of course helpfull to have the geometries of these polygons and tiles. For this reason the Ellipsis API suports three ways of obtaining these geometries. You can either request all geometries, all geometries in a certain bounding box or all geometries by id.

Geometries are always returend as GeoJSON.

<a id='geometry/polygon'></a>
## Geometries for predefined polygons

The most straightforeward thing we could do is of course downloading all polygons of a certian layer. We saw in the metadata requests that our current map has the polygon layers 'reserve' and mine. Let's retrieve all polygons of type 'mine'.

#### geometry/polygon/all


```python
r = requests.post(url + '/geometry/polygon/all',
                 json = {"mapId":  mapId,'layer': 'Mine', 'timestamp':0})

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
      <td>POLYGON Z ((-54.65552 4.889224 0, -54.6505432 ...</td>
      <td>1</td>
      <td>Mine</td>
      <td>Mine1</td>
    </tr>
    <tr>
      <th>1</th>
      <td>POLYGON Z ((-54.82143 5.1544714 0, -54.81791 5...</td>
      <td>2</td>
      <td>Mine</td>
      <td>Mine2</td>
    </tr>
    <tr>
      <th>2</th>
      <td>POLYGON Z ((-54.9401321 5.098449 0, -54.92769 ...</td>
      <td>3</td>
      <td>Mine</td>
      <td>Mine3</td>
    </tr>
    <tr>
      <th>3</th>
      <td>POLYGON Z ((-54.7134552 4.375063 0, -54.74607 ...</td>
      <td>4</td>
      <td>Mine</td>
      <td>Mine4</td>
    </tr>
    <tr>
      <th>4</th>
      <td>POLYGON Z ((-55.40319 4.38190937 0, -55.400444...</td>
      <td>5</td>
      <td>Mine</td>
      <td>Mine5</td>
    </tr>
  </tbody>
</table>
</div>




![png](output_103_1.png)


In case we want to retrieve specific polygons we can also request them by id.
#### geometry/polygon/ids


```python
r = requests.post(url + '/geometry/polygon/ids',
                 json = {"mapId":  mapId, 'polygonIds':[1,2], 'timestamp':0})

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
      <td>POLYGON Z ((-54.65552 4.889224 0, -54.6505432 ...</td>
      <td>1</td>
      <td>Mine</td>
      <td>Mine1</td>
    </tr>
    <tr>
      <th>1</th>
      <td>POLYGON Z ((-54.82143 5.1544714 0, -54.81791 5...</td>
      <td>2</td>
      <td>Mine</td>
      <td>Mine2</td>
    </tr>
  </tbody>
</table>
</div>




![png](output_105_1.png)


Lastly we can request all polygons that are within a certain bounding box. As we cannot on forehand now how many polygons we will get as a response it might be wise to first probe how many polygons are contained in a certain bounding box. For this we can use the polygonsCount request.
#### metadata/polygonsCount


```python
r = requests.post(url + '/metadata/polygonsCount',
                 json = {"mapId":  mapId, 'timestamp': 0, 'layer': 'Mine' , 'xMin': -55 ,'xMax':-53, 'yMin':4, 'yMax':5 })

r = r.json()
r
```




    {'count': 2}



Well just two polygons is nothing to worry about. So let's request all polygons withing this bounding boxe then!
#### geometry/polygon/bounds


```python
r = requests.post(url + '/geometry/polygon/bounds',
                 json = {"mapId":  mapId, 'timestamp': 0, 'layer': 'Mine' , 'xMin': -55 ,'xMax':-53, 'yMin':4, 'yMax':5 })

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
      <td>POLYGON Z ((-54.7134552 4.375063 0, -54.74607 ...</td>
      <td>4</td>
      <td>Mine</td>
      <td>Mine4</td>
    </tr>
    <tr>
      <th>1</th>
      <td>POLYGON Z ((-54.65552 4.889224 0, -54.6505432 ...</td>
      <td>1</td>
      <td>Mine</td>
      <td>Mine1</td>
    </tr>
  </tbody>
</table>
</div>




![png](output_109_1.png)


<a id='geometry/tile'></a>
## Geometries for standard tiles
In the same way as for the predefined polygons we can request the geometries of predefined polygons.

We start by simply requesting all tiles of the map.

#### geometry/tiles/all


```python
r = requests.post(url + '/geometry/tile/all',
                 json = {"mapId":  mapId,'layer': 'Mine', 'timestamp':0})

r  = gpd.GeoDataFrame.from_features(r.json()['features'])
r.plot()
```




    <matplotlib.axes._subplots.AxesSubplot at 0x7f6ffbe090b8>




![png](output_112_1.png)


Secondly we can request standart tiles by specifying their tileX and tileY coordinates.
#### geometry/tiles/ids


```python
r = requests.post(url + '/geometry/tile/ids',
                 json = {"mapId":  mapId, 'tileIds':[{'tileX':5704,'tileY':7971}, {'tileX':5705,'tileY':7973}], 'timestamp':0})

r  = gpd.GeoDataFrame.from_features(r.json()['features'])
r.plot()
```




    <matplotlib.axes._subplots.AxesSubplot at 0x7f6ffb8ea6a0>




![png](output_114_1.png)


Laslty we request all tiles within a certain bounding box.

First we probe how many tiles we are dealing with.
#### metadata/tilesCount


```python
r = requests.post(url + '/metadata/tilesCount',
                 json = {"mapId":  mapId, 'timestamp': 0, 'xMin': -55 ,'xMax':-53, 'yMin':4, 'yMax':5 })

r = r.json()
r
```




    {'count': 916}



916 is not too band, let's request them.
#### geometry/tiles/bounds


```python
r = requests.post(url + '/geometry/tile/bounds',
                 json = {"mapId":  mapId, 'timestamp': 0 , 'xMin': -55 ,'xMax':-53, 'yMin':4, 'yMax':5 })

r  = gpd.GeoDataFrame.from_features(r.json()['features'])
r.plot()

```




    <matplotlib.axes._subplots.AxesSubplot at 0x7f6ffb8fb4a8>




![png](output_118_1.png)


<a id='visual'></a>
# Acquiring visualisations

Aside from data we of course would also like to retrieve visualisations. We can obtain these visualisations for all tile layers that we found in the metadata section.

It is very easy to obtain an image of an area. You can simply specify the boudning box coordinates of your area of interest, the timerange over which you want to mosaic and the layer that you want to visualise.
#### visual


```python
r = requests.post(url + '/visual/bounds',
                 json = {"mapId":  mapId, 'timestampMin':1, 'timestampMax':8, 'layerName':'rgb', 'xMin': -55 ,'xMax':-53, 'yMin':4, 'yMax':5 })


img = mpimg.imread(BytesIO(r.content))
plt.imshow(img)
```




    <matplotlib.image.AxesImage at 0x7f6ffbdff1d0>




![png](output_121_1.png)


The API always makes sure that the returned image is addapted to you level of zoom. It prevents the largest dimension of your image to get larger then 1024 pixels.

The API mosaics the images from more recent to less recent. In case no cloudless footage is found that area of the map will render as blanc.
