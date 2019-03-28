import React, { Component } from "react";

import parse from 'html-react-parser';
import 'highlight.js/styles/monokai-sublime.css';
import './Markdown.css'

const hljs       = require('highlight.js');
const Remarkable = require('remarkable');

class Markdown extends Component
{
  md = new Remarkable('full', {
    highlight: (str, lang) =>
    {
      if (lang && hljs.getLanguage(lang))
      {
        try
        {
            return hljs.highlight(lang, str).value;
        }          
        catch (err) {

        }
      }

      try
      {
        return hljs.highlightAuto(str).value;
      }
      catch (err) {

      }

      return '';
    }
  });

  constructor(props){
    super(props);
    
    this.md.set({
      html        : true,
      xhtmlOut    : true,
      linkify     : true,
      typographer : true
    });

    this.state = {
      contentElements: null
    };
  }

  componentDidMount() {
    this.getContent(this.props);
  }

  componentWillReceiveProps = (nextProps) => {
    this.getContent(nextProps);
  }

  getContent = (props) => {
    fetch(props.contentUrl)
      .then(response => {
        if (response.ok) {
          return response.text();
        }
        else {
          throw "Failed to retrieve documents.";
        }
      })
      .then(text => {
        let output = this.md.render(text);
        let contentElements = parse(output);
        var clean = [];

        Object.keys(contentElements).forEach(function(index)
        {
          if(typeof(contentElements[index]) === 'object')
          {
            if(contentElements[index].type === 'p')
            {
              if (contentElements[index].props.children.type === 'img')
              {
                if (contentElements[index].props.children.props.src)
                {
                  let url = contentElements[index].props.children.props.src;
                  let new_img = <img src={this.props.imagesUrl + url}/>;
                  clean.push(new_img);
                }
              }
              else
              {
                clean.push(contentElements[index]);
              }
            }
            else
            {
              clean.push(contentElements[index]);
            }
          }
        }.bind(this));

        this.setState({ contentElements: clean});
      })
      .catch(error => {
        alert(error);
      })
  }

  render()
  {
    return (
      <div className='markdown-div'>
        {this.state.contentElements}
      </div>
    )
  }
}

export default Markdown;