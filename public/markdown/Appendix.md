
In the gallery notbooks we are using a few utility functions that are defined and explained in this appendix. The functions are not defined in the notebooks themselves as they would distract from the core message.

## Drawing polygons
In order to draw polygons in the webmercator projection on an image we use the polys_on_image function. The function takes as it's arguments a geopandas dataframe with polygons that need to be plotted and boundingbox coordinates in wgs84 to define the bounds in which to plot. Optionally you can pass an image as a numpy array with shape (w,h,4) to use as canvas and an alpha to define how the polygons should be blended with the background canvas. The argument column and colors allow you te define different colors for polygons depending on a column name in the geopandas dataframe.


```python
from shapely.geometry import Polygon
from rasterio.features import rasterize

def plotPolys(polys, xmin,xmax,ymin,ymax, alpha = None, im = None, colors = [(0,0,1)] , column= None):
    polys.crs = {'init': 'epsg:4326'}
    polys = polys.to_crs({'init': 'epsg:3395'})
    
    bbox = gpd.GeoDataFrame( {'geometry': [Polygon([(xmin,ymin), (xmax, ymin), (xmax, ymax), (xmin, ymax)])]} )
    bbox.crs = {'init': 'epsg:4326'}
    bbox = bbox.to_crs({'init': 'epsg:3395'})

    if str(type(im)) == "<class 'NoneType'>":
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
    if alpha == None:
        image = rasters
        image[image[:,:,3] == 0, :] = im [image[:,:,3] == 0, :]
    else:
        image = im * (1 - alpha) + rasters*alpha 
    return(image)
 
```

## Splitting up a list
In order to request data or geometries in batches we need to spilt up a list of id's in chunks of a certain size. For this we use the following function. The function takes a list l that needs splitting and an integer n to define the maximal size of each chunk.


```python
import math
def chunks(l, n = 3000):
    result = list()
    for i in range(0, len(l), n):
        result.append(l[i:i+n])
    return(result)
```

## Covering a polygon with bounding boxes
In case we would like to find a way to cover a polygon defined by a geopandas 'area' with bounding boxes of 'w' by 'w' kilometers, we can use the following function.


```python
def cover(area,  w):
    
    if len(area) == 0:
        return(gpd.GeoDataFrame())
    
    x1, y1, x2, y2  = area.bounds
         
    #calculate the y1 and y2 of all squares
    step_y =  w/geodesic((y1,x1), (y1 + 1,x1)).meters
    
    parts_y = math.floor((y2 - y1)/ step_y + 1)
    
    y1_vec = y1 + np.arange(0, parts_y )*step_y
    y2_vec = y1 + np.arange(1, parts_y +1 )*step_y
    
    #make a dataframe of these bounding boxes
    steps_x = [    w/geodesic((y,x1), (y,x1+1)).meters  for y in y1_vec  ]
    parts_x = [math.floor( (x2-x1) /step +1 ) for step in steps_x ]      
    coords = pd.DataFrame()
    for n in np.arange(len(parts_x)):
        x1_sq = [ x1 + j*steps_x[n] for j in np.arange(0,parts_x[n]) ]
        x2_sq = [ x1 + j*steps_x[n] for j in np.arange(1, parts_x[n]+1) ]
        coords_temp = {'x1': x1_sq, 'x2': x2_sq, 'y1': y1_vec[n], 'y2':y2_vec[n]}
        coords = coords.append(pd.DataFrame(coords_temp))
    
    #make a geopandas of this covering dataframe
    cover = [geometry.Polygon([ (coords['x1'].iloc[j] , coords['y1'].iloc[j]) , (coords['x2'].iloc[j] , coords['y1'].iloc[j]), (coords['x2'].iloc[j] , coords['y2'].iloc[j]), (coords['x1'].iloc[j] , coords['y2'].iloc[j]) ]) for j in np.arange(coords.shape[0])]
    
    coords = gpd.GeoDataFrame({'geometry': cover, 'x1':coords['x1'], 'x2':coords['x2'], 'y1':coords['y1'], 'y2':coords['y2'] })

    #remove all tiles that do not intersect the area that needed covering    
    keep = [area.intersects(coords['geometry'].values[j]) for j in np.arange(coords.shape[0])]
    coords = coords[pd.Series(keep, name = 'bools').values]
    coords['id'] = np.arange(coords.shape[0])
        
    return(coords)

```

## Parallel requests
If we need to make a lot of requests it might be worth our while to do it in parallel. the requestParallel function below helps us to split up our requests over 'threads' different threads. To use the request Parallel function we need to define a request function and an argsDict. The first argument of the request object should be a request session. The other arguments should be placed as a tuple in the argsDict ditionary. The key of each tuple corresponds with the key of the output dictionary. Note that the session object does not need to be specified in the argsDict, this session is created within requestParallel


```python
import threading
import numpy as np
import math
import requests
import multiprocessing

q_result = multiprocessing.Queue()
q_todo = multiprocessing.Queue()

def thread():
    s = requests.Session()
    while(q_todo.qsize()>0):
        args = q_todo.get()
        print(q_todo.qsize())
        key = list(args.keys())[0]
        args = args[key]
        args = (s,) + args
        r = request(*args)
        q_result.put({key:r})


def requestParallel(request, threads, argsDict):
    
    for key in argsDict.keys():
        q_todo.put({key:argsDict[key]})
    
    
    trs = list()
    for i in np.arange(threads):
        tr = threading.Thread(target = thread, args = () )
        tr.start()
        trs.append(tr)
    
    for tr in trs:
        tr.join()
    
    result = dict()
    for j in np.arange(q_result.qsize()):
        new = q_result.get()
        key = list(new.keys())[0]
        value = new[key]
        result.update({key:value})
        
    return(result)
```
