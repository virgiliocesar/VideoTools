const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

// Especifique os caminhos completos para ffmpeg e ffprobe
const ffmpegPath =
  "C:\\Users\\xbacon\\Desktop\\VideoTools\\ffmpeg\\bin\\ffmpeg.exe";
const ffprobePath =
  "C:\\Users\\xbacon\\Desktop\\VideoTools\\ffmpeg\\bin\\ffprobe.exe";
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "renderer.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile("index.html");
}

app.on("ready", createWindow);

ipcMain.handle("select-video", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [{ name: "Videos", extensions: ["mp4", "avi", "mov"] }],
  });
  return result.filePaths[0];
});

ipcMain.handle("select-directory", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"],
  });
  return result.filePaths[0];
});

ipcMain.handle(
  "process-video",
  async (event, inputVideo, outputDir, clipDuration) => {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputVideo, (err, metadata) => {
        if (err) {
          console.error("Erro ao obter metadados do vídeo:", err);
          reject(err);
          return;
        }

        const videoDuration = metadata.format.duration;
        let startTime = 0;
        let clipIndex = 1;

        const processClip = () => {
          if (startTime >= videoDuration) {
            mainWindow.webContents.send("progress", 100); // Garantir que o progresso finalize em 100%
            resolve();
            return;
          }

          const outputFilePath = path.join(outputDir, `clip${clipIndex}.mp4`);

          ffmpeg(inputVideo)
            .setStartTime(startTime)
            .setDuration(clipDuration)
            .videoFilters([
              {
                filter: "scale",
                options: {
                  w: -1,
                  h: "min(1920, ih*1080/iw)",
                },
              },
              {
                filter: "pad",
                options: "1080:1920:(1080-iw)/2:(1920-ih)/2",
              },
            ])
            .output(outputFilePath)
            .on("end", () => {
              console.log(`Clip ${clipIndex} criado: ${outputFilePath}`);
              const percent = Math.min(
                Math.round((startTime / videoDuration) * 100),
                100
              );
              mainWindow.webContents.send("progress", percent);
              startTime += clipDuration;
              clipIndex++;
              processClip();
            })
            .on("error", (err) => {
              console.error(`Erro ao criar o clip ${clipIndex}:`, err);
              reject(err);
            })
            .run();
        };

        processClip();
      });
    });
  }
);
