
# Flora management in the Netherlands
The Netherlands has 750.000 agricultural parcels of land. As they cover almost 80 percent of all soil, they are very important to the Dutch ecosystem. It is therfore important that the number and distribution of flowers and trees remain sufficient for insect life.

To this end it is very important to have an up-to-date overview of the conditions of all of these parcels. However, the monitoring of this large number of parcels spread out over the entire country provides challenges. This notebook tackles some of them.

The acquisition of the data has been paid for and made publicly available by the Dutch ministery of agriculture.

# Setting things up

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



# What fields have recently been mowed?

A good mowing regime is of vital importance for good landscape management. Mowing too often keeps plants from being able to flower and mowing all parcels in an area at the same time robs insect life of their food source.

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
r = requests.post(url + 'geometry/polygon/bounds',
                 json = {"mapId":  mapId, 'timestamp': 0, 'layer': 'percelen' , 'xMin': xmin ,'xMax':xmax, 'yMin':ymin, 'yMax':ymax })

parcels  = gpd.GeoDataFrame.from_features(r.json()['features'])
```

We are only interested in grassland at the moment, so let's filter for that type land use and make a plot.


```python
parcels = parcels[parcels['GWS_GEWASC'] == 265]
img =polys_on_image(alpha = 0.5,polys = parcels, xmin = parcels.bounds.minx.min() ,xmax = parcels.bounds.maxx.max(),ymin = parcels.bounds.miny.min(),ymax = parcels.bounds.maxy.max())

plt.imshow(img)
```




    <matplotlib.image.AxesImage at 0x7fee09aeb240>




![png](output_16_1.png)


Now we request all classification results of the map for timestamp 0 and select all parcels around Esloo.


```python
parcels_data = pd.DataFrame()
for i in np.arange(parcels.shape[0]):
    r = requests.post(url + 'data/class/polygon/timestamps',
                 json = {"mapId":  mapId, 'polygonId':list(parcels.id)[i]})
    r = pd.read_csv(StringIO(r.text))
    r['id'] = list(parcels.id)[i]
    parcels_data = parcels_data.append(r, sort = False)
parcels_data.head(5)
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
      <th>all classes</th>
      <th>blanc</th>
      <th>bruin</th>
      <th>groen</th>
      <th>groen-bruin</th>
      <th>lichtbruin</th>
      <th>lichtgroen</th>
      <th>mask</th>
      <th>no class</th>
      <th>area</th>
      <th>date_from</th>
      <th>date_to</th>
      <th>id</th>
      <th>no data</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.000847</td>
      <td>0.0</td>
      <td>0.001153</td>
      <td>0.000000</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.002</td>
      <td>2018-05-07</td>
      <td>2018-05-12</td>
      <td>15467</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>1</th>
      <td>1.0</td>
      <td>0.0</td>
      <td>0.000847</td>
      <td>0.0</td>
      <td>0.001153</td>
      <td>0.000000</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.002</td>
      <td>2018-05-27</td>
      <td>2018-06-01</td>
      <td>15467</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>0</th>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.001318</td>
      <td>0.0</td>
      <td>0.015682</td>
      <td>0.000000</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.017</td>
      <td>2018-05-07</td>
      <td>2018-05-12</td>
      <td>15728</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>1</th>
      <td>1.0</td>
      <td>0.0</td>
      <td>0.001318</td>
      <td>0.0</td>
      <td>0.015583</td>
      <td>0.000099</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.017</td>
      <td>2018-05-27</td>
      <td>2018-06-01</td>
      <td>15728</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>0</th>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.002154</td>
      <td>0.0</td>
      <td>0.024846</td>
      <td>0.000000</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.027</td>
      <td>2018-05-07</td>
      <td>2018-05-12</td>
      <td>15729</td>
      <td>NaN</td>
    </tr>
  </tbody>
</table>
</div>



Now let's see what percentage of fields have been mowed in the last 3 days, which fields have been mowed in the last 10 days and which have not been mowed in a while at timestamp 0.

For this we construct a table with for each parcel the percentage of pixels that is estimated to be very recently and recenlty mowed.


```python
parcels_data = parcels_data[parcels_data['timestamp'] == 0]
parcels_data['very recently mowed'] = np.divide(parcels_data['lichtgroen'].values, parcels_data['area'].values )
parcels_data['not recently mowed'] = np.divide(parcels_data['groen'].values, parcels_data['area'].values )

parcels_data = parcels_data[['id','very recently mowed','not recently mowed'  ]].copy()
parcels_data.head(10)
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
      <th>not recently mowed</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>15467</td>
      <td>0.0</td>
      <td>0.576271</td>
    </tr>
    <tr>
      <th>0</th>
      <td>15728</td>
      <td>0.0</td>
      <td>0.922481</td>
    </tr>
    <tr>
      <th>0</th>
      <td>15729</td>
      <td>0.0</td>
      <td>0.920220</td>
    </tr>
    <tr>
      <th>0</th>
      <td>15730</td>
      <td>0.0</td>
      <td>0.922992</td>
    </tr>
    <tr>
      <th>0</th>
      <td>15839</td>
      <td>0.0</td>
      <td>0.920973</td>
    </tr>
    <tr>
      <th>0</th>
      <td>23957</td>
      <td>0.0</td>
      <td>0.899177</td>
    </tr>
    <tr>
      <th>0</th>
      <td>27538</td>
      <td>0.0</td>
      <td>0.000000</td>
    </tr>
    <tr>
      <th>0</th>
      <td>30047</td>
      <td>0.0</td>
      <td>0.000000</td>
    </tr>
    <tr>
      <th>0</th>
      <td>30048</td>
      <td>0.0</td>
      <td>0.000000</td>
    </tr>
    <tr>
      <th>0</th>
      <td>30049</td>
      <td>0.0</td>
      <td>0.844055</td>
    </tr>
  </tbody>
</table>
</div>



Now let's make a pie-chart of the very recently mowed, recently mowed and not recently mowed parcels.


```python
very_recently_mowed = np.sum(parcels_data['very recently mowed'].values > 0.3)
not_recently_mowed = np.sum(parcels_data['not recently mowed'].values > 0.3)
recently_mowed = parcels_data.shape[0] - very_recently_mowed - not_recently_mowed
# Data to plot
labels = ['not recently', 'recently', 'very recently']
sizes = [not_recently_mowed, recently_mowed, very_recently_mowed]
colors = ['green', 'orange', 'red']
explode = (0.05, 0.05, 0.05)
# Plot
plt.pie(sizes, labels=labels, explode = explode, colors=colors,autopct='%1.1f%%')
plt.title('Mowing of fields around Esloo at may 7 2018')
plt.axis('equal')
plt.show()
```


![png](output_22_0.png)


Let's make a visualisation of the distribution of these fields.


```python
parcels_data['mowing'] = 1
parcels_data.loc[parcels_data['very recently mowed'] > 0.3, 'mowing'] = 2
parcels_data.loc[parcels_data['not recently mowed'] > 0.3, 'mowing'] = 0

parcels = parcels.merge(parcels_data, on  = 'id')
```


```python
 parcels.bounds.miny.min()
```




    52.9717636




```python
from shapely.geometry import Polygon
from rasterio.features import rasterize

def polys_on_image(polys, xmin,xmax,ymin,ymax, alpha, im = None, colors = [(0,0,1)] , column= None):
    polys.crs = {'init': 'epsg:4326'}
    polys = polys.to_crs({'init': 'epsg:3395'})
    
    bbox = gpd.GeoDataFrame( {'geometry': [Polygon([(xmin,ymin), (xmax, ymin), (xmax, ymax), (xmin, ymax)])]} )
    bbox.crs = {'init': 'epsg:4326'}
    bbox = bbox.to_crs({'init': 'epsg:3395'})

    if im == None:
        im = np.zeros((1024,1024,4))
    if column == None:
        column = 'extra'
        polys[column] = 0
    
    transform = rasterio.transform.from_bounds(bbox.bounds['minx'], bbox.bounds['miny'], bbox.bounds['maxx'], bbox.bounds['maxy'], im.shape[0], im.shape[1])
    rasters = np.zeros(im.shape)
    for i in np.arange(len(colors)):
        sub_polys = polys.loc[polys[column] == i]
        raster = rasterio.features.rasterize( shapes = [ (sub_polys['geometry'].values[m], 1) for m in np.arange(sub_polys.shape[0]) ] , fill = 0, transform = transform, out_shape = (im.shape[0], im.shape[1]), all_touched = True )
        raster = np.stack([raster * colors[i][0], raster*colors[i][1],raster*colors[i][2], raster ], axis = 2)
        rasters = np.add(rasters, raster)
     
    rasters = np.clip(rasters, 0,1)
    image = im * (1 - alpha) + rasters*alpha 
    return(image)
 
```


```python
img =polys_on_image(alpha = 1, column = 'mowing', colors = [(0,1,0), (1,1,0),(1,0,0)], polys = parcels, xmin = parcels.bounds.minx.min() ,xmax = parcels.bounds.maxx.max(),ymin = parcels.bounds.miny.min(),ymax = parcels.bounds.maxy.max())

plt.imshow(img)
```




    <matplotlib.image.AxesImage at 0x7fee09c6beb8>




![png](output_27_1.png)


# What fields are likely to be herb rich?

Parcels with high biomass are likely to be very fertile. This abundance of opportunity leads to many specialized species, which makes for a high biodiversity. On the other hand, fields with only grass are expected to have relatively constant biomass, with the exception of the moment they are mowed. That is why we want to find parcels whose biomass is relatively high and still growing.

To this end we look at parcels whose NDVI increased only slightly when compared to others.

First we collect all spectral indices information from the fields aroun Esloo.


```python
parcels_data = pd.DataFrame()
for i in np.arange(parcels.shape[0]):
    r = requests.post(url + 'data/spectral/polygon/timestamps',
                 json = {"mapId":  mapId, 'polygonId':list(parcels.id)[i], 'class': 'all classes'})
    r = pd.read_csv(StringIO(r.text))
    r['id'] = list(parcels.id)[i]
    parcels_data = parcels_data.append(r, sort = False)
    
parcels_data1 = parcels_data[parcels_data['timestamp'] == 0]
parcels_data2 = parcels_data[parcels_data['timestamp'] == 1]
parcels_data = parcels_data1.merge(parcels_data2, on = 'id')

parcels_data.head(5)
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
      <th>timestamp_x</th>
      <th>NDVI_x</th>
      <th>NDWI_x</th>
      <th>RE6NDVI_x</th>
      <th>cloud_cover_x</th>
      <th>area_x</th>
      <th>date_from_x</th>
      <th>date_to_x</th>
      <th>id</th>
      <th>timestamp_y</th>
      <th>NDVI_y</th>
      <th>NDWI_y</th>
      <th>RE6NDVI_y</th>
      <th>cloud_cover_y</th>
      <th>area_y</th>
      <th>date_from_y</th>
      <th>date_to_y</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>0</td>
      <td>0.559000</td>
      <td>-0.473000</td>
      <td>0.109000</td>
      <td>0.420000</td>
      <td>0.018</td>
      <td>2018-05-07</td>
      <td>2018-05-12</td>
      <td>15467</td>
      <td>1</td>
      <td>0.483000</td>
      <td>-0.413000</td>
      <td>0.146000</td>
      <td>0.420000</td>
      <td>0.018</td>
      <td>2018-05-27</td>
      <td>2018-06-01</td>
    </tr>
    <tr>
      <th>1</th>
      <td>0</td>
      <td>0.795000</td>
      <td>-0.679000</td>
      <td>0.161000</td>
      <td>0.080000</td>
      <td>0.153</td>
      <td>2018-05-07</td>
      <td>2018-05-12</td>
      <td>15728</td>
      <td>1</td>
      <td>0.696000</td>
      <td>-0.584000</td>
      <td>0.134000</td>
      <td>0.080000</td>
      <td>0.153</td>
      <td>2018-05-27</td>
      <td>2018-06-01</td>
    </tr>
    <tr>
      <th>2</th>
      <td>0</td>
      <td>0.871778</td>
      <td>-0.743333</td>
      <td>0.168444</td>
      <td>0.076667</td>
      <td>0.243</td>
      <td>2018-05-07</td>
      <td>2018-05-12</td>
      <td>15729</td>
      <td>1</td>
      <td>0.791556</td>
      <td>-0.653444</td>
      <td>0.141444</td>
      <td>0.076667</td>
      <td>0.243</td>
      <td>2018-05-27</td>
      <td>2018-06-01</td>
    </tr>
    <tr>
      <th>3</th>
      <td>0</td>
      <td>0.848000</td>
      <td>-0.710000</td>
      <td>0.148000</td>
      <td>0.080000</td>
      <td>0.270</td>
      <td>2018-05-07</td>
      <td>2018-05-12</td>
      <td>15730</td>
      <td>1</td>
      <td>0.754000</td>
      <td>-0.625000</td>
      <td>0.148000</td>
      <td>0.080000</td>
      <td>0.270</td>
      <td>2018-05-27</td>
      <td>2018-06-01</td>
    </tr>
    <tr>
      <th>4</th>
      <td>0</td>
      <td>0.743000</td>
      <td>-0.639000</td>
      <td>0.126000</td>
      <td>0.080000</td>
      <td>0.297</td>
      <td>2018-05-07</td>
      <td>2018-05-12</td>
      <td>15839</td>
      <td>1</td>
      <td>0.484000</td>
      <td>-0.456000</td>
      <td>0.115000</td>
      <td>0.080000</td>
      <td>0.297</td>
      <td>2018-05-27</td>
      <td>2018-06-01</td>
    </tr>
  </tbody>
</table>
</div>



Lets now make a plot of the NDVI at May 7 and the NDVI at May 25.


```python
plt.scatter(x = parcels_data['NDVI_x'].values , y = parcels_data['NDVI_y'] )
plt.xlabel('NDVI May 7')
plt.ylabel('NDVI May 25')
plt.show()
```


![png](output_32_0.png)


Parcels that are likely to be herb richt would have a high biomass at May 7 and would increase in biomass over time. So the point in the upper right of the graph lying on the left side of the linear line are likely to be herb rich.

Let's select these parcels and plot them in green on the map.


```python
herb_rich = parcels_data[parcels_data['NDVI_x'] >0.55 ]
herb_rich = herb_rich[herb_rich['NDVI_y'] >0.75 ]

parcels_data['richness'] = 0
parcels_data.loc[parcels_data['id'].isin(list(herb_rich['id'])), 'richness'] = 1

parcels = parcels.merge(parcels_data, on = 'id')

img =polys_on_image(alpha = 1, column = 'richness', colors = [(0,0,1), (0,1,0)], polys = parcels, xmin = parcels.bounds.minx.min() ,xmax = parcels.bounds.maxx.max(),ymin = parcels.bounds.miny.min(),ymax = parcels.bounds.maxy.max())

plt.imshow(img)
```




    <matplotlib.image.AxesImage at 0x7fee09921278>




![png](output_34_1.png)


# What parcels have trees nearby?

Trees provide valuable nesting areas for many insects, it is therefore important to make sure that parcels have enough trees nearby to house insects.

In this example we query for parcels that lack nearby trees.


```python

```

# Appendix
We use the following function to plot polygons over an image.


```python
from shapely.geometry import Polygon
from rasterio.features import rasterize

def polys_on_image(polys, xmin,xmax,ymin,ymax, alpha, im = None, colors = [(0,0,1)] , column= None):
    polys.crs = {'init': 'epsg:4326'}
    polys = polys.to_crs({'init': 'epsg:3395'})
    
    bbox = gpd.GeoDataFrame( {'geometry': [Polygon([(xmin,ymin), (xmax, ymin), (xmax, ymax), (xmin, ymax)])]} )
    bbox.crs = {'init': 'epsg:4326'}
    bbox = bbox.to_crs({'init': 'epsg:3395'})

    if im == None:
        im = np.zeros((1024,1024,4))
    if column == None:
        column = 'extra'
        polys[column] = 0
    
    transform = rasterio.transform.from_bounds(bbox.bounds['minx'], bbox.bounds['miny'], bbox.bounds['maxx'], bbox.bounds['maxy'], im.shape[0], im.shape[1])
    rasters = np.zeros(im.shape)
    for i in np.arange(len(colors)):
        sub_polys = polys.loc[polys[column] == i]
        raster = rasterio.features.rasterize( shapes = [ (sub_polys['geometry'].values[m], 1) for m in np.arange(sub_polys.shape[0]) ] , fill = 0, transform = transform, out_shape = (im.shape[0], im.shape[1]), all_touched = True )
        raster = np.stack([raster * colors[i][0], raster*colors[i][1],raster*colors[i][2], raster ], axis = 2)
        rasters = np.add(rasters, raster)
     
    rasters = np.clip(rasters, 0,1)
    image = im * (1 - alpha) + rasters*alpha 
    return(image)
 
```
