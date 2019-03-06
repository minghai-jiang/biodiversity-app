
# Ellipsis Earth tutorial

This document is meant as a brief tutorial for anyone who wants to use Ellipsis-Earth data through our API and WebMapService (WMS). We will go through all the possible requests you can make to our services, which give you access to a treasure of geodata processed by our cluster. You can start building your own amazing apps or notebooks with very little programming experience.

There are two ways to access our data. The WMS is meant for making interactive maps and attractive visualisations. The API is meant for performing analysis or automated information extraction. Both services will be covered in this tutorial.

This document is meant as a quick tutorial, showing all the options without going into the specifics. For a more brief description of the requests and their parameters, please take a look at the documentation instead. To see the full potential and power of the WMS and API, please visit one of our demo-notebooks in the Ellipsis-Gallery.

### Content

1.  **Ellipsis Data**: A few quick notes on how the data is structured.
2.	**Importing and understanding the requests package**: Some Python specific information on how to use an API.
3.	**Logging in**: How to obtain a token to access optional private information.
4.	**Retrieving metadata**: How to get an overview of the available information.
5.	**Retrieving data**: How to obtain data.
6.	**Retrieving images**: How to obtain visualizations.
7.	**Retrieving polygons**: How to obtain the predefined polygons of a map.

## Ellipsis Data

Ellipsis data is always connected to a map. When we refer to a map, we mean all available data and visualisations of a certain monitoring project. Maps consist of multiple timestamps, each of which contain all data and visualisations of that map acquired at a certain period in the past.

Data is visualized for the WMS and aggregated for the API for each timestamp in each map.

### Standard tiles

Ellipsis-Earth uses a large set of predefined standard tiles covering the entire globe. A tile can be uniquely identified by a tile_x, tile_y, and tile_zoom. The tile_zoom parameter determines the size of the tile. The other two parameters identify the respective x and y position of the tile on the globe in that zoom level. 

Specifically, Ellipsis-Earth tiles work in the same way as Open Street Map tiles. That is to say, the globe between 85 degrees south and north of the Equator is projected to a square in a way that preserves angles. After that the zoom levels 0,1,2,...,14 are defined. For each zoom level, the (now square) world map is divided into 2^zoomlevel by 2^zoomlevel tiles. The tile in the upper left corner has tile_x = 0 and tile_y =0 and the tile in the lower right corner has tile_x =  2^zoomlevel -1 and tile_y = 2^zoomlevel-1.

These tiles are used both in the API and WMS.

### Aggregation

Data is always both aggregated to standard tiles as well as predefined polygons. In case of land cover classes,  aggregations are made by taking the total surface area of each class within the aggregated region. In case of spectral indices, means are taken over the whole area.

There are a few get and post requests that allow you to obtain the geometry of these predefined polygons.

### WMS layers
All timestamps consist of layers. Each layer contains a certain type of visualization of the timestamp. There are four types of layers:

1.	**Images**: Visualizations of the raw satellite data, for example, RGB, false color or infrared.
2.	**Indices**: Heatmaps of the indices.
3.	**Labels**: Maps in which each class has a certain color.
4.	**Changes**: Maps in which each pixel that underwent a certain change has a certain color.

Each layer consists of a collection of PNG's of all standard tiles that are saved under a structured URL.

This is actually a standard way of working. If you supply a framework like Leaflet or arcGIS with the correct base URL, it will be able to construct an interactive map and render it on the fly. We will get to this in the section on WMS images.

### Request types
Ellipsis supports a large number of requests to our API. We categorise them in the following way:

1. **Metadata**: All requests that gather information about what data is available.
2. **Classes**: All requests that gather surface areas of classes
3. **Indices**: All requests that gather mean spectral indices
4. **Indices per class**: All requests that gather mean spectral indices when restricted to a specific class.
5. **WMS images**: All requests that retrieve PNG images.
6. **Polygons**: All requests that collect the geometries of predefined polygons.

This categorisation is reflected in the sections below.

## Importing and understanding the requests package

First, we import the requests package. This is a standard Python package that can be used to send get and post requests to URLs.


```python
import requests
```

The two functions from this package that we will be using are requests.post() and requests.get(). For both of these the first argument of the function is the URL to which we would like to send the request. The post request takes a second argument aswell; a dictionary of parameters of this request. Whether we use a post or a get function depends on the type of request.


```python
r = requests.post('http://www.example.com', 
                  data = {'parameter1':'value1','parameter2':'value2'})
```


```python
r = requests.get('http://www.example.com')
```

The response coming from the example URL with parameter 'key' set to 'value' is now stored in r.

In case we are accessing information for which we need to be logged in, we should add a token to our request. We can do this by using the header argument of these functions.


```python
r = requests.post('http://www.example.com', 
                  data = {'key':'value'}, 
                  headers = {"Authorization":'Your_token'})
```


```python
r = requests.get('http://www.example.com', 
                 headers = {"Authorization":'Your_token'})
```

Now let's have a look at r. If we print it directly we get the response code of our request.


```python
print(r)
```

    <Response [400]>
    

We get response code 400. This means that we made a bad request. Of course, our made-up URL and parameters did not result into anything. If we, however, would have made a good request, r would have had response code 200.

### Interpreting responses

If we want to access the data in the reply of r, we need to convert it to some kind of Python object. If the reply is a JSON object, we could convert it to a dictionary using the following command.


```python
#print(r.json())
```

The Ellipsis-Earth API sends most of its data in CSV format however. We can convert the reply r to text in the following way.


```python
#print(r.text)
```

A CSV as a string might not be the most convenient Python object to work with. It makes more sense to convert this string to a data frame. For this, we need to import the pandas and io packages.


```python
import pandas as pd
from io import StringIO
```

Using these packages we can convert the reply to a data frame with the following simple line of code:


```python
#data = pd.read_csv(StringIO(r.text))
```

### Receiving PNG responses

Now lastly, we would like to be able to request images. This is needed for visualizations stored in the Ellipsis WMS.


```python
r= requests.get('http://example.com',
                 data= {'param':'value'},
                 stream=True,
                 headers = {"Authorization":'my_token'})
```

The next step is now to save this image as a .png to our local disk.


```python
import shutil
#with open('img.png', 'wb') as out_file:
#    shutil.copyfileobj(r.raw, out_file)
```

We can use a library like matplotlib to read this image as a Python object.


```python
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
```


```python
#img=mpimg.imread('img.png')

#imgplot = plt.imshow(img)
#print(imgplot)
```

## Logging in

Some maps are public and can be accessed without a token. However, if we want to access maps that are private, meaning accessible only to specific people or organizations, we will need to send a token with our request. We can obtain this token by sending a post request with a username and password as parameters. In case you are interested in public maps only, you can skip this step and go to the next section.

For this tutorial we will use the demo account demo_user:


```python
r =requests.post('https://api.ellipsis-earth.com/account/login',
                 data = {'username':'demo_user', 'password':'demo_user'} )
print(r.text)
```

    {"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRlbW9fdXNlciIsImlhdCI6MTU1MTQ0NjgwNywiZXhwIjoxNTUxNTMzMjA3fQ.ndxoWgxcrj1PFQkFmErzD68gEKfmXfJpfbab4YXrb70"}
    

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

    Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRlbW9fdXNlciIsImlhdCI6MTU1MTQ0NjgwNywiZXhwIjoxNTUxNTMzMjA3fQ.ndxoWgxcrj1PFQkFmErzD68gEKfmXfJpfbab4YXrb70
    

To test whether our token is working, we send a get request with this token to the following authentication testing URL.


```python
r = requests.get('https://api.ellipsis-earth.com/account/ping', 
                 headers = {"Authorization":token} )
print(r)
```

    <Response [200]>
    

We get 200 as a response code which means that our token was valid and that we can use it perform actions that require authentication! The token we got will remain valid for a limited amount of time, after which we will need to request a new token by repeating the procedure above. The expiration time of a token is currently set to 12 hours.

## Retrieving metadata

All queries to the Ellipsis-Earth API should be sent to the following base URL followed by the query name.


```python
url = 'https://api.ellipsis-earth.com/queries/'
```

Now that we we have stored the URL in a variable, we need only concatenate the query name to it whenever we want to make a request.

### Available maps

The first question is of course which maps are available. To get all public maps and print them on-screen we can send the following command.


```python
r = requests.post(url + 'publicMaps')

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
      <th>map_id</th>
      <th>name</th>
      <th>public</th>
      <th>x1</th>
      <th>y1</th>
      <th>x2</th>
      <th>y2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>810b31c3-6335-45fe-8120-972e2d1c7da8</td>
      <td>Suriname</td>
      <td>True</td>
      <td>1.0</td>
      <td>2.0</td>
      <td>1.0</td>
      <td>2.0</td>
    </tr>
    <tr>
      <th>1</th>
      <td>27baf4f7-da8f-4ca5-8f0a-67a2e8799ce5</td>
      <td>Belgium Clouds</td>
      <td>True</td>
      <td>1.0</td>
      <td>2.0</td>
      <td>1.0</td>
      <td>2.0</td>
    </tr>
    <tr>
      <th>2</th>
      <td>8668df99-8c34-4085-b8fe-6e056af6a8ab</td>
      <td>Netherlands Fields</td>
      <td>True</td>
      <td>1.0</td>
      <td>2.0</td>
      <td>1.0</td>
      <td>2.0</td>
    </tr>
    <tr>
      <th>3</th>
      <td>e4c704c1-1d0d-450d-b2df-4cc03fe4da6a</td>
      <td>Chaco Demo</td>
      <td>True</td>
      <td>1.0</td>
      <td>2.0</td>
      <td>1.0</td>
      <td>2.0</td>
    </tr>
    <tr>
      <th>4</th>
      <td>f7f5ae51-1ff6-4e8b-98e0-37f5d0a97cb7</td>
      <td>Chaco Demo 2</td>
      <td>True</td>
      <td>1.0</td>
      <td>2.0</td>
      <td>1.0</td>
      <td>2.0</td>
    </tr>
  </tbody>
</table>
</div>



It seems there is a public map available for us! In this tutorial we will focus on the 'Suriname FSC' map. For convenience let's save the map_id of this map as variable.


```python
map_id = r[r['name'] == 'Suriname']['map_id'].values[0]
```

If we are interested in our private maps we send the following request, this time accompanied by our token:


```python
r = requests.post(url + 'myMaps',
                 headers = {"Authorization":token})

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
      <th>no data</th>
    </tr>
  </thead>
  <tbody>
  </tbody>
</table>
</div>



### Map available data

Now we found what maps we have access to we can start looking at what data is available for these maps. We already stored the map id of our map of interest in the variable map_id

Let's see what timestamps are available for this map.


```python
r = requests.post(url + 'timestamps_map',
                 data = {"mapId":  map_id })

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
      <th>date_from</th>
      <th>date_to</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>0</td>
      <td>2018-01-01</td>
      <td>2018-01-15</td>
    </tr>
    <tr>
      <th>1</th>
      <td>1</td>
      <td>2018-02-01</td>
      <td>2018-02-15</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2</td>
      <td>2018-03-01</td>
      <td>2018-03-15</td>
    </tr>
    <tr>
      <th>3</th>
      <td>3</td>
      <td>2018-04-01</td>
      <td>2018-04-15</td>
    </tr>
    <tr>
      <th>4</th>
      <td>4</td>
      <td>2018-05-01</td>
      <td>2018-05-15</td>
    </tr>
    <tr>
      <th>5</th>
      <td>5</td>
      <td>2018-06-01</td>
      <td>2018-06-15</td>
    </tr>
    <tr>
      <th>6</th>
      <td>6</td>
      <td>2018-07-01</td>
      <td>2018-07-15</td>
    </tr>
    <tr>
      <th>7</th>
      <td>7</td>
      <td>2018-08-01</td>
      <td>2018-08-15</td>
    </tr>
    <tr>
      <th>8</th>
      <td>8</td>
      <td>2018-09-01</td>
      <td>2018-09-15</td>
    </tr>
    <tr>
      <th>9</th>
      <td>9</td>
      <td>2018-10-01</td>
      <td>2018-10-15</td>
    </tr>
    <tr>
      <th>10</th>
      <td>10</td>
      <td>2018-11-01</td>
      <td>2018-11-15</td>
    </tr>
    <tr>
      <th>11</th>
      <td>11</td>
      <td>2018-12-01</td>
      <td>2018-12-15</td>
    </tr>
  </tbody>
</table>
</div>



There seem to be a couple of timestamps available! Let's have a look at what data has been acquired in these timestamps.

First of all, we request the classes of this map.


```python
r = requests.post(url + 'classes_map',
                 data = {"mapId":  map_id })

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
      <th>version</th>
      <th>class</th>
      <th>color</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>0</td>
      <td>1</td>
      <td>blanc</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>1</th>
      <td>0</td>
      <td>1</td>
      <td>disturbance</td>
      <td>ff0000ff</td>
    </tr>
    <tr>
      <th>2</th>
      <td>0</td>
      <td>1</td>
      <td>mask</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>3</th>
      <td>0</td>
      <td>1</td>
      <td>no class</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>4</th>
      <td>1</td>
      <td>1</td>
      <td>blanc</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>5</th>
      <td>1</td>
      <td>1</td>
      <td>disturbance</td>
      <td>ff0000ff</td>
    </tr>
    <tr>
      <th>6</th>
      <td>1</td>
      <td>1</td>
      <td>mask</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>7</th>
      <td>1</td>
      <td>1</td>
      <td>no class</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>8</th>
      <td>2</td>
      <td>1</td>
      <td>blanc</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>9</th>
      <td>2</td>
      <td>1</td>
      <td>disturbance</td>
      <td>ff0000ff</td>
    </tr>
    <tr>
      <th>10</th>
      <td>2</td>
      <td>1</td>
      <td>mask</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>11</th>
      <td>2</td>
      <td>1</td>
      <td>no class</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>12</th>
      <td>3</td>
      <td>1</td>
      <td>blanc</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>13</th>
      <td>3</td>
      <td>1</td>
      <td>disturbance</td>
      <td>ff0000ff</td>
    </tr>
    <tr>
      <th>14</th>
      <td>3</td>
      <td>1</td>
      <td>mask</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>15</th>
      <td>3</td>
      <td>1</td>
      <td>no class</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>16</th>
      <td>4</td>
      <td>1</td>
      <td>blanc</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>17</th>
      <td>4</td>
      <td>1</td>
      <td>disturbance</td>
      <td>ff0000ff</td>
    </tr>
    <tr>
      <th>18</th>
      <td>4</td>
      <td>1</td>
      <td>mask</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>19</th>
      <td>4</td>
      <td>1</td>
      <td>no class</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>20</th>
      <td>5</td>
      <td>1</td>
      <td>blanc</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>21</th>
      <td>5</td>
      <td>1</td>
      <td>disturbance</td>
      <td>ff0000ff</td>
    </tr>
    <tr>
      <th>22</th>
      <td>5</td>
      <td>1</td>
      <td>mask</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>23</th>
      <td>5</td>
      <td>1</td>
      <td>no class</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>24</th>
      <td>6</td>
      <td>1</td>
      <td>blanc</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>25</th>
      <td>6</td>
      <td>1</td>
      <td>disturbance</td>
      <td>ff0000ff</td>
    </tr>
    <tr>
      <th>26</th>
      <td>6</td>
      <td>1</td>
      <td>mask</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>27</th>
      <td>6</td>
      <td>1</td>
      <td>no class</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>28</th>
      <td>7</td>
      <td>1</td>
      <td>blanc</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>29</th>
      <td>7</td>
      <td>1</td>
      <td>disturbance</td>
      <td>ff0000ff</td>
    </tr>
    <tr>
      <th>30</th>
      <td>7</td>
      <td>1</td>
      <td>mask</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>31</th>
      <td>7</td>
      <td>1</td>
      <td>no class</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>32</th>
      <td>8</td>
      <td>1</td>
      <td>blanc</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>33</th>
      <td>8</td>
      <td>1</td>
      <td>disturbance</td>
      <td>ff0000ff</td>
    </tr>
    <tr>
      <th>34</th>
      <td>8</td>
      <td>1</td>
      <td>mask</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>35</th>
      <td>8</td>
      <td>1</td>
      <td>no class</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>36</th>
      <td>9</td>
      <td>1</td>
      <td>blanc</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>37</th>
      <td>9</td>
      <td>1</td>
      <td>disturbance</td>
      <td>ff0000ff</td>
    </tr>
    <tr>
      <th>38</th>
      <td>9</td>
      <td>1</td>
      <td>mask</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>39</th>
      <td>9</td>
      <td>1</td>
      <td>no class</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>40</th>
      <td>10</td>
      <td>1</td>
      <td>blanc</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>41</th>
      <td>10</td>
      <td>1</td>
      <td>disturbance</td>
      <td>ff0000ff</td>
    </tr>
    <tr>
      <th>42</th>
      <td>10</td>
      <td>1</td>
      <td>mask</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>43</th>
      <td>10</td>
      <td>1</td>
      <td>no class</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>44</th>
      <td>11</td>
      <td>1</td>
      <td>blanc</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>45</th>
      <td>11</td>
      <td>1</td>
      <td>disturbance</td>
      <td>ff0000ff</td>
    </tr>
    <tr>
      <th>46</th>
      <td>11</td>
      <td>1</td>
      <td>mask</td>
      <td>00000000</td>
    </tr>
    <tr>
      <th>47</th>
      <td>11</td>
      <td>1</td>
      <td>no class</td>
      <td>00000000</td>
    </tr>
  </tbody>
</table>
</div>



This table lists what classes are available for each timestamp. Since there might have been a version update of the classifying model there is an additional column to express what version of the model was run to obtain the conclusion. The color-column encodes what color this label has in the WebMapService visualization.

We can apply the same method for the spectral indices.


```python
r = requests.post(url + 'indices_map',
                 data = {"mapId":  map_id })

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
      <th>version</th>
      <th>index</th>
      <th>color</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>0</td>
      <td>1</td>
      <td>NDVI</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>1</th>
      <td>0</td>
      <td>1</td>
      <td>NDWI</td>
      <td>0000ffff</td>
    </tr>
    <tr>
      <th>2</th>
      <td>1</td>
      <td>1</td>
      <td>NDVI</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>3</th>
      <td>1</td>
      <td>1</td>
      <td>NDWI</td>
      <td>0000ffff</td>
    </tr>
    <tr>
      <th>4</th>
      <td>2</td>
      <td>1</td>
      <td>NDVI</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>5</th>
      <td>2</td>
      <td>1</td>
      <td>NDWI</td>
      <td>0000ffff</td>
    </tr>
    <tr>
      <th>6</th>
      <td>3</td>
      <td>1</td>
      <td>NDVI</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>7</th>
      <td>3</td>
      <td>1</td>
      <td>NDWI</td>
      <td>0000ffff</td>
    </tr>
    <tr>
      <th>8</th>
      <td>4</td>
      <td>1</td>
      <td>NDVI</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>9</th>
      <td>4</td>
      <td>1</td>
      <td>NDWI</td>
      <td>0000ffff</td>
    </tr>
    <tr>
      <th>10</th>
      <td>5</td>
      <td>1</td>
      <td>NDVI</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>11</th>
      <td>5</td>
      <td>1</td>
      <td>NDWI</td>
      <td>0000ffff</td>
    </tr>
    <tr>
      <th>12</th>
      <td>6</td>
      <td>1</td>
      <td>NDVI</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>13</th>
      <td>6</td>
      <td>1</td>
      <td>NDWI</td>
      <td>0000ffff</td>
    </tr>
    <tr>
      <th>14</th>
      <td>7</td>
      <td>1</td>
      <td>NDVI</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>15</th>
      <td>7</td>
      <td>1</td>
      <td>NDWI</td>
      <td>0000ffff</td>
    </tr>
    <tr>
      <th>16</th>
      <td>8</td>
      <td>1</td>
      <td>NDVI</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>17</th>
      <td>8</td>
      <td>1</td>
      <td>NDWI</td>
      <td>0000ffff</td>
    </tr>
    <tr>
      <th>18</th>
      <td>9</td>
      <td>1</td>
      <td>NDVI</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>19</th>
      <td>9</td>
      <td>1</td>
      <td>NDWI</td>
      <td>0000ffff</td>
    </tr>
    <tr>
      <th>20</th>
      <td>10</td>
      <td>1</td>
      <td>NDVI</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>21</th>
      <td>10</td>
      <td>1</td>
      <td>NDWI</td>
      <td>0000ffff</td>
    </tr>
    <tr>
      <th>22</th>
      <td>11</td>
      <td>1</td>
      <td>NDVI</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>23</th>
      <td>11</td>
      <td>1</td>
      <td>NDWI</td>
      <td>0000ffff</td>
    </tr>
  </tbody>
</table>
</div>



We obtain very similar information only this time the names of the indices are displayed instead of the names of the classes.

### Polygon layers

A map usually has some predefined polygons. These polygons can be grouped into certain types, like protected reserve or industrial area, if that data is available. Those collections are called layers. We can request the layers of the predefined polygons as follows.


```python
r = requests.post(url + 'polygonsLayers_map',
                 data = {"mapId":  map_id })

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
      <th>layer</th>
      <th>version</th>
      <th>color</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>0</td>
      <td>Mine</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>1</th>
      <td>0</td>
      <td>Reserve</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>2</th>
      <td>0</td>
      <td>polygon</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>3</th>
      <td>1</td>
      <td>Mine</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>4</th>
      <td>1</td>
      <td>Reserve</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>5</th>
      <td>1</td>
      <td>polygon</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>6</th>
      <td>2</td>
      <td>Mine</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>7</th>
      <td>2</td>
      <td>Reserve</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>8</th>
      <td>2</td>
      <td>polygon</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>9</th>
      <td>3</td>
      <td>Mine</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>10</th>
      <td>3</td>
      <td>Reserve</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>11</th>
      <td>3</td>
      <td>polygon</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>12</th>
      <td>4</td>
      <td>Mine</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>13</th>
      <td>4</td>
      <td>Reserve</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>14</th>
      <td>4</td>
      <td>polygon</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>15</th>
      <td>5</td>
      <td>Mine</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>16</th>
      <td>5</td>
      <td>Reserve</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>17</th>
      <td>5</td>
      <td>polygon</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>18</th>
      <td>6</td>
      <td>Mine</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>19</th>
      <td>6</td>
      <td>Reserve</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>20</th>
      <td>6</td>
      <td>polygon</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>21</th>
      <td>7</td>
      <td>Mine</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>22</th>
      <td>7</td>
      <td>Reserve</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>23</th>
      <td>7</td>
      <td>polygon</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>24</th>
      <td>8</td>
      <td>Mine</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>25</th>
      <td>8</td>
      <td>Reserve</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>26</th>
      <td>8</td>
      <td>polygon</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>27</th>
      <td>9</td>
      <td>Mine</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>28</th>
      <td>9</td>
      <td>Reserve</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>29</th>
      <td>9</td>
      <td>polygon</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>30</th>
      <td>10</td>
      <td>Mine</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>31</th>
      <td>10</td>
      <td>Reserve</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>32</th>
      <td>10</td>
      <td>polygon</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>33</th>
      <td>11</td>
      <td>Mine</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>34</th>
      <td>11</td>
      <td>Reserve</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
    <tr>
      <th>35</th>
      <td>11</td>
      <td>polygon</td>
      <td>1</td>
      <td>00ff00ff</td>
    </tr>
  </tbody>
</table>
</div>



Since the predefined polygons might shift over time, the version is specified in a seperate column.

### Map layers

We can also request the map layers that are available for this map in the WMS. These are the different options the WMS can show, and they are not necessarily related to the polygon layers.


```python
r = requests.post(url + 'wmsLayers_map',
                 data = {"mapId":  map_id })

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
      <th>type</th>
      <th>name</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>0</td>
      <td>images</td>
      <td>rgb</td>
    </tr>
    <tr>
      <th>1</th>
      <td>0</td>
      <td>indices</td>
      <td>ndvi</td>
    </tr>
    <tr>
      <th>2</th>
      <td>0</td>
      <td>indices</td>
      <td>ndwi</td>
    </tr>
    <tr>
      <th>3</th>
      <td>0</td>
      <td>labels</td>
      <td>label</td>
    </tr>
    <tr>
      <th>4</th>
      <td>1</td>
      <td>images</td>
      <td>rgb</td>
    </tr>
    <tr>
      <th>5</th>
      <td>1</td>
      <td>indices</td>
      <td>ndvi</td>
    </tr>
    <tr>
      <th>6</th>
      <td>1</td>
      <td>indices</td>
      <td>ndwi</td>
    </tr>
    <tr>
      <th>7</th>
      <td>1</td>
      <td>labels</td>
      <td>label</td>
    </tr>
    <tr>
      <th>8</th>
      <td>2</td>
      <td>images</td>
      <td>rgb</td>
    </tr>
    <tr>
      <th>9</th>
      <td>2</td>
      <td>indices</td>
      <td>ndvi</td>
    </tr>
    <tr>
      <th>10</th>
      <td>2</td>
      <td>indices</td>
      <td>ndwi</td>
    </tr>
    <tr>
      <th>11</th>
      <td>2</td>
      <td>labels</td>
      <td>label</td>
    </tr>
    <tr>
      <th>12</th>
      <td>3</td>
      <td>images</td>
      <td>rgb</td>
    </tr>
    <tr>
      <th>13</th>
      <td>3</td>
      <td>indices</td>
      <td>ndvi</td>
    </tr>
    <tr>
      <th>14</th>
      <td>3</td>
      <td>indices</td>
      <td>ndwi</td>
    </tr>
    <tr>
      <th>15</th>
      <td>3</td>
      <td>labels</td>
      <td>label</td>
    </tr>
    <tr>
      <th>16</th>
      <td>4</td>
      <td>images</td>
      <td>rgb</td>
    </tr>
    <tr>
      <th>17</th>
      <td>4</td>
      <td>indices</td>
      <td>ndvi</td>
    </tr>
    <tr>
      <th>18</th>
      <td>4</td>
      <td>indices</td>
      <td>ndwi</td>
    </tr>
    <tr>
      <th>19</th>
      <td>4</td>
      <td>labels</td>
      <td>label</td>
    </tr>
    <tr>
      <th>20</th>
      <td>5</td>
      <td>images</td>
      <td>rgb</td>
    </tr>
    <tr>
      <th>21</th>
      <td>5</td>
      <td>indices</td>
      <td>ndvi</td>
    </tr>
    <tr>
      <th>22</th>
      <td>5</td>
      <td>indices</td>
      <td>ndwi</td>
    </tr>
    <tr>
      <th>23</th>
      <td>5</td>
      <td>labels</td>
      <td>label</td>
    </tr>
    <tr>
      <th>24</th>
      <td>6</td>
      <td>images</td>
      <td>rgb</td>
    </tr>
    <tr>
      <th>25</th>
      <td>6</td>
      <td>indices</td>
      <td>ndvi</td>
    </tr>
    <tr>
      <th>26</th>
      <td>6</td>
      <td>indices</td>
      <td>ndwi</td>
    </tr>
    <tr>
      <th>27</th>
      <td>6</td>
      <td>labels</td>
      <td>label</td>
    </tr>
    <tr>
      <th>28</th>
      <td>7</td>
      <td>images</td>
      <td>rgb</td>
    </tr>
    <tr>
      <th>29</th>
      <td>7</td>
      <td>indices</td>
      <td>ndvi</td>
    </tr>
    <tr>
      <th>30</th>
      <td>7</td>
      <td>indices</td>
      <td>ndwi</td>
    </tr>
    <tr>
      <th>31</th>
      <td>7</td>
      <td>labels</td>
      <td>label</td>
    </tr>
    <tr>
      <th>32</th>
      <td>8</td>
      <td>images</td>
      <td>rgb</td>
    </tr>
    <tr>
      <th>33</th>
      <td>8</td>
      <td>indices</td>
      <td>ndvi</td>
    </tr>
    <tr>
      <th>34</th>
      <td>8</td>
      <td>indices</td>
      <td>ndwi</td>
    </tr>
    <tr>
      <th>35</th>
      <td>8</td>
      <td>labels</td>
      <td>label</td>
    </tr>
    <tr>
      <th>36</th>
      <td>9</td>
      <td>images</td>
      <td>rgb</td>
    </tr>
    <tr>
      <th>37</th>
      <td>9</td>
      <td>indices</td>
      <td>ndvi</td>
    </tr>
    <tr>
      <th>38</th>
      <td>9</td>
      <td>indices</td>
      <td>ndwi</td>
    </tr>
    <tr>
      <th>39</th>
      <td>9</td>
      <td>labels</td>
      <td>label</td>
    </tr>
    <tr>
      <th>40</th>
      <td>10</td>
      <td>images</td>
      <td>rgb</td>
    </tr>
    <tr>
      <th>41</th>
      <td>10</td>
      <td>indices</td>
      <td>ndvi</td>
    </tr>
    <tr>
      <th>42</th>
      <td>10</td>
      <td>indices</td>
      <td>ndwi</td>
    </tr>
    <tr>
      <th>43</th>
      <td>10</td>
      <td>labels</td>
      <td>label</td>
    </tr>
    <tr>
      <th>44</th>
      <td>11</td>
      <td>images</td>
      <td>rgb</td>
    </tr>
    <tr>
      <th>45</th>
      <td>11</td>
      <td>indices</td>
      <td>ndvi</td>
    </tr>
    <tr>
      <th>46</th>
      <td>11</td>
      <td>indices</td>
      <td>ndwi</td>
    </tr>
    <tr>
      <th>47</th>
      <td>11</td>
      <td>labels</td>
      <td>label</td>
    </tr>
  </tbody>
</table>
</div>



Since a layer does not need to be available for each timestamp, the timestamps are added as a column. The type-column expresses the type of the layer.

With the type and name of a layer, we can retrieve cool visualizations and an interactive map using the WebMapService described below.

## Retrieving data via the API

There are many data queries available and, as mentioned before, they are all sent to the base URL followed by the name of the query. All post requests have two parameters. The first with key 'mapId' is the map_id, the second with key 'args' is an array of additional parameters for the request. Keep in mind that we need to place these parameters in the array in the right order!

### Retrieving information of classes based on an arbitrary polygon

We can define an arbitrary polygon by specifying a sequence of coordinate tuples as follows:


```python
coords = ['(-55,4.1)', '(-55.5,4.2)', '(-55.2,4.2)','(-52.3,5.15)', '(-52,5)']
```

If we are interested in information about the classes on this polygon, there are two queries available.

First off we can obtain the aggregated surface area of each class for this polygon for all timestamps.


```python
r = requests.post(url + 'classes_timestamps_customPolygon',
                 data = {"mapId":  map_id, 'args':coords })

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
      <th>total_area</th>
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
      <td>1543.664</td>
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
      <td>1544.664</td>
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
      <td>1545.664</td>
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
      <td>1546.664</td>
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
      <td>1547.664</td>
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
      <td>1548.664</td>
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
      <td>1549.664</td>
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
      <td>1550.664</td>
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
      <td>1551.664</td>
      <td>2018-10-01</td>
      <td>2018-10-15</td>
    </tr>
    <tr>
      <th>10</th>
      <td>10</td>
      <td>124.488598</td>
      <td>57.339343</td>
      <td>0.248130</td>
      <td>1360.587930</td>
      <td>1552.664</td>
      <td>2018-11-01</td>
      <td>2018-11-15</td>
    </tr>
    <tr>
      <th>11</th>
      <td>11</td>
      <td>124.488598</td>
      <td>57.051231</td>
      <td>0.198523</td>
      <td>1360.925649</td>
      <td>1553.664</td>
      <td>2018-12-01</td>
      <td>2018-12-15</td>
    </tr>
  </tbody>
</table>
</div>



Secondly, we can get these surface areas per tile for one timestamp. Say timestamp 0.


```python
r = requests.post(url + 'classes_tiles_timestamp_customPolygon',
                 data = {"mapId":  map_id, 'args':[0] + coords })

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
      <th>tile_zoom</th>
      <th>x</th>
      <th>y</th>
      <th>blanc</th>
      <th>disturbance</th>
      <th>mask</th>
      <th>no class</th>
      <th>total_area</th>
      <th>xmin</th>
      <th>xmax</th>
      <th>ymin</th>
      <th>ymax</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>14</td>
      <td>5666</td>
      <td>8000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>5.318601</td>
      <td>0.592399</td>
      <td>5.911</td>
      <td>-55.502930</td>
      <td>-55.480957</td>
      <td>4.207968</td>
      <td>4.214943</td>
    </tr>
    <tr>
      <th>1</th>
      <td>14</td>
      <td>5667</td>
      <td>8000</td>
      <td>0.000000</td>
      <td>0.016506</td>
      <td>5.270618</td>
      <td>0.623877</td>
      <td>5.911</td>
      <td>-55.480957</td>
      <td>-55.458984</td>
      <td>4.207968</td>
      <td>4.214943</td>
    </tr>
    <tr>
      <th>2</th>
      <td>14</td>
      <td>5667</td>
      <td>8001</td>
      <td>0.000000</td>
      <td>0.155702</td>
      <td>3.118198</td>
      <td>2.638100</td>
      <td>5.912</td>
      <td>-55.480957</td>
      <td>-55.458984</td>
      <td>4.186054</td>
      <td>4.193030</td>
    </tr>
    <tr>
      <th>3</th>
      <td>14</td>
      <td>5668</td>
      <td>8000</td>
      <td>0.000000</td>
      <td>0.157660</td>
      <td>5.192419</td>
      <td>0.560921</td>
      <td>5.911</td>
      <td>-55.458984</td>
      <td>-55.437012</td>
      <td>4.207968</td>
      <td>4.214943</td>
    </tr>
    <tr>
      <th>4</th>
      <td>14</td>
      <td>5668</td>
      <td>8001</td>
      <td>0.000000</td>
      <td>0.051329</td>
      <td>4.907602</td>
      <td>0.953068</td>
      <td>5.912</td>
      <td>-55.458984</td>
      <td>-55.437012</td>
      <td>4.186054</td>
      <td>4.193030</td>
    </tr>
    <tr>
      <th>5</th>
      <td>14</td>
      <td>5669</td>
      <td>8000</td>
      <td>0.000000</td>
      <td>0.344544</td>
      <td>3.046957</td>
      <td>2.519499</td>
      <td>5.911</td>
      <td>-55.437012</td>
      <td>-55.415039</td>
      <td>4.207968</td>
      <td>4.214943</td>
    </tr>
    <tr>
      <th>6</th>
      <td>14</td>
      <td>5669</td>
      <td>8001</td>
      <td>0.000000</td>
      <td>0.021560</td>
      <td>4.652489</td>
      <td>1.237951</td>
      <td>5.912</td>
      <td>-55.437012</td>
      <td>-55.415039</td>
      <td>4.186054</td>
      <td>4.193030</td>
    </tr>
    <tr>
      <th>7</th>
      <td>14</td>
      <td>5670</td>
      <td>8000</td>
      <td>0.000000</td>
      <td>0.019572</td>
      <td>4.782213</td>
      <td>1.109214</td>
      <td>5.911</td>
      <td>-55.415039</td>
      <td>-55.393066</td>
      <td>4.207968</td>
      <td>4.214943</td>
    </tr>
    <tr>
      <th>8</th>
      <td>14</td>
      <td>5670</td>
      <td>8001</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>5.495230</td>
      <td>0.416770</td>
      <td>5.912</td>
      <td>-55.415039</td>
      <td>-55.393066</td>
      <td>4.186054</td>
      <td>4.193030</td>
    </tr>
    <tr>
      <th>9</th>
      <td>14</td>
      <td>5671</td>
      <td>8000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>5.387871</td>
      <td>0.523129</td>
      <td>5.911</td>
      <td>-55.393066</td>
      <td>-55.371094</td>
      <td>4.207968</td>
      <td>4.214943</td>
    </tr>
    <tr>
      <th>10</th>
      <td>14</td>
      <td>5671</td>
      <td>8001</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>4.550100</td>
      <td>1.361900</td>
      <td>5.912</td>
      <td>-55.393066</td>
      <td>-55.371094</td>
      <td>4.186054</td>
      <td>4.193030</td>
    </tr>
    <tr>
      <th>11</th>
      <td>14</td>
      <td>5672</td>
      <td>8000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>5.683078</td>
      <td>0.227922</td>
      <td>5.911</td>
      <td>-55.371094</td>
      <td>-55.349121</td>
      <td>4.207968</td>
      <td>4.214943</td>
    </tr>
    <tr>
      <th>12</th>
      <td>14</td>
      <td>5672</td>
      <td>8001</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>4.845808</td>
      <td>1.066192</td>
      <td>5.912</td>
      <td>-55.371094</td>
      <td>-55.349121</td>
      <td>4.186054</td>
      <td>4.193030</td>
    </tr>
    <tr>
      <th>13</th>
      <td>14</td>
      <td>5672</td>
      <td>8002</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>4.621186</td>
      <td>1.290814</td>
      <td>5.912</td>
      <td>-55.371094</td>
      <td>-55.349121</td>
      <td>4.164140</td>
      <td>4.171115</td>
    </tr>
    <tr>
      <th>14</th>
      <td>14</td>
      <td>5673</td>
      <td>8000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>5.872216</td>
      <td>0.038784</td>
      <td>5.911</td>
      <td>-55.349121</td>
      <td>-55.327148</td>
      <td>4.207968</td>
      <td>4.214943</td>
    </tr>
    <tr>
      <th>15</th>
      <td>14</td>
      <td>5673</td>
      <td>8001</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>5.430098</td>
      <td>0.481902</td>
      <td>5.912</td>
      <td>-55.349121</td>
      <td>-55.327148</td>
      <td>4.186054</td>
      <td>4.193030</td>
    </tr>
    <tr>
      <th>16</th>
      <td>14</td>
      <td>5673</td>
      <td>8002</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>5.117701</td>
      <td>0.794299</td>
      <td>5.912</td>
      <td>-55.349121</td>
      <td>-55.327148</td>
      <td>4.164140</td>
      <td>4.171115</td>
    </tr>
    <tr>
      <th>17</th>
      <td>14</td>
      <td>5674</td>
      <td>8000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>5.851381</td>
      <td>0.059619</td>
      <td>5.911</td>
      <td>-55.327148</td>
      <td>-55.305176</td>
      <td>4.207968</td>
      <td>4.214943</td>
    </tr>
    <tr>
      <th>18</th>
      <td>14</td>
      <td>5674</td>
      <td>8001</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>5.502808</td>
      <td>0.409192</td>
      <td>5.912</td>
      <td>-55.327148</td>
      <td>-55.305176</td>
      <td>4.186054</td>
      <td>4.193030</td>
    </tr>
    <tr>
      <th>19</th>
      <td>14</td>
      <td>5674</td>
      <td>8002</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>5.885388</td>
      <td>0.026612</td>
      <td>5.912</td>
      <td>-55.327148</td>
      <td>-55.305176</td>
      <td>4.164140</td>
      <td>4.171115</td>
    </tr>
    <tr>
      <th>20</th>
      <td>14</td>
      <td>5675</td>
      <td>8000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>5.911000</td>
      <td>0.000000</td>
      <td>5.911</td>
      <td>-55.305176</td>
      <td>-55.283203</td>
      <td>4.207968</td>
      <td>4.214943</td>
    </tr>
    <tr>
      <th>21</th>
      <td>14</td>
      <td>5675</td>
      <td>8001</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>5.769558</td>
      <td>0.142442</td>
      <td>5.912</td>
      <td>-55.305176</td>
      <td>-55.283203</td>
      <td>4.186054</td>
      <td>4.193030</td>
    </tr>
    <tr>
      <th>22</th>
      <td>14</td>
      <td>5675</td>
      <td>8002</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>5.912000</td>
      <td>0.000000</td>
      <td>5.912</td>
      <td>-55.305176</td>
      <td>-55.283203</td>
      <td>4.164140</td>
      <td>4.171115</td>
    </tr>
    <tr>
      <th>23</th>
      <td>14</td>
      <td>5676</td>
      <td>8000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>5.862836</td>
      <td>0.048164</td>
      <td>5.911</td>
      <td>-55.283203</td>
      <td>-55.261230</td>
      <td>4.207968</td>
      <td>4.214943</td>
    </tr>
    <tr>
      <th>24</th>
      <td>14</td>
      <td>5676</td>
      <td>8001</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>4.529893</td>
      <td>1.382107</td>
      <td>5.912</td>
      <td>-55.283203</td>
      <td>-55.261230</td>
      <td>4.186054</td>
      <td>4.193030</td>
    </tr>
    <tr>
      <th>25</th>
      <td>14</td>
      <td>5676</td>
      <td>8002</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>5.912000</td>
      <td>0.000000</td>
      <td>5.912</td>
      <td>-55.283203</td>
      <td>-55.261230</td>
      <td>4.164140</td>
      <td>4.171115</td>
    </tr>
    <tr>
      <th>26</th>
      <td>14</td>
      <td>5677</td>
      <td>8000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>5.775257</td>
      <td>0.135743</td>
      <td>5.911</td>
      <td>-55.261230</td>
      <td>-55.239258</td>
      <td>4.207968</td>
      <td>4.214943</td>
    </tr>
    <tr>
      <th>27</th>
      <td>14</td>
      <td>5677</td>
      <td>8001</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>5.495410</td>
      <td>0.416590</td>
      <td>5.912</td>
      <td>-55.261230</td>
      <td>-55.239258</td>
      <td>4.186054</td>
      <td>4.193030</td>
    </tr>
    <tr>
      <th>28</th>
      <td>14</td>
      <td>5677</td>
      <td>8002</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>5.912000</td>
      <td>0.000000</td>
      <td>5.912</td>
      <td>-55.261230</td>
      <td>-55.239258</td>
      <td>4.164140</td>
      <td>4.171115</td>
    </tr>
    <tr>
      <th>29</th>
      <td>14</td>
      <td>5677</td>
      <td>8003</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>5.912000</td>
      <td>0.000000</td>
      <td>5.912</td>
      <td>-55.261230</td>
      <td>-55.239258</td>
      <td>4.142225</td>
      <td>4.149201</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>231</th>
      <td>14</td>
      <td>5709</td>
      <td>7990</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>5.127491</td>
      <td>0.780509</td>
      <td>5.908</td>
      <td>-54.558105</td>
      <td>-54.536133</td>
      <td>4.427071</td>
      <td>4.434044</td>
    </tr>
    <tr>
      <th>232</th>
      <td>14</td>
      <td>5709</td>
      <td>7991</td>
      <td>0.000000</td>
      <td>0.152081</td>
      <td>3.783911</td>
      <td>1.972008</td>
      <td>5.908</td>
      <td>-54.558105</td>
      <td>-54.536133</td>
      <td>4.405163</td>
      <td>4.412137</td>
    </tr>
    <tr>
      <th>233</th>
      <td>14</td>
      <td>5709</td>
      <td>7992</td>
      <td>0.000000</td>
      <td>0.486346</td>
      <td>4.464029</td>
      <td>0.958626</td>
      <td>5.909</td>
      <td>-54.558105</td>
      <td>-54.536133</td>
      <td>4.383255</td>
      <td>4.390229</td>
    </tr>
    <tr>
      <th>234</th>
      <td>14</td>
      <td>5709</td>
      <td>7993</td>
      <td>0.000000</td>
      <td>0.099812</td>
      <td>2.719893</td>
      <td>3.089295</td>
      <td>5.909</td>
      <td>-54.558105</td>
      <td>-54.536133</td>
      <td>4.361347</td>
      <td>4.368320</td>
    </tr>
    <tr>
      <th>235</th>
      <td>14</td>
      <td>5709</td>
      <td>7994</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>5.863647</td>
      <td>0.045353</td>
      <td>5.909</td>
      <td>-54.558105</td>
      <td>-54.536133</td>
      <td>4.339437</td>
      <td>4.346411</td>
    </tr>
    <tr>
      <th>236</th>
      <td>14</td>
      <td>5709</td>
      <td>7995</td>
      <td>0.195599</td>
      <td>0.000000</td>
      <td>5.714401</td>
      <td>0.000000</td>
      <td>5.910</td>
      <td>-54.558105</td>
      <td>-54.536133</td>
      <td>4.317527</td>
      <td>4.324501</td>
    </tr>
    <tr>
      <th>237</th>
      <td>14</td>
      <td>5709</td>
      <td>7996</td>
      <td>5.604202</td>
      <td>0.000000</td>
      <td>0.305798</td>
      <td>0.000000</td>
      <td>5.910</td>
      <td>-54.558105</td>
      <td>-54.536133</td>
      <td>4.295617</td>
      <td>4.302591</td>
    </tr>
    <tr>
      <th>238</th>
      <td>14</td>
      <td>5710</td>
      <td>7990</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>5.817310</td>
      <td>0.090690</td>
      <td>5.908</td>
      <td>-54.536133</td>
      <td>-54.514160</td>
      <td>4.427071</td>
      <td>4.434044</td>
    </tr>
    <tr>
      <th>239</th>
      <td>14</td>
      <td>5710</td>
      <td>7991</td>
      <td>0.000000</td>
      <td>0.680174</td>
      <td>3.928600</td>
      <td>1.299226</td>
      <td>5.908</td>
      <td>-54.536133</td>
      <td>-54.514160</td>
      <td>4.405163</td>
      <td>4.412137</td>
    </tr>
    <tr>
      <th>240</th>
      <td>14</td>
      <td>5710</td>
      <td>7992</td>
      <td>0.000000</td>
      <td>0.395009</td>
      <td>4.038003</td>
      <td>1.475988</td>
      <td>5.909</td>
      <td>-54.536133</td>
      <td>-54.514160</td>
      <td>4.383255</td>
      <td>4.390229</td>
    </tr>
    <tr>
      <th>241</th>
      <td>14</td>
      <td>5710</td>
      <td>7993</td>
      <td>0.000000</td>
      <td>0.202779</td>
      <td>3.618289</td>
      <td>2.087932</td>
      <td>5.909</td>
      <td>-54.536133</td>
      <td>-54.514160</td>
      <td>4.361347</td>
      <td>4.368320</td>
    </tr>
    <tr>
      <th>242</th>
      <td>14</td>
      <td>5710</td>
      <td>7994</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>5.633098</td>
      <td>0.275902</td>
      <td>5.909</td>
      <td>-54.536133</td>
      <td>-54.514160</td>
      <td>4.339437</td>
      <td>4.346411</td>
    </tr>
    <tr>
      <th>243</th>
      <td>14</td>
      <td>5710</td>
      <td>7995</td>
      <td>2.000901</td>
      <td>0.000000</td>
      <td>3.909099</td>
      <td>0.000000</td>
      <td>5.910</td>
      <td>-54.536133</td>
      <td>-54.514160</td>
      <td>4.317527</td>
      <td>4.324501</td>
    </tr>
    <tr>
      <th>244</th>
      <td>14</td>
      <td>5711</td>
      <td>7990</td>
      <td>0.000000</td>
      <td>0.534132</td>
      <td>3.749564</td>
      <td>1.624303</td>
      <td>5.908</td>
      <td>-54.514160</td>
      <td>-54.492188</td>
      <td>4.427071</td>
      <td>4.434044</td>
    </tr>
    <tr>
      <th>245</th>
      <td>14</td>
      <td>5711</td>
      <td>7991</td>
      <td>0.000000</td>
      <td>0.147303</td>
      <td>5.627997</td>
      <td>0.132699</td>
      <td>5.908</td>
      <td>-54.514160</td>
      <td>-54.492188</td>
      <td>4.405163</td>
      <td>4.412137</td>
    </tr>
    <tr>
      <th>246</th>
      <td>14</td>
      <td>5711</td>
      <td>7992</td>
      <td>0.000000</td>
      <td>0.062754</td>
      <td>5.466564</td>
      <td>0.379681</td>
      <td>5.909</td>
      <td>-54.514160</td>
      <td>-54.492188</td>
      <td>4.383255</td>
      <td>4.390229</td>
    </tr>
    <tr>
      <th>247</th>
      <td>14</td>
      <td>5711</td>
      <td>7993</td>
      <td>0.000000</td>
      <td>0.016049</td>
      <td>5.473236</td>
      <td>0.419714</td>
      <td>5.909</td>
      <td>-54.514160</td>
      <td>-54.492188</td>
      <td>4.361347</td>
      <td>4.368320</td>
    </tr>
    <tr>
      <th>248</th>
      <td>14</td>
      <td>5711</td>
      <td>7994</td>
      <td>2.202891</td>
      <td>0.000000</td>
      <td>3.706109</td>
      <td>0.000000</td>
      <td>5.909</td>
      <td>-54.514160</td>
      <td>-54.492188</td>
      <td>4.339437</td>
      <td>4.346411</td>
    </tr>
    <tr>
      <th>249</th>
      <td>14</td>
      <td>5711</td>
      <td>7995</td>
      <td>5.704391</td>
      <td>0.000000</td>
      <td>0.205609</td>
      <td>0.000000</td>
      <td>5.910</td>
      <td>-54.514160</td>
      <td>-54.492188</td>
      <td>4.317527</td>
      <td>4.324501</td>
    </tr>
    <tr>
      <th>250</th>
      <td>14</td>
      <td>5712</td>
      <td>7989</td>
      <td>0.000000</td>
      <td>0.000180</td>
      <td>4.494825</td>
      <td>1.412994</td>
      <td>5.908</td>
      <td>-54.492188</td>
      <td>-54.470215</td>
      <td>4.448978</td>
      <td>4.455951</td>
    </tr>
    <tr>
      <th>251</th>
      <td>14</td>
      <td>5712</td>
      <td>7990</td>
      <td>0.000000</td>
      <td>0.014604</td>
      <td>5.014444</td>
      <td>0.878952</td>
      <td>5.908</td>
      <td>-54.492188</td>
      <td>-54.470215</td>
      <td>4.427071</td>
      <td>4.434044</td>
    </tr>
    <tr>
      <th>252</th>
      <td>14</td>
      <td>5712</td>
      <td>7991</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>5.817581</td>
      <td>0.090419</td>
      <td>5.908</td>
      <td>-54.492188</td>
      <td>-54.470215</td>
      <td>4.405163</td>
      <td>4.412137</td>
    </tr>
    <tr>
      <th>253</th>
      <td>14</td>
      <td>5712</td>
      <td>7992</td>
      <td>0.131189</td>
      <td>0.000180</td>
      <td>5.694950</td>
      <td>0.082681</td>
      <td>5.909</td>
      <td>-54.492188</td>
      <td>-54.470215</td>
      <td>4.383255</td>
      <td>4.390229</td>
    </tr>
    <tr>
      <th>254</th>
      <td>14</td>
      <td>5712</td>
      <td>7993</td>
      <td>3.435887</td>
      <td>0.000000</td>
      <td>2.473113</td>
      <td>0.000000</td>
      <td>5.909</td>
      <td>-54.492188</td>
      <td>-54.470215</td>
      <td>4.361347</td>
      <td>4.368320</td>
    </tr>
    <tr>
      <th>255</th>
      <td>14</td>
      <td>5712</td>
      <td>7994</td>
      <td>5.907377</td>
      <td>0.000000</td>
      <td>0.001623</td>
      <td>0.000000</td>
      <td>5.909</td>
      <td>-54.492188</td>
      <td>-54.470215</td>
      <td>4.339437</td>
      <td>4.346411</td>
    </tr>
    <tr>
      <th>256</th>
      <td>14</td>
      <td>5713</td>
      <td>7989</td>
      <td>1.388023</td>
      <td>0.000000</td>
      <td>3.765160</td>
      <td>0.754817</td>
      <td>5.908</td>
      <td>-54.470215</td>
      <td>-54.448242</td>
      <td>4.448978</td>
      <td>4.455951</td>
    </tr>
    <tr>
      <th>257</th>
      <td>14</td>
      <td>5713</td>
      <td>7990</td>
      <td>0.668725</td>
      <td>0.000000</td>
      <td>5.167967</td>
      <td>0.071308</td>
      <td>5.908</td>
      <td>-54.470215</td>
      <td>-54.448242</td>
      <td>4.427071</td>
      <td>4.434044</td>
    </tr>
    <tr>
      <th>258</th>
      <td>14</td>
      <td>5713</td>
      <td>7991</td>
      <td>0.672421</td>
      <td>0.000000</td>
      <td>4.684859</td>
      <td>0.550720</td>
      <td>5.908</td>
      <td>-54.470215</td>
      <td>-54.448242</td>
      <td>4.405163</td>
      <td>4.412137</td>
    </tr>
    <tr>
      <th>259</th>
      <td>14</td>
      <td>5713</td>
      <td>7992</td>
      <td>4.565824</td>
      <td>0.000000</td>
      <td>1.298274</td>
      <td>0.044902</td>
      <td>5.909</td>
      <td>-54.470215</td>
      <td>-54.448242</td>
      <td>4.383255</td>
      <td>4.390229</td>
    </tr>
    <tr>
      <th>260</th>
      <td>14</td>
      <td>5714</td>
      <td>7991</td>
      <td>5.906648</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.001352</td>
      <td>5.908</td>
      <td>-54.448242</td>
      <td>-54.426270</td>
      <td>4.405163</td>
      <td>4.412137</td>
    </tr>
  </tbody>
</table>
<p>261 rows × 12 columns</p>
</div>



### Retrieving information of classes based on predefined polygons

There are three queries available for classes of predefined polygons. First of all, we can retrieve all polygons for a certain timestamp. say timestamp 1.


```python
r = requests.post(url + 'classes_polygons_timestamp',
                 data = {"mapId":  map_id, 'args':[1] })
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
      <th>total_area</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>0</td>
      <td>3.487559</td>
      <td>272.089905</td>
      <td>7648.308727</td>
      <td>6350.077808</td>
      <td>14273.964</td>
    </tr>
    <tr>
      <th>1</th>
      <td>1</td>
      <td>0.000000</td>
      <td>3.581839</td>
      <td>19.940976</td>
      <td>15.135185</td>
      <td>38.658</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2</td>
      <td>0.000000</td>
      <td>1.891067</td>
      <td>2.164558</td>
      <td>1.256375</td>
      <td>5.312</td>
    </tr>
    <tr>
      <th>3</th>
      <td>3</td>
      <td>0.000000</td>
      <td>3.194770</td>
      <td>2.913799</td>
      <td>3.846431</td>
      <td>9.955</td>
    </tr>
    <tr>
      <th>4</th>
      <td>4</td>
      <td>0.000000</td>
      <td>3.657095</td>
      <td>20.714430</td>
      <td>14.863475</td>
      <td>39.235</td>
    </tr>
    <tr>
      <th>5</th>
      <td>5</td>
      <td>0.000000</td>
      <td>0.330621</td>
      <td>0.093677</td>
      <td>0.353702</td>
      <td>0.778</td>
    </tr>
    <tr>
      <th>6</th>
      <td>6</td>
      <td>0.321840</td>
      <td>4.467514</td>
      <td>27.034183</td>
      <td>11.970464</td>
      <td>43.794</td>
    </tr>
    <tr>
      <th>7</th>
      <td>7</td>
      <td>10.391874</td>
      <td>16.971280</td>
      <td>135.943489</td>
      <td>37.206357</td>
      <td>200.513</td>
    </tr>
    <tr>
      <th>8</th>
      <td>8</td>
      <td>0.000000</td>
      <td>0.589073</td>
      <td>33.071856</td>
      <td>31.332071</td>
      <td>64.993</td>
    </tr>
    <tr>
      <th>9</th>
      <td>9</td>
      <td>0.000000</td>
      <td>0.032070</td>
      <td>13.464082</td>
      <td>10.329848</td>
      <td>23.826</td>
    </tr>
    <tr>
      <th>10</th>
      <td>10</td>
      <td>0.000000</td>
      <td>0.066065</td>
      <td>101.544760</td>
      <td>28.181174</td>
      <td>129.792</td>
    </tr>
  </tbody>
</table>
</div>



The resulting data frame has a row for each polygon, describing the total area in square kilometers for each particular class. Additional metadata is appended on the right side and is specific to the map we are studying.

Secondly, we can request all timestamps for a particular polygon. Say polygon number 3.


```python
r = requests.post(url + 'classes_timestamps_polygon',
                 data = {"mapId":  map_id, 'args':[3] })

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
      <th>total_area</th>
      <th>date_from</th>
      <th>date_to</th>
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
      <td>2018-01-01</td>
      <td>2018-01-15</td>
    </tr>
    <tr>
      <th>1</th>
      <td>1</td>
      <td>0.0</td>
      <td>3.194770</td>
      <td>2.913799</td>
      <td>3.846431</td>
      <td>10.955</td>
      <td>2018-02-01</td>
      <td>2018-02-15</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2</td>
      <td>0.0</td>
      <td>3.199635</td>
      <td>2.700752</td>
      <td>4.054613</td>
      <td>11.955</td>
      <td>2018-03-01</td>
      <td>2018-03-15</td>
    </tr>
    <tr>
      <th>3</th>
      <td>3</td>
      <td>0.0</td>
      <td>3.193522</td>
      <td>2.583946</td>
      <td>4.177531</td>
      <td>12.955</td>
      <td>2018-04-01</td>
      <td>2018-04-15</td>
    </tr>
    <tr>
      <th>4</th>
      <td>4</td>
      <td>0.0</td>
      <td>3.366972</td>
      <td>1.879114</td>
      <td>4.708914</td>
      <td>13.955</td>
      <td>2018-05-01</td>
      <td>2018-05-15</td>
    </tr>
    <tr>
      <th>5</th>
      <td>5</td>
      <td>0.0</td>
      <td>3.366972</td>
      <td>1.879114</td>
      <td>4.708914</td>
      <td>14.955</td>
      <td>2018-06-01</td>
      <td>2018-06-15</td>
    </tr>
    <tr>
      <th>6</th>
      <td>6</td>
      <td>0.0</td>
      <td>3.786952</td>
      <td>0.319638</td>
      <td>5.848410</td>
      <td>15.955</td>
      <td>2018-07-01</td>
      <td>2018-07-15</td>
    </tr>
    <tr>
      <th>7</th>
      <td>7</td>
      <td>0.0</td>
      <td>3.880725</td>
      <td>0.000000</td>
      <td>6.074275</td>
      <td>16.955</td>
      <td>2018-08-01</td>
      <td>2018-08-15</td>
    </tr>
    <tr>
      <th>8</th>
      <td>8</td>
      <td>0.0</td>
      <td>3.687068</td>
      <td>0.000000</td>
      <td>6.267932</td>
      <td>17.955</td>
      <td>2018-09-01</td>
      <td>2018-09-15</td>
    </tr>
    <tr>
      <th>9</th>
      <td>9</td>
      <td>0.0</td>
      <td>3.848149</td>
      <td>0.000000</td>
      <td>6.106851</td>
      <td>18.955</td>
      <td>2018-10-01</td>
      <td>2018-10-15</td>
    </tr>
    <tr>
      <th>10</th>
      <td>10</td>
      <td>0.0</td>
      <td>3.955575</td>
      <td>0.000000</td>
      <td>5.999425</td>
      <td>19.955</td>
      <td>2018-11-01</td>
      <td>2018-11-15</td>
    </tr>
    <tr>
      <th>11</th>
      <td>11</td>
      <td>0.0</td>
      <td>3.758150</td>
      <td>0.000000</td>
      <td>6.196850</td>
      <td>20.955</td>
      <td>2018-12-01</td>
      <td>2018-12-15</td>
    </tr>
  </tbody>
</table>
</div>



In the same way as before, we find the area per class and the metadata of the polygon. This time each row belongs to a certain timestamp of the requested polygon.

Lastly, we can request the area of the classes for each tile within a certain polygon on a certain timestamp. Say we want this for polygon 3 on timestamp 5:


```python
r = requests.post(url + 'classes_tiles_timestamp_polygon',
                 data = {"mapId":  map_id, 'args':[3,5] })

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
      <th>tile_zoom</th>
      <th>tile_x</th>
      <th>tile_y</th>
      <th>blanc</th>
      <th>disturbance</th>
      <th>mask</th>
      <th>no class</th>
      <th>total_area</th>
      <th>xmin</th>
      <th>xmax</th>
      <th>ymin</th>
      <th>ymax</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>14</td>
      <td>5691</td>
      <td>7959</td>
      <td>0.0</td>
      <td>0.058146</td>
      <td>0.525839</td>
      <td>0.135015</td>
      <td>13650.719</td>
      <td>-54.953613</td>
      <td>-54.931641</td>
      <td>5.105863</td>
      <td>5.112830</td>
    </tr>
    <tr>
      <th>1</th>
      <td>14</td>
      <td>5691</td>
      <td>7960</td>
      <td>0.0</td>
      <td>0.481033</td>
      <td>0.135625</td>
      <td>0.495342</td>
      <td>13652.112</td>
      <td>-54.953613</td>
      <td>-54.931641</td>
      <td>5.083978</td>
      <td>5.090944</td>
    </tr>
    <tr>
      <th>2</th>
      <td>14</td>
      <td>5692</td>
      <td>7959</td>
      <td>0.0</td>
      <td>0.063063</td>
      <td>1.079176</td>
      <td>0.393761</td>
      <td>13652.536</td>
      <td>-54.931641</td>
      <td>-54.909668</td>
      <td>5.105863</td>
      <td>5.112830</td>
    </tr>
    <tr>
      <th>3</th>
      <td>14</td>
      <td>5692</td>
      <td>7960</td>
      <td>0.0</td>
      <td>2.385504</td>
      <td>0.131453</td>
      <td>2.710043</td>
      <td>13657.227</td>
      <td>-54.931641</td>
      <td>-54.909668</td>
      <td>5.083978</td>
      <td>5.090944</td>
    </tr>
    <tr>
      <th>4</th>
      <td>14</td>
      <td>5692</td>
      <td>7961</td>
      <td>0.0</td>
      <td>0.083273</td>
      <td>0.000000</td>
      <td>0.212727</td>
      <td>13653.296</td>
      <td>-54.931641</td>
      <td>-54.909668</td>
      <td>5.062091</td>
      <td>5.069058</td>
    </tr>
    <tr>
      <th>5</th>
      <td>14</td>
      <td>5693</td>
      <td>7960</td>
      <td>0.0</td>
      <td>0.295953</td>
      <td>0.007021</td>
      <td>0.762026</td>
      <td>13654.065</td>
      <td>-54.909668</td>
      <td>-54.887695</td>
      <td>5.083978</td>
      <td>5.090944</td>
    </tr>
  </tbody>
</table>
</div>



This time we receive all information per standard tile. The standard tiles are intersected with the polygon, so they can greatly vary in size.

### Retrieving information of indices based on an arbitrary polygon per class

Instead of taking the mean spectral indices over all pixels, we can also restrict to pixels belonging to a certain class. The queries in this section are the same as those in the previous section, but this time we restrict to pixels of a certain class.

In this tutorial we will study the spectral indices of the class 'disturbance'.

Once again we define some polygon that we might be interested in.


```python
coords = ['(-55,4.1)', '(-55.5,4.2)', '(-55.2,4.2)','(-52.3,5.15)', '(-52,5)']
```

Now let's request the mean of all spectral indices of the standard tiles intersecting our polygon.


```python
r = requests.post(url + 'indices_timestamps_customPolygon_class',
                 data = {"mapId":  map_id, 'args': ['no class'] + coords })

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
      <th>tile_zoom</th>
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
      <td>14</td>
      <td>0</td>
      <td>0.836991</td>
      <td>-0.731293</td>
      <td>0.568470</td>
      <td>216.817771</td>
    </tr>
    <tr>
      <th>1</th>
      <td>14</td>
      <td>1</td>
      <td>0.830895</td>
      <td>-0.738747</td>
      <td>0.561821</td>
      <td>608.362607</td>
    </tr>
    <tr>
      <th>2</th>
      <td>14</td>
      <td>2</td>
      <td>0.466167</td>
      <td>-0.404528</td>
      <td>0.855087</td>
      <td>700.381747</td>
    </tr>
    <tr>
      <th>3</th>
      <td>14</td>
      <td>3</td>
      <td>0.055014</td>
      <td>-0.036660</td>
      <td>0.989043</td>
      <td>705.253178</td>
    </tr>
    <tr>
      <th>4</th>
      <td>14</td>
      <td>4</td>
      <td>0.156969</td>
      <td>-0.096399</td>
      <td>0.907557</td>
      <td>755.007964</td>
    </tr>
    <tr>
      <th>5</th>
      <td>14</td>
      <td>5</td>
      <td>0.503882</td>
      <td>-0.400993</td>
      <td>0.846103</td>
      <td>850.100863</td>
    </tr>
    <tr>
      <th>6</th>
      <td>14</td>
      <td>6</td>
      <td>0.788195</td>
      <td>-0.656701</td>
      <td>0.345213</td>
      <td>1197.274393</td>
    </tr>
    <tr>
      <th>7</th>
      <td>14</td>
      <td>7</td>
      <td>0.785686</td>
      <td>-0.633030</td>
      <td>0.342964</td>
      <td>1304.349374</td>
    </tr>
    <tr>
      <th>8</th>
      <td>14</td>
      <td>8</td>
      <td>0.829483</td>
      <td>-0.688576</td>
      <td>0.171491</td>
      <td>1350.773358</td>
    </tr>
    <tr>
      <th>9</th>
      <td>14</td>
      <td>9</td>
      <td>0.801829</td>
      <td>-0.652292</td>
      <td>0.076367</td>
      <td>1360.686909</td>
    </tr>
    <tr>
      <th>10</th>
      <td>14</td>
      <td>10</td>
      <td>0.767882</td>
      <td>-0.621535</td>
      <td>0.399517</td>
      <td>1360.587930</td>
    </tr>
    <tr>
      <th>11</th>
      <td>14</td>
      <td>11</td>
      <td>0.360888</td>
      <td>-0.285023</td>
      <td>0.880289</td>
      <td>1360.925649</td>
    </tr>
  </tbody>
</table>
</div>



As indices cannot be calculated over clouded areas data can be missing. To get an idea of how much data is missing there is an additional column with the percentage of cloud cover.

Next we request the information about all tiles intersecting with our defined polygon.


```python
r = requests.post(url + 'indices_tiles_customPolygon_timestamp_class',
                 data = {"mapId":  map_id, 'args':[0, 'disturbance'] + [coords] })

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
      <th>tile_zoom</th>
      <th>tile_x</th>
      <th>tile_y</th>
      <th>NDVI</th>
      <th>NDWI</th>
      <th>cloud_cover</th>
      <th>area</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>14</td>
      <td>5667</td>
      <td>8000</td>
      <td>1.000</td>
      <td>0.576</td>
      <td>0.89</td>
      <td>0.016506</td>
    </tr>
    <tr>
      <th>1</th>
      <td>14</td>
      <td>5667</td>
      <td>8001</td>
      <td>0.994</td>
      <td>0.705</td>
      <td>0.53</td>
      <td>0.155702</td>
    </tr>
    <tr>
      <th>2</th>
      <td>14</td>
      <td>5668</td>
      <td>8000</td>
      <td>1.000</td>
      <td>0.645</td>
      <td>0.88</td>
      <td>0.157660</td>
    </tr>
    <tr>
      <th>3</th>
      <td>14</td>
      <td>5668</td>
      <td>8001</td>
      <td>0.979</td>
      <td>0.758</td>
      <td>0.83</td>
      <td>0.051329</td>
    </tr>
    <tr>
      <th>4</th>
      <td>14</td>
      <td>5669</td>
      <td>8000</td>
      <td>0.998</td>
      <td>0.528</td>
      <td>0.52</td>
      <td>0.344544</td>
    </tr>
    <tr>
      <th>5</th>
      <td>14</td>
      <td>5669</td>
      <td>8001</td>
      <td>0.975</td>
      <td>0.675</td>
      <td>0.79</td>
      <td>0.021560</td>
    </tr>
    <tr>
      <th>6</th>
      <td>14</td>
      <td>5670</td>
      <td>8000</td>
      <td>1.000</td>
      <td>0.590</td>
      <td>0.81</td>
      <td>0.019572</td>
    </tr>
    <tr>
      <th>7</th>
      <td>14</td>
      <td>5687</td>
      <td>7997</td>
      <td>1.000</td>
      <td>0.627</td>
      <td>0.80</td>
      <td>0.021102</td>
    </tr>
    <tr>
      <th>8</th>
      <td>14</td>
      <td>5688</td>
      <td>7997</td>
      <td>1.000</td>
      <td>0.679</td>
      <td>0.46</td>
      <td>0.048697</td>
    </tr>
    <tr>
      <th>9</th>
      <td>14</td>
      <td>5689</td>
      <td>7997</td>
      <td>1.000</td>
      <td>0.531</td>
      <td>0.25</td>
      <td>0.783840</td>
    </tr>
    <tr>
      <th>10</th>
      <td>14</td>
      <td>5689</td>
      <td>7998</td>
      <td>1.000</td>
      <td>0.589</td>
      <td>0.38</td>
      <td>0.091457</td>
    </tr>
    <tr>
      <th>11</th>
      <td>14</td>
      <td>5689</td>
      <td>7999</td>
      <td>0.967</td>
      <td>0.722</td>
      <td>0.69</td>
      <td>0.060160</td>
    </tr>
    <tr>
      <th>12</th>
      <td>14</td>
      <td>5690</td>
      <td>7997</td>
      <td>1.000</td>
      <td>0.504</td>
      <td>0.92</td>
      <td>0.058526</td>
    </tr>
    <tr>
      <th>13</th>
      <td>14</td>
      <td>5690</td>
      <td>7998</td>
      <td>1.000</td>
      <td>0.279</td>
      <td>0.79</td>
      <td>0.172362</td>
    </tr>
    <tr>
      <th>14</th>
      <td>14</td>
      <td>5690</td>
      <td>7999</td>
      <td>0.982</td>
      <td>0.505</td>
      <td>0.75</td>
      <td>0.541258</td>
    </tr>
    <tr>
      <th>15</th>
      <td>14</td>
      <td>5691</td>
      <td>7997</td>
      <td>1.000</td>
      <td>0.323</td>
      <td>0.70</td>
      <td>0.272612</td>
    </tr>
    <tr>
      <th>16</th>
      <td>14</td>
      <td>5691</td>
      <td>7998</td>
      <td>0.996</td>
      <td>0.235</td>
      <td>0.72</td>
      <td>0.363304</td>
    </tr>
    <tr>
      <th>17</th>
      <td>14</td>
      <td>5691</td>
      <td>7996</td>
      <td>1.000</td>
      <td>0.143</td>
      <td>0.99</td>
      <td>0.006042</td>
    </tr>
    <tr>
      <th>18</th>
      <td>14</td>
      <td>5691</td>
      <td>8002</td>
      <td>1.000</td>
      <td>0.770</td>
      <td>0.88</td>
      <td>0.016148</td>
    </tr>
    <tr>
      <th>19</th>
      <td>14</td>
      <td>5691</td>
      <td>8003</td>
      <td>1.000</td>
      <td>0.732</td>
      <td>0.97</td>
      <td>0.007848</td>
    </tr>
    <tr>
      <th>20</th>
      <td>14</td>
      <td>5692</td>
      <td>8000</td>
      <td>1.000</td>
      <td>0.806</td>
      <td>0.95</td>
      <td>0.016235</td>
    </tr>
    <tr>
      <th>21</th>
      <td>14</td>
      <td>5692</td>
      <td>8001</td>
      <td>1.000</td>
      <td>0.866</td>
      <td>0.77</td>
      <td>0.000090</td>
    </tr>
    <tr>
      <th>22</th>
      <td>14</td>
      <td>5692</td>
      <td>7997</td>
      <td>1.000</td>
      <td>0.699</td>
      <td>0.45</td>
      <td>0.054198</td>
    </tr>
    <tr>
      <th>23</th>
      <td>14</td>
      <td>5692</td>
      <td>7998</td>
      <td>0.998</td>
      <td>0.577</td>
      <td>0.76</td>
      <td>0.112383</td>
    </tr>
    <tr>
      <th>24</th>
      <td>14</td>
      <td>5692</td>
      <td>7999</td>
      <td>1.000</td>
      <td>0.867</td>
      <td>0.92</td>
      <td>0.000541</td>
    </tr>
    <tr>
      <th>25</th>
      <td>14</td>
      <td>5692</td>
      <td>8002</td>
      <td>0.985</td>
      <td>0.472</td>
      <td>0.79</td>
      <td>0.190072</td>
    </tr>
    <tr>
      <th>26</th>
      <td>14</td>
      <td>5692</td>
      <td>8003</td>
      <td>0.980</td>
      <td>0.465</td>
      <td>0.94</td>
      <td>0.036355</td>
    </tr>
    <tr>
      <th>27</th>
      <td>14</td>
      <td>5693</td>
      <td>7997</td>
      <td>1.000</td>
      <td>0.726</td>
      <td>0.22</td>
      <td>0.337812</td>
    </tr>
    <tr>
      <th>28</th>
      <td>14</td>
      <td>5693</td>
      <td>7998</td>
      <td>1.000</td>
      <td>0.505</td>
      <td>0.57</td>
      <td>0.084152</td>
    </tr>
    <tr>
      <th>29</th>
      <td>14</td>
      <td>5693</td>
      <td>8002</td>
      <td>1.000</td>
      <td>0.720</td>
      <td>0.48</td>
      <td>0.018673</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>33</th>
      <td>14</td>
      <td>5694</td>
      <td>7996</td>
      <td>1.000</td>
      <td>0.739</td>
      <td>0.91</td>
      <td>0.037244</td>
    </tr>
    <tr>
      <th>34</th>
      <td>14</td>
      <td>5695</td>
      <td>7997</td>
      <td>0.997</td>
      <td>0.604</td>
      <td>0.16</td>
      <td>0.472901</td>
    </tr>
    <tr>
      <th>35</th>
      <td>14</td>
      <td>5695</td>
      <td>7998</td>
      <td>0.994</td>
      <td>0.574</td>
      <td>0.45</td>
      <td>0.250290</td>
    </tr>
    <tr>
      <th>36</th>
      <td>14</td>
      <td>5695</td>
      <td>7999</td>
      <td>0.895</td>
      <td>0.663</td>
      <td>0.83</td>
      <td>0.075764</td>
    </tr>
    <tr>
      <th>37</th>
      <td>14</td>
      <td>5695</td>
      <td>7996</td>
      <td>1.000</td>
      <td>0.676</td>
      <td>0.61</td>
      <td>0.078276</td>
    </tr>
    <tr>
      <th>38</th>
      <td>14</td>
      <td>5696</td>
      <td>7997</td>
      <td>1.000</td>
      <td>0.608</td>
      <td>0.51</td>
      <td>0.052124</td>
    </tr>
    <tr>
      <th>39</th>
      <td>14</td>
      <td>5696</td>
      <td>7998</td>
      <td>1.000</td>
      <td>0.458</td>
      <td>0.68</td>
      <td>0.039054</td>
    </tr>
    <tr>
      <th>40</th>
      <td>14</td>
      <td>5697</td>
      <td>8000</td>
      <td>1.000</td>
      <td>0.757</td>
      <td>0.79</td>
      <td>0.019211</td>
    </tr>
    <tr>
      <th>41</th>
      <td>14</td>
      <td>5697</td>
      <td>7997</td>
      <td>1.000</td>
      <td>0.217</td>
      <td>0.80</td>
      <td>0.002435</td>
    </tr>
    <tr>
      <th>42</th>
      <td>14</td>
      <td>5703</td>
      <td>7996</td>
      <td>1.000</td>
      <td>0.491</td>
      <td>0.88</td>
      <td>0.099919</td>
    </tr>
    <tr>
      <th>43</th>
      <td>14</td>
      <td>5703</td>
      <td>7995</td>
      <td>0.977</td>
      <td>0.661</td>
      <td>0.64</td>
      <td>0.134818</td>
    </tr>
    <tr>
      <th>44</th>
      <td>14</td>
      <td>5704</td>
      <td>7996</td>
      <td>1.000</td>
      <td>0.593</td>
      <td>0.84</td>
      <td>0.031292</td>
    </tr>
    <tr>
      <th>45</th>
      <td>14</td>
      <td>5704</td>
      <td>7995</td>
      <td>0.999</td>
      <td>0.335</td>
      <td>0.49</td>
      <td>0.306249</td>
    </tr>
    <tr>
      <th>46</th>
      <td>14</td>
      <td>5706</td>
      <td>7994</td>
      <td>1.000</td>
      <td>0.432</td>
      <td>0.90</td>
      <td>0.301419</td>
    </tr>
    <tr>
      <th>47</th>
      <td>14</td>
      <td>5707</td>
      <td>7994</td>
      <td>0.998</td>
      <td>0.363</td>
      <td>0.79</td>
      <td>0.449829</td>
    </tr>
    <tr>
      <th>48</th>
      <td>14</td>
      <td>5708</td>
      <td>7991</td>
      <td>1.000</td>
      <td>0.108</td>
      <td>0.99</td>
      <td>0.083207</td>
    </tr>
    <tr>
      <th>49</th>
      <td>14</td>
      <td>5708</td>
      <td>7992</td>
      <td>1.000</td>
      <td>0.220</td>
      <td>0.94</td>
      <td>0.216214</td>
    </tr>
    <tr>
      <th>50</th>
      <td>14</td>
      <td>5709</td>
      <td>7991</td>
      <td>1.000</td>
      <td>0.497</td>
      <td>0.64</td>
      <td>0.152081</td>
    </tr>
    <tr>
      <th>51</th>
      <td>14</td>
      <td>5709</td>
      <td>7992</td>
      <td>0.960</td>
      <td>0.339</td>
      <td>0.76</td>
      <td>0.486346</td>
    </tr>
    <tr>
      <th>52</th>
      <td>14</td>
      <td>5709</td>
      <td>7993</td>
      <td>1.000</td>
      <td>0.354</td>
      <td>0.46</td>
      <td>0.099812</td>
    </tr>
    <tr>
      <th>53</th>
      <td>14</td>
      <td>5710</td>
      <td>7991</td>
      <td>0.986</td>
      <td>0.351</td>
      <td>0.66</td>
      <td>0.680174</td>
    </tr>
    <tr>
      <th>54</th>
      <td>14</td>
      <td>5710</td>
      <td>7992</td>
      <td>1.000</td>
      <td>0.254</td>
      <td>0.68</td>
      <td>0.395009</td>
    </tr>
    <tr>
      <th>55</th>
      <td>14</td>
      <td>5710</td>
      <td>7993</td>
      <td>1.000</td>
      <td>0.468</td>
      <td>0.61</td>
      <td>0.202779</td>
    </tr>
    <tr>
      <th>56</th>
      <td>14</td>
      <td>5711</td>
      <td>7991</td>
      <td>0.966</td>
      <td>0.616</td>
      <td>0.95</td>
      <td>0.147303</td>
    </tr>
    <tr>
      <th>57</th>
      <td>14</td>
      <td>5711</td>
      <td>7992</td>
      <td>1.000</td>
      <td>0.711</td>
      <td>0.93</td>
      <td>0.062754</td>
    </tr>
    <tr>
      <th>58</th>
      <td>14</td>
      <td>5711</td>
      <td>7993</td>
      <td>1.000</td>
      <td>0.773</td>
      <td>0.93</td>
      <td>0.016049</td>
    </tr>
    <tr>
      <th>59</th>
      <td>14</td>
      <td>5711</td>
      <td>7990</td>
      <td>1.000</td>
      <td>0.478</td>
      <td>0.63</td>
      <td>0.534132</td>
    </tr>
    <tr>
      <th>60</th>
      <td>14</td>
      <td>5712</td>
      <td>7992</td>
      <td>1.000</td>
      <td>0.802</td>
      <td>0.99</td>
      <td>0.000180</td>
    </tr>
    <tr>
      <th>61</th>
      <td>14</td>
      <td>5712</td>
      <td>7990</td>
      <td>1.000</td>
      <td>0.669</td>
      <td>0.85</td>
      <td>0.014604</td>
    </tr>
    <tr>
      <th>62</th>
      <td>14</td>
      <td>5712</td>
      <td>7989</td>
      <td>1.000</td>
      <td>0.190</td>
      <td>0.76</td>
      <td>0.000180</td>
    </tr>
  </tbody>
</table>
<p>63 rows × 7 columns</p>
</div>



### Retrieving information of indices based on predefined polygons per class

Now let's request all mean indices for all polygons for timestamp 1 and class 'disturbance'


```python
r = requests.post(url + 'indices_polygons_timestamp_class',
                 data = {"mapId":  map_id, 'args':[0, 'disturbance'] })

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
      <td>0.990581</td>
      <td>0.443551</td>
      <td>0.581132</td>
      <td>110.635302</td>
    </tr>
    <tr>
      <th>1</th>
      <td>1</td>
      <td>0.997801</td>
      <td>0.420108</td>
      <td>0.776349</td>
      <td>0.491334</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2</td>
      <td>0.998190</td>
      <td>0.342603</td>
      <td>0.525937</td>
      <td>0.699399</td>
    </tr>
    <tr>
      <th>3</th>
      <td>3</td>
      <td>0.989652</td>
      <td>0.449496</td>
      <td>0.642835</td>
      <td>0.977871</td>
    </tr>
    <tr>
      <th>4</th>
      <td>4</td>
      <td>0.970152</td>
      <td>0.330398</td>
      <td>0.699334</td>
      <td>1.449953</td>
    </tr>
    <tr>
      <th>5</th>
      <td>7</td>
      <td>0.995748</td>
      <td>0.236464</td>
      <td>0.827383</td>
      <td>5.668281</td>
    </tr>
    <tr>
      <th>6</th>
      <td>8</td>
      <td>0.992238</td>
      <td>0.543425</td>
      <td>0.596543</td>
      <td>0.391093</td>
    </tr>
  </tbody>
</table>
</div>



In the same manner we can request all timestamps of a particular polygon, say polygon 1.


```python
r = requests.post(url + 'indices_timestamps_polygon_class',
                 data = {"mapId":  map_id, 'args':[1, 'disturbance'] })

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
      <th>NDVI</th>
      <th>NDWI</th>
      <th>date_from</th>
      <th>date_to</th>
      <th>cloud_cover</th>
      <th>area</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>0</td>
      <td>0.997801</td>
      <td>0.420108</td>
      <td>2018-01-01</td>
      <td>2018-01-15</td>
      <td>0.776349</td>
      <td>0.491334</td>
    </tr>
    <tr>
      <th>1</th>
      <td>1</td>
      <td>0.989887</td>
      <td>0.505977</td>
      <td>2018-02-01</td>
      <td>2018-02-15</td>
      <td>0.365857</td>
      <td>3.581839</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2</td>
      <td>0.206461</td>
      <td>0.089885</td>
      <td>2018-03-01</td>
      <td>2018-03-15</td>
      <td>0.925376</td>
      <td>4.166653</td>
    </tr>
    <tr>
      <th>3</th>
      <td>3</td>
      <td>0.209027</td>
      <td>0.093185</td>
      <td>2018-04-01</td>
      <td>2018-04-15</td>
      <td>0.992080</td>
      <td>4.288390</td>
    </tr>
    <tr>
      <th>4</th>
      <td>4</td>
      <td>0.979667</td>
      <td>0.399467</td>
      <td>2018-05-01</td>
      <td>2018-05-15</td>
      <td>0.455114</td>
      <td>5.657836</td>
    </tr>
    <tr>
      <th>5</th>
      <td>5</td>
      <td>0.993109</td>
      <td>0.462795</td>
      <td>2018-06-01</td>
      <td>2018-06-15</td>
      <td>0.479066</td>
      <td>6.704650</td>
    </tr>
    <tr>
      <th>6</th>
      <td>6</td>
      <td>0.999063</td>
      <td>0.469955</td>
      <td>2018-07-01</td>
      <td>2018-07-15</td>
      <td>0.119573</td>
      <td>7.778954</td>
    </tr>
    <tr>
      <th>7</th>
      <td>7</td>
      <td>0.997772</td>
      <td>0.493741</td>
      <td>2018-08-01</td>
      <td>2018-08-15</td>
      <td>0.190244</td>
      <td>7.788224</td>
    </tr>
    <tr>
      <th>8</th>
      <td>8</td>
      <td>1.000000</td>
      <td>0.466556</td>
      <td>2018-09-01</td>
      <td>2018-09-15</td>
      <td>0.000000</td>
      <td>7.645055</td>
    </tr>
    <tr>
      <th>9</th>
      <td>9</td>
      <td>1.000000</td>
      <td>0.459856</td>
      <td>2018-10-01</td>
      <td>2018-10-15</td>
      <td>0.000000</td>
      <td>8.053007</td>
    </tr>
    <tr>
      <th>10</th>
      <td>10</td>
      <td>0.991976</td>
      <td>0.443488</td>
      <td>2018-11-01</td>
      <td>2018-11-15</td>
      <td>0.186353</td>
      <td>7.707333</td>
    </tr>
    <tr>
      <th>11</th>
      <td>11</td>
      <td>0.105761</td>
      <td>0.169895</td>
      <td>2018-12-01</td>
      <td>2018-12-15</td>
      <td>0.978439</td>
      <td>7.687882</td>
    </tr>
  </tbody>
</table>
</div>



We get highly similar information, only this time per timestamp for the particular polygon.


```python
r = requests.post(url + 'indices_tiles_polygon_timestamp_class',
                 data = {"mapId":  map_id, 'args':[1,0, 'disturbance'] })

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
      <th>tile_x</th>
      <th>tile_y</th>
      <th>NDVI</th>
      <th>NDWI</th>
      <th>cloud_cover</th>
      <th>area</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>5703</td>
      <td>7970</td>
      <td>1.00</td>
      <td>0.375</td>
      <td>0.69</td>
      <td>0.299013</td>
    </tr>
    <tr>
      <th>1</th>
      <td>5704</td>
      <td>7969</td>
      <td>1.00</td>
      <td>0.490</td>
      <td>0.91</td>
      <td>0.190881</td>
    </tr>
    <tr>
      <th>2</th>
      <td>5705</td>
      <td>7971</td>
      <td>0.25</td>
      <td>0.522</td>
      <td>0.99</td>
      <td>0.001441</td>
    </tr>
  </tbody>
</table>
</div>



Again a very similar result, only this time per standard tile that is intersecting with the particular requested field. Only the section of the tile intersected with the field is considered. For this reason the area of each tile can vary.

## Retrieving images via the WMS

As we saw in the 'map layers' section, a map consists of multiple layers. We can obtain visualisations of these layers by using the WMS.

We can request these images by specifying the map_id, the timestamp, the type of the layer, the name of the layer, the tile_zoom, the tile_x and the tile_y. The image will be rendered as a PNG file.

These parameters should then be pasted to the following URL


```python
wms_url = 'https://api.ellipsis-earth.com/wms'
```

in the following way


```python
url = wms_url + '/[map_id]/[timestamp]/[layer_type]/[layer_name]/[tile_zoom]/[tile_x]/[tile_y]'
```

As example we retrieve the visualisations of a few layers of the tile with tile_zoom 14 tile_x 5694 and tile_y 7996 on timestamp 9:


```python
tile_x = str(5694)
tile_y = str(7996)
tile_zoom = str(14)
```


```python
r= requests.get(wms_url + '/' + map_id + '/9/images/rgb/' + tile_zoom + '/' + tile_x + '/' + tile_y,
                 stream=True,
                 headers = {"Authorization":token})
with open('img.png', 'wb') as out_file:
    shutil.copyfileobj(r.raw, out_file)
img=mpimg.imread('img.png')
imgplot = plt.imshow(img)
print(imgplot)
```

    AxesImage(54,36;334.8x217.44)
    


![png](tutorial_files/tutorial_123_1.png)



```python
r= requests.get(wms_url + '/' + map_id + '/9/labels/label/' + tile_zoom + '/' + tile_x + '/' + tile_y,
                 stream=True,
                 headers = {"Authorization":token})
with open('img.png', 'wb') as out_file:
    shutil.copyfileobj(r.raw, out_file)
img=mpimg.imread('img.png')
imgplot = plt.imshow(img)
print(imgplot)
```

    AxesImage(54,36;334.8x217.44)
    


![png](tutorial_files/tutorial_124_1.png)



```python
r= requests.get(wms_url + '/' + map_id + '/9/indices/ndvi/' + tile_zoom + '/' + tile_x + '/' + tile_y,
                 stream=True,
                 headers = {"Authorization":token})
with open('img.png', 'wb') as out_file:
    shutil.copyfileobj(r.raw, out_file)
img=mpimg.imread('img.png')
imgplot = plt.imshow(img)
print(imgplot)
```

    AxesImage(54,36;334.8x217.44)
    


![png](tutorial_files/tutorial_125_1.png)


The tile_zoom, tile_x and tile_y that we were looking at were 14, 5694 and 7996. If we want to have a visualisation of this area one zoom level higher we should change the zoomleve to 13 and divide the tile_x and tile_y by 2. That is to say we want to request the tile 13,2847,3998. Let's have a look.


```python
tile_x = str(round(int(tile_x)/2))
tile_y = str(round(int(tile_y)/2))
tile_zoom = str(int(tile_zoom)-1)
```




    '2847'




```python
r= requests.get(wms_url + '/' + map_id + '/9/images/rgb/' + tile_zoom + '/' + tile_x + '/' + tile_y,
                 stream=True,
                 headers = {"Authorization":token})
with open('img.png', 'wb') as out_file:
    shutil.copyfileobj(r.raw, out_file)
img=mpimg.imread('img.png')
imgplot = plt.imshow(img)
print(imgplot)
```

    AxesImage(54,36;334.8x217.44)
    


![png](tutorial_files/tutorial_128_1.png)



```python
r= requests.get(wms_url + '/' + map_id + '/9/labels/label/' + tile_zoom + '/' + tile_x + '/' + tile_y,
                 stream=True,
                 headers = {"Authorization":token})
with open('img.png', 'wb') as out_file:
    shutil.copyfileobj(r.raw, out_file)
img=mpimg.imread('img.png')
imgplot = plt.imshow(img)
print(imgplot)
```

    AxesImage(54,36;334.8x217.44)
    


![png](tutorial_files/tutorial_129_1.png)


## Retrieving underlying polygons

### Download shape of all polygons

In order to obtain all the predefined polygons that the data has been aggregated to, we can simply download a shapefile containing all these polygons. For this we can use the following url.


```python
url = 'https://api.ellipsis-earth.com/utilities/'
```

Before we can start our download we need to construct a download url. For this we need a token. We can request this token in the following way for timestamp 0.


```python
r = requests.post(url + 'requestShapeDownload',
                 data = {"mapId":  map_id, 'args':[0] })

token = r.text
```

We can now download the shapefile by pasting this token to the original url.


```python
requests.get(url + '/' + token)
```




    <Response [404]>



This will download the shapefile to our local disk.

### Retrieve polygons within a bounding box

Instead of loading all polygons in a, possibly very large, shapefile, it might be better to just request a few polygons. For this we can use the following two requests. Each of them returns a GeoJSON with just a selection of polygons.

To effectively handle polygons in Python we will need the geopandas package.


```python
import geopandas as gpd
```

If we were interested in finding all polygons within a bounding box we can use te following request.


```python
r = requests.post(url + 'getPolygonsJsonBounds',
                 data = {"mapId":  map_id, 'timestampNumber':0, 'layer': 'Mine', 'x1':-56, 'x2':-53, 'y1':3, 'y2':6 })
```

The result is a GeoJSON containing all polygons and metadata, if there are less than 200. If more than 200 polygons would have been found, the response would contain no polygons.


```python
r  = gpd.GeoDataFrame.from_features(r.json()['features'])
```

Let's plot the results.


```python
r.plot(column = 'name')
```




    <matplotlib.axes._subplots.AxesSubplot at 0x7fce09007780>




![png](tutorial_files/tutorial_147_1.png)


### Retrieve polygons by id's

We can also request polygons based on their id. We can for example request polygon 1, 5 and 8.


```python
r = requests.post(url + 'getPolygonsJsonIds',
                 data = {"mapId":  map_id, 'timestampNumber':0, 'polygons': [1,5,8] })
```


```python
r  = gpd.GeoDataFrame.from_features(r.json()['features'])
r.plot(column = 'layer')
```




    <matplotlib.axes._subplots.AxesSubplot at 0x7fce056ceb38>




![png](tutorial_files/tutorial_151_1.png)

