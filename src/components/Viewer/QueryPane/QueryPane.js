import React, { PureComponent} from 'react';
import SlidingPane from 'react-sliding-pane';
import Papa from 'papaparse';

import 'react-sliding-pane/dist/react-sliding-pane.css';
import "./QueryPane.css";

const availableQueries = [
  { id: 0, text: 'Get tile classes data', name: 'classes_tiles_timestamp_customPolygon' },
  { id: 1, text: 'Get tile indices data', name: 'indices_tiles_customPolygon_timestamp_class' }
];

export class QueryPane extends PureComponent {
  constructor(props, context) {
    super(props, context)
    this.state = {
      openQueryPane: false,
      dataCsvText: '',
      dataTable: null
    };
  }

  toggleQueryPane = (open) => {
    this.setState({ openQueryPane: open });
  }

  renderQueryOptions = () => {
    let options = [];

    for (let i = 0; i < availableQueries.length; i++) {
      let query = availableQueries[i];
      options.push(
        <option value={query.id} key={i}>{query.text}</option>
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
      return 'Please draw a shape on the map.';
    }
  }

  executeQuery = async () => {
    let selectedQueryId = this.refs.querySelect.value;
    let query = availableQueries.find(x => x.id == selectedQueryId);

    if (query) {
      let shape = this.props.shape;
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

      let response = await fetch(
        `${this.props.apiUrl}queries/${query.name}`,
        {
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          },  
          body: bodyJson,
        }
      );

      if (response.ok) {
        let text = await response.text();

        let csvData = Papa.parse(text, { skipEmptyLines: true }).data;

        let rows = [];
        for (let x = 0; x < csvData.length; x++) {
          let cells = [];
          let rowData = csvData[x];

          for (let i = 0; i < rowData.length; i++) {
            let cell = null;
            
            if (x === 0) {
              cell = (
                <th className='query-data-table-cell query-data-table-header'>
                  {rowData[i]}
                </th>
              );
            }
            else {
              let data = rowData[i];
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
          dataTable: table
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
    let element = document.createElement('a');
    let file = new Blob([this.state.dataCsvText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'data.csv';
    element.click();
  }

  render() {
    return (
      <div>
        <div className='open-query-window-button' onClick={() => { this.toggleQueryPane(true); }}></div>
        <SlidingPane
          className='query-pane'
          overlayClassName='modal-overlay'
          isOpen={this.state.openQueryPane}
          title='Query Data'
          width={'80%'}
          onRequestClose={() => { this.toggleQueryPane(false); }}>
          <div>
            <select ref='querySelect'>
              <option value="">Select a query</option>
              {this.renderQueryOptions()}
            </select>
          </div>
          <div>
            {this.renderShapeCoords()}
          </div>
          <button onClick={this.executeQuery}>Execute query</button>
          <button onClick={this.downloadData}>Download data</button>
          {this.state.dataTable}
        </SlidingPane>
      </div>
    );
  }
}

export default QueryPane;