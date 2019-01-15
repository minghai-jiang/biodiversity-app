import { Component } from "react";
import { withRouter } from "react-router-dom";

export class ScrollToTop extends Component {
    componentDidUpdate(prevProps) {
        // debugger;
        // if (this.props.location !== prevProps.location) {
            window.scrollTo(0, 0)
        // }
    }
  
    render() {
        return this.props.children
    }
}
  
export default withRouter(ScrollToTop)