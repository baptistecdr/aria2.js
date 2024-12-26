#!/usr/bin/env node

import Aria2 from "../../dist/esm/index.js";

async function main() {
  const serverOptions = {
    host: "localhost",
    port: 6800,
    secure: false,
    secret: "",
    path: "/jsonrpc",
  };

  const aria2viaHTTP = new Aria2(serverOptions);
  console.log("Aria2 using HTTP");
  try {
    const response = await aria2viaHTTP.call("getVersion");
    console.log(response);
  } catch (error) {
    console.log(error);
  }

  const aria2viaWebSocket = new Aria2(serverOptions);
  console.log("Aria2 using WebSocket");
  try {
    await aria2viaWebSocket.open();
    const response = await aria2viaWebSocket.call("getVersion");
    console.log(response);
    await aria2viaWebSocket.close();
  } catch (error) {
    console.log(error);
  }
}

await main();
