import React, { PureComponent} from 'react';
import Moment from 'moment';

import './react-vis-style.css';
import './SoilTable.css';
import ViewerUtility from '../../../ViewerUtility';

import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import Paper from '@material-ui/core/Paper';


export class SoilTable extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      table: null,
    }
  };

  componentDidMount()
  {
    let hasData = Object.entries(this.props.data).length === 0 && this.props.data.constructor === Object;

    if (this.props.data && !hasData)
    {
      let parsed = this.props.data.data[this.props.data.data.length - 1];
      let tableData = [];

      for (var key in parsed)
      {
        if (key !== 'area' && key !== 'date_from' && key !== 'date_to')
        {
          tableData.push(<TableRow key={key + parsed[key]}><TableCell>{key}</TableCell><TableCell>{parsed[key]}</TableCell></TableRow>)
        }
      }

      let head = <TableHead><TableRow><TableCell>key</TableCell><TableCell>value</TableCell></TableRow></TableHead>;
      let body = <TableBody>{tableData}</TableBody>

      this.setState({table: <Paper className='SoilTable'><Table size="small">{head}{body}</Table></Paper>})
    }
  }

  render() {
    return (this.state.table)
  }
}

export default SoilTable;