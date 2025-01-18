import path from "path";
import { fileURLToPath } from "url";
import fsp from "fs/promises";
import express from "express";
import fs from "fs";

const appsConfig = JSON.parse(fs.readFileSync("./apps.config.json", "utf8"));

let isProduction = process.env.NODE_ENV === "production";

async function createServer() {
  let app = express();
  let vite: any;
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  if (!isProduction) {
    const { createServer } = await import("vite");
    vite = await createServer({
      root: process.cwd(),
      server: { middlewareMode: true },
      appType: "custom",
    });

    app.use(vite.middlewares);
  } else {
    const compression = await import("compression");
    app.use(compression.default());
    app.use(express.static(path.join(__dirname, "dist")));
  }

  app.use("*", async (req: any, res: any) => {
    let url = req.originalUrl;

    let appDirectory = "";
    let htmlFileToLoad = "";

    appsConfig.forEach((app: any) => {
      if (url.startsWith(app.route)) {
        appDirectory = app.directory;
        htmlFileToLoad = path.join(
          isProduction ? "dist" : "",
          appDirectory,
          app.indexFile
        );
      }
    });

    function getAppConfig(url: string) {
      const appConfig = appsConfig.find((app: any) =>
        url.startsWith(app.route)
      );
      return appConfig;
    }

    if (isProduction) {
      htmlFileToLoad = path.join("dist", appDirectory, "index.html");
    } else {
      const appConfig = getAppConfig(url);
      if (appConfig) {
        appDirectory = appConfig.directory;
        htmlFileToLoad = path.join(
          isProduction ? "dist" : "",
          appDirectory,
          appConfig.indexFile
        );
      }
      htmlFileToLoad = path.join(appDirectory, "index.html");
    }

    try {
      let html = await fsp.readFile(
        path.join(__dirname, htmlFileToLoad),
        "utf8"
      );

      if (!isProduction) {
        html = await vite.transformIndexHtml(req.url, html);
      }

      res.setHeader("Content-Type", "text/html");
      return res.status(200).end(html);
    } catch (error: any) {
      if (!isProduction) vite.ssrFixStacktrace(error);
      console.log(error.stack);
      return res.status(500).end(error.stack);
    }
  });

  return app;
}

createServer().then((app) => {
  app.listen(3000, () => {
    console.log("HTTP server is running at http://localhost:3000");
  });
});
