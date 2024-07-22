const ffmpeg = require("fluent-ffmpeg");
const path = require("path");

// Especifique os caminhos completos para ffmpeg e ffprobe
const ffmpegPath ="C:\\Users\\xbacon\\Desktop\\VideoTools\\ffmpeg\\bin\\ffmpeg.exe";
const ffprobePath = "C:\\Users\\xbacon\\Desktop\\VideoTools\\ffmpeg\\bin\\ffprobe.exe";
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

// Certifique-se de que o caminho para o arquivo de vídeo está correto
const inputVideo = "C:\\Users\\xbacon\\Desktop\\VideoTools\\VideoCut\\video.mp4";
const outputDir = "C:\\Users\\xbacon\\Desktop\\VideoTools\\VideoCut\\ShortsVideo";
const clipDuration = 80; // duração de cada clipe em segundos (ajuste conforme necessário)

ffmpeg.ffprobe(inputVideo, (err, metadata) => {
  if (err) {
    console.error("Erro ao obter metadados do vídeo:", err);
    return;
  }

  const videoDuration = metadata.format.duration;
  let startTime = 0;
  let clipIndex = 1;

  while (startTime < videoDuration) {
    const outputFilePath = path.join(outputDir, `clip${clipIndex}.mp4`);

    ffmpeg(inputVideo)
      .setStartTime(startTime)
      .setDuration(clipDuration)
      .output(outputFilePath)
      .on("end", () => {
        console.log(`Clip ${clipIndex} criado: ${outputFilePath}`);
      })
      .on("error", (err) => {
        console.error(`Erro ao criar o clip ${clipIndex}:`, err);
      })
      .run();

    startTime += clipDuration;
    clipIndex++;
  }
});
