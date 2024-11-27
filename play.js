let handPose;
let video;
let hands = [];
let oscillator;
let playing = false;
let limitReset = 1;
let limit = limitReset;
let avgFreq = 440;

function preload() {
  handPose = ml5.handPose();
}

function setup() {
  
  /*let aspectRatio = 640 / 480; // Original video aspect ratio
  let scaledWidth = 1280; // Desired width of the canvas
  let scaledHeight = scaledWidth / aspectRatio; // Maintain aspect ratio
  
  createCanvas(scaledWidth, scaledHeight);*/
  
  createCanvas(640, 480);
  
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  handPose.detectStart(video, gotHands);

  oscillatorSetup();
}

function draw() {

  if (limit > 0) {
    limit -= 1;
    return;
  }
  limit = limitReset;
  

  image(video, 0, 0, width, height);
 
  // Draw divider (optional for debugging)
  //stroke(255);
  //line(width / 2, 0, width / 2, height);
  
  // Loop through detected hands
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    let isLeftHand = hand.handedness === "Left";
    let isRightHand = hand.handedness === "Right";

    for (let j = 0; j < hand.keypoints.length; j++) {
      let keypoint = hand.keypoints[j];
      
      // Draw hand keypoints
      fill(0, 255, 0);
      noStroke();
      circle(keypoint.x, keypoint.y, 10);
    }

    // Left hand controls amplitude
    if (isLeftHand) {
      let leftHandY = hand.keypoints[9].y; // Palm center
      let amplitude = map(leftHandY, height, 0, 0, 1);
      oscillator.amp(amplitude);
      fill(0, 0, 255);
      text(`Amplitude: ${amplitude.toFixed(2)}`, 10, 20);
    }

    // Right hand controls frequency
    if (isRightHand) {
      let rightHandY = hand.keypoints[9].y; // Palm center
      let frequency = map(rightHandY, height, 0, 100, 1000);
      
      avgFreq = (9 * avgFreq + frequency) / 10;
      oscillator.freq(avgFreq);
      fill(255, 0, 0);
      text(`Frequency: ${frequency.toFixed(2)} Hz`, width - 150, 20);
    }
  }
}

function gotHands(results) {
  hands = results;
}

function oscillatorSetup() {
  // Oscillator setup
  oscillator = new p5.Oscillator();
  oscillator.setType('sine');  // 'sine' is the default
  userStartAudio();
  oscillator.start();
  oscillator.freq(440);
  oscillator.amp(0);
  
  let playButton = createButton('Play/Pause');
  playButton.mousePressed(toggle);
}

function toggle() {
  if (!playing) {
    oscillator.amp(0.5, 1);
    playing = true;
  } else {
    oscillator.amp(0, 1);
    playing = false;
  }
}

function createWaveformButtons() {
  const waveforms = ['sine', 'triangle', 'sawtooth', 'square'];
  
  for (let i = 0; i < waveforms.length; i++) {
    let button = createButton(waveforms[i]);
    button.mousePressed(() => changeWaveform(waveforms[i]));
    button.position(10, 10 + i * 30);
  }
}

function changeWaveform(waveform) {
  oscillator.setType(waveform);
  console.log("Waveform changed to ${waveform}.");
}
