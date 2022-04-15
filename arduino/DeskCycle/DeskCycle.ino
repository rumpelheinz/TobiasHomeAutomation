// arduino-cli compile --fqbn arduino:avr:nano:cpu=atmega328 . && arduino-cli upload -p /dev/ttyUSB0 --fqbn arduino:avr:nano:cpu=atmega328 
unsigned long previousMillis;
int steps;
bool washigh;
// char[32] datain;
// int datainptr;
void setup() {
  // put your setup code here, to run once:
  Serial.flush();
  Serial.begin(9600);
    while(Serial.available() > 0) {
    char t = Serial.read();
  }
  delay(1000);
  Serial.println("DeskCycle");

  String the_path = __FILE__;
  int slash_loc = the_path.lastIndexOf('/');
  String the_cpp_name = the_path.substring(slash_loc+1);
  int dot_loc = the_cpp_name.lastIndexOf('.');
  String the_sketchname = the_cpp_name.substring(0, dot_loc);


//   Serial.println(the_sketchname);
  Serial.print("Compiled on: ");
  Serial.print(__DATE__);
  Serial.print(" at ");
  Serial.print(__TIME__);
  Serial.print("\n");
  Serial.println("Start");
  pinMode(7, INPUT_PULLUP);
  previousMillis = millis();
  washigh = digitalRead(7);
  steps = 0;
//   datainptr = 0;
}

void loop() {
  // put your main code here, to run repeatedly:
  unsigned long currentMillis = millis();
  int sensorVal = digitalRead(7);
    if ((unsigned long)(currentMillis - previousMillis) >= (60000)) {
        if (steps>0){
            Serial.print("t ");
            Serial.println(steps);
        }
        previousMillis=currentMillis;
        steps = 0;
    }
  if (washigh) {
    if (!sensorVal) {
      washigh = false;
      delay(10);
    }
  } else {
    if (sensorVal) {
      washigh = true;
      Serial.println("s");
      steps++;
      delay(10);
    }
  }

}
