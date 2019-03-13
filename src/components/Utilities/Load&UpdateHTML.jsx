import React, { Component } from "react";
import parse from 'html-react-parser';

import Markdown  from '../Markdown/Markdown';

class L_U_HTML extends Component
{
  constructor(props){
    super(props);
    this.state = {
      contentElements: null
    };
  }

  componentDidMount() {
    this.getContent(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.getContent(nextProps);
    
  }

  getContent(props) {
    if (props.contentUrl) {
      if (props.isMarkdown === true)
      {
        debugger;
        let imagesUrl = props.contentUrl.substring(0, props.contentUrl.length - 3) + '/';
        let markdownElement = (
          <Markdown
            contentUrl={props.contentUrl}
            imagesUrl={imagesUrl}
          />
        )
        this.setState({ 
          contentElements: markdownElement
        });
      }
      else {
        let r = Math.random();

        fetch(props.contentUrl + '?' + r)
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
    }
  }

  render()
  {
    return(
      <div className='dynamic-content'>
        {this.state.contentElements}
      </div>
    )
  }
}

export default L_U_HTML;