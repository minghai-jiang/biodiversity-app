import React, { PureComponent} from 'react';

export class Table extends PureComponent {
  constructor(props, context) {
    super(props, context)
    this.state = {
      table: [],
    }
  };

  componentWillMount = () =>
  {
    let tableBody = [];
    let tableHead = [];
    for (let i = 0; i < this.props.data.data.length; i++)
    {
      let cell = '';
      let tr = [];
      let row = this.props.data.data[i];
      for (let j = 0; j < row.length; j++)
      {
        cell = row[j];
        if (i === 0)
        {
          tr.push(<th key={'th'+j}>{cell}</th>);
        }
        else
        {
          tr.push(<td key={i + '.' + j}>{cell}</td>);
        }
      }

      if(i===0)
      {
        tableHead.push(<thead key={this.props.type + 'thead'}><tr key={i}>{tr}</tr></thead>);
      }
      else
      {
        tableBody.push(<tr key={i}>{tr}</tr>);
      }
    }

    this.setState({table: <table key={this.props.type + 'Table'}>{tableHead}<tbody key={this.props.type + 'tbody'}>{tableBody}</tbody></table>});
  }

  buttonHandle = (e) =>
  {
    e.target.nextSibling.classList.toggle('hidden');
  }

  render() {
    if(this.props.data)
    {
      let className = 'tableContainer hidden';
      if(this.state.table.props.children[1].props.children.length === 1)
      {
        className = 'tableContainer';
      }

      return(
        <div>
          <button className='button' onClick={this.buttonHandle}>Display raw data</button>
          <div className={className}>
            {this.state.table}
          </div>
        </div>
      );
    }
    else
    {
      return (<div>No data for table</div>);
    }
  }
}

export default Table;