import app from "./app.mjs";
import AppConfig from "./configs/app.config.mjs";

console.log(AppConfig);

app.listen(AppConfig.Server.port, () => {
  console.log("Succesfully running");
});
