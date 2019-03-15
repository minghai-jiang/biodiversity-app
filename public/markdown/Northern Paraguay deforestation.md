
# Deforestation in northern Paraguay

The Chaco in Paraguay is a large area of about 150.000 square kilometers where heavy deforestation takes place. Monitoring complience in this area is an enormous challange. This notebook demonstrates the power of the Ellipsis-API to cope with this challange.

Deforestation falls into three classes. Deforesation for which a permit has been granted, illegal deforestation in reserves of various types, and deforestation outside reserves for which no permit is administered. We will have a look at all of these.

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

Furthermore we are going to use the utility function poly_on_image that is defined in the appendix. This function will allow us to draw polygons on images.

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

## Deforestation in areas that have been marked as reserves

Reserves are designated areas in which no deforestation may take place. To check if indeed no deforestation has taken place here we compare suface areas of the land cover clases of these polygons at two different tiemstamps. Say 7 and 26.


```python
t1 = 7
t2 = 26
```


```python
r = requests.post(url + 'data/class/polygon/polygons',
                 data = {"mapId":  mapId, 'timestamp':t1, 'layer': 'reserve' })
landcover_first_timestamp = pd.read_csv(StringIO(r.text))
```


```python
r = requests.post(url + 'data/class/polygon/polygons',
                 data = {"mapId":  mapId, 'timestamp':t2, 'layer': 'reserve' })
landcover_second_timestamp = pd.read_csv(StringIO(r.text))
```

We now subtract the amount of forestcover from the first and last timestamp to get the amount of deforestation. We create a table with a row for each reserve and as its columns the polygon id and, the total and relative deforested area, toghether with some metadata.


```python
landcover_first_timestamp = landcover_first_timestamp[['polygon', 'no class', 'area', 'name', 'owner']]
landcover_first_timestamp = landcover_first_timestamp.rename(columns = {'no class': 'no class 1'})

landcover_second_timestamp = landcover_second_timestamp[['polygon', 'no class']]
landcover_second_timestamp = landcover_second_timestamp.rename(columns = {'no class': 'no class 2'})

landcover = landcover_first_timestamp.merge( landcover_second_timestamp, on = 'polygon')

landcover['deforested'] = landcover['no class 2'].values - landcover['no class 1'].values 
landcover['relative_deforestation'] = np.divide(landcover['deforested'].values, landcover['area'].values)

landcover = landcover[['polygon', 'name', 'owner', 'deforested','relative_deforestation', 'area']]

landcover.head(n = 20)
```

    /home/daniel/.local/lib/python3.6/site-packages/ipykernel_launcher.py:10: RuntimeWarning: invalid value encountered in true_divide
      # Remove the CWD from sys.path while we load stuff.





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
      <th>name</th>
      <th>owner</th>
      <th>deforested</th>
      <th>relative_deforestation</th>
      <th>area</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>29185</td>
      <td>Reserva Forestal Legal</td>
      <td>DIEGO INSFRAN</td>
      <td>-0.196825</td>
      <td>-0.003042</td>
      <td>64.699</td>
    </tr>
    <tr>
      <th>1</th>
      <td>29186</td>
      <td>Reserva</td>
      <td>DIEGO INSFRAN</td>
      <td>-0.002734</td>
      <td>-0.001989</td>
      <td>1.375</td>
    </tr>
    <tr>
      <th>2</th>
      <td>29187</td>
      <td>Bosque de reserva</td>
      <td>DIEGO INSFRAN</td>
      <td>-0.006773</td>
      <td>-0.002820</td>
      <td>2.402</td>
    </tr>
    <tr>
      <th>3</th>
      <td>29188</td>
      <td>Bosque de protecciÃ³n</td>
      <td>DIEGO INSFRAN</td>
      <td>-0.112802</td>
      <td>-0.228344</td>
      <td>0.494</td>
    </tr>
    <tr>
      <th>4</th>
      <td>29189</td>
      <td>Bosque de protecciÃ³n</td>
      <td>DIEGO INSFRAN</td>
      <td>-0.069857</td>
      <td>-0.147690</td>
      <td>0.473</td>
    </tr>
    <tr>
      <th>5</th>
      <td>29190</td>
      <td>Bosque de reserva</td>
      <td>DIEGO INSFRAN</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.011</td>
    </tr>
    <tr>
      <th>6</th>
      <td>29191</td>
      <td>Bosque de reserva</td>
      <td>DIEGO INSFRAN</td>
      <td>-0.034722</td>
      <td>-0.229944</td>
      <td>0.151</td>
    </tr>
    <tr>
      <th>7</th>
      <td>29192</td>
      <td>Bosque de reserva</td>
      <td>DIEGO INSFRAN</td>
      <td>-0.008701</td>
      <td>-0.038332</td>
      <td>0.227</td>
    </tr>
    <tr>
      <th>8</th>
      <td>29193</td>
      <td>Bosque de reserva</td>
      <td>DIEGO INSFRAN</td>
      <td>-0.000164</td>
      <td>-0.032787</td>
      <td>0.005</td>
    </tr>
    <tr>
      <th>9</th>
      <td>29194</td>
      <td>Bosque de reserva</td>
      <td>DIEGO INSFRAN</td>
      <td>-0.003951</td>
      <td>-0.096377</td>
      <td>0.041</td>
    </tr>
    <tr>
      <th>10</th>
      <td>29195</td>
      <td>Bosque de reserva</td>
      <td>DIEGO INSFRAN</td>
      <td>-0.002830</td>
      <td>-0.029788</td>
      <td>0.095</td>
    </tr>
    <tr>
      <th>11</th>
      <td>29196</td>
      <td>Bosque de reserva</td>
      <td>DIEGO INSFRAN</td>
      <td>-0.002000</td>
      <td>-0.010000</td>
      <td>0.200</td>
    </tr>
    <tr>
      <th>12</th>
      <td>29197</td>
      <td>RESERVA</td>
      <td>DIEGO INSFRAN</td>
      <td>0.094268</td>
      <td>0.072291</td>
      <td>1.304</td>
    </tr>
    <tr>
      <th>13</th>
      <td>29198</td>
      <td>RESERVA</td>
      <td>DIEGO INSFRAN</td>
      <td>0.054980</td>
      <td>0.018032</td>
      <td>3.049</td>
    </tr>
    <tr>
      <th>14</th>
      <td>29199</td>
      <td>Reserva Forestal</td>
      <td>ARECALDE</td>
      <td>0.026543</td>
      <td>0.002776</td>
      <td>9.563</td>
    </tr>
    <tr>
      <th>15</th>
      <td>29200</td>
      <td>Bosque de reserva</td>
      <td>CMARTINEZ</td>
      <td>-0.019706</td>
      <td>-0.002104</td>
      <td>9.365</td>
    </tr>
    <tr>
      <th>16</th>
      <td>29201</td>
      <td>Bosque de reserva</td>
      <td>CMARTINEZ</td>
      <td>-0.002247</td>
      <td>-0.004632</td>
      <td>0.485</td>
    </tr>
    <tr>
      <th>17</th>
      <td>29202</td>
      <td>Bosque de reserva</td>
      <td>CMARTINEZ</td>
      <td>-0.037656</td>
      <td>-0.316439</td>
      <td>0.119</td>
    </tr>
    <tr>
      <th>18</th>
      <td>29203</td>
      <td>Bosque de reserva</td>
      <td>CMARTINEZ</td>
      <td>-0.009308</td>
      <td>-0.007922</td>
      <td>1.175</td>
    </tr>
    <tr>
      <th>19</th>
      <td>29204</td>
      <td>Bosque de reserva</td>
      <td>CMARTINEZ</td>
      <td>-0.007819</td>
      <td>-0.080607</td>
      <td>0.097</td>
    </tr>
  </tbody>
</table>
</div>



Now let's have a look at the top five reserves in which forest has dissapeard.


```python
landcover=landcover.sort_values(by = ['deforested'], ascending  = False)
landcover.head(n = 15)
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
      <th>name</th>
      <th>owner</th>
      <th>deforested</th>
      <th>relative_deforestation</th>
      <th>area</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>5558</th>
      <td>34743</td>
      <td>Bosque de Reserva</td>
      <td>ARECALDE</td>
      <td>12.323656</td>
      <td>0.140333</td>
      <td>87.817</td>
    </tr>
    <tr>
      <th>8034</th>
      <td>37219</td>
      <td>Bosque nativo de reserva</td>
      <td>SEAM_GIS</td>
      <td>6.325491</td>
      <td>0.061917</td>
      <td>102.160</td>
    </tr>
    <tr>
      <th>4112</th>
      <td>33297</td>
      <td>Bosque bajo</td>
      <td>SEAM</td>
      <td>3.852084</td>
      <td>0.789523</td>
      <td>4.879</td>
    </tr>
    <tr>
      <th>1833</th>
      <td>31018</td>
      <td>Bosque de Reserva</td>
      <td>GLOPEZ</td>
      <td>3.756133</td>
      <td>0.399929</td>
      <td>9.392</td>
    </tr>
    <tr>
      <th>297</th>
      <td>29482</td>
      <td>Bosque de Reserva</td>
      <td>CMARTINEZ</td>
      <td>2.262520</td>
      <td>0.756949</td>
      <td>2.989</td>
    </tr>
    <tr>
      <th>921</th>
      <td>30106</td>
      <td>Bosque de reserva</td>
      <td>DINSFRAN</td>
      <td>2.124724</td>
      <td>0.176516</td>
      <td>12.037</td>
    </tr>
    <tr>
      <th>5397</th>
      <td>34582</td>
      <td>RESERVA</td>
      <td>ARECALDE</td>
      <td>2.026542</td>
      <td>0.440074</td>
      <td>4.605</td>
    </tr>
    <tr>
      <th>934</th>
      <td>30119</td>
      <td>Bosque Reserva</td>
      <td>WCABALLERO</td>
      <td>1.838599</td>
      <td>0.162134</td>
      <td>11.340</td>
    </tr>
    <tr>
      <th>194</th>
      <td>29379</td>
      <td>Bosque de Reserva</td>
      <td>DINSFRAN</td>
      <td>1.808454</td>
      <td>0.537271</td>
      <td>3.366</td>
    </tr>
    <tr>
      <th>298</th>
      <td>29483</td>
      <td>Bosque de Reserva</td>
      <td>CMARTINEZ</td>
      <td>1.789840</td>
      <td>0.160986</td>
      <td>11.118</td>
    </tr>
    <tr>
      <th>51</th>
      <td>29236</td>
      <td>Bosque de reserva</td>
      <td>NaN</td>
      <td>1.788859</td>
      <td>0.083517</td>
      <td>21.419</td>
    </tr>
    <tr>
      <th>6297</th>
      <td>35482</td>
      <td>Bosque de Reserva</td>
      <td>SEAM</td>
      <td>1.688984</td>
      <td>0.161455</td>
      <td>10.461</td>
    </tr>
    <tr>
      <th>5132</th>
      <td>34317</td>
      <td>Bosque</td>
      <td>MROBLES</td>
      <td>1.688680</td>
      <td>0.086087</td>
      <td>19.616</td>
    </tr>
    <tr>
      <th>7168</th>
      <td>36353</td>
      <td>Reserva forestal</td>
      <td>ABM</td>
      <td>1.441901</td>
      <td>0.752558</td>
      <td>1.916</td>
    </tr>
    <tr>
      <th>922</th>
      <td>30107</td>
      <td>Bosque de reserva</td>
      <td>DINSFRAN</td>
      <td>1.385724</td>
      <td>0.106471</td>
      <td>13.015</td>
    </tr>
  </tbody>
</table>
</div>



This gives us 20 cases in which our registration does not seem to match reality.

Let's focus on polygon 29236 and check what is going on here. First we retrieve it's geometry.


```python
polyId = 29236
```


```python
r = requests.post(url + 'geometry/polygon/ids',
                 json = {"mapId":  mapId, "timestamp":0, "polygonIds":[polyId] })

poly  = gpd.GeoDataFrame.from_features(r.json()['features'])
poly.plot()
```




    <matplotlib.axes._subplots.AxesSubplot at 0x7f0e34cd6e10>




![png](output_21_1.png)


We can retrieve a visualisation of both timestamps from the API to see the situatioin before and after. We use the polys_on_image function from the Appendix to include the polygon on the image.


```python
r = requests.post(url + 'visual/bounds',
                 json = {"mapId":  mapId, 'timestampMin':1, 'timestampMax':t1, 'layerName':'rgb', 'xMin': poly.bounds.minx[0] ,'xMax':poly.bounds.maxx[0], 'yMin':poly.bounds.miny[0], 'yMax':poly.bounds.maxy[0] })


img = mpimg.imread(BytesIO(r.content))
img = polys_on_image(im = img, polys = poly, alpha = 0.2, xmin = poly.bounds.minx[0] ,xmax = poly.bounds.maxx[0],ymin = poly.bounds.miny[0],ymax = poly.bounds.maxy[0])

plt.imshow(img)
```

    Clipping input data to the valid range for imshow with RGB data ([0..1] for floats or [0..255] for integers).





    <matplotlib.image.AxesImage at 0x7f0e352edf60>




![png](output_23_2.png)



```python
r = requests.post(url + 'visual/bounds',
                 json = {"mapId":  mapId, 'timestampMin':t1, 'timestampMax':t2, 'layerName':'rgb', 'xMin': poly.bounds.minx[0] ,'xMax':poly.bounds.maxx[0], 'yMin':poly.bounds.miny[0], 'yMax':poly.bounds.maxy[0] })


img = mpimg.imread(BytesIO(r.content))
img = polys_on_image(im = img, polys = poly, alpha = 0.2, xmin = poly.bounds.minx[0] ,xmax = poly.bounds.maxx[0],ymin = poly.bounds.miny[0],ymax = poly.bounds.maxy[0])

plt.imshow(img)
```

    Clipping input data to the valid range for imshow with RGB data ([0..1] for floats or [0..255] for integers).





    <matplotlib.image.AxesImage at 0x7f0e35254f60>




![png](output_24_2.png)


Yes there has indeed been some deforestation in the lower right corner there. Let's now have a look when this occured. To this end we request a timeserie of this particular polygon.


```python
r = requests.post(url + 'data/class/polygon/timestamps',
                 data = {"mapId":  mapId, 'polygonId':[polyId] })

r = pd.read_csv(StringIO(r.text))
r = r.loc[ (r['blanc'] + r['mask']) == 0 ]
```


```python
plt.plot(np.arange(r.shape[0]), (r['forest'].values + r['other'].values ) )
plt.ylabel('forest cover')
plt.xlabel('date')
plt.xticks(np.arange(r.shape[0]), r['date_to'].values, rotation='vertical')
plt.title('forest cover on polygon 29236')
plt.show()
```


![png](output_27_0.png)


It looks like the deforestation took place in august and september of 2016.

## Tracking legal deforestation

In the predefined polygonslayers we saw the layer permitted. In polygons of this layer deforestation is allowed. In this example we are going to analyse how much forest is still in these areas and at what rate it is dissapearing.

To this end we compare the landcover of all permit polygons in october 2016 and 2018.


```python
t1= 10
t2 = 20
```

First we request all landcover information of these polygons from the Ellipsis-API for the two timestamps.


```python
r = requests.post(url + 'data/class/polygon/polygons',
                 data = {"mapId":  mapId, 'timestamp': t1, 'layer':'permited' })

permit1 = pd.read_csv(StringIO(r.text))[['polygon', 'no class', 'forest', 'other']]
permit1 = permit1.rename(columns = {'no class': 'no class 1','forest':'forest 1', 'other':'other 1'})

r = requests.post(url + 'data/class/polygon/polygons',
                 data = {"mapId":  mapId, 'timestamp': t2, 'layer':'permited' })
permit2 = pd.read_csv(StringIO(r.text))[['polygon', 'no class', 'forest', 'area','other']]
permit2 = permit2.rename(columns = {'no class': 'no class 2','forest':'forest 2','other':'other 2'})

permit = permit1.merge(permit2, on = 'polygon')
```

Based on this information we make a pi-plot of the total landcover for both of these timestamps.


```python
# Data to plot
labels = ['deforested', 'shrub savana', 'forest']
sizes = [permit['no class 1'].sum(),permit['other 1'].sum(), permit['forest 1'].sum()]
colors = ['red', 'lightgreen', 'green']
explode = (0.05, 0.05, 0.05)
# Plot
plt.pie(sizes, labels=labels, explode = explode, colors=colors,autopct='%1.1f%%')
plt.title('landcover of permit areas august 2016')
plt.axis('equal')
plt.show()


# Data to plot
labels = ['deforested', 'shrub savana', 'forest']
sizes = [permit['no class 2'].sum(),permit['other 2'].sum(), permit['forest 2'].sum()]
colors = ['red', 'lightgreen', 'green']
explode = (0.05, 0.05, 0.05)
# Plot
plt.pie(sizes, labels=labels, explode = explode, colors=colors,autopct='%1.1f%%')
plt.title('landcover of permit areas august 2017')
plt.axis('equal')
plt.show()

```


![png](output_35_0.png)



![png](output_35_1.png)


By the looks of it about 70 percent of the forest in these areas is already cut down. Forest over the last year has droped somewhat but not staggering. Interesting is the fact that savana seems to be increasing. Maybe some of the deforested areas are getting overgrown by more natural vegetation.

## Getting a grasp on how much forest is disappearing

In this example we track the total amount of forest cover in the province Filadelfia from 2016 to 2019.


```python
poly_id = 6
```


```python
r = requests.post(url + 'data/class/polygon/timestamps',
                 json = {"mapId":  mapId, 'polygonId': poly_id})

r = pd.read_csv(StringIO(r.text))
r = r.loc[ (r['blanc'] + r['mask']) == 0 ]
```


```python
plt.plot(np.arange(r.shape[0]), (r['forest'].values + r['other'].values  ))
plt.ylabel('forest cover')
plt.xlabel('date')
plt.title('forest cover in Filadelfia')
plt.show()
```


![png](output_41_0.png)


## Tracking unclear deforestation

Let's now have a look at all spots where forest dissapeared but no agreement is known. We will compare august 2016 and 2017.


```python
t1 = 7
t2= 18
polyId = 6
```

First we retrieve all tiles falling outside of any permit area or reserve in the Filadelfia district for both august 2016 and 2017.


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

By subtracting the landcover surface areas we get the deforestation. Let's have a look at all tiles in which more than 2 square kilometers of forest has been cut down.


```python
filadelfia['deforested'] = filadelfia['no class 2'] - filadelfia['no class 1']
filadelfia = filadelfia.sort_values('deforested', ascending = False)
filadelfia = filadelfia.loc[filadelfia['deforested']> 2]
filadelfia.shape
```




    (25, 9)



Let's retrieve the geometry of these tiles from the API and plot them on a background map that we also retrieve from the API.


```python
tiles = [dict( [('tileX', list(filadelfia['tileX'])[i]), ('tileY', list(filadelfia['tileY'])[i])] ) for i in np.arange(filadelfia.shape[0]) ]
r = requests.post(url + 'geometry/tile/ids',
                 json = {"mapId":  mapId, 'tileIds': tiles, 'timestamp':0})

tiles  = gpd.GeoDataFrame.from_features(r.json()['features'])
tiles.plot()
```




    <matplotlib.axes._subplots.AxesSubplot at 0x7f0e34f73400>




![png](output_50_1.png)



```python
tiles.bounds.maxx.max()
```




    -59.8974609375




```python
r = requests.post(url + 'visual/bounds',
                 json = {"mapId":  mapId, 'timestampMin':1, 'timestampMax':t2, 'layerName':'rgb', 'xMin': tiles.bounds.minx.min() ,'xMax':tiles.bounds.maxx.max(), 'yMin':tiles.bounds.miny.min(), 'yMax':tiles.bounds.maxy.max() })


img = mpimg.imread(BytesIO(r.content))
img = polys_on_image(im = img, polys = tiles, alpha = 0.2, xmin =  tiles.bounds.minx.min() ,xmax =  tiles.bounds.maxx.max(),ymin =  tiles.bounds.miny.min(),ymax =  tiles.bounds.maxy.max(), colors = [(1,0,0)])

plt.imshow(img)
```

    Clipping input data to the valid range for imshow with RGB data ([0..1] for floats or [0..255] for integers).





    <matplotlib.image.AxesImage at 0x7f0e32778400>




![png](output_52_2.png)


Now let's retrieve all areas from the API where deforestation was permited and overlay it with this map.


```python
r = requests.post(url + 'geometry/polygon/bounds',
                 json = {"mapId":  mapId, 'timestamp': 0, 'layer': 'reserve' , 'xMin': tiles.bounds.minx.min() ,'xMax':tiles.bounds.maxx.max(), 'yMin':tiles.bounds.miny.min(), 'yMax':tiles.bounds.maxy.max() })


img = polys_on_image(im = img, polys = polys, alpha = 0.1, xmin =  tiles.bounds.minx.min() ,xmax =  tiles.bounds.maxx.max(),ymin =  tiles.bounds.miny.min(),ymax =  tiles.bounds.maxy.max(), colors = [(0,0,1)])

plt.imshow(img)
```

    Clipping input data to the valid range for imshow with RGB data ([0..1] for floats or [0..255] for integers).





    <matplotlib.image.AxesImage at 0x7f0e302b6a58>




![png](output_54_2.png)


As we can see a lot of the deforestation took place outside any areas for which a permit is known.

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
