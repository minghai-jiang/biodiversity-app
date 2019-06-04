const ErrorHandler = {
  alert: (error) => {
    if (typeof myVar === 'string' || myVar instanceof String) {
      alert(new Error(error));
    }
    else if (error.status) {
      alert(new Error(error.status + ' ' + error.message));
    }
  }
};

export default ErrorHandler;