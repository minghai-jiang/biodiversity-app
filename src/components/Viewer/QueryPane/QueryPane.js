import React, { PureComponent} from 'react';
import SlidingPane from 'react-sliding-pane';
import Papa from 'papaparse';
import FileDownload from 'js-file-download';
import Moment from 'moment';

import 'react-sliding-pane/dist/react-sliding-pane.css';
import "./QueryPane.css";

let timestampParamName = 'timestamp';
let shapeParamName = 'shape';
let polygonIdParamName = 'polygon';
let classNameParamName = 'class';
let polygonLayerNameParamName = 'layer';

const availableQueries = [
  {
    name: 'Map metadata',
    queries: [
      { id: 1, text: 'Classes map', name: 'classes_map', params: []},
      { id: 2, text: 'Indices map', name: 'indices_map', params: []},
    ]
  },
  {
    name: 'Surface area of all classes',
    queries: [
      { id: 10, text: 'For all polygons for a timestamp', name: 'classes_polygons_timestamp', params: [timestampParamName, polygonLayerNameParamName] },
      { id: 11, text: 'For all timestamps for a polygon', name: 'classes_timestamps_polygon', params: [polygonIdParamName] },
      { id: 12, text: 'For all tiles within a polygon on a timestamp ', name: 'classes_tiles_timestamp_polygon', params: [polygonIdParamName, timestampParamName]  },
      { id: 13, text: 'For all timestamps for a drawn polygon', name: 'classes_timestamps_customPolygon', params: [shapeParamName]},
      { id: 14, text: 'For all tiles intersecting a drawn polygon ', name: 'classes_tiles_timestamp_customPolygon', params: [timestampParamName, shapeParamName]}
    ]
  }, 
  // {
  //   name: 'Mean spectral indices',
  //   queries: [
  //     { id: 55, text: 'For all polygons for a timestamp', name: 'indices_polygons_timestamp', params: [timestampParamName, polygonLayerNameParamName] },
  //     { id: 56, text: 'For all timestamps for a polygon', name: 'indices_timestamps_polygon', params: [polygonIdParamName] },
  //     { id: 57, text: 'For all tiles for a polygon for a timestamp.', name: 'indices_tiles_polygon_timestamp', params: [polygonIdParamName, timestampParamName] },
  //     { id: 58, text: 'For all timestamps for a drawn polygon 	', name: 'indices_timestamps_customPolygon', params: [shapeParamName] },
  //     { id: 59, text: 'For all tiles for a drawn polygon for a timestamp', name: 'indices_tiles_customPolygon_timestamp', params: [timestampParamName, shapeParamName] }
  //   ]
  // }, 
  {
    name: 'Mean spectral indices of a certain class',
    queries: [        
      { id: 50, text: 'For all polygons for a timestamp', name: 'indices_polygons_timestamp_class', params: [timestampParamName, classNameParamName, polygonLayerNameParamName, ] },
      { id: 51, text: 'For all timestamps for a polygon', name: 'indices_timestamps_polygon_class', params: [polygonIdParamName, classNameParamName] },
      { id: 52, text: 'For all tiles for a polygon for a timestamp', name: 'indices_tiles_polygon_timestamp_class', params: [polygonIdParamName, timestampParamName, classNameParamName] },
      { id: 53, text: 'For all timestamps for a drawn polygon ', name: 'indices_timestamps_customPolygon_class', params: [classNameParamName, shapeParamName] },
      { id: 54, text: 'For all tiles for a drawn polygon for a timestamp', name: 'indices_tiles_customPolygon_timestamp_class', params: [timestampParamName, classNameParamName, shapeParamName] }
    ]
  }, 
];

const noDataHeaderText = 'no data';
const maxDataRows = 100;

export class QueryPane extends PureComponent {
  constructor(props, context) {
    super(props, context)
    this.state = {
      openQueryPane: false,
      query: null,
      polygonId: null,
      className: null,
      polygonLayerName: null,

      dataCsvText: '',
      dataTable: null,
      noData: false,
      dataRowsNumber: 0,

      executingQuery: false,
    };
  }

  executeQuery = async () => {
    let query = this.state.query;

    if (query) {
      let args = [];

      for (let i = 0; i < query.params.length; i++) {
        let paramName = query.params[i];
        if (paramName === timestampParamName) {
          args.push(this.props.timestampRange.end);
        }
        else if (paramName === polygonIdParamName)  {
          args.push(this.state.polygonId);
        }
        else if (paramName === classNameParamName) {
          args.push(this.state.className)
        }
        else if (paramName === shapeParamName) {
          let shape = this.props.shape;
          let shapeCoords = [];
          for (let i = 0; i < shape.length; i++) {
            shapeCoords.push(
                `(${shape[i].x}, ${shape[i].y})`  
            );
          } 
  
          args = args.concat(shapeCoords);
        }
        else if (paramName === polygonLayerNameParamName) {
          args.push(this.state.polygonLayerName);
        }
      }

      let bodyJson = JSON.stringify({
        mapId: this.props.map.id,
        args: args
      });

      let headers = {
        "Content-Type": "application/json"
      };

      if (this.props.user) {
        headers["Authorization"] = "Bearer " + this.props.user.token
      }

      this.setState({ executingQuery: true });

      let response = await fetch(
        `${this.props.apiUrl}queries/${query.name}`,
        {
          method: 'POST',
          headers: headers,
          body: bodyJson,
        }
      );

      if (response.ok) {
        let text = await response.text();

        let csvData = Papa.parse(text, { skipEmptyLines: true }).data;

        let rows = [];
        let noData = false;

        for (let x = 0; x < csvData.length && x < maxDataRows; x++) {
          let cells = [];
          let rowData = csvData[x];

          for (let i = 0; i < rowData.length; i++) {
            let cell = null;
            let data = rowData[i]
            
            if (x === 0) {
              if (i === 0 && data === noDataHeaderText) {
                noData = true;
              }

              cell = (
                <th className='query-data-table-cell query-data-table-header' key={(x + 1) * (i + 1)}>
                  {data}
                </th>
              );
            }
            else {
              if (!isNaN(data)) {
                data = parseFloat(data);
                data = +data.toFixed(4);
              }

              cell = (
                <td className='query-data-table-cell' key={(x + csvData.length + 1) * (i + 1)}>
                  {data}
                </td>
              )
            }

            cells.push(cell);
          }

          rows.push(
            <tr key={x}>
              {cells}
            </tr>
          )
        }

        let table = (
          <table className='query-data-table'>
            <tbody>
              {rows}
            </tbody>
          </table>
        );

        this.setState({
          dataCsvText: text,
          dataTable: table,
          noData: noData,
          dataRowsNumber: csvData.length,
          executingQuery: false
        });
      }
      else {
        let error = await response.json();
        alert(error.status + ': ' + error.message);
        this.setState({ executingQuery: false });
      }
    }
    else {
      alert('Please select a query.');
    }    
  }

  downloadData = () => {
    FileDownload(this.state.dataCsvText, 'data.csv');
  }

  toggleQueryPane = (open) => {
    this.setState({ openQueryPane: open });
  }

  renderQueryOptions = () => {
    let options = [];

    options.push(
      <option value="">Select a query</option>
    );

    for (let i = 0; i < availableQueries.length; i++) {
      let queryGroup = availableQueries[i];
      let queryGroupElements = [];

      for (let x = 0; x < queryGroup.queries.length; x++) {
        let query = queryGroup.queries[x];
        // let selected = this.state.query && query.id === this.state.query.id;

        queryGroupElements.push(
          <option value={query.id}>{query.text}</option>
        );
      }

      options.push(
        <optgroup label={queryGroup.name}>
          {queryGroupElements}
        </optgroup>
      )

    }

    return options;
  }

  renderTimestampInfo = () => {
    if (this.state.query)
    {
      if (this.state.query.params.includes(timestampParamName)) {
        let timestamp = this.props.map.timestamps[this.props.timestampRange.end];
        let dateFormat = 'MMM Do YYYY';
        let dateString = Moment(timestamp.dateFrom).format(dateFormat);
        return (
          <div>
            Selected timestamp date: {dateString}
          </div>
        )
      }
      else {
        return null;
      }
    }
  }

  renderShapeCoords = () => {
    let shape = this.props.shape;
    if (this.state.query)
    {
      let needShape = this.state.query.params.includes(shapeParamName);

      if (needShape && shape && shape.length > 0) {

        let shapesCoords = ['Shape coordinates: ', (<br/>)];
  
        for (let i = 0; i < shape.length; i++) {
          let x = shape[i].x;
          let y = shape[i].y;
  
          shapesCoords.push(
              `(${x}, ${y})`  
          );
          shapesCoords.push(<br/>);
        }
        return shapesCoords;
      }
      else if (needShape) {
        return 'No area selected. Close this pane and select an area of interest on the map using the tools on the left.';
      }
      else if (!needShape) {
        return null;
      }
    }
  }

  renderPolygonIdInput = () => {
    if (this.state.query) {
      if (this.state.query.params.includes(polygonIdParamName)) {
        return (
          <div>
            <div>Polygon ID:</div>
            <input type="text" onChange={this.onPolygonIdChange.bind(this)} value={this.state.polygonId ? this.state.polygonId : ''}/>
          </div>
        );
      }
      else {
        return null;
      }
    }
  }

  renderClassNameInput = () => {
    if (this.state.query) {
      if (this.state.query.params.includes(classNameParamName)) {
        return (
          <div>
            <div>Class name:</div>
            <input type="text" onChange={this.onClassNameChange.bind(this)} value={this.state.className ? this.state.className : ''}/>
          </div>
        );
      }
      else {
        return null;
      }
    }
  }

  renderPolygonLayerNameOptions = () => {
    let polygonLayers = this.props.map.polygonLayers;
    let polygonLayerNameOptions = []

    for (let i = 0; i < polygonLayers.length; i++) {
      let polygonLayerName = polygonLayers[i].name
      polygonLayerNameOptions.push(
        <option value={polygonLayerName}>{polygonLayerName}</option>
      )
    }
    
    return polygonLayerNameOptions;    
  }

  renderExecuteButton = () => {
    if (this.state.query) {
      let shapeFulfilled = this.props.shape || !this.state.query.params.includes(shapeParamName);
      let polygonIdFulfilled = this.state.polygonId || !this.state.query.params.includes(polygonIdParamName);
      let classNameFulfilled = this.state.className || !this.state.query.params.includes(classNameParamName);
      let polygonLayerNameFulfilled = this.state.polygonLayerName || !this.state.query.params.includes(polygonLayerNameParamName);

      if (shapeFulfilled && polygonIdFulfilled && classNameFulfilled && polygonLayerNameFulfilled) {        
        return ( <button onClick={this.executeQuery}>Execute query</button> )
      }
      else {
        return null;
      }
    }

  }

  onQuerySelect = (event) => {
    let selectedQueryId = event.target.value;
    let query = null;
    for (let i = 0; i < availableQueries.length; i++) {
      query = availableQueries[i].queries.find(x => x.id == selectedQueryId);

      if (query) {
        break;
      }
    }

    this.setState({
      query: query,
      dataCsvText: '',
      dataTable: null,
      dataRowsNumber: 0,
    });
  }

  onPolygonLayerNameSelect = (event) => {
    let selectedValue = event.target.value;
    this.setState({ polygonLayerName:selectedValue !== "" ? selectedValue : null });
  }

  onPolygonIdChange = (event) => {
    this.setState({ polygonId: event.target.value });
  }

  onClassNameChange = (event) => {
    this.setState({ className: event.target.value });
  }

  render() {
    if (this.props.map) {    
      return (
        <div>
          <div className='button viewer-button' onClick={() => { this.toggleQueryPane(true); }} style={{top: '40vh'}}>
            Queries
          </div>
          <SlidingPane
            className='query-pane'
            overlayClassName='modal-overlay'
            isOpen={this.state.openQueryPane}
            title='GeoMessage'
            width={'80%'}
            onRequestClose={() => { this.toggleQueryPane(false); }}
          >
            <div className='query-pane-div' style={{marginTop: '0px'}}>
              <select ref='querySelect' onChange={this.onQuerySelect} value={this.state.query ? this.state.query.id : 0}>
                {this.renderQueryOptions()}
              </select>
            </div>
            <div className='query-pane-div' >
              {this.renderTimestampInfo()}
            </div>
            <div className='query-pane-div' >
              {this.renderShapeCoords()}
            </div>
            <div className='query-pane-div' >
              {this.renderPolygonIdInput()}
            </div>
            <div className='query-pane-div' >
              {this.renderClassNameInput()}
            </div>
            {
              this.state.query && this.state.query.params.includes(polygonLayerNameParamName) ?
                <div className='query-pane-div'>
                  <select 
                    ref='polygonLayerNameSelect' 
                    onChange={this.onPolygonLayerNameSelect} 
                    value={this.state.polygonLayerName ? this.polygonLayerNameParamName : null}
                  >
                    <option value="">Select a polygon layer</option>
                    {this.renderPolygonLayerNameOptions()}
                  </select>
                </div> :
                null
            }
            <div className='query-pane-div' >
              {this.renderExecuteButton()}
            </div>
            {
              this.state.executingQuery ? <div className='query-pane-div'>Loading...</div> : null
            }
            <div className='query-pane-div' >
              {this.state.dataCsvText && !this.state.noData? 
                <button onClick={this.downloadData}>Download data</button> :
                null}
            </div>
            <div>
              {this.state.dataRowsNumber > maxDataRows ?
                 `${maxDataRows} of ${this.state.dataRowsNumber} rows shown. Download the data to see all.` :
                 null
              }
            </div>
            {this.state.dataTable}
          </SlidingPane>
        </div>
      );
    }
    else {
      return (
        <div></div>
      )
    }
  }
}

export default QueryPane;