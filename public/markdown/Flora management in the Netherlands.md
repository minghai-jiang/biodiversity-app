
The Netherlands has over 750.000 agricultural plots. As they cover almost 80 percent of all soil, they are of vital importance to the Dutch ecosystem. Especially insects are dependent on the number and distribution of flowers and trees on these plots.

To help keeping the Netherlands pollinator friendly we need an up to date overview of the conditions of all of these plots so that we can take timely and information driven action when necessary. However, the monitoring of this large number of plots spread out over the entire country provides challenges. This notebook tackles some of them.

The acquisition and publication of the data used in this notebook has been paid for by the Dutch ministery of agriculture.

## Setting things up

We import the following packages


```python
import requests

import pandas as pd
import numpy as np
import geopandas as gpd
import rasterio
import shapely

from matplotlib import pyplot as plt
from matplotlib import image as mpimg

from io import BytesIO
from io import StringIO
```

On top of this we will be using some utility functions from the Appendix notebook.

For convenience we store the base url in a variable


```python
url = 'https://api.ellipsis-earth.com/'
```

In this notebook we will study the Netherlands fields map. We fetch the id of this map and store it in mapId.


```python
r = requests.get(url + 'account/myMaps')
r = r.json()
mapId = [map['uuid'] for map in r if map['name'] == 'Netherlands Fields'][0]
mapId
```




    'ee6b8f33-2c86-4593-9c0f-4d050c322fbb'



Let's see what timestamps are available for this map.


```python
r = requests.post(url + 'metadata/timestamps',
                 json = {"mapId":  mapId })

r = r.json()
r
```




    [{'timestampNumber': 0,
      'dateFrom': '2018-05-07T00:00:00.000Z',
      'dateTo': '2018-05-12T00:00:00.000Z'},
     {'timestampNumber': 1,
      'dateFrom': '2018-05-27T00:00:00.000Z',
      'dateTo': '2018-06-01T00:00:00.000Z'}]



## What plots have recently been mowed?

A good mowing regime is of vital importance for good landscape management. Mowing too often keeps plants from being able to flower and mowing all plots in an area at the same time robs insect life of their food source.

In this example we find the mowing regime around Esloo and analyse its impact on insect life.

First we define bounding box coordinates for Esloo.


```python
xmin = 6.1623 
xmax = 6.3102
ymin = 52.9752
ymax = 52.9957
```

Now let's retrieve all agricultural parcels within this bounding box from the API.


```python
r = requests.post(url + 'metadata/polygons',
                 json = {"mapId":  mapId, 'layer': 'percelen' , 'xMin': xmin ,'xMax':xmax, 'yMin':ymin, 'yMax':ymax })

ids = r.json()['ids']
r = requests.post(url + 'geometry/polygons',
                 json = {"mapId":  mapId, 'polygonIds':ids})

parcels  = gpd.GeoDataFrame.from_features(r.json()['features'])

```

We are only interested in grassland at the moment, so let's filter for that type land use and make a plot.


```python
parcels = parcels[parcels['GWS_GEWASC'] == 265]

img =plotPolys(colors =[(0,0,0.5)] , polys = parcels, xmin = parcels.bounds.minx.min() ,xmax = parcels.bounds.maxx.max(),ymin = parcels.bounds.miny.min(),ymax = parcels.bounds.maxy.max())

plt.figure(figsize=(10,10))
plt.imshow(img)
```




    <matplotlib.image.AxesImage at 0x7f09329905f8>




![png](output_16_1.png)


Now we request all classification results of the map for timestamp 0 and select all parcels around Esloo and merge the result with the geopandas dataframe.


```python
r = requests.post(url + 'data/class/polygon/polygonIds',
                 json = {"mapId":  mapId, 'timestamp':0, 'polygonIds':parcels['id'].tolist()  })
r = pd.read_csv(StringIO(r.text))
parcels = parcels.merge(r, on = 'id')
```

Now let's see what percentage of fields have been mowed in the last 3 days, which fields have been mowed in the last 10 days and which have not been mowed in a while at timestamp 0.

For this we construct a table with for each parcel the percentage of pixels that is estimated to be very recently and recenlty mowed.


```python
parcels['very recently mowed'] = np.divide(parcels['lichtgroen'].values, parcels['area'].values )
parcels['not recently mowed'] = np.divide(parcels['groen'].values, parcels['area'].values )

parcels['recently mowed'] = 1  - parcels['not recently mowed'].values
parcels['recently mowed'] = parcels['recently mowed']  - parcels['very recently mowed'].values

parcels = parcels[['geometry','id','very recently mowed','recently mowed', 'not recently mowed'  ]].copy()
parcels = parcels.sort_values('very recently mowed', ascending = False)
parcels[['id','very recently mowed','recently mowed', 'not recently mowed']].head(15)
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
      <th>very recently mowed</th>
      <th>recently mowed</th>
      <th>not recently mowed</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>229</th>
      <td>656592</td>
      <td>0.970206</td>
      <td>0.029794</td>
      <td>0.000000</td>
    </tr>
    <tr>
      <th>233</th>
      <td>681066</td>
      <td>0.904235</td>
      <td>0.069796</td>
      <td>0.025970</td>
    </tr>
    <tr>
      <th>66</th>
      <td>171288</td>
      <td>0.833877</td>
      <td>0.101424</td>
      <td>0.064698</td>
    </tr>
    <tr>
      <th>63</th>
      <td>168332</td>
      <td>0.790385</td>
      <td>0.177885</td>
      <td>0.031731</td>
    </tr>
    <tr>
      <th>224</th>
      <td>645478</td>
      <td>0.778689</td>
      <td>0.143443</td>
      <td>0.077869</td>
    </tr>
    <tr>
      <th>222</th>
      <td>642157</td>
      <td>0.770115</td>
      <td>0.091607</td>
      <td>0.138278</td>
    </tr>
    <tr>
      <th>42</th>
      <td>107868</td>
      <td>0.750588</td>
      <td>0.148235</td>
      <td>0.101176</td>
    </tr>
    <tr>
      <th>178</th>
      <td>547058</td>
      <td>0.530335</td>
      <td>0.426255</td>
      <td>0.043410</td>
    </tr>
    <tr>
      <th>112</th>
      <td>265645</td>
      <td>0.488520</td>
      <td>0.511480</td>
      <td>0.000000</td>
    </tr>
    <tr>
      <th>159</th>
      <td>486761</td>
      <td>0.374187</td>
      <td>0.087852</td>
      <td>0.537961</td>
    </tr>
    <tr>
      <th>180</th>
      <td>547060</td>
      <td>0.335119</td>
      <td>0.621387</td>
      <td>0.043494</td>
    </tr>
    <tr>
      <th>134</th>
      <td>317191</td>
      <td>0.330947</td>
      <td>0.025330</td>
      <td>0.643722</td>
    </tr>
    <tr>
      <th>92</th>
      <td>222005</td>
      <td>0.298077</td>
      <td>0.021635</td>
      <td>0.680288</td>
    </tr>
    <tr>
      <th>250</th>
      <td>740917</td>
      <td>0.246315</td>
      <td>0.198595</td>
      <td>0.555090</td>
    </tr>
    <tr>
      <th>94</th>
      <td>224019</td>
      <td>0.229925</td>
      <td>0.767348</td>
      <td>0.002727</td>
    </tr>
  </tbody>
</table>
</div>



Now let's make a pie-chart of the very recently mowed, recently mowed and not recently mowed parcels.


```python
very_recently_mowed = np.sum(parcels['very recently mowed'].values > 0.3)
not_recently_mowed = np.sum(parcels['not recently mowed'].values > 0.3)
recently_mowed = parcels.shape[0] - very_recently_mowed - not_recently_mowed
# Data to plot
labels = ['not recently', 'recently', 'very recently']
sizes = [not_recently_mowed, recently_mowed, very_recently_mowed]
colors = ['green', 'orange', 'red']
explode = (0.05, 0.05, 0.05)
# Plot
plt.pie(sizes, labels=labels, explode = explode, colors=colors,autopct='%1.1f%%')
plt.title('Mowing of plots around Esloo at may 7 2018')
plt.axis('equal')
plt.show()
```


![png](output_22_0.png)


Let's make a visualisation of the distribution of these fields.


```python
parcels['mowing'] = 1
parcels.loc[parcels['very recently mowed'] > 0.3, 'mowing'] = 2
parcels.loc[parcels['not recently mowed'] > 0.3, 'mowing'] = 0
```


```python
parcels[['id','very recently mowed','recently mowed', 'not recently mowed', 'mowing']].head(15)
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
      <th>very recently mowed</th>
      <th>recently mowed</th>
      <th>not recently mowed</th>
      <th>mowing</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>229</th>
      <td>656592</td>
      <td>0.970206</td>
      <td>0.029794</td>
      <td>0.000000</td>
      <td>2</td>
    </tr>
    <tr>
      <th>233</th>
      <td>681066</td>
      <td>0.904235</td>
      <td>0.069796</td>
      <td>0.025970</td>
      <td>2</td>
    </tr>
    <tr>
      <th>66</th>
      <td>171288</td>
      <td>0.833877</td>
      <td>0.101424</td>
      <td>0.064698</td>
      <td>2</td>
    </tr>
    <tr>
      <th>63</th>
      <td>168332</td>
      <td>0.790385</td>
      <td>0.177885</td>
      <td>0.031731</td>
      <td>2</td>
    </tr>
    <tr>
      <th>224</th>
      <td>645478</td>
      <td>0.778689</td>
      <td>0.143443</td>
      <td>0.077869</td>
      <td>2</td>
    </tr>
    <tr>
      <th>222</th>
      <td>642157</td>
      <td>0.770115</td>
      <td>0.091607</td>
      <td>0.138278</td>
      <td>2</td>
    </tr>
    <tr>
      <th>42</th>
      <td>107868</td>
      <td>0.750588</td>
      <td>0.148235</td>
      <td>0.101176</td>
      <td>2</td>
    </tr>
    <tr>
      <th>178</th>
      <td>547058</td>
      <td>0.530335</td>
      <td>0.426255</td>
      <td>0.043410</td>
      <td>2</td>
    </tr>
    <tr>
      <th>112</th>
      <td>265645</td>
      <td>0.488520</td>
      <td>0.511480</td>
      <td>0.000000</td>
      <td>2</td>
    </tr>
    <tr>
      <th>159</th>
      <td>486761</td>
      <td>0.374187</td>
      <td>0.087852</td>
      <td>0.537961</td>
      <td>0</td>
    </tr>
    <tr>
      <th>180</th>
      <td>547060</td>
      <td>0.335119</td>
      <td>0.621387</td>
      <td>0.043494</td>
      <td>2</td>
    </tr>
    <tr>
      <th>134</th>
      <td>317191</td>
      <td>0.330947</td>
      <td>0.025330</td>
      <td>0.643722</td>
      <td>0</td>
    </tr>
    <tr>
      <th>92</th>
      <td>222005</td>
      <td>0.298077</td>
      <td>0.021635</td>
      <td>0.680288</td>
      <td>0</td>
    </tr>
    <tr>
      <th>250</th>
      <td>740917</td>
      <td>0.246315</td>
      <td>0.198595</td>
      <td>0.555090</td>
      <td>0</td>
    </tr>
    <tr>
      <th>94</th>
      <td>224019</td>
      <td>0.229925</td>
      <td>0.767348</td>
      <td>0.002727</td>
      <td>1</td>
    </tr>
  </tbody>
</table>
</div>




```python
img = plotPolys(column = 'mowing', colors = [(0,0.5,0), (1,0.5,0),(0.8,0,0)], polys = parcels, xmin = parcels.bounds.minx.min() ,xmax = parcels.bounds.maxx.max(),ymin = parcels.bounds.miny.min(),ymax = parcels.bounds.maxy.max())

plt.figure(figsize=(10,10))
plt.imshow(img)
```




    <matplotlib.image.AxesImage at 0x7f09365faeb8>




![png](output_26_1.png)


### Brining it to the next level
Now let's take advantage of the full power of the API and analyse the entire Netherlands in one go. We repeat the procedure around Esloo for each and every square kilometer of the Netherlands. Of each square kilometer we analye the percentage of mowed fields with respect to the total number of fields.

Places in which this percentage is too high are flagged as these are places that insects might be dealing with a food shortage.

In order to do this we first collect the standard tiles covering the Netherlands.


```python
r = requests.post(url + 'metadata/tiles',
                 json = {"mapId":  mapId})

tileIds = r.json()['ids']
```


```python
tile_chunks = chunks(tileIds,3000)
tiles = list()
for chunk in tile_chunks:
    r = requests.post(url + 'geometry/tiles',
                 json = {"mapId":  mapId, 'timestamp':0,'tileIds':chunk})

    tiles.append(gpd.GeoDataFrame.from_features(r.json()['features']))
tiles = pd.concat(tiles)
```

Based on these tiles we now the polygon id's of the polygons that overlap with a tile for each tile. As these are a lot of requests we will be using the requestParallel function from the appendix allowing us to make multiple requests simultaneously.

First we define the request we would like to make.


```python
def request(s, i, mapId, minx, maxx, miny, maxy):
    try:
        r = s.post(url + 'metadata/polygons', timeout=30,
                 json = {"mapId":  mapId, 'layer': 'percelen' , 'xMin': minx ,'xMax':maxx, 'yMin':miny, 'yMax':maxy })
        out = (r.json()['ids'],)
        return(out)  

    except:
        print('timeout occured with: ' + str(i))
        return(None)
```

Secondly we construct a dictionary of arguments.


```python
bounds = tiles.bounds
argsDict = dict()
for i in np.arange(tiles.shape[0]):
 argsDict.update({i: (int(i), mapId, list(bounds.minx)[i], list(bounds.maxx)[i] ,list(bounds.miny)[i],list(bounds.maxy)[i])})

```

Now let's make the above defined request for all values in the dictionary in an asychnronous fashion.


```python
threads = 3
result = requestParallel(request, threads, argsDict)
```

Using these id's per tile we can now request all relevant data for these polygons and calculate the fraction of mowed fields. Again we would like to do this in an asynchronous fashio. So let's first define a function that we would like to run multiple times.


```python
import pickle
file = open('temp', 'rb')
result = pickle.load(file)
```


```python
def request(s,ids):
    try:
        if len(ids) == 0:
            return(None)

        r = s.post(url + 'geometry/polygons',
                 json = {"mapId":  mapId, 'polygonIds':ids})
        parcels  = gpd.GeoDataFrame.from_features(r.json()['features'])

        r = s.post(url + 'data/class/polygon/polygonIds',
                 json = {"mapId":  mapId, 'timestamp':0, 'polygonIds': ids })
        parcelsData = pd.read_csv(StringIO(r.text))

        if parcels.shape[0] == 0 or parcelsData.shape[0] == 0:
            return(None)        
        
        parcels = parcels.merge(parcelsData, on  = 'id')

        parcels = parcels[parcels['GWS_GEWASC'] == 265]

        if parcels.shape[0] == 0:
            return(None)
        parcels['very recently mowed'] = np.divide(parcels['lichtgroen'].values, parcels['area'].values )
        parcels['not recently mowed'] = np.divide(parcels['groen'].values, parcels['area'].values )

        parcels['recently mowed'] = 1  - parcels['not recently mowed'].values
        parcels['recently mowed'] = parcels['recently mowed']  - parcels['very recently mowed'].values

        parcels = parcels[['geometry','id','very recently mowed','recently mowed', 'not recently mowed'  ]].copy()

        mowed = np.sum( np.add(parcels['recently mowed'].values, parcels['very recently mowed'].values) > 0.4)
        fraction = mowed / parcels.shape[0]
    
        return(fraction)
    except:
        print(ids)
```

Now let's run this request asynchronously


```python
threads = 3
result2 = requestParallel(request, threads, result )
```

For each tile we now have the fraction of mowed fields. Let's draw a map of the netherlands and color each tile green, organge or red based on the fraction of mowed plots.


```python
tiles['fractionMowed'] = 0
keys = [int(key) for key in result2.keys() if result2[key] != None and result2[key]>0.5]
tiles['fractionMowed'].iloc[keys] = 1
keys = [int(key) for key in result2.keys() if result2[key] != None and result2[key]>0.8]
tiles['fractionMowed'].iloc[keys] = 2

im = plotPolys(polys = tiles, xmin = tiles.bounds.minx.min(),xmax = tiles.bounds.maxx.max(),ymin = tiles.bounds.miny.min(),ymax = tiles.bounds.maxy.max(), colors = [(0,0.5,0), (1,0.5,0),(0.8,0,0)], column= 'fractionMowed')
plt.figure(figsize=(10,10))
plt.imshow(im)
```




    <matplotlib.image.AxesImage at 0x7f60cac72588>




![png](output_42_1.png)


## How did the biomass on plots evolve in May?

A good estimator for the abundance of plantlife is the increase in biomass in May. It would therefore make sense to find all grasslands that underwent a more than 20 percent biomass increase.

Biomass is hard to extract from satellite imagery, but by using the NDVI spectral index we can evaluate the increase in photosynthesis which is a good proxy for biomass.

First we collect all spectral indices information from the fields aroun Esloo and merge it on the parcels geopandas dataframe.


```python
r1 = requests.post(url + 'data/spectral/polygon/polygonIds',
                 json = {"mapId":  mapId, 'timestamp':0, 'polygonIds': parcels['id'].tolist(), 'class': 'all classes' })
r1 = pd.read_csv(StringIO(r1.text))


r2 = requests.post(url + 'data/spectral/polygon/polygonIds',
                 json = {"mapId":  mapId, 'timestamp':1, 'polygonIds': parcels['id'].tolist(), 'class': 'all classes' })
r2 = pd.read_csv(StringIO(r2.text))

parcels = parcels.merge(r1, on = 'id')
parcels = parcels.merge(r2, on = 'id')


```

Lets now make a plot of the NDVI at May 7 and the NDVI at May 25.


```python
plt.scatter(x = parcels['NDVI_x'].values , y = parcels['NDVI_y'] )
plt.xlabel('NDVI May 7')
plt.ylabel('NDVI May 25')
plt.show()
```


![png](output_47_0.png)


Now let's make a plot in which all plots with an increase in biomass are colored green, all plots with a stable biomass are colored blue and all plots with a decreassing biomass are colore red.


```python
parcels['biomass'] = 1
parcels.loc[parcels['NDVI_y'] > 1.2 * parcels['NDVI_x'], 'biomass'  ] = 2
parcels.loc[parcels['NDVI_y'] < 0.8 * parcels['NDVI_x'], 'biomass'  ] = 0

img = plotPolys(column = 'biomass', colors = [(0.5,0,0), (0,0,0.5), (0,0.5,0)], polys = parcels, xmin = parcels.bounds.minx.min() ,xmax = parcels.bounds.maxx.max(),ymin = parcels.bounds.miny.min(),ymax = parcels.bounds.maxy.max())

plt.figure(figsize=(10,10))
plt.imshow(img)
```




    <matplotlib.image.AxesImage at 0x7f09364c4128>




![png](output_49_1.png)

