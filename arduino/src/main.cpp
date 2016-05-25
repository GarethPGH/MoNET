#include <Wire.h>
#include <ArduinoJson.h>
#include "Adafruit_TCS34725.h"
#include <ESP8266WiFi.h>
#include "conf.h"

const char* ssid     =  MYSSID;
const char* password = MYPASS;
const char* host = MYHOST;

int gainSetting = 0;
int timeSetting = 5;

float rcal = 0;
float gcal = 0;
float bcal = 0;

Adafruit_TCS34725 tcs = Adafruit_TCS34725(TCS34725_INTEGRATIONTIME_700MS, TCS34725_GAIN_60X);

void joinWiFi() {
  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

    WiFi.begin(ssid, password);

     while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
    }

    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
}


void writeSample (String sample) {
  String line;
  Serial.print("connecting to ");
  Serial.println(host);

  // Use WiFiClient class to create TCP connections
  WiFiClient client;
  const int httpPort = 3000;
  if (!client.connect(host, httpPort)) {
    Serial.println("connection failed");
    return;
  }

  // We now create a URI for the request
  String url = "/sample" + sample;

  // This will send the request to the server
  client.print(String("GET ") + url + " HTTP/1.1\r\n" +
               "Host: " + host + "\r\n" +
               "Accept: */*\r\n" +
               "User-Agent: Mozilla/4.0 (compatible; esp8266 Lua; )\r\n" +
               "Connection: close\r\n\r\n");
  delay(10);

  while(!client.available()){}

  // Read all the lines of the reply from server and print them to Serial
  while(client.available()){
     line = client.readStringUntil('\r');
  }

  Serial.println(line);

  StaticJsonBuffer<200> jsonBuffer;

  JsonObject& root = jsonBuffer.parseObject(line);

  if (root["gain"] == 1 && gainSetting <= 3) {
    gainSetting++;
  }
  if (root["gain"] == -1 && gainSetting >= 0) {
    gainSetting--;
  }
  if (root["gain"] != 0 && gainSetting <= 3 && gainSetting >= 0) {
      switch (gainSetting) {
        case 0:
          Serial.println("1X");
          tcs.setGain(TCS34725_GAIN_1X);
          break;
        case 1:
          Serial.println("4X");
          tcs.setGain(TCS34725_GAIN_4X);
          break;
        case 2:
          Serial.println("16x");
          tcs.setGain(TCS34725_GAIN_16X);
          break;
        case 3:
          Serial.println("60X");
          tcs.setGain(TCS34725_GAIN_60X);
          break;
      }
      Serial.println(gainSetting);
      delay(800);
    }

  if (root["time"] == 1 && timeSetting <= 5) {
    timeSetting++;
  }
  if (root["time"] == -1 && timeSetting >= 0) {
    timeSetting--;
  }
  if (root["time"] != 0 && timeSetting <= 5 && timeSetting >= 0) {
      switch (timeSetting) {
        case 0:
          Serial.println("2.4MS");
          tcs.setIntegrationTime(TCS34725_INTEGRATIONTIME_2_4MS);
          break;
        case 1:
          Serial.println("24MS");
          tcs.setIntegrationTime(TCS34725_INTEGRATIONTIME_24MS);
          break;
        case 2:
          Serial.println("50MS");
          tcs.setIntegrationTime(TCS34725_INTEGRATIONTIME_50MS);
          break;
        case 3:
          Serial.println("101MS");
          tcs.setIntegrationTime(TCS34725_INTEGRATIONTIME_101MS);
          break;
        case 4:
          Serial.println("154MS");
          tcs.setIntegrationTime(TCS34725_INTEGRATIONTIME_154MS);
          break;
        case 5:
          Serial.println("700MS");
          tcs.setIntegrationTime(TCS34725_INTEGRATIONTIME_700MS);
          break;
      }
      Serial.println(timeSetting);
      delay(800);
  }

  if (root["setwhite"] != 0 ) {
    Serial.println(atof(root["red"]));
    rcal = atof(root["red"]);
    gcal = atof(root["green"]);
    bcal = atof(root["blue"]);
  }

  Serial.println("closing connection");

  delay(10);
}


void setup(void) {
  Serial.begin(115200);
  tcs.begin();
  pinMode(4, OUTPUT);
  digitalWrite(4, LOW); // @gremlins Bright light, bright light!

  joinWiFi();

  delay(2000);

}

void loop(void) {
  uint16_t r, g, b, c;
  tcs.getRawData(&r, &g, &b, &c);

  float red, blue, green, sum;

  red = r;
  blue = g;
  green = b;
  red /= c;
  blue /= c;
  green /= c;
  red *= 256;
  blue *= 256;
  green *= 256;

  Serial.print(rcal);
  Serial.print(',');
  Serial.print(gcal);
  Serial.print(',');
  Serial.println(bcal);

  red += rcal;
  blue += bcal;
  green += gcal;

  Serial.print(r);
  Serial.print(',');
  Serial.print(g);
  Serial.print(',');
  Serial.println(b);

  Serial.print(red);
  Serial.print(',');
  Serial.print(green);
  Serial.print(',');
  Serial.println(blue);
  //Serial.print((int)red ); Serial.print(" "); Serial.print((int)green);Serial.print(" ");  Serial.println((int)blue );

  char redChr[10];
  char greenChr[10];
  char blueChr[10];
  dtostrf(red, 6, 2, redChr);
  dtostrf(green, 6, 2, greenChr);
  dtostrf(blue, 6, 2, blueChr);


  char saveChr[50];
  sprintf(saveChr, "/%s/%s/%s", redChr, greenChr, blueChr);

  String sample = saveChr;
  sample.replace(" ", "");

  writeSample(sample);

  delay(500);
}
