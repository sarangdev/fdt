const FDT = require("./fdt");

const onData = async (e, params) => {
  switch (e) {
    case "calc":
      return params.a + params.b;
      break;
    default:
      return "Method not found";
      break;
  }
};

connect();
const server = new FDT(onData);
server.start();
