// https://github.com/Arduino-IRremote/Arduino-IRremote
#include <IRremote.h>
// https://github.com/adafruit/DHT-sensor-library
#include "DHT.h"

IRsend IrSender;

#define lightToggleButton 3 //PWM3
#define volumeUpButton 23   //PWM3
#define volumeDownButton 22 //PWM3
// #define muteToggleButton 25   //PWM3
#define previousSongButton 24 //PWM3
#define pauseToggleButton 25
#define nextSongButton 26 //PWM3

#define DHTPIN 5      // what pin we're connected to
#define DHTTYPE DHT22 // DHT 22  (AM2302)
#include <Wire.h>

#include <LiquidCrystal_I2C.h>



#define on1  9383020
#define off1 9383012
#define on2  9383018
#define off2 9383010
#define on3  9383017
#define off3  9383009
#define on4  9383021
#define off4 9383013
#define onall 9383019
#define offall 9383011
#include <RCSwitch.h>
RCSwitch mySwitch = RCSwitch();
#define rf433sender 12


// #define IR_SEND_PIN 0 (PWM 9)
bool on = 0;
long lastLightToggle = millis();
long lastButtonPress = millis();
long lastTempRead = millis();


// #if defined(ESP32)
// int IR_RECEIVE_PIN = 15;
// #elif defined(ARDUINO_AVR_PROMICRO)
// int IR_RECEIVE_PIN = 10;
// #else
int IR_RECEIVE_PIN = 11;
// #endif
IRrecv IrReceiver(IR_RECEIVE_PIN);
DHT dht(DHTPIN, DHTTYPE);
char inputbuffer[256];
char artist[256];
char song[256];
LiquidCrystal_I2C lcd(0x27, 20, 4); // set the LCD address to 0x27 for a 16 chars and 2 line display

void setup()
{
    pinMode(lightToggleButton, INPUT_PULLUP);
    pinMode(volumeUpButton, INPUT_PULLUP);
    pinMode(volumeDownButton, INPUT_PULLUP);
    // pinMode(muteToggleButton, INPUT_PULLUP);
    pinMode(previousSongButton, INPUT_PULLUP);
    pinMode(pauseToggleButton, INPUT_PULLUP);
    pinMode(nextSongButton, INPUT_PULLUP);


    
    
    
    Serial.begin(9600);
    Serial.println(F("START " __FILE__ " from " __DATE__));
    IrReceiver.enableIRIn();
    Serial.print("IR Send pin         ");
    Serial.println(IR_SEND_PIN);
    Serial.print("IR Receive pin      ");
    Serial.println(IR_RECEIVE_PIN);
    Serial.print("LightToggleButton   ");
    Serial.print(lightToggleButton);
    Serial.println();
    Serial.print("volumeUpButton      ");
    Serial.print(volumeUpButton);
    Serial.println();
    Serial.print("volumeDownButton    ");
    Serial.print(volumeDownButton);
    Serial.println();
    // Serial.print("muteToggleButton    ");
    // Serial.print(muteToggleButton);
    // Serial.println();
    Serial.print("nextSongButton      ");
    Serial.print(nextSongButton);
    Serial.println();
    Serial.print("pauseToggleButton   ");
    Serial.print(pauseToggleButton);
    Serial.println();
    Serial.print("previousSongButton  ");
    Serial.print(previousSongButton);
    Serial.println();
    Serial.print("DHTPin              ");
    Serial.print(DHTPIN);
    Serial.println();
    artist[0] = '\0';
    song[0] = '\0';
    dht.begin();
    lcd.init(); // initialize the lcd
    // Print a message to the LCD.
    lcd.backlight();
    lcd.setCursor(3, 0);
    lcd.print("Hello, world!");
    lcd.setCursor(2, 1);
    lcd.print("Ywrobot Arduino!");
    lcd.setCursor(0, 2);
    lcd.print("Arduino LCM IIC 2004");
    lcd.setCursor(2, 3);
    lcd.print("Power By Ec-yuan!");

//    pinMode(rf433sender,OUTPUT);
    mySwitch.enableTransmit(rf433sender);
    mySwitch.setProtocol(1);
    // mySwitch.setPulseLength(186);
        mySwitch.setPulseLength(130);

}
int bufindex = 0;
char tmpbuf[256];
void loop()
{
    while (Serial.available() > 0)
    {
        char nextchar = Serial.read();
        if (bufindex == 255)
        {
            bufindex = 0;
        }
        if (nextchar == '\n')
        {
            inputbuffer[bufindex] = '\0';
            memcpy(tmpbuf, inputbuffer, bufindex + 1);
            Serial.print("Got: '");
            Serial.print(tmpbuf);
            Serial.println("'");
            parseline(bufindex);
            bufindex = 0;
        }
        else
        {
            inputbuffer[bufindex] = nextchar;
            bufindex += 1;
        }
    }
    checkButtonPress("volumeUp", volumeUpButton);
    checkButtonPress("volumeDown", volumeDownButton);
    // checkButtonPress("muteToggleButton",muteToggleButton);
    checkButtonPress("previousSong", previousSongButton);
    checkButtonPress("pauseToggle", pauseToggleButton);
    checkButtonPress("nextSong", nextSongButton);
    if (!digitalRead(lightToggleButton))
    {
        toggleLight();
    }
    if (IrReceiver.decode())
    {
        storeCode();
        IrReceiver.resume(); // resume receiver
    }

    // Serial.println("startsend");
    // mySwitch.send(on1, 24);
    // delay(5000);  
    // Serial.println("Sentoan");
    // mySwitch.send(off1, 24);
    // delay(5000);  
    checkTemperature();
    scroll();
}
void checkTemperature()
{
    if (lastTempRead + 60000 < millis())
    {
        float h = dht.readHumidity();
        float t = dht.readTemperature();

        // Check if any reads failed and exit early (to try again).
        if (isnan(h) || isnan(t))
        {
            return;
        }

        Serial.print("Humidity: ");
        Serial.print(h);
        Serial.print(" %, ");
        Serial.print("Temperature: ");
        Serial.print(t);
        Serial.println(" *C");
        lastTempRead = millis();
    }
}
long lastscroll=millis();
void scroll()
{
    if ( lastscroll+ 2000 < millis())
    {
        // lcd.autoscroll();
        lastscroll = millis();
    }
}



void parseline(int length)
{
    const char s[2] = " ";
    char *token;
    token = strtok(tmpbuf, s);
    if (!strcmp(token, "lightOn"))
    {
        turnOnLight();
    }
    else if (!strcmp(token, "socket"))
    {
        char *pEnd;
        char *pEnd2;
        int number = strtol(token+7, &pEnd, 10);
        int on = strtol(pEnd+1, &pEnd2, 10);
        switchSocket(number,on);
        Serial.print("Turned socket ");
        Serial.print(number);
        Serial.println(on? " ON":" OFF");

    }
    else if (!strcmp(token, "lightOff"))
    {
        turnOffLight();
    }
    else if (!strcmp(token, "art"))
    {

        int i = 0;
        while ((token = strtok(NULL, s)) != NULL)
        {
            strcpy(artist + i, token);
            i += strlen(token) + 1;
            artist[i - 1] = ' ';
        }
        artist[i - 1] = '\0';
        artist[20] = '\0';

        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print(song);
        lcd.setCursor(0, 1);
        lcd.print(artist);
        // lcd.autoscroll();
    }
    else if (!strcmp(token, "song"))
    {
        int i = 0;
        while ((token = strtok(NULL, s)) != NULL)
        {
            strcpy(song + i, token);
            i += strlen(token) + 1;
            song[i - 1] = ' ';
        }
        song[i - 1] = '\0';
        song[20] = '\0';

        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print(song);
        lcd.setCursor(0, 1);
        lcd.print(artist);
        // lcd.autoscroll();
    }
}
struct parsedline
{
    int length;
};

void checkButtonPress(char *command, int pin)
{
    if (lastButtonPress + 200 < millis())
    {
        if (!digitalRead(pin))
        {
            Serial.println(command);
            lastButtonPress = millis();
        }
    }
}

void turnOnLight()
{
    IrSender.sendNEC(0xFFE01F, 32);
}
void turnOffLight()
{
    IrSender.sendNEC(0xFF609F, 32);
}


void switchSocket(int number, bool on)
{
    long int code=on1;
    if (number==0 ) code= on? onall:offall;
    if (number==1 ) code= on? on1:off1;
    if (number==2 ) code= on? on2:off2;
    if (number==3 ) code= on? on3:off3;
    if (number==4 ) code= on? on4:off4;
    mySwitch.send(code, 24);

}


void toggleLight()
{

    if (lastLightToggle + 500 < millis())
    {
        lastLightToggle = millis();
        if (on)
        {
            turnOnLight();
            Serial.println("turned on");
        }
        else
        {
            turnOffLight();
            Serial.println("turned off");
        }
        on = !on;
    }
}

int codeType = -1;                        // The type of code
uint32_t codeValue;                       // The code value if not raw
uint16_t address;                         // The address value if not raw
unsigned int rawCodes[RAW_BUFFER_LENGTH]; // The durations if raw
uint8_t codeLen;                          // The length of the code
int toggle = 0;                           // The RC5/6 toggle state
void storeCode()
{
    if (IrReceiver.results.isRepeat)
    {
        Serial.println("Ignore repeat");
        return;
    }
    codeType = IrReceiver.results.decode_type;
    address = IrReceiver.results.address;

    //  int count = IrReceiver.results.rawlen;
    if (codeType == UNKNOWN)
    {
        Serial.println("Received unknown code, saving as raw");
        codeLen = IrReceiver.results.rawlen - 1;
        // To store raw codes:
        // Drop first value (gap)
        // Convert from ticks to microseconds
        // Tweak marks shorter, and spaces longer to cancel out IR receiver distortion
        for (int i = 1; i <= codeLen; i++)
        {
            if (i % 2)
            {
                // Mark
                rawCodes[i - 1] = IrReceiver.results.rawbuf[i] * MICROS_PER_TICK - MARK_EXCESS_MICROS;
                Serial.print(" m");
            }
            else
            {
                // Space
                rawCodes[i - 1] = IrReceiver.results.rawbuf[i] * MICROS_PER_TICK + MARK_EXCESS_MICROS;
                Serial.print(" s");
            }
            Serial.print(rawCodes[i - 1], DEC);
        }
        Serial.println();
    }
    else
    {
        IrReceiver.printResultShort(&Serial);
        Serial.println();

        codeValue = IrReceiver.results.value;
        codeLen = IrReceiver.results.bits;
    }
}
/*
   IRremote: IRsendDemo - demonstrates sending IR codes with IRsend
   An IR LED must be connected to Arduino PWM pin 3.
   Initially coded 2009 Ken Shirriff http://www.righto.com
*/

// #include <IRremote.h>
// #if defined(__AVR_ATtiny25__) || defined(__AVR_ATtiny45__) || defined(__AVR_ATtiny85__) || defined(__AVR_ATtiny87__) || defined(__AVR_ATtiny167__)
// #include "ATtinySerialOut.h"
// #endif

// IRsend IrSender;

// // On the Zero and others we switch explicitly to SerialUSB
// #if defined(ARDUINO_ARCH_SAMD)
// #define Serial SerialUSB
// #endif

// void setup()
// {
//     pinMode(67, OUTPUT);
//     pinMode(3, INPUT_PULLUP);

//     Serial.begin(9600);
// #if defined(__AVR_ATmega32U4__) || defined(SERIAL_USB) || defined(SERIAL_PORT_USBVIRTUAL)
//     delay(2000); // To be able to connect Serial monitor after reset and before first printout
// #endif
//     // Just to know which program is running on my Arduino
//     Serial.println(F("START " __FILE__ " from " __DATE__));
//     Serial.print(F("Ready to send IR signals at pin "));
//     Serial.println(IR_SEND_PIN);
// }
// bool on = 1;
// void loop()
// {
// #ifdef SEND_NEC_STANDARD
//     static uint8_t sCommand = 9;
//     if (on)
//     {
//         IrSender.sendNEC(0xFFE01F, 32);
//     }
//     else
//     {
//         IrSender.sendNEC(0xFF609F, 32);
//     }
//     on = !on;
//     Serial.println(F("sendNECStandard(0xFF00, sCommand,2)"));
//     sCommand++;
// #else
//     unsigned long tData = 0xa90;
//     // loop for repeats
//     for (int i = 0; i < 3; i++)
//     {
//         IrSender.sendSony(tData, 12);
//         Serial.print(F("sendSony(0x"));
//         Serial.print(tData, HEX);
//         Serial.println(F(", 12)"));
//         //        IrSender.sendJVC(0xC5B8, 16,0); // hex value, 16 bits, no repeat
//         //        delayMicroseconds(50); // see http://www.sbprojects.com/knowledge/ir/jvc.php for information
//         //        IrSender.sendJVC(0xC5B8, 16,1); // hex value, 16 bits, repeat
//         //        Serial.println(F("sendJVC(9xC5B8, 16)"));

//         delay(40);
//     }
//     tData++;
// #endif
//     Serial.println(digitalRead(A3));
//     delay(5000); //5 second delay between each signal burst
//       digitalWrite(67, HIGH); // sets the digital pin 13 on
//   delay(1000);            // waits for a second
//   digitalWrite(67, LOW);  // sets the digital pin 13 off
//   delay(1000);
// }