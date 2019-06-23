
The Chaco in Paraguay is a large sparsely habited area of about 150.000 square kilometers. The vast amount of forests make the Chaco of enourmous ecological value. Unfortunately much of this forest is dissapearing at an unpresedented rate.

This notebook invastigates deforestation in northern Paraguay in recent years. Using the Ellipsis API it tackles some of the monitoring challanges. We will specifically be looking at deforestation that took place within reserves. That is to say deforestation taking place in areas where it is explicitely prohibited.

The acquisition of the data has been paid for and made publicly available by IUCN the Netherlands comittee and Guyra Paraguay.

## Programming a deforestation alert bot

Using python and the Ellipsis API we will write a bot program identifying all reserves that have suffered forest loss. The bot will request the total surface area of non-forest in all reserves at 1 july 2018 and flag all situations in which the total non-forest area seems suspicious.

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
mapId = [map['uuid'] for map in r if map['name'] == 'Gran Chaco'][0]
mapId
```




    '6b696129-659a-4cf4-8dd6-2cf0642f58db'



Next we should request the available timestamps for this map.


```python
r = requests.post(url + 'metadata/timestamps',
                 json = {"mapId":  mapId })

r = r.json()
r
```




    [{'timestampNumber': 0,
      'dateFrom': '2016-07-01T00:00:00.000Z',
      'dateTo': '2016-07-31T00:00:00.000Z'},
     {'timestampNumber': 1,
      'dateFrom': '2016-11-01T00:00:00.000Z',
      'dateTo': '2016-12-01T00:00:00.000Z'},
     {'timestampNumber': 2,
      'dateFrom': '2017-01-01T00:00:00.000Z',
      'dateTo': '2017-01-31T00:00:00.000Z'},
     {'timestampNumber': 3,
      'dateFrom': '2017-04-01T00:00:00.000Z',
      'dateTo': '2017-05-01T00:00:00.000Z'},
     {'timestampNumber': 4,
      'dateFrom': '2017-07-01T00:00:00.000Z',
      'dateTo': '2017-07-31T00:00:00.000Z'},
     {'timestampNumber': 5,
      'dateFrom': '2017-10-01T00:00:00.000Z',
      'dateTo': '2017-10-31T00:00:00.000Z'},
     {'timestampNumber': 6,
      'dateFrom': '2018-01-01T00:00:00.000Z',
      'dateTo': '2018-01-31T00:00:00.000Z'},
     {'timestampNumber': 7,
      'dateFrom': '2018-04-01T00:00:00.000Z',
      'dateTo': '2018-05-01T00:00:00.000Z'},
     {'timestampNumber': 8,
      'dateFrom': '2018-07-01T00:00:00.000Z',
      'dateTo': '2018-07-31T00:00:00.000Z'}]



Let save the highest, and therefore most recent, timestamp into a variable.


```python
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

Now we are ready to obtain the total deforested surface area of all reserves. We will request the total deforested area for each reserve for all timestamps and take the minimum surface area as the value we were looking for. We do this as the model can make classification mistakes, by multilooking and taking the minimum we counter these one-off mistakes.


```python
Data = list()
for ids_chunk in ids_chunks:
    new_data = list()
    for timestamp in np.arange(max_timestamp):
        r = requests.post(url + 'data/class/polygon/polygonIds',
                 json = {"mapId":  mapId, 'timestamp': int(timestamp), 'polygonIds': ids_chunk })
        new_data.append(pd.read_csv(StringIO(r.text)))
        
    deforested = [x['no class'].values for x in new_data]
    deforested = np.minimum.reduce(deforested)
        
    new_data = pd.DataFrame({'id':new_data[0]['id'].values, 'area':new_data[0]['area'].values, 'deforested':deforested})
    
    Data.append(new_data)
Data = pd.concat(Data)
```

Now let's select all reserves in which more than 0.5 km2 is non-forest.


```python
Data_sub = Data.loc[Data['deforested'] > 0.5]
```

Let's only consider cases in which the reserve area is larger than 5km2


```python
Data_sub = Data_sub.loc[Data_sub['area'] > 5 ]
```

Now let's have a loot at the resereves we are now left with.


```python
Data_sub['id'] = [int(id) for id in Data_sub['id'].values]
Data_sub.sort_values(by = 'deforested', ascending  = False).head(30)
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
      <th>2220</th>
      <td>92200</td>
      <td>45.132</td>
      <td>33.263</td>
    </tr>
    <tr>
      <th>2033</th>
      <td>59013</td>
      <td>40.781</td>
      <td>30.494</td>
    </tr>
    <tr>
      <th>279</th>
      <td>45259</td>
      <td>52.877</td>
      <td>29.376</td>
    </tr>
    <tr>
      <th>991</th>
      <td>72971</td>
      <td>45.647</td>
      <td>27.502</td>
    </tr>
    <tr>
      <th>705</th>
      <td>87685</td>
      <td>59.407</td>
      <td>26.034</td>
    </tr>
    <tr>
      <th>725</th>
      <td>87705</td>
      <td>59.407</td>
      <td>26.034</td>
    </tr>
    <tr>
      <th>800</th>
      <td>72780</td>
      <td>39.197</td>
      <td>25.805</td>
    </tr>
    <tr>
      <th>1788</th>
      <td>115768</td>
      <td>34.383</td>
      <td>22.166</td>
    </tr>
    <tr>
      <th>2451</th>
      <td>68431</td>
      <td>34.383</td>
      <td>22.166</td>
    </tr>
    <tr>
      <th>1854</th>
      <td>55834</td>
      <td>22.229</td>
      <td>17.331</td>
    </tr>
    <tr>
      <th>1433</th>
      <td>118413</td>
      <td>36.178</td>
      <td>16.958</td>
    </tr>
    <tr>
      <th>2003</th>
      <td>91983</td>
      <td>18.325</td>
      <td>15.230</td>
    </tr>
    <tr>
      <th>456</th>
      <td>93436</td>
      <td>22.125</td>
      <td>15.218</td>
    </tr>
    <tr>
      <th>2239</th>
      <td>92219</td>
      <td>19.734</td>
      <td>15.031</td>
    </tr>
    <tr>
      <th>2351</th>
      <td>92331</td>
      <td>23.381</td>
      <td>14.776</td>
    </tr>
    <tr>
      <th>243</th>
      <td>93223</td>
      <td>24.285</td>
      <td>14.214</td>
    </tr>
    <tr>
      <th>1029</th>
      <td>73009</td>
      <td>18.452</td>
      <td>13.590</td>
    </tr>
    <tr>
      <th>356</th>
      <td>114336</td>
      <td>18.452</td>
      <td>13.590</td>
    </tr>
    <tr>
      <th>1305</th>
      <td>58285</td>
      <td>33.591</td>
      <td>13.550</td>
    </tr>
    <tr>
      <th>1603</th>
      <td>94583</td>
      <td>18.628</td>
      <td>12.861</td>
    </tr>
    <tr>
      <th>2009</th>
      <td>91989</td>
      <td>33.396</td>
      <td>12.586</td>
    </tr>
    <tr>
      <th>1346</th>
      <td>79326</td>
      <td>20.994</td>
      <td>12.577</td>
    </tr>
    <tr>
      <th>293</th>
      <td>84273</td>
      <td>26.191</td>
      <td>12.350</td>
    </tr>
    <tr>
      <th>2027</th>
      <td>77007</td>
      <td>26.191</td>
      <td>12.350</td>
    </tr>
    <tr>
      <th>177</th>
      <td>108157</td>
      <td>27.075</td>
      <td>12.339</td>
    </tr>
    <tr>
      <th>161</th>
      <td>48141</td>
      <td>38.709</td>
      <td>12.164</td>
    </tr>
    <tr>
      <th>2611</th>
      <td>74591</td>
      <td>26.902</td>
      <td>12.044</td>
    </tr>
    <tr>
      <th>1576</th>
      <td>55556</td>
      <td>20.706</td>
      <td>11.854</td>
    </tr>
    <tr>
      <th>1942</th>
      <td>61922</td>
      <td>24.145</td>
      <td>11.200</td>
    </tr>
    <tr>
      <th>2337</th>
      <td>110317</td>
      <td>31.271</td>
      <td>10.782</td>
    </tr>
  </tbody>
</table>
</div>



We found that about a 1000 of the 80.000 reserves seem to have sufered deforestation in some form. Let us now retrieve the polygons of these reserves to continue our analysis.


```python
r = requests.post(url + 'geometry/polygons',
                 json = {"mapId":  mapId, 'polygonIds':list(Data_sub['id']) })
r.json()
r  = gpd.GeoDataFrame.from_features(r.json()['features'])
```

We finish by merging our deforestation data with this shape.


```python
r['id'] = [int(id) for id in r['id'].values]
test = r.merge(Data_sub, on  = ['id'])
test.plot()
```




    <matplotlib.axes._subplots.AxesSubplot at 0x7f733bb9bc50>




![png](output_27_1.png)


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




![png](output_32_2.png)



```python
r = requests.post(url + 'visual/bounds',
                 json = {"mapId":  mapId, 'timestampMin':t1, 'timestampMax':t2, 'layerName':'rgb', 'xMin': poly.bounds.minx.min() ,'xMax':poly.bounds.maxx.max(), 'yMin':poly.bounds.miny.min(), 'yMax':poly.bounds.maxy.max() })

img = mpimg.imread(BytesIO(r.content))
img = plotPolys(im = img, polys = poly, alpha = 0.2, xmin = poly.bounds.minx.min() ,xmax = poly.bounds.maxx.max(),ymin = poly.bounds.miny.min(),ymax = poly.bounds.maxy.max() )

plt.imshow(img)
```

    Clipping input data to the valid range for imshow with RGB data ([0..1] for floats or [0..255] for integers).





    <matplotlib.image.AxesImage at 0x7f500eb315c0>




![png](output_33_2.png)


Yes there has indeed been some deforestation in the lower right corner there.
