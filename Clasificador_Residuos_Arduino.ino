/*
=========================================================
 CLASIFICADOR DE RESIDUOS - OLED + NEOPIXELS
 Autor: Daniel Ramos
 Universidad CESMAG
=========================================================
*/

// =====================================================
// LIBRERÍAS
// =====================================================

#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#include <Adafruit_NeoPixel.h>

#include <Servo.h>

#include <Wire.h>

// =====================================================
// OLED 128x32
// =====================================================

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 32

#define OLED_RESET -1

Adafruit_SSD1306 display(
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  &Wire,
  OLED_RESET
);

// =====================================================
// NEOPIXELS
// =====================================================

// PRUEBA ESTOS PINES SI NO FUNCIONA:
// 14
// 16
// 48

#define LED_PIN 13

#define NUM_LEDS 3

Adafruit_NeoPixel pixels(
  NUM_LEDS,
  LED_PIN,
  NEO_GRB + NEO_KHZ800
);

// =====================================================
// SERVOS
// =====================================================

Servo servo1;
Servo servo2;
Servo servo3;

#define SERVO1_PIN A1
#define SERVO2_PIN A3
#define SERVO3_PIN 9

// =====================================================
// VARIABLES
// =====================================================

char result = '2';

char previousResult = 'X';

// =====================================================
// SETUP
// =====================================================

void setup() {

  Serial.begin(9600);

  // ===================================================
  // OLED
  // ===================================================

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {

    Serial.println("OLED NO DETECTADA");

    while (true);
  }

  display.clearDisplay();

  display.setTextSize(1);

  display.setTextColor(SSD1306_WHITE);

  display.setCursor(0, 0);

  display.println("CLASIFICADOR");

  display.println("Iniciando...");

  display.display();

  // ===================================================
  // NEOPIXELS
  // ===================================================

  pixels.begin();

  pixels.clear();

  pixels.show();

  // ==========================================
  // PRUEBA INICIAL MORADO
  // ==========================================

  setColor(150, 0, 255);

  delay(3000);

  pixels.clear();

  pixels.show();

  // ===================================================
  // SERVOS
  // ===================================================

  servo1.attach(SERVO1_PIN);

  servo2.attach(SERVO2_PIN);

  servo3.attach(SERVO3_PIN);

  servo1.write(90);

  servo2.write(90);

  servo3.write(90);

  delay(1000);

  showMessage("Sistema listo", "Esperando...");
}

// =====================================================
// LOOP
// =====================================================

void loop() {

  // ==========================================
  // RECIBIR SERIAL
  // ==========================================

  if (Serial.available() > 0) {

    result = Serial.read();

    Serial.println(result);
  }

  // ==========================================
  // SOLO SI CAMBIA
  // ==========================================

  if (result != previousResult) {

    switch (result) {

      // ======================================
      // ORGÁNICO
      // ======================================

      case '0':

        setColor(0, 255, 0);

        showMessage(
          "RESIDUO:",
          "ORGANICO"
        );

        servo1.write(20);

        servo2.write(90);

        servo3.write(90);

        break;

      // ======================================
      // INORGÁNICO
      // ======================================

      case '1':

        setColor(255, 0, 0);

        showMessage(
          "RESIDUO:",
          "INORGANICO"
        );

        servo1.write(90);

        servo2.write(20);

        servo3.write(90);

        break;

      // ======================================
      // NO APLICA
      // ======================================

      case '2':

        setColor(0, 0, 255);

        showMessage(
          "RESIDUO:",
          "NO APLICA"
        );

        servo1.write(90);

        servo2.write(90);

        servo3.write(20);

        break;

      // ======================================
      // DEFAULT
      // ======================================

      default:

        setColor(80, 80, 80);

        showMessage(
          "Esperando",
          "deteccion..."
        );

        servo1.write(90);

        servo2.write(90);

        servo3.write(90);

        break;
    }

    previousResult = result;
  }
}

// =====================================================
// FUNCIÓN OLED
// =====================================================

void showMessage(String line1, String line2) {

  display.clearDisplay();

  display.setTextSize(1);

  display.setTextColor(SSD1306_WHITE);

  display.setCursor(0, 5);

  display.println(line1);

  display.setTextSize(2);

  display.setCursor(0, 18);

  display.println(line2);

  display.display();
}

// =====================================================
// FUNCIÓN NEOPIXELS
// =====================================================

void setColor(int r, int g, int b) {

  for (int i = 0; i < NUM_LEDS; i++) {

    pixels.setPixelColor(
      i,
      pixels.Color(r, g, b)
    );
  }

  pixels.show();
}