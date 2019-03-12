const createReactClass = require('create-react-class');

const QueryUtil = createReactClass({
  statics: {
    getData: async (url, body) => {
      if(url)
      {      
        try
        {
          var response;
          if(body)
          {
            response = await fetch(url, 
              {
                method:   'POST',
                headers:  { "Content-Type": "application/json" },
                body:     JSON.stringify(body),
              });
          }
          else
          {
            response = await fetch(url);
          }

          let responseJson = await response.text();
          if (!~responseJson.indexOf('Error'))
          {
            responseJson = JSON.parse(responseJson);
            return (responseJson);
          }
        }
        catch(error)
        {
          throw new Error(error);
        }
      }
      else
      {
        throw new Error('Invalid Query URL');
      }
    },
  },
  render() {
    return;
  },
});

export default QueryUtil;