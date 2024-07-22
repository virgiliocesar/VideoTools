const fs = require("fs");

function saveAsVTT(transcription) {
  const lines = transcription.split("\n");
  let vttContent = "WEBVTT\n\n";

  lines.forEach((line, index) => {
    const startTime =
      new Date(index * 5 * 1000).toISOString().substr(11, 8) + ".000";
    const endTime =
      new Date((index + 1) * 5 * 1000).toISOString().substr(11, 8) + ".000";
    vttContent += `${startTime} --> ${endTime}\n${line}\n\n`;
  });
  // subtitle output
  fs.writeFileSync(
    "C:Users\\xbacon\\Desktop\\VideoTools\\LegendConvertVTTouSRT\\SubtitleOutput\\subtitles.vtt",
    vttContent
  );
}
