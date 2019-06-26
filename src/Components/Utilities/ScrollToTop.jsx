import { Component } from "react";
import { withRouter } from "react-router-dom";

export class ScrollToTop extends Component {
  componentDidUpdate(prevProps) {        	
    let loc = window.location.href.split('#');
    if(loc.length === 2)
    {
      let dest = document.getElementById(loc[1]);
      if (dest !== null)
      {
        window.scrollTo(0, dest.offsetTop);
        dest.focus(); 
      }
      else
      {
        window.scrollTo(0, 0);
      }
    }
    else
    {
      window.scrollTo(0, 0);
    }
  }

  render() {
    return this.props.children
  }
}
  
export default withRouter(ScrollToTop)