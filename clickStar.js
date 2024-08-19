sleep(5000);
let maxLimit = 2500;
let hasStarCount = 0;
while (1) {
  let x = random(device.width / 2 - 20, device.width / 2 + 20);
  let y = random(device.height / 2 - 50, device.height / 2);
  sleep(random(100, 200));
  press(x, y, 1);
  hasStarCount++;
}
