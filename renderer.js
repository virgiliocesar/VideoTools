const { ipcRenderer } = require("electron");

document.getElementById("select-video").addEventListener("click", async () => {
  const filePath = await ipcRenderer.invoke("select-video");
  document.getElementById("video-path").innerText =
    filePath || "Nenhum vídeo selecionado";
});

document
  .getElementById("select-directory")
  .addEventListener("click", async () => {
    const directoryPath = await ipcRenderer.invoke("select-directory");
    document.getElementById("directory-path").innerText =
      directoryPath || "Nenhum diretório selecionado";
  });

document
  .getElementById("start-processing")
  .addEventListener("click", async () => {
    const inputVideo = document.getElementById("video-path").innerText;
    const outputDir = document.getElementById("directory-path").innerText;
    const clipDuration = parseInt(
      document.getElementById("clip-duration").value
    );

    if (!inputVideo || !outputDir || isNaN(clipDuration)) {
      document.getElementById("status").innerText =
        "Por favor, selecione um vídeo, um diretório e insira um valor válido para a duração do clipe.";
      return;
    }

    document.getElementById("status").innerText = "Processando...";

    ipcRenderer.on("progress", (event, percent) => {
      const progressBarFill = document.getElementById("progress-bar-fill");
      progressBarFill.style.width = `${percent}%`;
      progressBarFill.innerText = `${percent}%`;
    });

    try {
      await ipcRenderer.invoke(
        "process-video",
        inputVideo,
        outputDir,
        clipDuration
      );
      document.getElementById("status").innerText = "Processamento concluído!";
    } catch (error) {
      document.getElementById("status").innerText = `Erro: ${error.message}`;
    }
  });

document.getElementById("theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDarkMode = document.body.classList.contains("dark-mode");
  document.getElementById("theme-toggle").innerText = isDarkMode
    ? "Modo Claro"
    : "Modo Escuro";
});
