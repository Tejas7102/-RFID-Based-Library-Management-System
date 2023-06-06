/*
RFID BASED LIBRARY MANAGEMENT SYSTEM
NODEMCU CONNECTIONS:
--------------------------------------
*/
//~~~LIBRARIES REQUIRED~~~
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <Firebase_ESP_Client.h>
#include <SPI.h>
#include <MFRC522.h>
#include <LiquidCrystal_I2C.h>
#include "addons/TokenHelper.h" // Provide the token generation process info.
#include <NTPClient.h>
#include <WiFiUdp.h>

//~~~CONSTANTS USED IN PROGRAM~~~
//Insert your network credentials*/
#define WIFI_SSID "Cyber-Dude"
#define WIFI_PASSWORD "Dave@1717"

//Insert Firebase project API Key
#define API_KEY "AIzaSyBRgdk1s216-tRYdPoTUmxFUlRSVrWwWKI"

//Define the project ID 
#define FIREBASE_PROJECT_ID "dlms-67462"

//Insert Authorized Email and Corresponding Password
#define USER_EMAIL "admin@gmail.com"
#define USER_PASSWORD "admin1"

//RC522 PIN DEFINATIONS
#define SS_PIN 2
#define RST_PIN 16

//INPUT BUTTON PIN DEFINATIONS
#define button1 0
#define button2 10

//Define Firebase objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

//Define Firebase JSON object
FirebaseJson payload;
FirebaseJson jsonContent;

//Get the data from FirebaseJson object 
FirebaseJsonData jsonData;

//Instance of the class
MFRC522 rfid(SS_PIN, RST_PIN); 

//Set the LCD address to 0x27 for a 16 chars and 2 line display
LiquidCrystal_I2C lcd(0x27,16,2);   

//DEFINING NTP CLIENT
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org"); 

//Structures to fetch store student and book data
struct student {
  int bookIssued;
  String studentUID; 
  String name;
  String id;
}studentData;
struct book {
  String bookUID;
  String serialNo;
  String title;
  String status;
}bookData;

//GLOBAL VARIABLES
String errors;
String content;
int opt;
bool isRead;

// Initialize WiFi
void initializeWIFI() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("CONNECTING TO WIFI");
  lcd.clear();
  printLCD("WIFI CONNECTING",0,0);
  int count=0;
  while (WiFi.status() != WL_CONNECTED) {
    if(count%4==0){
      lcd.clear();
      printLCD("WIFI CONNECTING",0,0);
    }
    delay(1000);
    Serial.print('.');
    printLCD(".",(count%4),1);
    count++;
  }
  Serial.println();
  Serial.println("WIFI CONNECTED SUCCESSFULLY");
  lcd.clear();
  printLCD("WIFI CONNECTED",0,0);
  printLCD("SUCCESSFULLY",0,1);
  delay(1000);
}

void initializeFirebase() {
  config.api_key = API_KEY; //Assign the api key (required)
  auth.user.email = USER_EMAIL; //Assign the user sign in credentials
  auth.user.password = USER_PASSWORD;
  //Assign the callback function for the long running token generation task
  config.token_status_callback = tokenStatusCallback; //see addons/TokenHelper.h
  fbdo.setBSSLBufferSize(2048 /* Rx buffer size in bytes from 512 - 16384 */, 2048 /* Tx buffer size in bytes from 512 - 16384 */);
  fbdo.setResponseSize(2048);// Limit the size of response payload to be collected in FirebaseData
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  lcd.clear();
  printLCD("FIREBASE READY:",0,0);
  if(Firebase.ready()) {
    printLCD("TRUE",0,1);
    delay(1000);
  }
  else {
    printLCD("FALSE",0,1);
    delay(1000);
    initializeFirebase();
  }
}

void menu() {
  content="";
  Serial.println("1. ISSUE | 2. RETURN");
  Serial.println("Select Option: ");
  lcd.clear();
  printLCD("1.ISSUE|2.RETURN",0,0);
  printLCD("PRESS BUTTON",0,1);
  isRead = true;
  buttonInput();
  Serial.println(opt);
  lcd.clear();
  if(opt==1) { 
    Serial.println("ISSUE BOOK");
    lcd.clear();
    printLCD("ISSUE BOOK",0,0);
    delay(1000);
    if(student() && book()) {
      issueBook();
      return;
    }
    else {
      return;
    }
  }
  else if(opt==2) { 
    Serial.println("RETURN BOOK");
    lcd.clear();
    printLCD("RETURN BOOK",0,0);
    delay(1000);
    if(student() && book()) {
      returnBook();
      return;
    }
    else {
      return;
    }
  }
}

bool student() {
  Serial.println("SCAN STUDENT ID");
  lcd.clear();
  printLCD("SCAN STUDENT ID",0,0);
  while(content=="")
    getUID();
  studentData.studentUID = content;
  content="";
  if(fetchDocument("mapStudent/"+studentData.studentUID)) {
    studentData.id = getStringValueJSON("fields/id/stringValue");
    getStudentDetails();
    lcd.clear();
    printLCD("STUDENT ID",0,0);
    printLCD(studentData.id,0,1);
    delay(1000);
    if(studentData.bookIssued == 5) {
      Serial.println("ISSUE LIMIT EXCEED");
      lcd.clear();
      printLCD("ISSUE LIMIT EXCEED",0,0);
      delay(1000);
      return false;
    }
    return true;
  }
  Serial.println("ID NOT VALID");
  lcd.clear();
  printLCD("ID NOT VALID",0,0);
  delay(1000);
  return false;
}

bool book() {
  lcd.clear();
  Serial.println("SCAN BOOK");
  printLCD("SCAN BOOK",0,0);  
  while(content=="")
    getUID();
  bookData.bookUID = content;
  content="";
  if(fetchDocument("mapBook/"+bookData.bookUID)) {
    bookData.serialNo = getStringValueJSON("fields/serialNo/stringValue");
    getBookDetails();
    printLCD("BOOK SERIAL NO.",0,0);
    printLCD(bookData.serialNo,0,1);
    delay(1000);
    if(bookData.status == "issued" && opt == 1) {
      Serial.println("BOOK ALREADY ISSUED");
      lcd.clear();
      printLCD("BOOK ALREADY ISSUED",0,0);
      delay(1000);
      return false;
    }
    return true;
  }
  Serial.println("BOOK NOT VALID");
  lcd.clear();
  printLCD("BOOK NOT VALID",0,0);
  delay(1000);
  return false;
}

void issueBook(){
  int counter = 1;
  bool emptySlot = false;
  String jsonPath;
  String key;
  fetchDocument("studentData/"+studentData.id);
  while(emptySlot==false && counter<6) {
    jsonPath = "fields/issueRecord/mapValue/fields/slot"+String(counter)+"/mapValue/fields/serialNo/stringValue";
    if(getStringValueJSON(jsonPath)=="null") {
      Serial.println(counter);
      emptySlot = true;
    }
    counter++;
  }
  lcd.clear();
  printLCD("PROCESSING",0,0);
  printLCD("PLEASE WAIT...",0,1);
  counter--;
  jsonPath = "fields/issueRecord/mapValue/fields/slot"+String(counter)+"/mapValue/fields/serialNo/stringValue";
  key = "issueRecord.slot"+String(counter)+".serialNo";
  //INSERTING SERIAL NUMBER IN ISSUE RECORD
  writeStringValueJSON(jsonPath, bookData.serialNo);
  patchDocument("studentData/"+studentData.id, key);
  //INSERTING DATE IN ISSUE RECORD
  jsonPath = "fields/issueRecord/mapValue/fields/slot"+String(counter)+"/mapValue/fields/issueDate/stringValue";
  key = "issueRecord.slot"+String(counter)+".issueDate";
  writeStringValueJSON(jsonPath, getDate());
  patchDocument("studentData/"+studentData.id, key);
  //INSERTING TIME IN ISSUE RECORD
  jsonPath = "fields/issueRecord/mapValue/fields/slot"+String(counter)+"/mapValue/fields/issueTime/stringValue";
  key = "issueRecord.slot"+String(counter)+".issueTime";
  writeStringValueJSON(jsonPath, getTime());
  patchDocument("studentData/"+studentData.id, key);
  //UPDATING NUMBER OF BOOKS ISSUED
  jsonPath = "fields/bookIssued/integerValue";
  key = "bookIssued";
  writeStringValueJSON(jsonPath, String(++studentData.bookIssued));
  patchDocument("studentData/"+studentData.id, key);
  //UPDATING BOOKS STATUS
  jsonPath = "fields/status/stringValue";
  key = "status";
  writeStringValueJSON(jsonPath, "issued");
  patchDocument("bookData/"+bookData.serialNo, key);
  Serial.println("BOOK ISSUED SUCCESSFULLY");
  lcd.clear();
  printLCD("BOOK ISSUED",0,0);
  printLCD("SUCCESSFULLY",0,1);
  delay(1000);
}

void returnBook(){
  int bookSlot = 1;
  bool foundSlot = false;
  String jsonPath;
  String key;
  fetchDocument("studentData/"+studentData.id);
  while(foundSlot==false && bookSlot<6) {
    jsonPath = "fields/issueRecord/mapValue/fields/slot"+String(bookSlot)+"/mapValue/fields/serialNo/stringValue";
    if(getStringValueJSON(jsonPath)==bookData.serialNo) {
      Serial.println(bookSlot);
      foundSlot = true;
    }
    bookSlot++;
  }
  if(bookSlot==6 && foundSlot==false){
    Serial.println("RECORD NOT FOUND");
    lcd.clear();
    printLCD("RECORD NOT FOUND",0,0);
    delay(1000);
    return;
  }
  bookSlot--;
  if(foundSlot) {
    int counter = 1;
    bool emptySlot = false;
    while(! emptySlot && counter<6) {
      jsonPath = "fields/returnRecord/mapValue/fields/slot"+String(counter)+"/mapValue/fields/serialNo/stringValue";
      if(getStringValueJSON(jsonPath)=="null") {
        Serial.println(counter);
        emptySlot = true;
      }
      counter++;
    }
    counter--;
    lcd.clear();
    printLCD("PROCESSING",0,0);
    printLCD("PLEASE WAIT...",0,1);
    key = "returnRecord.slot"+String(counter)+".serialNo";
    //INSERTING SERIAL NUMBER IN RETURN RECORD
    writeStringValueJSON(jsonPath, bookData.serialNo);
    patchDocument("studentData/"+studentData.id, key);
    //INSERTING ISSUE DATE IN RETURN RECORD
    jsonPath = "fields/returnRecord/mapValue/fields/slot"+String(counter)+"/mapValue/fields/issueDate/stringValue";
    key = "returnRecord.slot"+String(counter)+".issueDate";
    writeStringValueJSON(jsonPath, getStringValueJSON("fields/issueRecord/mapValue/fields/slot"+String(bookSlot)+"/mapValue/fields/issueDate/stringValue"));
    patchDocument("studentData/"+studentData.id, key);
    //INSERTING ISSUE TIME IN RETURN RECORD
    jsonPath = "fields/returnRecord/mapValue/fields/slot"+String(counter)+"/mapValue/fields/issueTime/stringValue";
    key = "returnRecord.slot"+String(counter)+".issueTime";
    writeStringValueJSON(jsonPath, getStringValueJSON("fields/issueRecord/mapValue/fields/slot"+String(bookSlot)+"/mapValue/fields/issueTime/stringValue"));
    patchDocument("studentData/"+studentData.id, key);
    //INSERTING RETURN DATE IN RETURN RECORD
    jsonPath = "fields/returnRecord/mapValue/fields/slot"+String(counter)+"/mapValue/fields/returnDate/stringValue";
    key = "returnRecord.slot"+String(counter)+".returnDate";
    writeStringValueJSON(jsonPath, getDate());
    patchDocument("studentData/"+studentData.id, key);
    //INSERTING RETURN TIME IN RETURN RECORD
    jsonPath = "fields/returnRecord/mapValue/fields/slot"+String(counter)+"/mapValue/fields/returnTime/stringValue";
    key = "returnRecord.slot"+String(counter)+".returnTime";
    writeStringValueJSON(jsonPath, getTime());    
    patchDocument("studentData/"+studentData.id, key);
    
    //UPDATE FIELDS TO NULL
    jsonPath = "fields/issueRecord/mapValue/fields/slot"+String(bookSlot)+"/mapValue/fields/serialNo/stringValue";
    key = "issueRecord.slot"+String(bookSlot)+".serialNo";
    writeStringValueJSON(jsonPath, "null");
    patchDocument("studentData/"+studentData.id, key);
    jsonPath = "fields/issueRecord/mapValue/fields/slot"+String(bookSlot)+"/mapValue/fields/issueDate/stringValue";
    key = "issueRecord.slot"+String(bookSlot)+".issueDate";
    writeStringValueJSON(jsonPath, "null");
    patchDocument("studentData/"+studentData.id, key);
    jsonPath = "fields/issueRecord/mapValue/fields/slot"+String(bookSlot)+"/mapValue/fields/issueTime/stringValue";
    key = "issueRecord.slot"+String(bookSlot)+".issueTime";
    writeStringValueJSON(jsonPath, "null");
    patchDocument("studentData/"+studentData.id, key);
    jsonPath = "fields/bookIssued/integerValue";
    key = "bookIssued";
    writeStringValueJSON(jsonPath, String(--bookSlot));
    patchDocument("studentData/"+studentData.id, key);
    jsonPath = "fields/status/stringValue";
    key = "status";
    if(fetchDocument("bookData/"+bookData.serialNo)) {}
    writeStringValueJSON(jsonPath, "available");
    patchDocument("bookData/"+bookData.serialNo, key);
    Serial.println("BOOK RETURNED SUCCESSFULLY");
    lcd.clear();
    printLCD("BOOK RETURNED",0,0);
    printLCD("SUCCESSFULLY",0,1);
    delay(1000);
  }
}

bool getStudentDetails(){
  if(fetchDocument("studentData/"+studentData.id)) {
    Serial.println("Document Fetched");
    Serial.println("Student Details:");
    studentData.name = getStringValueJSON("fields/name/stringValue");
    studentData.bookIssued = (getStringValueJSON("fields/bookIssued/integerValue")).toInt();
    Serial.println("ID: " + studentData.id);
    Serial.println("Name: " + studentData.name);
    Serial.println("Books Issued: " + String(studentData.bookIssued));
    return true;
  }
  return false;
}

bool getBookDetails(){
  if(fetchDocument("bookData/"+bookData.serialNo)) {
    Serial.println("Document Fetched");
    Serial.println("Book Details:");
    bookData.title = getStringValueJSON("fields/title/stringValue");
    bookData.status = getStringValueJSON("fields/status/stringValue");
    Serial.println("Serial No: " + bookData.serialNo);
    Serial.println("Title: " + bookData.title);
    Serial.println("Status: " + bookData.status);
    return true;
  }
  return false;
}

bool fetchDocument(String documentPath) {
  if(Firebase.Firestore.getDocument(&fbdo, FIREBASE_PROJECT_ID, "", documentPath.c_str())) {
    payload.setJsonData(fbdo.payload().c_str());
    return true;
  }
  return false;
}

void createDocument(String documentPath) {
  Firebase.Firestore.createDocument(&fbdo, FIREBASE_PROJECT_ID, "" /* databaseId can be (default) or empty */, documentPath.c_str(), jsonContent.raw());
}

bool patchDocument(String documentPath, String key) {
  if(Firebase.Firestore.patchDocument(&fbdo, FIREBASE_PROJECT_ID, "", documentPath.c_str(), jsonContent.raw(), key)) {
    Serial.println(jsonContent.raw());
    return true;
  }
  return false;
}

bool validateJSONPath(String jsonPath) {
  if(payload.get(jsonData, jsonPath, true)) {
    return true;
  }  
  return false;
}

String getStringValueJSON(String jsonPath) {
  payload.get(jsonData, jsonPath, true);
  return jsonData.stringValue;
}

void writeStringValueJSON(String jsonPath, String value) {
  jsonContent.clear();
  jsonContent.set(jsonPath,value);
}

void getUID(){
  if ( ! rfid.PICC_IsNewCardPresent())
    return;
  if ( ! rfid.PICC_ReadCardSerial())
    return;
  for (byte i = 0; i < rfid.uid.size; i++){
    content.concat(String(rfid.uid.uidByte[i]<0x10?"0":""));
    content.concat(String(rfid.uid.uidByte[i],HEX));
  }
  rfid.PICC_HaltA();  // Halt PICC
  rfid.PCD_StopCrypto1();  // Stop encryption on PCD
}

void printLCD(String message, int i, int j) {
  lcd.setCursor(i,j);
  lcd.print(message);
}

void buttonInput() {
  while(isRead) {
    delay(100);
    if(digitalRead(button1)==LOW) {
      opt=1;
      isRead=false;
    }
    else if(digitalRead(button2)==LOW) {
      opt=2;
      isRead=false;
    }
    else {
      continue;
    }
  }
}

String getDate() {
  timeClient.update();
  time_t epochTime = timeClient.getEpochTime();
  //Get a time structure
  struct tm *ptm = gmtime ((time_t *)&epochTime); 
  int monthDay = ptm->tm_mday;
  int currentMonth = ptm->tm_mon+1;
  int currentYear = ptm->tm_year+1900;
  String currentDate =  String(monthDay)+"/"+String(currentMonth)+"/"+String(currentYear);
  return currentDate;
}

String getTime() {
  timeClient.update();
  return timeClient.getFormattedTime();
} 

void setup() {
  delay(1000);
  Serial.begin(115200);
  //Init LCD
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0,0);
  lcd.clear();
  printLCD("STARTING SETUP",0,0);
  Serial.println();
  Serial.println("STARTING SETUP");
  delay(1000);
  // Init SPI bus
  SPI.begin();
  // Init MFRC522 
  rfid.PCD_Init();
  // Initialize WiFi
  initializeWIFI();
  // Initialize Firebase
  initializeFirebase();
  //INPUT BUTTON PINMODE SETUP
  pinMode(button1, INPUT_PULLUP);
  pinMode(button2, INPUT_PULLUP);
  // Initialize a NTPClient to get time
  timeClient.begin();
  timeClient.setTimeOffset(19800);
  // if(! fetchDocument("issueRecord/"+getDate())){
  //   jsonContent.clear();
  //   jsonContent.set("fields/createdAt/stringValue", getTime());
  //   createDocument("issueRecord/"+getDate());
  // }
  // else {
  //   Serial.println("Issue Record Already Exisits...!");
  // }
  // if(! fetchDocument("returnRecord/"+getDate())){
  //   jsonContent.clear();
  //   jsonContent.set("fields/createdAt/stringValue", getTime());
  //   createDocument("returnRecord/"+getDate());
  // }
  // else {
  //   Serial.println("Return Record Already Exisits...!");
  // }
  // bookData.serialNo = "0000000000";
  // studentData.id = "20dcs015";
  // jsonContent.clear();
  // jsonContent.set("fields/"+bookData.serialNo, "");
  // String key = bookData.serialNo;
  // patchDocument("issueRecord/"+getDate(), key);
}

void loop() {
  menu();
}