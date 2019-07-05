
The Chaco in Paraguay is a large sparsely habited area of about 150.000 square kilometers. The vast amount of forests make the Chaco of enourmous ecological value. Unfortunately much of this forest is dissapearing at an unpresedented rate.

This notebook invastigates deforestation in northern Paraguay in recent years. Using the Ellipsis API it tackles some of the monitoring challanges. We will specifically be looking at deforestation that took place within reserves. That is to say deforestation taking place in areas where it is explicitely prohibited.

The acquisition of the data has been paid for and made publicly available by IUCN the Netherlands comittee and Guyra Paraguay.

## Programming a deforestation alert bot

Using python and the Ellipsis API we will write a bot program to help us analyzing the deforestation in the Gran Chaco.

We will be requiring the following python packages


```python
import requests

import pandas as pd
import numpy as np
import geopandas as gpd
import rasterio

from matplotlib import pyplot as plt
from matplotlib import image as mpimg

from io import BytesIO
from io import StringIO
```

Now let's save the url that we need in a variable to shorten our code at a later stage.


```python
url = 'https://api.ellipsis-earth.com/v1/'
```

Lastly we store the id of the chaco_demo map in a variable as well.


```python
r = requests.get(url + 'account/myMaps')
r = r.json()
mapId = [map['id'] for map in r if map['name'] == 'Gran Chaco'][0]
mapId
```




    '6b696129-659a-4cf4-8dd6-2cf0642f58db'



Next we should request the available timestamps for this map.

# Reserves lacking forest

Let save the highest, and therefore most recent, timestamp into a variable.


```python
r = requests.post(url + 'metadata/timestamps',
                 json = {"mapId":  mapId })

r = r.json()
min_timestamp = 0
max_timestamp = len(r)

```

Having done this, we request all the id's of reserves.


```python
r = requests.post(url + 'metadata/polygons',
                 json = {"mapId":  mapId, 'layer': 'Areas bosque Paraguay' })

ids = r.json()['ids']
```

A long list of almost 80.000 polygons! There is a max of 3000 polygons per request, so we will need to use chunks to make this work. We shall be using the chunks function from the Appendix to do so.


```python

ids_chunks = chunks(ids, 3000)
```

Now we are ready to obtain the total deforested surface area of all reserves.

We will request the total deforested area for each reserve for all timestamps and take the median surface area as the value we were looking for. All the while we will ignore all measurements in which there was any cloudcover.

This strategy of multilooking counters the one off mistakes that the model may maken.


```python
Data = list()
for ids_chunk in ids_chunks:
    new_data = list()
    for timestamp in np.arange(min_timestamp, max_timestamp):
        r = requests.post(url + 'data/class/polygon/polygonIds',
                 json = {"mapId":  mapId, 'timestamp': int(timestamp), 'polygonIds': ids_chunk })
        new_data.append(pd.read_csv(StringIO(r.text)))
        
    deforested = [x['no class'].values for x in new_data]
    clouds = [x['mask'].values for x in new_data]

    deforested_end = []
    for i in np.arange(len(deforested[0])):
        timeserie = []
        for j in np.arange(len(deforested)):
            if clouds[j][i] > 0:
                pass
            else:
                timeserie = timeserie + [deforested[j][i] ]
            
        deforested_end = deforested_end +  [np.median(timeserie)]
        
    new_data = pd.DataFrame({'id':new_data[0]['id'].values, 'area':new_data[0]['area'].values, 'deforested':deforested_end})
    
    Data.append(new_data)
Data = pd.concat(Data)
```

Let's calculate the total amount of non-natural vegetation within reserves in the Gran-Chaco.


```python
Data['deforested'].sum()
```




    8876.581



Now let's select all reserves in which lack mare than 1km2 of forest and count the number we are left with.


```python
Data_sub = Data.loc[ Data['deforested'] > 1]
Data_sub.shape[0]
```




    1475



Let's sort the resutl and display it in a table.


```python
Data_sub.sort_values(by = 'deforested', ascending  = False).head(10)
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
      <th>area</th>
      <th>deforested</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>279</th>
      <td>45259</td>
      <td>52.877</td>
      <td>36.600</td>
    </tr>
    <tr>
      <th>2220</th>
      <td>92200</td>
      <td>45.132</td>
      <td>34.220</td>
    </tr>
    <tr>
      <th>991</th>
      <td>72971</td>
      <td>45.647</td>
      <td>33.425</td>
    </tr>
    <tr>
      <th>2033</th>
      <td>59013</td>
      <td>40.781</td>
      <td>32.117</td>
    </tr>
    <tr>
      <th>800</th>
      <td>72780</td>
      <td>39.197</td>
      <td>28.874</td>
    </tr>
    <tr>
      <th>705</th>
      <td>87685</td>
      <td>59.407</td>
      <td>28.613</td>
    </tr>
    <tr>
      <th>725</th>
      <td>87705</td>
      <td>59.407</td>
      <td>28.613</td>
    </tr>
    <tr>
      <th>2451</th>
      <td>68431</td>
      <td>34.383</td>
      <td>24.893</td>
    </tr>
    <tr>
      <th>1788</th>
      <td>115768</td>
      <td>34.383</td>
      <td>24.893</td>
    </tr>
    <tr>
      <th>2732</th>
      <td>50712</td>
      <td>45.748</td>
      <td>20.182</td>
    </tr>
  </tbody>
</table>
</div>



We found that about a 1500 of the 80.000 reserves seem to have sufered deforestation in some form. In total all reserves together lost about 9000km2 of forest.

# Deforestation

In this example we search for all standard tiles that suffered forest loss.

We compare the median between timestamp 0 to 2 and timestamp 7 to 9.


```python
timestamp1 = 2
timestamp2 = 10
```

The first step is to find all tiles present in the map and split them up in chunks that we can request at once.


```python
r = requests.post(url + 'metadata/tiles',
                 json = {"mapId":  mapId })

ids = r.json()['ids']

def chunks(l, n = 3000):
    result = list()
    for i in range(0, len(l), n):
        result.append(l[i:i+n])
    return(result)



ids_chunks = chunks(ids, 3000)
```

We now construct two dataframes. One for the median forest cover between timestamp 0 and 2 and another one for timestamp 7 to 9. We remove all timestamps in which the tile sufered cloudcover.


```python
Data = list()
for ids_chunk in ids_chunks:
    r = requests.post(url + 'data/class/tile/tileIds',
                 json = {"mapId":  mapId, 'timestamp': int(timestamp1), 'tileIds': ids_chunk })
    Data.append(pd.read_csv(StringIO(r.text)))
    
Data1 = pd.concat(Data)

Data = list()
for ids_chunk in ids_chunks:
    r = requests.post(url + 'data/class/tile/tileIds',
                 json = {"mapId":  mapId, 'timestamp': int(timestamp2), 'tileIds': ids_chunk })
    Data.append(pd.read_csv(StringIO(r.text)))
    
Data2 = pd.concat(Data)


```

We merge the results into one dataframe. Simple subtraction gives us the amount of forest loss.


```python
Data2 = Data2.rename(columns = {'mask': 'mask 2','blanc':'blanc 2', 'no class':'no class 2', 'area':'area2', 'forest': 'forest 2', 'other': 'other 2'})
Data = Data1.merge(Data2, on = ['tileX','tileY', 'zoom'])
Data['forest loss'] = Data['no class 2'] - Data['no class']
```

Let's select all tiles that have lost over 0.6km2 of forest and display them in a table.


```python
Data_sub = Data.loc[Data['forest loss'] > 0.6]


Data_sub.sort_values(by = 'forest loss', ascending  = False).head(10)
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
      <th>forest</th>
      <th>mask</th>
      <th>no class</th>
      <th>other</th>
      <th>area</th>
      <th>blanc 2</th>
      <th>forest 2</th>
      <th>mask 2</th>
      <th>no class 2</th>
      <th>other 2</th>
      <th>area2</th>
      <th>forest loss</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>97074</th>
      <td>5339</td>
      <td>9004</td>
      <td>14</td>
      <td>0.0</td>
      <td>0.000</td>
      <td>5.408</td>
      <td>0.000</td>
      <td>0.0</td>
      <td>5.408</td>
      <td>0.0</td>
      <td>0.055</td>
      <td>0.0</td>
      <td>5.353</td>
      <td>0.000</td>
      <td>5.408</td>
      <td>5.353</td>
    </tr>
    <tr>
      <th>133094</th>
      <td>5342</td>
      <td>9006</td>
      <td>14</td>
      <td>0.0</td>
      <td>0.000</td>
      <td>5.405</td>
      <td>0.000</td>
      <td>0.0</td>
      <td>5.405</td>
      <td>0.0</td>
      <td>0.091</td>
      <td>0.0</td>
      <td>5.294</td>
      <td>0.020</td>
      <td>5.405</td>
      <td>5.294</td>
    </tr>
    <tr>
      <th>181149</th>
      <td>5350</td>
      <td>9026</td>
      <td>14</td>
      <td>0.0</td>
      <td>0.000</td>
      <td>5.379</td>
      <td>0.001</td>
      <td>0.0</td>
      <td>5.380</td>
      <td>0.0</td>
      <td>0.092</td>
      <td>0.0</td>
      <td>5.288</td>
      <td>0.000</td>
      <td>5.380</td>
      <td>5.287</td>
    </tr>
    <tr>
      <th>163079</th>
      <td>5342</td>
      <td>9008</td>
      <td>14</td>
      <td>0.0</td>
      <td>0.000</td>
      <td>5.402</td>
      <td>0.000</td>
      <td>0.0</td>
      <td>5.402</td>
      <td>0.0</td>
      <td>0.118</td>
      <td>0.0</td>
      <td>5.284</td>
      <td>0.000</td>
      <td>5.402</td>
      <td>5.284</td>
    </tr>
    <tr>
      <th>172103</th>
      <td>5342</td>
      <td>9004</td>
      <td>14</td>
      <td>0.0</td>
      <td>0.000</td>
      <td>5.311</td>
      <td>0.096</td>
      <td>0.0</td>
      <td>5.408</td>
      <td>0.0</td>
      <td>0.043</td>
      <td>0.0</td>
      <td>5.365</td>
      <td>0.000</td>
      <td>5.408</td>
      <td>5.269</td>
    </tr>
    <tr>
      <th>77641</th>
      <td>5534</td>
      <td>9114</td>
      <td>14</td>
      <td>0.0</td>
      <td>5.265</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.0</td>
      <td>5.265</td>
      <td>0.0</td>
      <td>0.000</td>
      <td>0.0</td>
      <td>5.265</td>
      <td>0.000</td>
      <td>5.265</td>
      <td>5.265</td>
    </tr>
    <tr>
      <th>116654</th>
      <td>5529</td>
      <td>9119</td>
      <td>14</td>
      <td>0.0</td>
      <td>5.258</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.0</td>
      <td>5.258</td>
      <td>0.0</td>
      <td>0.000</td>
      <td>0.0</td>
      <td>5.258</td>
      <td>0.000</td>
      <td>5.258</td>
      <td>5.258</td>
    </tr>
    <tr>
      <th>188684</th>
      <td>5536</td>
      <td>9119</td>
      <td>14</td>
      <td>0.0</td>
      <td>5.258</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.0</td>
      <td>5.258</td>
      <td>0.0</td>
      <td>0.000</td>
      <td>0.0</td>
      <td>5.258</td>
      <td>0.000</td>
      <td>5.258</td>
      <td>5.258</td>
    </tr>
    <tr>
      <th>136088</th>
      <td>5342</td>
      <td>9007</td>
      <td>14</td>
      <td>0.0</td>
      <td>0.000</td>
      <td>5.374</td>
      <td>0.030</td>
      <td>0.0</td>
      <td>5.404</td>
      <td>0.0</td>
      <td>0.115</td>
      <td>0.0</td>
      <td>5.287</td>
      <td>0.002</td>
      <td>5.404</td>
      <td>5.257</td>
    </tr>
    <tr>
      <th>32612</th>
      <td>5530</td>
      <td>9119</td>
      <td>14</td>
      <td>0.0</td>
      <td>5.258</td>
      <td>0.000</td>
      <td>0.000</td>
      <td>0.0</td>
      <td>5.258</td>
      <td>0.0</td>
      <td>0.004</td>
      <td>0.0</td>
      <td>5.254</td>
      <td>0.000</td>
      <td>5.258</td>
      <td>5.254</td>
    </tr>
  </tbody>
</table>
</div>



In order to get a grasp of the magnitude we calculate the total forest loss of all of these tile combined.


```python
Data_sub['forest loss'].sum()
```




    24320.201



## Looking at a specific case

Let's focus on polygon 29236 and check what is going on here. First we retrieve it's geometry.


```python
id = 29236
poly = r[r['id'] == id]
```

We can retrieve a visualisation of both timestamps from the API to see the situatioin before and after. We use the polys_on_image function from the Appendix to include the polygon on the image.


```python
r = requests.post(url + 'visual/bounds',
                 json = {"mapId":  mapId, 'timestampMin':1, 'timestampMax':t1, 'layerName':'rgb', 'xMin': poly.bounds.minx.min() ,'xMax':poly.bounds.maxx.max(), 'yMin':poly.bounds.miny.min(), 'yMax':poly.bounds.maxy.max() })

img = mpimg.imread(BytesIO(r.content))
img = plotPolys(im = img, polys = poly, alpha = 0.2, xmin = poly.bounds.minx.min() ,xmax = poly.bounds.maxx.max(),ymin = poly.bounds.miny.min(),ymax = poly.bounds.maxy.max() )

plt.imshow(img)
```

    Clipping input data to the valid range for imshow with RGB data ([0..1] for floats or [0..255] for integers).





    <matplotlib.image.AxesImage at 0x7f500df4e080>




![png](output_42_2.png)



```python
r = requests.post(url + 'visual/bounds',
                 json = {"mapId":  mapId, 'timestampMin':t1, 'timestampMax':t2, 'layerName':'rgb', 'xMin': poly.bounds.minx.min() ,'xMax':poly.bounds.maxx.max(), 'yMin':poly.bounds.miny.min(), 'yMax':poly.bounds.maxy.max() })

img = mpimg.imread(BytesIO(r.content))
img = plotPolys(im = img, polys = poly, alpha = 0.2, xmin = poly.bounds.minx.min() ,xmax = poly.bounds.maxx.max(),ymin = poly.bounds.miny.min(),ymax = poly.bounds.maxy.max() )

plt.imshow(img)
```

    Clipping input data to the valid range for imshow with RGB data ([0..1] for floats or [0..255] for integers).





    <matplotlib.image.AxesImage at 0x7f500eb315c0>




![png](output_43_2.png)


Yes there has indeed been some deforestation in the lower right corner there.
