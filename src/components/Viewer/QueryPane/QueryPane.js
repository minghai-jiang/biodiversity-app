import React, { PureComponent} from 'react';
import SlidingPane from 'react-sliding-pane';
import Papa from 'papaparse';
import FileDownload from 'js-file-download';

import 'react-sliding-pane/dist/react-sliding-pane.css';
import "./QueryPane.css";

const availableQueries = [
  { id: 0, text: 'Get classes data', name: 'classes_tiles_timestamp_customPolygon' },
  { id: 1, text: 'Get indices data', name: 'indices_tiles_customPolygon_timestamp' }
];

const noDataHeaderText = 'no data';

export class QueryPane extends PureComponent {
  constructor(props, context) {
    super(props, context)
    this.state = {
      openQueryPane: false,
      selectedQueryId: null,
      dataCsvText: '',
      dataTable: null,
      noData: false
    };
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
      let query = availableQueries[i];
      options.push(
        <option value={query.id} key={i} selected={query.id == this.state.selectedQueryId}>{query.text}</option>
      );
    }

    return options;
  }

  renderShapeCoords = () => {
    let shape = this.props.shape;
    if (shape && shape.length > 0) {

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
    else {
      return 'No area selected. Close this pane and select an area of interest on the map using the tools on the left.';
    }
  }

  executeQuery = async () => {
    let selectedQueryId = this.refs.querySelect.value;
    let query = availableQueries.find(x => x.id == selectedQueryId);

    let shape = this.props.shape;

    if (query && shape) {
      let shapeCoords = [];
      for (let i = 0; i < shape.length; i++) {
        shapeCoords.push(
            `(${shape[i].x}, ${shape[i].y})`  
        );
      }

      let bodyJson = JSON.stringify({
        mapId: this.props.map.id,
        args: [this.props.timestampRange.end, ...shapeCoords]
      });

      let headers = {
        "Content-Type": "application/json"
      };

      if (this.props.user) {
        headers["Authorization"] = "BEARER " + this.props.user.token
      }

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

        for (let x = 0; x < csvData.length; x++) {
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
                <th className='query-data-table-cell query-data-table-header'>
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
                <td className='query-data-table-cell'>
                  {data}
                </td>
              )
            }

            cells.push(cell);
          }

          rows.push(
            <tr>
              {cells}
            </tr>
          )
        }

        let table = (
          <table className='query-data-table'>
            {rows}
          </table>
        );

        this.setState({
          dataCsvText: text,
          dataTable: table,
          noData: noData
        });
      }
      else {
        let error = await response.json();
        alert(error.status + ': ' + error.message);
      }
    }
    else {
      alert('Please select a query.');
    }    
  }

  downloadData = () => {
    FileDownload(this.state.dataCsvText, 'data.csv');
  }

  onQuerySelect = (event) => {
    this.setState({selectedQueryId: event.target.value});
  }

  render() {
    if (this.props.map) {    
      return (
        <div>
          <div className='button open-query-window-button' onClick={() => { this.toggleQueryPane(true); }}>
            Queries
          </div>
          <SlidingPane
            className='query-pane'
            overlayClassName='modal-overlay'
            isOpen={this.state.openQueryPane}
            title='Query Data'
            width={'80%'}
            onRequestClose={() => { this.toggleQueryPane(false); }}
          >
            <div className='query-pane-div' style={{marginTop: '0px'}}>
              <select ref='querySelect' onChange={this.onQuerySelect}>
                {this.renderQueryOptions()}
              </select>
            </div>
            <div className='query-pane-div' >
              {this.renderShapeCoords()}
            </div>
            <div className='query-pane-div' >
              {this.state.selectedQueryId && this.props.shape ? 
                <button onClick={this.executeQuery}>Execute query</button> :
                null}
            </div>
            <div className='query-pane-div' >
              {this.state.dataCsvText && !this.state.noData? 
                <button onClick={this.downloadData}>Download data</button> :
                null}
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