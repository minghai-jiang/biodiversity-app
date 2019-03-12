import React, { Component } from "react";
import parse from 'html-react-parser';

import Markdown  from '../Markdown/Markdown';

class LoadUpdateUtil extends Component
{
  constructor(props){
    super(props);
    this.state = {
      contentElements: null
    };
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.contentName && nextProps.contentName !== this.props.contentName) {
      if (this.props.type === 'Sector')
      {
        fetch(`${this.props.publicFilesUrl}sectors/${nextProps.contentName}.html`)
          .then(response => {
            if (response.ok) {
              return response.text();
            }
            else {
              throw new Error("Failed to retrieve documents.");
            }
          })
          .then(text => {
            let contentElements = parse(text);
            this.setState({ contentElements: contentElements});
          })
          .catch(error => {
            alert(error);
          }); 
      }
      else if (this.props.type === 'Gallery')
      {
        this.setState({ contentElements: <Markdown publicFilesUrl={this.props.publicFilesUrl} file={nextProps.contentName}></Markdown>});
      }
    }
  }

  render()
  {
    return(
      <div className={this.props.type + "_content"}>
        {this.state.contentElements}
      </div>
    )
  }
}

export default LoadUpdateUtil;