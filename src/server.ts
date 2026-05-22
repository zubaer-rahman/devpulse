import { app } from "./app";
import config from "./config";
import { initDB } from "./db";
import net from "node:net";

net.setDefaultAutoSelectFamilyAttemptTimeout(1000);

(async () => {
  await initDB();
  app.listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`);
  });
})();
