const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path.replace(
  "app.asar",
  "app.asar.unpacked"
);

const ffprobePath = require("@ffprobe-installer/ffprobe").path.replace(
  "app.asar",
  "app.asar.unpacked"
);

// Configure o caminho para ffmpeg e ffprobe se necessário
// const ffmpegPath = ".\\ffmpeg\\bin\\ffmpeg.exe";
// const ffprobePath = ".\\ffmpeg\\bin\\ffprobe.exe";
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

// IPC Handlers
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
          reject(err);
          return;
        }

        const videoDuration = metadata.format.duration;
        let startTime = 0;
        let clipIndex = 1;

        const processClip = () => {
          if (startTime >= videoDuration) {
            resolve();
            return;
          }

          const outputFilePath = path.join(outputDir, `clip${clipIndex}.mp4`);

          ffmpeg(inputVideo)
            .setStartTime(startTime)
            .setDuration(clipDuration)
            .output(outputFilePath)
            .on("end", () => {
              clipIndex++;
              startTime += clipDuration;
              processClip();
            })
            .on("error", (err) => {
              reject(err);
            })
            .run();
        };

        processClip();
      });
    });
  }
);
