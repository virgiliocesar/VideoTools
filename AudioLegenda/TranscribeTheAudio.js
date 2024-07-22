const { OpenAI } = require("openai");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");

require("dotenv").config();

// Configuração da API da OpenAI
const openai = new OpenAI({
  apiKey: "sk-proj-ptnCLYWRR5IytDgYFklqT3BlbkFJE0PgsXuDO7eLgVwcoFiP",
  //process.env.OPENAI_API_KEY,
});

const inputVideo =
  "C:\\Users\\xbacon\\Desktop\\VideoTools\\AudioLegenda\\InputVideo\\video.mp4";
const audioOutput =
  "C:\\Users\\xbacon\\Desktop\\VideoTools\\AudioLegenda\\AudioOutput\\audio.wav";
const legendasOutput =
  "C:\\Users\\xbacon\\Desktop\\VideoTools\\AudioLegenda\\LegendasOutput\\legendas.vtt";

// Função para extrair áudio do vídeo
function extrairAudio(input, output, callback) {
  ffmpeg(input)
    .output(output)
    .on("end", callback)
    .on("error", (err) => {
      console.error("Erro ao extrair áudio:", err);
    })
    .run();
}

// Função para transcrever o áudio usando OpenAI com retry
async function transcreverAudio(retryCount = 3) {
  const audio = fs.readFileSync(audioOutput);
  const audioBytes = audio.toString("base64");

  try {
    const response = await openai.audio.transcriptions.create({
      model: "whisper-1",
      audio: audioBytes,
      language: "pt",
    });

    const transcription = response.data.text;
    console.log("Transcrição:", transcription);
    salvarLegendas(transcription);
  } catch (error) {
    console.error("Erro ao transcrever o áudio:", error);
    if (retryCount > 0) {
      console.log("Tentando novamente...");
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Espera 5 segundos antes de tentar novamente
      await transcreverAudio(retryCount - 1);
    } else {
      console.error("Falha ao transcrever o áudio após várias tentativas.");
    }
  }
}

// Função para salvar a transcrição no formato VTT
function salvarLegendas(transcricao) {
  const vttContent = `
WEBVTT

00:00:00.000 --> 00:00:10.000
${transcricao}
  `;

  fs.writeFileSync(legendasOutput, vttContent);
}

// Inicia o processo de extração de áudio e transcrição
extrairAudio(inputVideo, audioOutput, () => {
  transcreverAudio();
});
