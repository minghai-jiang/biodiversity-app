
The Chaco in Paraguay is a large sparsely habited area of about 150.000 square kilometers. The vast amount of forests make the Chaco of enourmous ecological value. Unfortunately much of this forest is dissapearing in an unpresedented rate.

This notebook invastigates deforestation in northern Paraguay in recent years. Using the Ellipsis API it tackles some of the monitoring chalanges. We will be looking at deforestation within registered reserves, within permit areas and within areas for which no status is known.

The acquisition of the data has been paid for and made publicly available by IUCN the Netherlands comittee.

## Setting things up

In this notebook we shall analyse the public 'Chaco Demo' map. This map contains 3 classes forest, natural shrubland and other. Furthermore it contains an NDVI index.

Information has been aggregated to predefined polygons that can either be nature reserves or area designated for deforestation.

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

Furthermore we are going to use some of the utility functions defined in the Appendix notebook.

Now let's save the url that we need in a varialbe to shorten our code further on.


```python
url = 'https://api.ellipsis-earth.com/'
```

Lastly we store the id of the chaco_demo map in a variable as well.


```python
r = requests.get(url + 'account/myMaps')
r = r.json()
mapId = [map['uuid'] for map in r if map['name'] == 'Chaco Demo'][0]
mapId
```




    'f7f5ae51-1ff6-4e8b-98e0-37f5d0a97cb7'



## Deforestation in areas that have been marked as reserves

Reserves are designated areas in which no deforestation may take place. To check if indeed no deforestation has taken place here we compare suface areas of the land cover clases of these polygons at two different tiemstamps. Say 7 and 26.


```python
t1 = 7
t2 = 26
```

Next we should request all id's of polygons in the 'reserve' layer.


```python
r = requests.post(url + 'metadata/polygons',
                 json = {"mapId":  mapId, 'layer': 'reserve' })

ids = r.json()['ids']
```

There is a max of 3000 polygons per request, so let's use the chunks function from the Appendix to split up the id array into chunks of no more than 3000.


```python
ids_chunks = chunks(ids, 3000)
```

Now we are ready to request all data and geometries of the reserves using their id's.


```python
Data_t1 = list()
for ids_chunk in ids_chunks:
    r = requests.post(url + 'data/class/polygon/polygonIds',
                 json = {"mapId":  mapId, 'timestamp':t1, 'polygonIds': ids_chunk })
    Data_t1.append(pd.read_csv(StringIO(r.text)))
Data_t1 = pd.concat(Data_t1)
        
Data_t2 = list()
for ids_chunk in ids_chunks:
    r = requests.post(url + 'data/class/polygon/polygonIds',
                 json = {"mapId":  mapId, 'timestamp':t2, 'polygonIds': ids_chunk })
    Data_t2.append(pd.read_csv(StringIO(r.text)))
Data_t2 = pd.concat(Data_t2)

geometries = list()
for ids_chunk in ids_chunks:
    r = requests.post(url + 'geometry/polygons',
                 json = {"mapId":  mapId, 'polygonIds':ids_chunk})

    geometries.append(gpd.GeoDataFrame.from_features(r.json()['features']))
geometries = pd.concat(geometries)

Data = Data_t1.merge(Data_t2, on = 'id')
reserves = geometries.merge(Data, on = 'id')

```

We now subtract the amount of forestcover from the first and last timestamp to get the amount of deforestation. We create a table with a row for each reserve and as it's columns the polygon id and, the total and relative deforested area, toghether with some metadata.


```python
reserves['deforested'] = reserves['no class_x'].values - reserves['no class_y'].values 
reserves['relative_deforestation'] = np.divide(reserves['deforested'].values, reserves['area_x'].values)
```

    /home/daniel/.local/lib/python3.6/site-packages/ipykernel_launcher.py:2: RuntimeWarning: invalid value encountered in true_divide
      


Now let's have a look at the top fifteen reserves in which forest has dissapeard.


```python
reserves=reserves.sort_values(by = ['deforested'], ascending  = False)
reserves[['id', 'deforested', 'relative_deforestation', 'area_x', 'owner']].head(n = 15)
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
      <th>deforested</th>
      <th>relative_deforestation</th>
      <th>area_x</th>
      <th>owner</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>1314</th>
      <td>30499</td>
      <td>18.309929</td>
      <td>0.567011</td>
      <td>32.292</td>
      <td>SEAM</td>
    </tr>
    <tr>
      <th>4832</th>
      <td>34017</td>
      <td>16.697553</td>
      <td>0.761784</td>
      <td>21.919</td>
      <td>ASEMIDEI</td>
    </tr>
    <tr>
      <th>8012</th>
      <td>37197</td>
      <td>4.360079</td>
      <td>0.690432</td>
      <td>6.315</td>
      <td>GLOPEZ</td>
    </tr>
    <tr>
      <th>5726</th>
      <td>34911</td>
      <td>4.093578</td>
      <td>0.026805</td>
      <td>152.716</td>
      <td>JGONZALEZ</td>
    </tr>
    <tr>
      <th>1793</th>
      <td>30978</td>
      <td>3.799778</td>
      <td>0.398008</td>
      <td>9.547</td>
      <td>WCABALLERO</td>
    </tr>
    <tr>
      <th>1824</th>
      <td>31009</td>
      <td>3.705251</td>
      <td>0.666532</td>
      <td>5.559</td>
      <td>WCABALLERO</td>
    </tr>
    <tr>
      <th>3379</th>
      <td>32564</td>
      <td>3.449872</td>
      <td>0.290540</td>
      <td>11.874</td>
      <td>ASEMIDEI</td>
    </tr>
    <tr>
      <th>3378</th>
      <td>32563</td>
      <td>2.891744</td>
      <td>0.199817</td>
      <td>14.472</td>
      <td>ASEMIDEI</td>
    </tr>
    <tr>
      <th>1755</th>
      <td>30940</td>
      <td>2.808007</td>
      <td>0.852461</td>
      <td>3.294</td>
      <td>DINSFRAN</td>
    </tr>
    <tr>
      <th>4031</th>
      <td>33216</td>
      <td>2.415253</td>
      <td>0.239894</td>
      <td>10.068</td>
      <td>DINSFRAN</td>
    </tr>
    <tr>
      <th>143</th>
      <td>29328</td>
      <td>2.285814</td>
      <td>0.049057</td>
      <td>46.595</td>
      <td>GLOPEZ</td>
    </tr>
    <tr>
      <th>112</th>
      <td>29297</td>
      <td>2.285814</td>
      <td>0.049057</td>
      <td>46.595</td>
      <td>GLOPEZ</td>
    </tr>
    <tr>
      <th>4604</th>
      <td>33789</td>
      <td>2.115028</td>
      <td>0.859418</td>
      <td>2.461</td>
      <td>JGONZALEZ</td>
    </tr>
    <tr>
      <th>5703</th>
      <td>34888</td>
      <td>1.964400</td>
      <td>0.019132</td>
      <td>102.674</td>
      <td>ARECALDE</td>
    </tr>
    <tr>
      <th>7178</th>
      <td>36363</td>
      <td>1.876226</td>
      <td>0.043072</td>
      <td>43.560</td>
      <td>CMARTINEZ</td>
    </tr>
  </tbody>
</table>
</div>



Let's focus on polygon 29236 and check what is going on here. First we retrieve it's geometry.


```python
id = 29236
poly = reserves[reserves['id'] == id]
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




![png](output_25_2.png)



```python
r = requests.post(url + 'visual/bounds',
                 json = {"mapId":  mapId, 'timestampMin':t1, 'timestampMax':t2, 'layerName':'rgb', 'xMin': poly.bounds.minx.min() ,'xMax':poly.bounds.maxx.max(), 'yMin':poly.bounds.miny.min(), 'yMax':poly.bounds.maxy.max() })

img = mpimg.imread(BytesIO(r.content))
img = plotPolys(im = img, polys = poly, alpha = 0.2, xmin = poly.bounds.minx.min() ,xmax = poly.bounds.maxx.max(),ymin = poly.bounds.miny.min(),ymax = poly.bounds.maxy.max() )

plt.imshow(img)
```

    Clipping input data to the valid range for imshow with RGB data ([0..1] for floats or [0..255] for integers).





    <matplotlib.image.AxesImage at 0x7f500eb315c0>




![png](output_26_2.png)


Yes there has indeed been some deforestation in the lower right corner there. Let's now have a look when this occured. To this end we request a timeserie of this particular polygon.


```python
r = requests.post(url + 'data/class/polygon/timestamps',
                 data = {"mapId":  mapId, 'polygonId':[polyId] })

r = pd.read_csv(StringIO(r.text))
r = r.loc[ (r['blanc'] + r['mask']) == 0 ]

plt.plot(np.arange(r.shape[0]), (r['forest'].values + r['other'].values ) )
plt.ylabel('forest cover')
plt.xlabel('date')
plt.xticks(np.arange(r.shape[0]), r['date_to'].values, rotation='vertical')
plt.title('forest cover on polygon 29236')
plt.show()
```


![png](output_28_0.png)


It looks like the deforestation took place in august and september of 2016.

## Tracking legal deforestation

Now let's turn ou attention to the areas in which licences to cut down forest have been granted. In this example we will be analysing how much forest there is in these areas and at what rate it is dissapearing.

To this end we compare the landcover of all permit polygons in october 2016 and 2018.


```python
t1= 5
t2 = 20
```

First we request all landcover information and geometries of these polygons from the Ellipsis-API for both timestamps.


```python
r = requests.post(url + 'metadata/polygons',
                 json = {"mapId":  mapId, 'layer': 'permited' })

ids = r.json()['ids']

ids_chunks = chunks(ids, 3000)

Data_t1 = list()
for ids_chunk in ids_chunks:
    r = requests.post(url + 'data/class/polygon/polygonIds',
                 json = {"mapId":  mapId, 'timestamp':t1, 'polygonIds': ids_chunk })
    Data_t1.append(pd.read_csv(StringIO(r.text)))
Data_t1 = pd.concat(Data_t1)
        
Data_t2 = list()
for ids_chunk in ids_chunks:
    r = requests.post(url + 'data/class/polygon/polygonIds',
                 json = {"mapId":  mapId, 'timestamp':t2, 'polygonIds': ids_chunk })
    Data_t2.append(pd.read_csv(StringIO(r.text)))
Data_t2 = pd.concat(Data_t2)

geometries = list()
for ids_chunk in ids_chunks:
    r = requests.post(url + 'geometry/polygons',
                 json = {"mapId":  mapId, 'polygonIds':ids_chunk})

    geometries.append(gpd.GeoDataFrame.from_features(r.json()['features']))
geometries = pd.concat(geometries)

Data = Data_t1.merge(Data_t2, on = 'id')
permits = geometries.merge(Data, on = 'id')

```

Based on this information we make a pi-plot of the total landcover for both of these timestamps.


```python
# Data to plot
labels = ['deforested', 'shrub savana', 'forest']
sizes = [permits['no class_x'].sum(),permits['other_x'].sum(), permits['forest_x'].sum()]
colors = ['red', 'lightgreen', 'green']
explode = (0.05, 0.05, 0.05)
# Plot
plt.pie(sizes, labels=labels, explode = explode, colors=colors,autopct='%1.1f%%')
plt.title('landcover of permit areas august 2016')
plt.axis('equal')
plt.show()


# Data to plot
labels = ['deforested', 'shrub savana', 'forest']
sizes = [permits['no class_y'].sum(),permits['other_y'].sum(), permits['forest_y'].sum()]
colors = ['red', 'lightgreen', 'green']
explode = (0.05, 0.05, 0.05)
# Plot
plt.pie(sizes, labels=labels, explode = explode, colors=colors,autopct='%1.1f%%')
plt.title('landcover of permit areas august 2017')
plt.axis('equal')
plt.show()

```


![png](output_36_0.png)



![png](output_36_1.png)


By the looks of it most forest in these areas is already cut down. Forest over the last year has droped somewhat but not staggering. Interesting is the fact that savana seems to be increasing. Maybe some of the deforested areas are getting overgrown by more natural vegetation.

## Getting a grasp on how much forest is disappearing

In this example we track the total amount of forest cover in the province Filadelfia from 2016 to 2019.


```python
poly_id = 6

r = requests.post(url + 'data/class/polygon/timestamps',
                 json = {"mapId":  mapId, 'polygonId': poly_id})

r = pd.read_csv(StringIO(r.text))
r = r.loc[ (r['blanc'] + r['mask']) == 0 ]

plt.plot(np.arange(r.shape[0]), (r['forest'].values + r['other'].values  ))
plt.ylabel('forest cover')
plt.xlabel('date')
plt.xticks(np.arange(r.shape[0]), r['date_to'].values, rotation='vertical')
plt.title('forest cover in Filadelfia')
plt.show()
```


![png](output_40_0.png)


## Tracking unclear deforestation

One of the big issues with monitoring deforestation in Paraguay is that of most areas there is no known regulation. Much of the natural areas are neither contained in a reserve nor within a permit area. Deforestatioin in these places is hard to interpret.

In this section we have a look how much forest dissapears under unclear circumstances. We will compare the forest cover of the province Filadelfia in august 2016 and 2017.


```python
t1 = 7
t2= 18
polyId = 6
```

First we retrieve all standard tiles covering Filadelfia district for both august 2016 and 2017.


```python
r = requests.post(url + 'data/class/polygon/tiles',
                 data = {"mapId":  mapId, 'polygonId':polyId, 'timestamp': t1 })
filadelfia1 = pd.read_csv(StringIO(r.text))


r = requests.post(url + 'data/class/polygon/tiles',
                 data = {"mapId":  mapId, 'polygonId':polyId, 'timestamp': t2 })
filadelfia2 = pd.read_csv(StringIO(r.text))

filadelfia1 = filadelfia1.rename(columns = {'no class': 'no class 1', 'forest': 'forest 1', 'other': 'other 1'})
filadelfia2 = filadelfia2.rename(columns = {'no class': 'no class 2', 'forest': 'forest 2', 'other': 'other 2'})

filadelfia2 = filadelfia2[['tileX', 'tileY', 'no class 2', 'forest 2', 'other 2']]
filadelfia = filadelfia1.merge(filadelfia2, on = ['tileX', 'tileY'])


filadelfia = filadelfia[['tileX', 'tileY', 'forest 1', 'forest 2', 'other 1', 'other 2', 'no class 1', 'no class 2']]
```

By subtracting the landcover surface areas we get the deforestation. We filter out all tiles in which more than 2 square kilometers of forest has been cut down.


```python
filadelfia['deforested'] = filadelfia['no class 2'] - filadelfia['no class 1']
filadelfia = filadelfia.sort_values('deforested', ascending = False)
filadelfia = filadelfia.loc[filadelfia['deforested']> 2]
```

Let's retrieve the geometry of these tiles from the API and plot them on a background map.


```python
tiles = [dict( [('tileX', list(filadelfia['tileX'])[i]), ('tileY', list(filadelfia['tileY'])[i])] ) for i in np.arange(filadelfia.shape[0]) ]
r = requests.post(url + 'geometry/tiles',
                 json = {"mapId":  mapId, 'tileIds': tiles, 'timestamp':0})

tiles  = gpd.GeoDataFrame.from_features(r.json()['features'])

r = requests.post(url + 'visual/bounds',
                 json = {"mapId":  mapId, 'timestampMin':1, 'timestampMax':5, 'layerName':'rgb', 'xMin': tiles.bounds.minx.min() ,'xMax':tiles.bounds.maxx.max(), 'yMin':tiles.bounds.miny.min(), 'yMax':tiles.bounds.maxy.max() })


img = mpimg.imread(BytesIO(r.content))
img = plotPolys(im = img, polys = tiles, xmin =  tiles.bounds.minx.min() ,xmax =  tiles.bounds.maxx.max(),ymin =  tiles.bounds.miny.min(),ymax =  tiles.bounds.maxy.max(), colors = [(1,0,0)])

plt.figure(figsize=(10,10))
plt.imshow(img)
```




    <matplotlib.image.AxesImage at 0x7f500ebbad30>




![png](output_49_1.png)


Now let's retrieve all areas from the API where deforestation was permited and overlay it with this map.


```python
r = requests.post(url + 'metadata/polygons',
                 json = {"mapId":  mapId, 'layer': 'reserve','xMin': tiles.bounds.minx.min() ,'xMax':tiles.bounds.maxx.max(), 'yMin':tiles.bounds.miny.min(), 'yMax':tiles.bounds.maxy.max() })

ids = r.json()['ids']

r = requests.post(url + 'geometry/polygons',
                 json = {"mapId":  mapId, 'polygonIds': ids})

polys = gpd.GeoDataFrame.from_features(r.json()['features'])

img = plotPolys(im = img, polys = polys, xmin =  tiles.bounds.minx.min() ,xmax =  tiles.bounds.maxx.max(),ymin =  tiles.bounds.miny.min(),ymax =  tiles.bounds.maxy.max(), colors = [(0,0,1)])

plt.figure(figsize=(10,10))
plt.imshow(img)
```




    <matplotlib.image.AxesImage at 0x7f500ebf6908>




![png](output_51_1.png)


As we can see most deforestation takes place under unclear circumstances.
