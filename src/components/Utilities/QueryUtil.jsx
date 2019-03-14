const createReactClass = require('create-react-class');

const QueryUtil = createReactClass({
  statics: {
    getData: async (url, body, header = { "Content-Type": "application/json" }) => {
      if(url)
      {      
        try
        {
          var response;
          if(body)
          {
            if (!header['Content-Type'])
            {
              header['Content-Type'] = "application/json";
            }
            response = await fetch(url, 
              {
                method:   'POST',
                headers:  header,
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