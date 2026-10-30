"use strict";
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const mascot = document.querySelector("#hero-mascot");
const petButton = document.querySelector("#hero-pet");
const speech = document.querySelector("#hero-speech");
const lines = ["なでてくれて、うれしい！", "いっしょに、おえかきしよ。", "きみは、なにがすき？", "えへへ。ありがとう！"];
let greeting = 0, petTimer;
function celebrate(x, y) {
  if (reducedMotion.matches) return;
  const layer = document.querySelector("#confetti");
  const colors = ["#fa8fae", "#d4fb48", "#85d7a7", "#a0b9ff", "#20211e"];
  for (let i = 0; i < 18; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-bit";
    piece.style.cssText = `left:${x}px;top:${y}px;background:${colors[i % colors.length]};--dx:${Math.round((Math.random() - .5) * 300)}px;--dy:${Math.round(80 + Math.random() * 180)}px`;
    layer.append(piece); setTimeout(() => piece.remove(), 1100);
  }
}
petButton.addEventListener("click", () => {
  clearTimeout(petTimer);
  speech.textContent = lines[greeting++ % lines.length];
  mascot.classList.remove("petting");
  void mascot.offsetWidth;
  mascot.classList.add("petting");
  const rect = petButton.getBoundingClientRect();
  celebrate(rect.left + rect.width / 2, rect.top + 80);
  petTimer = setTimeout(() => mascot.classList.remove("petting"), 800);
});
const canvas = document.querySelector("#drawing");
const context = canvas.getContext("2d", { willReadFrequently: true });
context.imageSmoothingEnabled = false;
const guide = document.querySelector("#drawing-guide");
const message = document.querySelector("#drawing-message");
const animateButton = document.querySelector("#animate");
const undoButton = document.querySelector("#undo");
const sampleButton = document.querySelector("#sample");
let color = "#532f21", erasing = false, drawing = false, lastPoint = null, moving = false;
let history = [], activePointer = null, sampleGeneration = 0;
function hasDrawing() { const data = context.getImageData(0, 0, 64, 64).data; for (let i = 3; i < data.length; i += 4) if (data[i]) return true; return false; }
function update() { guide.classList.toggle("hidden", hasDrawing()); undoButton.disabled = history.length === 0; }
function remember() { history.push(context.getImageData(0, 0, 64, 64)); if (history.length > 30) history.shift(); }
function stopMoving() { moving = false; canvas.classList.remove("moving"); animateButton.innerHTML = "うごかす！ <span>✳</span>"; }
function point(event) { const r = canvas.getBoundingClientRect(); return {x: Math.max(0, Math.min(63, Math.floor((event.clientX-r.left)*64/r.width))), y: Math.max(0, Math.min(63, Math.floor((event.clientY-r.top)*64/r.height)))}; }
function dot(x, y) { if (erasing) context.clearRect(x-1, y-1, 3, 3); else { context.fillStyle = color; context.fillRect(x, y, 2, 2); } }
function line(a, b) { let x = a.x, y = a.y, dx = Math.abs(b.x-x), dy = -Math.abs(b.y-y), sx = x < b.x ? 1 : -1, sy = y < b.y ? 1 : -1, err = dx+dy; for (;;) { dot(x,y); if (x === b.x && y === b.y) break; const e = 2*err; if (e >= dy) { err += dy; x += sx; } if (e <= dx) { err += dx; y += sy; } } }
canvas.addEventListener("pointerdown", event => { if (activePointer !== null || event.button > 0) return; sampleGeneration++; stopMoving(); remember(); activePointer = event.pointerId; canvas.setPointerCapture(event.pointerId); drawing = true; lastPoint = point(event); dot(lastPoint.x,lastPoint.y); update(); message.textContent = "いいね。そのまま、自由に！"; });
canvas.addEventListener("pointermove", event => { if (!drawing || event.pointerId !== activePointer) return; const next = point(event); line(lastPoint,next); lastPoint = next; });
function endStroke(event) { if (event.pointerId !== activePointer) return; drawing = false; activePointer = null; lastPoint = null; update(); }
canvas.addEventListener("pointerup", endStroke); canvas.addEventListener("pointercancel", endStroke); canvas.addEventListener("lostpointercapture", endStroke);
document.querySelectorAll(".color").forEach(button => button.addEventListener("click", () => { erasing = false; color = button.dataset.color; document.querySelectorAll(".color").forEach(b => { const selected = b === button; b.classList.toggle("selected",selected); b.setAttribute("aria-pressed",String(selected)); }); document.querySelector("#eraser").setAttribute("aria-pressed","false"); }));
document.querySelector("#eraser").addEventListener("click", event => { erasing = !erasing; event.currentTarget.setAttribute("aria-pressed",String(erasing)); document.querySelectorAll(".color").forEach(b => { const selected = !erasing && b.dataset.color === color; b.classList.toggle("selected",selected); b.setAttribute("aria-pressed",String(selected)); }); });
document.querySelector("#clear").addEventListener("click", () => { sampleGeneration++; stopMoving(); if (hasDrawing()) remember(); context.clearRect(0,0,64,64); update(); message.textContent = "まっさら！ また、すきな子を描こう。"; });
undoButton.addEventListener("click", () => { sampleGeneration++; stopMoving(); const previous = history.pop(); if (previous) context.putImageData(previous,0,0); update(); message.textContent = "ひとつ前に、もどったよ。"; });
sampleButton.addEventListener("click", async () => {
  const generation = ++sampleGeneration;
  sampleButton.disabled = true;
  const img = new Image(); img.src = "assets/mascot-64.png";
  try { await img.decode(); if (generation !== sampleGeneration) return; stopMoving(); remember(); context.clearRect(0,0,64,64); context.drawImage(img,0,0,64,64); update(); message.textContent = "看板ペットがきたよ！ 描き足しても、いいんだよ。"; }
  catch { message.textContent = "お手本を読み込めませんでした。もう一度ためしてね。"; }
  finally { sampleButton.disabled = false; }
});
animateButton.addEventListener("click", () => {
  if (!hasDrawing()) { message.textContent = "まずは線を描くか、「お手本をよぶ」を押してね。"; return; }
  if (moving) { stopMoving(); message.textContent = "ちょっと、ひとやすみ。"; return; }
  moving = true; canvas.classList.add("moving"); animateButton.innerHTML = "ひとやすみ <span>Ⅱ</span>";
  message.textContent = reducedMotion.matches ? "きみだけの子が、できた！ 動きを抑える設定で表示中です。" : "やっほー！ きみの絵が、うごいた！";
  const rect = canvas.getBoundingClientRect(); celebrate(rect.left+rect.width/2,rect.top+40);
});
update();
