#include "WiFi.h"
#include "AsyncUDP.h"

const char* ssid     = "Mi A3";
const char* password = "175903182";
const int wifiStatusAttempts = 5;
const int wifiConnectTryRetry = 10;

const int FifiStatusOK = 0;
const int FifiStatusError = -1;

int wifiStatus;
AsyncUDP udp;

void setup() {
  Serial.begin(115200);

  delay(1000);

  Serial.println("Begin");
  
  wifiTryRetry();

  if (wifiStatus != FifiStatusOK) {
    return;
  }

  // 81.177.26.40
  if(udp.connect(IPAddress(81,177,26,40), 9000)) {
    udp.print("Hello Server!");
  }
}

void wifiTryRetry() {
  int i;
  for (i = wifiConnectTryRetry; i > 0; i--) {
    Serial.print("\r\nwifiConnectTryRetry: ");
    Serial.println(wifiConnectTryRetry - i + 1);

    WiFi.begin(ssid, password);
    
    wifiStatus = wifiConnect();
    if (wifiStatus == FifiStatusOK) {
      break;
    }

    delay(10000);
    continue;
  }
}

int wifiConnect() {
  int i;
  for (i = wifiStatusAttempts; i > 0; i--) {
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("\r\nWiFi connected");
      Serial.println("IP address: ");
      Serial.println(WiFi.localIP());
      return FifiStatusOK;
    } else {
      delay(2000);
      Serial.print(".");  
    }
  }

  return FifiStatusError;
}

void loop() {
  if (wifiStatus != FifiStatusOK) {
    delay(1000 * 3600);
    return;
  }
  
  udp.print("ping");

  delay(10000);
}
