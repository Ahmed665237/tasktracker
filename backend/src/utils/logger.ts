const logger = { // this is a variable where its value is an object and this objects value is two arrow fns
  info: (message: string) => {
    console.log(
      `[INFO] ${new Date().toISOString()} ${message}`
    ); // any information done like: task created === then this will display in the info fn to be displayed in the backend
  },

  error: (
    message: string,
    error?: unknown
  ) => {
    console.error(
      `[ERROR] ${new Date().toISOString()} ${message}`,
      error
    ); // this displays an error message in the backend
  },
};

export default logger;