#include<Arduino.h>
#include<WiFi.h>
#include<HTTPClient.h>
#include<NewPing.h>
#include<string>
#include "DHT.h"

//#define WIFI_SSID "Airtel 4G Router_02A2"
//#define WIFI_PASSWORD "MuMtbTDx"
//#define WIFI_SSID "Airtel 4G Router_E95B"
//#define WIFI_PASSWORD "Kc7kaLe7"
#define WIFI_SSID "Galaxy M10D591"
#define WIFI_PASSWORD "ryst9765"
#define STARTER_RELAY 13
#define TRIGGER_PIN 12
#define ECHO_PIN 14
#define MAX_DISTANCE 50
#define DHT_PIN 26
#define CHOKE_RELAY 25
#define KILL_SWITCH_RELAY 33

NewPing sonar(TRIGGER_PIN,ECHO_PIN,MAX_DISTANCE);
HTTPClient http;

DHT dht(DHT_PIN,DHT11);

bool starterState=false;
String serverName="https://power-generator.herokuapp.com/check_state";
   
unsigned long lastTime1=0;
unsigned long lastTime2=0;
unsigned long lastTime3=0;
unsigned long timerDelay=50000;

bool isConnected=false;

String getGeneratorState(){
  Serial.println("testing API call");
  String serverPath=serverName;
  http.begin(serverPath.c_str());

  int httpResponseCode=http.GET();
  
  if(httpResponseCode>0){
    Serial.print("HTTP Response code:");
    Serial.println(httpResponseCode);
    String payload=http.getString();
    Serial.println(payload);
    return payload;
  }
  else{
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
  }
  http.end();
  lastTime1=millis();
}

void useUltrasonicSensor(){
  Serial.print("Distance:");
  int distance=sonar.ping_cm();
  Serial.println(distance);
  delay(500);
  if(isConnected && distance>0){  
    String serverPath="https://power-generator.herokuapp.com/fuel_volume/"+String(distance);
    Serial.println(serverPath);
  
    http.begin(serverPath.c_str());

    int httpResponseCode=http.POST("ultrasonic sensor");

    if(httpResponseCode>0){
      Serial.print("HTTP Response code:");
      Serial.println(httpResponseCode);
      String payload=http.getString();
      Serial.println(payload);
    }
    else{
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }
    http.end();
    lastTime2=millis();
  }
}


unsigned long previousMillis = 0;
unsigned long interval = 1000;
void storeFuelValues(){
  unsigned long currentMillis = millis();
  if(isConnected){ 
      Serial.println(interval);
      if(currentMillis - previousMillis >= interval){
            interval=300000;
            String serverPath="https://power-generator.herokuapp.com/store_sensor_data";
            Serial.println(serverPath);
            http.begin(serverPath.c_str());
            int httpResponseCode=http.POST("store data");

            if(httpResponseCode>0){
              Serial.print("HTTP Response code:");
              Serial.println(httpResponseCode);
              String payload=http.getString();
              Serial.println(payload);
            }
            else{
              Serial.print("Error code: ");
              Serial.println(httpResponseCode);
            }
            http.end();
            previousMillis = currentMillis;
      }
  }
}


unsigned long previousMillis2 = 0;
unsigned long interval2 = 2000;
int temperatureThreshold=37.5;
void readTemperatureAndHumidity(){
    unsigned long currentMillis2 = millis(); 
    if(currentMillis2 - previousMillis2 >= interval2){
       float h = dht.readHumidity();
       float t = dht.readTemperature();  
       float f = dht.readTemperature(true);
       
      if (isnan(h)|| isnan(t) || isnan(f)) {
         Serial.println(F("Failed to read from DHT sensor!"));
      }
      
      else{
       Serial.print("Temperature: ");
       Serial.print(t);
       Serial.println("Humidity: ");
       Serial.print(h);
       
       if(t > 55){
            String serverPath="https://power-generator.herokuapp.com/turnOff";
            http.begin(serverPath.c_str());
            int httpResponseCode=http.POST("turn OFF");

            if(httpResponseCode>0){
              String payload=http.getString();
              Serial.println(payload);
            }
            else{
              Serial.print("Error code: ");
              Serial.println(httpResponseCode);
            }
            http.end();
       }
       
      }
       previousMillis2 = currentMillis2;
    }
}

void controlStartHandler(){
  if(starterState==false){
     starterState=true;
     digitalWrite(KILL_SWITCH_RELAY,LOW);
     digitalWrite(CHOKE_RELAY,LOW);
     delay(3000); 
     digitalWrite(STARTER_RELAY,LOW);
     delay(3000);     
     digitalWrite(STARTER_RELAY,HIGH);
     digitalWrite(CHOKE_RELAY,HIGH);  
   }
}

void controlStopHandler(){
  if(starterState==true){
     starterState=false;
     digitalWrite(KILL_SWITCH_RELAY,HIGH);
  }
}

void setup(){
    Serial.begin(115200);
    pinMode(LED_BUILTIN,OUTPUT);
    pinMode(STARTER_RELAY,OUTPUT);
    pinMode(CHOKE_RELAY,OUTPUT);
    pinMode(KILL_SWITCH_RELAY,OUTPUT);
    
    digitalWrite(STARTER_RELAY,HIGH);
    digitalWrite(CHOKE_RELAY,HIGH);
    digitalWrite(KILL_SWITCH_RELAY,HIGH);
    
    WiFi.begin(WIFI_SSID,WIFI_PASSWORD);
    dht.begin();
    Serial.println("Connecting...");
}


void loop(){
    useUltrasonicSensor();
    storeFuelValues();

    if(WiFi.status() == WL_CONNECTED && !isConnected){
      Serial.println("connected");
      digitalWrite(LED_BUILTIN,HIGH);
      isConnected=true; 
    }

    if(WiFi.status() != WL_CONNECTED){
      Serial.print('.');
      digitalWrite(LED_BUILTIN,!digitalRead(LED_BUILTIN));
      delay(1000);
      isConnected=false; 
    }

    if(isConnected){
      readTemperatureAndHumidity();
      String generatorState=getGeneratorState();
      if(generatorState == "ON"){
        controlStartHandler(); 
      }
      else if(generatorState == "OFF"){
        controlStopHandler();  
      }
    }

}
