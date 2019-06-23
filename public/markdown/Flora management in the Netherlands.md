
The Netherlands has over 750.000 agricultural plots. As they cover almost 80 percent of all soil, they are of vital importance to the Dutch ecosystem. Especially insects are dependent on the number and distribution of flowers and trees on these plots.

To help keeping the Netherlands pollinator friendly we need an up-to-date overview of the conditions of all of these plots, so that we can take timely and information driven action when necessary. However, the monitoring of this large number of plots spread out over the entire country provides challenges. This notebook tackles some of them.

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
import seaborn as sns

from matplotlib import pyplot as plt
from matplotlib import image as mpimg

from io import BytesIO
from io import StringIO
```

On top of this we will be using some utility functions from the Appendix notebook.

For convenience we store the base url in a variable


```python
url = 'https://api.ellipsis-earth.com/v1/'
```

In this notebook we will study the Netherlands fields map. We fetch the id of this map and store it in mapId.


```python
r = requests.get(url + 'account/myMaps')
r = r.json()
mapId = [map['uuid'] for map in r if map['name'] == 'LNV maai en oogst kaart'][0]
mapId
```




    'd9903b33-f5d1-4d57-992f-3d8172460126'



Let's see what timestamps are available for this map.


```python
r = requests.post(url + 'metadata/timestamps',
                 json = {"mapId":  mapId })

r = r.json()
r
```

## What plots have recently been mowed?

A good mowing regime is of vital importance for good landscape management. Mowing too often keeps plants from being able to flower and mowing all plots in an area at the same time robs insect life of their food source.

In this example we find the mowing regime around Esloo and analyse its impact on insect life.

First we define bounding box coordinates for Elsloo, Friesland.


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

We are only interested in grassland at the moment, so let's filter for that type land use and make a plot. For this we use the plotPolys function from the Appendix.


```python
parcels = parcels[parcels['GWS_GEWASC'] == 265]
```


```python
img =plotPolys(colors =[(0,0,0.5)] , polys = parcels, xmin = parcels.bounds.minx.min() ,xmax = parcels.bounds.maxx.max(),ymin = parcels.bounds.miny.min(),ymax = parcels.bounds.maxy.max())

plt.figure(figsize=(10,10))
plt.imshow(img)
```




    <matplotlib.image.AxesImage at 0x7fbc7bc39048>




![png](output_17_1.png)


Now we request all classification results of the map for timestamp 0 and select all parcels around Esloo and merge the result with the geopandas dataframe.


```python
r_0 = requests.post(url + 'data/class/polygon/polygonIds',
                 json = {"mapId":  mapId, 'timestamp':0, 'polygonIds':parcels['id'].tolist()  })
r_0 = pd.read_csv(StringIO(r_0.text))
r_0 = parcels.merge(r_0, on = 'id')
```

Now let's see what percentage of fields have been mowed in the last 3 days, which fields have been mowed in the last 10 days and which have not been mowed in a while at timestamp 0.

For this we construct an extra column for each mowing-status, with for each parcel the percentage of pixels that is estimated to belong to it.


```python
r_0['very recently mowed'] = np.divide(r_0['very recently mowed/crop'].values, r_0['area'].values )
r_0['not recently mowed'] = np.divide(r_0['grass/crop'].values, r_0['area'].values )
r_0['recently mowed'] =  np.divide(np.add(r_0['recently mowed/crop'].values, r_0['recently mowed/no crop'].values), r_0['area'].values )
r_0['other'] = 1 - r_0['very recently mowed'].values - r_0['not recently mowed'].values - r_0['recently mowed'].values

r_0 = r_0[['geometry','id','very recently mowed','recently mowed', 'not recently mowed' , 'other' ]].copy()
r_0 = r_0.sort_values('very recently mowed', ascending = False)
r_0[['id','very recently mowed','recently mowed', 'not recently mowed', 'other']].head(15)
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
      <th>other</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>229</th>
      <td>656592</td>
      <td>0.962025</td>
      <td>0.000000</td>
      <td>0.012658</td>
      <td>0.025316</td>
    </tr>
    <tr>
      <th>92</th>
      <td>222005</td>
      <td>0.909091</td>
      <td>0.018182</td>
      <td>0.054545</td>
      <td>0.018182</td>
    </tr>
    <tr>
      <th>31</th>
      <td>74343</td>
      <td>0.878788</td>
      <td>0.090909</td>
      <td>0.000000</td>
      <td>0.030303</td>
    </tr>
    <tr>
      <th>113</th>
      <td>265646</td>
      <td>0.866667</td>
      <td>0.088889</td>
      <td>0.000000</td>
      <td>0.044444</td>
    </tr>
    <tr>
      <th>222</th>
      <td>642157</td>
      <td>0.857143</td>
      <td>0.000000</td>
      <td>0.035714</td>
      <td>0.107143</td>
    </tr>
    <tr>
      <th>94</th>
      <td>224019</td>
      <td>0.833333</td>
      <td>0.083333</td>
      <td>0.000000</td>
      <td>0.083333</td>
    </tr>
    <tr>
      <th>250</th>
      <td>740917</td>
      <td>0.774194</td>
      <td>0.193548</td>
      <td>0.000000</td>
      <td>0.032258</td>
    </tr>
    <tr>
      <th>183</th>
      <td>552124</td>
      <td>0.758621</td>
      <td>0.206897</td>
      <td>0.000000</td>
      <td>0.034483</td>
    </tr>
    <tr>
      <th>66</th>
      <td>171288</td>
      <td>0.740741</td>
      <td>0.185185</td>
      <td>0.055556</td>
      <td>0.018519</td>
    </tr>
    <tr>
      <th>42</th>
      <td>107868</td>
      <td>0.714286</td>
      <td>0.000000</td>
      <td>0.071429</td>
      <td>0.214286</td>
    </tr>
    <tr>
      <th>40</th>
      <td>93205</td>
      <td>0.700000</td>
      <td>0.133333</td>
      <td>0.033333</td>
      <td>0.133333</td>
    </tr>
    <tr>
      <th>233</th>
      <td>681066</td>
      <td>0.684211</td>
      <td>0.289474</td>
      <td>0.000000</td>
      <td>0.026316</td>
    </tr>
    <tr>
      <th>63</th>
      <td>168332</td>
      <td>0.558824</td>
      <td>0.411765</td>
      <td>0.000000</td>
      <td>0.029412</td>
    </tr>
    <tr>
      <th>159</th>
      <td>486761</td>
      <td>0.548387</td>
      <td>0.000000</td>
      <td>0.354839</td>
      <td>0.096774</td>
    </tr>
    <tr>
      <th>32</th>
      <td>75435</td>
      <td>0.488889</td>
      <td>0.088889</td>
      <td>0.311111</td>
      <td>0.111111</td>
    </tr>
  </tbody>
</table>
</div>



Now let's make a pie-chart of the very recently mowed, recently mowed and not recently mowed parcels.


```python
very_recently_mowed = np.sum(r_0['very recently mowed'].values > 0.3)
not_recently_mowed = np.sum(r_0['not recently mowed'].values > 0.3)
mowed_other = np.sum(r_0['other'].values > 0.3)
recently_mowed = r_0.shape[0] - very_recently_mowed - not_recently_mowed - mowed_other
# Data to plot
labels = ['not recently', 'recently', 'very recently', 'other']
sizes = [not_recently_mowed, recently_mowed, very_recently_mowed, mowed_other]
colors = ['green', 'orange', 'red', 'brown']
explode = (0.05, 0.05, 0.05, 0.05)
# Plot
plt.pie(sizes, labels=labels, explode = explode, colors=colors,autopct='%1.1f%%')
plt.title('Mowing of plots around Esloo at may 7 2018')
plt.axis('equal')
plt.show()
```


![png](output_23_0.png)


Let's make a visualisation of the distribution of these fields.


```python
r_0['mowing'] = 1
r_0.loc[r_0['other'] > 0.3, 'mowing'] = 3
r_0.loc[r_0['very recently mowed'] > 0.3, 'mowing'] = 2
r_0.loc[r_0['not recently mowed'] > 0.3, 'mowing'] = 0
```


```python
r_0[['id','very recently mowed','recently mowed', 'not recently mowed', 'other', 'mowing']].head(15)
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
      <th>other</th>
      <th>mowing</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>229</th>
      <td>656592</td>
      <td>0.962025</td>
      <td>0.000000</td>
      <td>0.012658</td>
      <td>0.025316</td>
      <td>2</td>
    </tr>
    <tr>
      <th>92</th>
      <td>222005</td>
      <td>0.909091</td>
      <td>0.018182</td>
      <td>0.054545</td>
      <td>0.018182</td>
      <td>2</td>
    </tr>
    <tr>
      <th>31</th>
      <td>74343</td>
      <td>0.878788</td>
      <td>0.090909</td>
      <td>0.000000</td>
      <td>0.030303</td>
      <td>2</td>
    </tr>
    <tr>
      <th>113</th>
      <td>265646</td>
      <td>0.866667</td>
      <td>0.088889</td>
      <td>0.000000</td>
      <td>0.044444</td>
      <td>2</td>
    </tr>
    <tr>
      <th>222</th>
      <td>642157</td>
      <td>0.857143</td>
      <td>0.000000</td>
      <td>0.035714</td>
      <td>0.107143</td>
      <td>2</td>
    </tr>
    <tr>
      <th>94</th>
      <td>224019</td>
      <td>0.833333</td>
      <td>0.083333</td>
      <td>0.000000</td>
      <td>0.083333</td>
      <td>2</td>
    </tr>
    <tr>
      <th>250</th>
      <td>740917</td>
      <td>0.774194</td>
      <td>0.193548</td>
      <td>0.000000</td>
      <td>0.032258</td>
      <td>2</td>
    </tr>
    <tr>
      <th>183</th>
      <td>552124</td>
      <td>0.758621</td>
      <td>0.206897</td>
      <td>0.000000</td>
      <td>0.034483</td>
      <td>2</td>
    </tr>
    <tr>
      <th>66</th>
      <td>171288</td>
      <td>0.740741</td>
      <td>0.185185</td>
      <td>0.055556</td>
      <td>0.018519</td>
      <td>2</td>
    </tr>
    <tr>
      <th>42</th>
      <td>107868</td>
      <td>0.714286</td>
      <td>0.000000</td>
      <td>0.071429</td>
      <td>0.214286</td>
      <td>2</td>
    </tr>
    <tr>
      <th>40</th>
      <td>93205</td>
      <td>0.700000</td>
      <td>0.133333</td>
      <td>0.033333</td>
      <td>0.133333</td>
      <td>2</td>
    </tr>
    <tr>
      <th>233</th>
      <td>681066</td>
      <td>0.684211</td>
      <td>0.289474</td>
      <td>0.000000</td>
      <td>0.026316</td>
      <td>2</td>
    </tr>
    <tr>
      <th>63</th>
      <td>168332</td>
      <td>0.558824</td>
      <td>0.411765</td>
      <td>0.000000</td>
      <td>0.029412</td>
      <td>2</td>
    </tr>
    <tr>
      <th>159</th>
      <td>486761</td>
      <td>0.548387</td>
      <td>0.000000</td>
      <td>0.354839</td>
      <td>0.096774</td>
      <td>0</td>
    </tr>
    <tr>
      <th>32</th>
      <td>75435</td>
      <td>0.488889</td>
      <td>0.088889</td>
      <td>0.311111</td>
      <td>0.111111</td>
      <td>0</td>
    </tr>
  </tbody>
</table>
</div>




```python
img = plotPolys(column = 'mowing', colors = [(0,0.5,0), (1,0.5,0),(0.8,0,0), (1,0.5,0.5)], polys = parcels, xmin = parcels.bounds.minx.min() ,xmax = parcels.bounds.maxx.max(),ymin = parcels.bounds.miny.min(),ymax = parcels.bounds.maxy.max())

plt.figure(figsize=(10,10))
plt.imshow(img)
```




    <matplotlib.image.AxesImage at 0x7fb0a4fe43c8>




![png](output_27_1.png)


## Measurements analysis

Besides class data, the API can also provide the average values of some measurements for each parcel. These indices get more meaningful when combined with information about the mowing regime, so we need to put the information we have gathered so far in a suitable form.


```python
r_0 = requests.post(url + 'data/class/polygon/polygonIds',
                 json = {"mapId":  mapId, 'timestamp':0, 'polygonIds':parcels['id'].tolist()  })
r_0 = pd.read_csv(StringIO(r_0.text))

r_0['very recently mowed'] = np.divide(r_0['very recently mowed/crop'].values, r_0['area'].values )
r_0['not recently mowed'] = np.divide(r_0['grass/crop'].values, r_0['area'].values )
r_0['recently mowed'] =  np.divide(r_0['recently mowed/crop'].values, r_0['area'].values )
r_0['other'] = 1 - r_0['very recently mowed'].values - r_0['not recently mowed'].values - r_0['recently mowed'].values

r_0['status'] = 'other'
r_0.loc[r_0['recently mowed'] > 0.3, 'status'] = 'recently mowed'
r_0.loc[r_0['very recently mowed'] > 0.3, 'status'] = 'very recently mowed'
r_0.loc[r_0['not recently mowed'] > 0.3, 'status'] = 'not recently mowed'
r_0 = r_0[['id','very recently mowed','recently mowed', 'not recently mowed', 'other', 'status']]
```

So far we have only considered timestamp 0. For the sake of an equal analysis we will make a similar data frame for timestamp 1.


```python
r_1 = requests.post(url + 'data/class/polygon/polygonIds',
                 json = {"mapId":  mapId, 'timestamp':1, 'polygonIds':parcels['id'].tolist()  })
r_1 = pd.read_csv(StringIO(r_1.text))

r_1['very recently mowed'] = np.divide(r_1['very recently mowed/crop'].values, r_1['area'].values )
r_1['not recently mowed'] = np.divide(r_1['grass/crop'].values, r_1['area'].values )
r_1['recently mowed'] =  np.divide(r_1['recently mowed/crop'].values, r_1['area'].values )
r_1['other'] = 1 - r_1['very recently mowed'].values - r_1['not recently mowed'].values - r_1['recently mowed'].values

r_1['status'] = 'other'
r_1.loc[r_1['recently mowed'] > 0.3, 'status'] = 'recently mowed'
r_1.loc[r_1['very recently mowed'] > 0.3, 'status'] = 'very recently mowed'
r_1.loc[r_1['not recently mowed'] > 0.3, 'status'] = 'not recently mowed'
r_1 = r_1[['id','very recently mowed','recently mowed', 'not recently mowed', 'other', 'status']]
```

Now we are ready to request the measurement data. Let's request both timestamps.


```python
s_0 = requests.post(url + 'data/measurement/polygon/polygonIds',
                 json = {"mapId":  mapId, 'timestamp':0, 'polygonIds': parcels['id'].tolist(), 'class': 'all classes' })
s_0 = pd.read_csv(StringIO(s_0.text))

s_1 = requests.post(url + 'data/measurement/polygon/polygonIds',
                 json = {"mapId":  mapId, 'timestamp':1, 'polygonIds': parcels['id'].tolist(), 'class': 'all classes' })
s_1 = pd.read_csv(StringIO(s_1.text))
```

Finally we merge all data frames on the id column, so we can easily compare the different timestamps.


```python
parcels = parcels.merge(s_0, on = 'id')
parcels = parcels.merge(r_0, on = 'id')
parcels = parcels.merge(s_1, on = 'id')
parcels = parcels.merge(r_1, on = 'id')

pd.options.display.max_columns = 100
parcels.head()
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
      <th>CAT_GEWASC</th>
      <th>GWS_GEWAS</th>
      <th>GWS_GEWASC</th>
      <th>geometry</th>
      <th>id</th>
      <th>layer</th>
      <th>NDII_x</th>
      <th>NDVI_x</th>
      <th>RE6NDVI_x</th>
      <th>cloud_cover_x</th>
      <th>area_x</th>
      <th>very recently mowed_x</th>
      <th>recently mowed_x</th>
      <th>not recently mowed_x</th>
      <th>other_x</th>
      <th>status_x</th>
      <th>NDII_y</th>
      <th>NDVI_y</th>
      <th>RE6NDVI_y</th>
      <th>cloud_cover_y</th>
      <th>area_y</th>
      <th>very recently mowed_y</th>
      <th>recently mowed_y</th>
      <th>not recently mowed_y</th>
      <th>other_y</th>
      <th>status_y</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>Grasland</td>
      <td>Grasland, blijvend</td>
      <td>265</td>
      <td>POLYGON ((6.25712252 52.97938, 6.257115 52.979...</td>
      <td>15467</td>
      <td>percelen</td>
      <td>0.257</td>
      <td>0.559</td>
      <td>0.109</td>
      <td>0.420</td>
      <td>0.016</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.500000</td>
      <td>0.500000</td>
      <td>not recently mowed</td>
      <td>0.199</td>
      <td>0.483</td>
      <td>0.146</td>
      <td>0.420</td>
      <td>0.016</td>
      <td>0.0</td>
      <td>0.000000</td>
      <td>0.500000</td>
      <td>0.500000</td>
      <td>not recently mowed</td>
    </tr>
    <tr>
      <th>1</th>
      <td>Grasland</td>
      <td>Grasland, blijvend</td>
      <td>265</td>
      <td>POLYGON ((6.25687647 52.97944, 6.2568717 52.97...</td>
      <td>15728</td>
      <td>percelen</td>
      <td>0.412</td>
      <td>0.795</td>
      <td>0.161</td>
      <td>0.080</td>
      <td>0.136</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.941176</td>
      <td>0.058824</td>
      <td>not recently mowed</td>
      <td>0.286</td>
      <td>0.696</td>
      <td>0.134</td>
      <td>0.080</td>
      <td>0.136</td>
      <td>0.0</td>
      <td>0.000000</td>
      <td>0.941176</td>
      <td>0.058824</td>
      <td>not recently mowed</td>
    </tr>
    <tr>
      <th>2</th>
      <td>Grasland</td>
      <td>Grasland, blijvend</td>
      <td>265</td>
      <td>POLYGON ((6.257249 52.97469, 6.256544 52.97473...</td>
      <td>15729</td>
      <td>percelen</td>
      <td>0.471</td>
      <td>0.872</td>
      <td>0.168</td>
      <td>0.077</td>
      <td>0.216</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.925926</td>
      <td>0.074074</td>
      <td>not recently mowed</td>
      <td>0.364</td>
      <td>0.792</td>
      <td>0.141</td>
      <td>0.077</td>
      <td>0.216</td>
      <td>0.0</td>
      <td>0.000000</td>
      <td>0.925926</td>
      <td>0.074074</td>
      <td>not recently mowed</td>
    </tr>
    <tr>
      <th>3</th>
      <td>Grasland</td>
      <td>Grasland, blijvend</td>
      <td>265</td>
      <td>POLYGON ((6.25911 52.9753761, 6.25748634 52.97...</td>
      <td>15730</td>
      <td>percelen</td>
      <td>0.421</td>
      <td>0.848</td>
      <td>0.148</td>
      <td>0.080</td>
      <td>0.240</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.933333</td>
      <td>0.066667</td>
      <td>not recently mowed</td>
      <td>0.294</td>
      <td>0.754</td>
      <td>0.148</td>
      <td>0.080</td>
      <td>0.240</td>
      <td>0.0</td>
      <td>0.266667</td>
      <td>0.666667</td>
      <td>0.066667</td>
      <td>not recently mowed</td>
    </tr>
    <tr>
      <th>4</th>
      <td>Grasland</td>
      <td>Grasland, blijvend</td>
      <td>265</td>
      <td>POLYGON ((6.168067 52.99535, 6.168104 52.99479...</td>
      <td>15839</td>
      <td>percelen</td>
      <td>0.347</td>
      <td>0.743</td>
      <td>0.126</td>
      <td>0.080</td>
      <td>0.264</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.878788</td>
      <td>0.121212</td>
      <td>not recently mowed</td>
      <td>0.076</td>
      <td>0.484</td>
      <td>0.115</td>
      <td>0.080</td>
      <td>0.264</td>
      <td>0.0</td>
      <td>0.818182</td>
      <td>0.090909</td>
      <td>0.090909</td>
      <td>recently mowed</td>
    </tr>
  </tbody>
</table>
</div>



We gathered a lot of information, but it is not very insightful yet. Let's start with a humble scatterplot to try and change that. The NDVI is a proxy for biomass, so to see the change in biomass over time we plot the NDVIs for different timestamps against each other.


```python
sns.set(style="whitegrid")
ax = sns.scatterplot(x="NDVI_x", y="NDVI_y", data=parcels)
```


![png](output_38_0.png)


The dots are clearly grouped together, so there might be some trend hidden in here. However, it is still not very clear. We could make distinctions based on one of the "status" columns, but it would be even better to combine information from both timestamps. Therefore, we add another column which tells if a field is mowed early (i.e. mowed shortly before the first timestamp), mowed late (i.e. mowed shortly before the second timestamp) or not mowed at all..


```python
parcels['mowing'] = 'other'
parcels.loc[np.logical_and(np.equal(parcels['status_x'], 'not recently mowed'),np.equal(parcels['status_y'], 'not recently mowed')) == True, 'mowing'] = 'unmowed'
parcels.loc[np.logical_and(np.equal(parcels['status_x'], 'not recently mowed'), np.logical_not(np.equal(parcels['status_y'], 'not recently mowed'))) == True, 'mowing'] = 'mowed late'
parcels.loc[np.logical_and(np.logical_not(np.equal(parcels['status_x'], 'not recently mowed')),np.equal(parcels['status_y'], 'not recently mowed')) == True, 'mowing'] = 'mowed early'

parcels[['id','mowing']].head()
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
      <th>mowing</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>15467</td>
      <td>unmowed</td>
    </tr>
    <tr>
      <th>1</th>
      <td>15728</td>
      <td>unmowed</td>
    </tr>
    <tr>
      <th>2</th>
      <td>15729</td>
      <td>unmowed</td>
    </tr>
    <tr>
      <th>3</th>
      <td>15730</td>
      <td>unmowed</td>
    </tr>
    <tr>
      <th>4</th>
      <td>15839</td>
      <td>mowed late</td>
    </tr>
  </tbody>
</table>
</div>



Now let's try the scatterplot again.


```python
ax = sns.scatterplot(x="NDVI_x", y="NDVI_y", hue="mowing", data=parcels, hue_order = ['unmowed','mowed early','mowed late','other'])
```


![png](output_42_0.png)


We see that the fields which gain biomass are the ones that growing back after having been mowed, while on the other hand a loss of biomass is most likely caused by just having been mowed. The unmowed fields are fairly constant. To look at this in more detail we calculate the change in average NDVI.


```python
parcels['NDVI_change'] = parcels['NDVI_y'] - parcels['NDVI_x']
ax = sns.violinplot(x ='mowing', y='NDVI_change', data = parcels, scale = 'count', order = ['unmowed','mowed early','mowed late','other'])
```


![png](output_44_0.png)


The width of this violinplot shows the density of that particular result. All four are scaled by count, so the size of the "violin" is an indication of the size of that category. We see that mowed early or late changes the NDVI as expected, but unexpectedly the unmowed plots show a slightly negative change. This drop can have many causes, but let's if we can find at least a partial reason from our data. We begin with the red-edge NDVI


```python
parcels['RE6NDVI_change'] = parcels['RE6NDVI_y'] - parcels['RE6NDVI_x']
ax = sns.violinplot(x ='mowing', y='RE6NDVI_change', data = parcels, scale = 'count', order = ['unmowed','mowed early','mowed late','other'])
```


![png](output_46_0.png)


The red-edge NDVI is a decent proxy for among others chlorophyll. We see a slightly negative trend for unmowed fields, but it is not as pronounced as the NDVI change. Most likely an actual decrease in photosynthetic material is not the cause.


```python
parcels['NDII_change'] = parcels['NDII_y'] - parcels['NDII_x']
ax = sns.violinplot(x ='mowing', y='NDII_change', data = parcels, scale = 'count', order = ['unmowed','mowed early','mowed late','other'])
```


![png](output_48_0.png)


The NDII is a proxy for waterstress in plants; a negative change can indicate a shortage of water. Plants, especially grass, need a steady supply of water to thrive. Waterstress can halt growth and eventually lead to death. It is quite reasonable to assume that a lack of rain caused a small drop in NDVI.

### Bringing it to the next level
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




![png](output_64_1.png)

