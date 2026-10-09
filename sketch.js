/*
=========================================================
 SISTEMA INTELIGENTE DE CLASIFICACIÓN AMBIENTAL
 Universidad CESMAG
 Autor: Daniel Ramos
=========================================================
*/

// =====================================================
// CONFIGURACIÓN
// =====================================================

const modelURL =
'https://teachablemachine.withgoogle.com/models/q_LE946QS/';

const serialPort = 'COM5';

// =====================================================
// VARIABLES
// =====================================================

let classifier;

let serial;

let video;

let flippedVideo;

let label = "Cargando...";

let confidence = 0;

let estadoColor;

// =====================================================
// HISTORIAL
// =====================================================

let historial = [];

let ultimoLabel = "";

// =====================================================
// ANIMACIONES
// =====================================================

let pulse = 0;

// =====================================================
// VARIABLES RESPONSIVE
// =====================================================

let camX;
let camY;
let camW;
let camH;

let panelX;
let panelY;
let panelW;
let panelH;

let historialX;
let historialY;
let historialW;
let historialH;

// =====================================================
// PRELOAD
// =====================================================

function preload() {

  classifier = ml5.imageClassifier(
    modelURL + 'model.json'
  );

  serial = new p5.SerialPort();
}

// =====================================================
// SETUP
// =====================================================

function setup() {

  createCanvas(
    windowWidth,
    windowHeight
  );

  // SERIAL

  serial.open(serialPort);

  // VIDEO

  video = createCapture(VIDEO);

  video.size(640, 480);

  video.hide();

  // RESPONSIVE

  calcularLayout();

  // INICIAR IA

  flippedVideo = ml5.flipImage(video);

  classifyVideo();

  textFont('Arial');
}

// =====================================================
// DRAW
// =====================================================

function draw() {

  pulse += 0.05;

  drawBackground();

  drawGrid();

  drawHeader();

  drawCameraPanel();

  drawResultPanel();

  drawHistoryPanel();

  drawFooter();
}

// =====================================================
// RESPONSIVE
// =====================================================

function calcularLayout() {

  // PANEL CÁMARA

  camW = width * 0.52;

  camH = camW * 0.75;

  camX = width * 0.03;

  camY = height * 0.15;

  // PANEL RESULTADO

  panelW = width * 0.34;

  panelH = height * 0.24;

  panelX = width * 0.62;

  panelY = height * 0.15;

  // PANEL HISTORIAL

  historialW = width * 0.34;

  historialH = height * 0.30;

  historialX = width * 0.62;

  historialY = height * 0.44;
}

// =====================================================
// HEADER
// =====================================================

function drawHeader() {

  fill(255);

  noStroke();

  textAlign(LEFT);

  textSize(width * 0.026);

  textStyle(BOLD);

  text(
    "AI CLASIFICADOR DE RESIDUOS",
    width * 0.03,
    height * 0.06
  );

  fill(170);

  textSize(width * 0.011);

  textStyle(NORMAL);

  text(
    "Sistema Inteligente de Clasificación de Residuos con IA",
    width * 0.03,
    height * 0.09
  );

  // FECHA Y HORA

  let fechaHora =
    nf(day(), 2) + "/" +
    nf(month(), 2) + "/" +
    year() + "   " +
    nf(hour(), 2) + ":" +
    nf(minute(), 2) + ":" +
    nf(second(), 2);

  textAlign(RIGHT);

  fill(220);

  textSize(width * 0.010);

  text(
    fechaHora,
    width * 0.97,
    height * 0.06
  );
}

// =====================================================
// PANEL CÁMARA
// =====================================================

function drawCameraPanel() {

  fill(15, 25, 45, 180);

  stroke(0, 255, 200, 70);

  strokeWeight(2);

  rect(
    camX,
    camY,
    camW,
    camH,
    25
  );

  image(
    flippedVideo,
    camX + 20,
    camY + 20,
    camW - 40,
    camH - 40
  );

  // BRILLO SUAVE

  let glow =
    map(
      sin(pulse),
      -1,
      1,
      120,
      255
    );

  noFill();

  stroke(0, glow, 255);

  strokeWeight(3);

  rect(
    camX + 10,
    camY + 10,
    camW - 20,
    camH - 20,
    25
  );
}

// =====================================================
// RESULTADO
// =====================================================

function drawResultPanel() {

  updateStatusColor();

  fill(15, 25, 45, 180);

  noStroke();

  rect(
    panelX,
    panelY,
    panelW,
    panelH,
    25
  );

  // TÍTULO

  fill(255);

  textAlign(LEFT);

  textStyle(BOLD);

  textSize(width * 0.015);

  text(
    "RESULTADO DEL MODELO",
    panelX + 30,
    panelY + 50
  );

  // INDICADOR

  let sizePulse =
    map(
      sin(pulse * 2),
      -1,
      1,
      width * 0.03,
      width * 0.025
    );

  fill(estadoColor);

  ellipse(
    panelX + panelW * 0.18,
    panelY + panelH * 0.55,
    sizePulse
  );

  // TEXTO

  fill(255);

  textSize(width * 0.022);

  let textoMostrar = "";

  if (label == "0") {

    textoMostrar = "ORGÁNICO";

  }
  else if (label == "1") {

    textoMostrar = "INORGÁNICO";

  }
  else {

    textoMostrar = "NO APLICA";
  }

  text(
    textoMostrar,
    panelX + panelW * 0.32,
    panelY + panelH * 0.58
  );

  // CONFIANZA

  fill(180);

  textSize(width * 0.012);

  text(
    "Confianza: " +
    nf(confidence * 100, 2, 1) + "%",
    panelX + panelW * 0.32,
    panelY + panelH * 0.76
  );
}

// =====================================================
// HISTORIAL
// =====================================================

function drawHistoryPanel() {

  fill(15, 25, 45, 180);

  noStroke();

  rect(
    historialX,
    historialY,
    historialW,
    historialH,
    25
  );

  // TÍTULO

  fill(255);

  textAlign(LEFT);

  textStyle(BOLD);

  textSize(width * 0.015);

  text(
    "HISTORIAL DE DETECCIONES",
    historialX + 30,
    historialY + 50
  );

  // CONFIGURACIÓN INTERNA

  let margenTop = 90;

  let margenBottom = 30;

  let espacioLinea = height * 0.04;

  let alturaDisponible =
    historialH - margenTop - margenBottom;

  let maxItems =
    floor(
      alturaDisponible / espacioLinea
    );

  // HISTORIAL

  textStyle(NORMAL);

  fill(210);

  textSize(width * 0.011);

  for (
    let i = 0;
    i < min(historial.length, maxItems);
    i++
  ) {

    text(
      historial[i],
      historialX + 40,
      historialY +
      margenTop +
      (i * espacioLinea)
    );
  }
}

// =====================================================
// FOOTER ELEGANTE
// =====================================================

function drawFooter() {

  let footerW = width * 0.28;

  let footerH = height * 0.06;

  let footerX = width - footerW - 20;

  let footerY = height - footerH - 15;

  // FONDO

  fill(10, 20, 35, 190);

  stroke(0, 255, 180, 60);

  strokeWeight(1.5);

  rect(
    footerX,
    footerY,
    footerW,
    footerH,
    16
  );

  // TEXTO PRINCIPAL

  noStroke();

  textAlign(CENTER);

  fill(240);

  textSize(width * 0.0095);

  text(
    "Universidad CESMAG  |  Daniel Ramos",
    footerX + footerW / 2,
    footerY + footerH * 0.42
  );

  // TEXTO SECUNDARIO

  fill(120, 255, 220);

  textSize(width * 0.008);

  text(
    "Trabajo de Grado • IA Ambiental",
    footerX + footerW / 2,
    footerY + footerH * 0.74
  );
}

// =====================================================
// IA
// =====================================================

function classifyVideo() {

  flippedVideo = ml5.flipImage(video);

  classifier.classify(
    flippedVideo,
    gotResult
  );

  flippedVideo.remove();
}

// =====================================================
// RESULTADOS
// =====================================================

function gotResult(error, results) {

  if (error) {

    console.error(error);

    return;
  }

  label = results[0].label;

  confidence = results[0].confidence;

  // SERIAL

  if (label != ultimoLabel) {

    serial.write(label);

    let tipo = "";

    if (label == "0") {

      tipo = "ORGÁNICO";

    }
    else if (label == "1") {

      tipo = "INORGÁNICO";

    }
    else {

      tipo = "NO APLICA";
    }

    let horaActual =
      nf(hour(), 2) + ":" +
      nf(minute(), 2) + ":" +
      nf(second(), 2);

    historial.unshift(
      horaActual + "  →  " + tipo
    );

    // LIMITAR HISTORIAL

    if (historial.length > 20) {

      historial.pop();
    }

    ultimoLabel = label;
  }

  classifyVideo();
}

// =====================================================
// FONDO
// =====================================================

function drawBackground() {

  for (let y = 0; y < height; y++) {

    let inter =
      map(y, 0, height, 0, 1);

    let c = lerpColor(
      color(5, 10, 20),
      color(15, 45, 70),
      inter
    );

    stroke(c);

    line(0, y, width, y);
  }
}

// =====================================================
// GRID FUTURISTA
// =====================================================

function drawGrid() {

  stroke(255, 255, 255, 10);

  strokeWeight(1);

  for (let x = 0; x < width; x += width * 0.03) {

    line(x, 0, x, height);
  }

  for (let y = 0; y < height; y += height * 0.04) {

    line(0, y, width, y);
  }
}

// =====================================================
// COLORES
// =====================================================

function updateStatusColor() {

  if (label == "0") {

    estadoColor =
      color(0, 255, 120);
  }
  else if (label == "1") {

    estadoColor =
      color(255, 90, 90);
  }
  else {

    estadoColor =
      color(180);
  }
}

// =====================================================
// RESPONSIVE
// =====================================================

function windowResized() {

  resizeCanvas(
    windowWidth,
    windowHeight
  );

  calcularLayout();
}