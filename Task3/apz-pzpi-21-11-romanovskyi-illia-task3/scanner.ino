#include <WiFi.h>
#include <HTTPClient.h>
#include "DHTesp.h"

const char* SSID = "Wokwi-GUEST";
const char* PASSWORD = "";

const int DHT_PIN = 18; 
const int micPin = 35;  

DHTesp dhtSensor; 

float measureNoiseLevel() {
  int noiseLevel = analogRead(micPin);
  float noiseLevelDb = (noiseLevel / 4096.0) * 100.0; 
  return noiseLevelDb;
}

void setup() {
  Serial.begin(115200);
  dhtSensor.setup(DHT_PIN, DHTesp::DHT22); 
  WiFi.begin(SSID, PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
  }
}

void loop() {
  float noiseLevelDb = measureNoiseLevel();
  Serial.print("Noise Level: ");
  Serial.print(noiseLevelDb);
  Serial.println(" dB");

  TempAndHumidity data = dhtSensor.getTempAndHumidity();
  Serial.print("Temperature: ");
  Serial.print(data.temperature, 2);
  Serial.print("°C, Humidity: ");
  Serial.print(data.humidity, 1);
  Serial.println("%");

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin("http://localhost:8000/get_sensor_data");
    http.addHeader("Content-Type", "application/json");
    
    String jsonData = "{\"sensor_id\":14, \"Temperature\":" + String(data.temperature, 2) + 
                      ", \"Humidity\":" + String(data.humidity, 1) + 
                      ", \"Noise\":" + String(noiseLevelDb) + "}";
    
    int httpResponseCode = http.POST(jsonData);
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println(httpResponseCode);
      Serial.println(response);
    } else {
      Serial.print("Error on sending POST: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("Error in WiFi connection");
  }

  delay(5000); 
} 