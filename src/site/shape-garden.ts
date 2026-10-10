import type p5 from 'p5';

type ShapeKind = 'circle' | 'rectangle' | 'triangle' | 'star' | 'words';
type MotionKind = 'still' | 'drift' | 'bounce' | 'orbit' | 'pulse';
type InputMode = 'keyboard' | 'mouse' | 'face';
type AltRole = 'informative' | 'decorative';

interface GardenItem {
  id: number;
  kind: ShapeKind;
  label: string;
  color: string;
  size: number;
  x: number;
  y: number;
  motion: MotionKind;
  motionApproved: boolean;
  intention: string;
  description: string;
  altRole: AltRole;
  altText: string;
  phase: number;
}

interface ActionEntry {
  action: string;
  detail: string;
  time: string;
}

interface FacePoint {
  x: number;
  y: number;
}
interface FaceResult {
  keypoints?: FacePoint[];
}
interface FaceModel {
  detectStart(video: HTMLVideoElement, callback: (faces: FaceResult[]) => void): void;
  detectStop?: () => void;
}
interface Ml5Api {
  faceMesh(options: { maxFaces: number }): Promise<FaceModel> | FaceModel;
}
type Ml5Window = Window & { ml5?: Ml5Api };

const byId = <T extends HTMLElement>(id: string): T => {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing garden control: ${id}`);
  return node as T;
};
const clamp = (value: number, min = 0.06, max = 0.94) => Math.max(min, Math.min(max, value));

export function mountShapeGarden(): void {
  const status = byId<HTMLElement>('garden-status');
  const itemsList = byId<HTMLUListElement>('garden-objects');
  const description = byId<HTMLElement>('garden-scene-description');
  const logList = byId<HTMLOListElement>('garden-action-log');
  const codeOutput = byId<HTMLElement>('garden-code-output');
  const copyButton = byId<HTMLButtonElement>('garden-copy-code');
  const downloadButton = byId<HTMLButtonElement>('garden-download-code');
  const modeHelp = byId<HTMLElement>('garden-mode-help');
  const cameraControls = byId<HTMLElement>('garden-camera-controls');
  const cameraStart = byId<HTMLButtonElement>('garden-camera-start');
  const cameraStop = byId<HTMLButtonElement>('garden-camera-stop');
  const video = byId<HTMLVideoElement>('garden-camera-preview');
  const movementGroup = byId<HTMLElement>('garden-move-controls');

  const inputs = {
    intention: byId<HTMLTextAreaElement>('garden-intention'),
    description: byId<HTMLTextAreaElement>('garden-description'),
    altRole: byId<HTMLSelectElement>('garden-alt-role'),
    altText: byId<HTMLTextAreaElement>('garden-alt-text'),
    color: byId<HTMLInputElement>('garden-color'),
    size: byId<HTMLInputElement>('garden-size'),
    sizeValue: byId<HTMLOutputElement>('garden-size-value'),
    motion: byId<HTMLSelectElement>('garden-motion'),
    approval: byId<HTMLInputElement>('garden-motion-approval'),
    animate: byId<HTMLInputElement>('garden-animate'),
  };

  const actions: ActionEntry[] = [];
  const items: GardenItem[] = [];
  let selectedId: number | null = null;
  let nextId = 1;
  let currentMode: InputMode = 'keyboard';
  let faceModel: FaceModel | null = null;
  let stream: MediaStream | null = null;
  let cameraBusy = false;
  let lastFaceZone = '';
  let lastLoggedFaceZone = '';
  let lastFaceMove = 0;
  let scene: p5 | null = null;
  let sceneRefresh = () => {};

  const selected = () => items.find((item) => item.id === selectedId) ?? null;
  const record = (action: string, detail: string) => {
    actions.push({ action, detail, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) });
    if (actions.length > 40) actions.shift();
    renderLog();
    renderCode();
  };
  const announce = (message: string) => {
    status.textContent = message;
  };
  function renderLog(): void {
    logList.replaceChildren();
    for (const entry of actions) {
      const li = document.createElement('li');
      li.textContent = `${entry.time}: ${entry.action} — ${entry.detail}`;
      logList.append(li);
    }
  }
  function describeScene(): void {
    if (!items.length) {
      description.textContent = 'No objects yet. Add a shape or words, then describe its purpose and what it communicates.';
      return;
    }
    description.textContent = items.map((item, index) => {
      const x = Math.round(item.x * 100);
      const y = Math.round(item.y * 100);
      const alt = item.altRole === 'decorative' ? 'decorative' : (item.altText || 'text alternative not written yet');
      return `${index + 1}. ${item.label}, ${item.description || 'description not written yet'}, at ${x}% from the left and ${y}% from the top; ${alt}.`;
    }).join(' ');
  }
  function renderCode(): void {
    if (!items.length) {
      codeOutput.textContent = '// Add an object to create your p5.js code.';
      copyButton.disabled = true;
      downloadButton.disabled = true;
      return;
    }
    const entries = items.map((item) => ({
      kind: item.kind,
      label: item.label,
      color: item.color,
      size: item.size,
      x: Number(item.x.toFixed(3)),
      y: Number(item.y.toFixed(3)),
      intention: item.intention,
      description: item.description,
      alternativeRole: item.altRole,
      alternativeText: item.altText,
      motion: item.motion,
      motionApproved: item.motionApproved,
    }));
    const selectedIndex = Math.max(0, items.findIndex((item) => item.id === selectedId));
    const source = `// UMADA Garden scene — paste into the p5.js web editor.
const gardenObjects = ${JSON.stringify(entries, null, 2)};
const actionTrail = ${JSON.stringify(actions, null, 2)};
let selectedObject = ${selectedIndex};
let motionEnabled = ${inputs.animate.checked};

function setup() {
  createCanvas(640, 420);
  updateCanvasDescription();
  if (motionEnabled && gardenObjects.some((item) => item.motionApproved && item.motion !== 'still')) loop();
  else noLoop();
}

function updateCanvasDescription() {
  const informative = gardenObjects
    .filter((item) => item.alternativeRole === 'informative')
    .map((item) => item.alternativeText || item.description);
  const decorativeCount = gardenObjects.filter((item) => item.alternativeRole === 'decorative').length;
  const locations = gardenObjects.map((item) => item.label + ' at ' + Math.round(item.x * 100) + '% across and ' + Math.round(item.y * 100) + '% down');
  const meaning = informative.length ? informative.join('. ') : 'The garden contains decorative shapes.';
  const decorative = decorativeCount ? ' ' + decorativeCount + ' decorative objects.' : '';
  describe('UMADA Garden. ' + meaning + decorative + ' ' + locations.join('; ') + '.');
}

function draw() {
  background('#f6f0dc');
  const seconds = millis() / 1000;
  gardenObjects.forEach((item) => {
    const moving = motionEnabled && item.motionApproved;
    const phase = seconds + item.x * 6 + item.y * 4;
    let x = item.x * width;
    let y = item.y * height;
    let size = item.size;
    if (moving && item.motion === 'drift') x += Math.sin(phase * 0.45) * 8;
    if (moving && item.motion === 'bounce') y -= Math.abs(Math.sin(phase * 1.1)) * 14;
    if (moving && item.motion === 'orbit') {
      x += Math.cos(phase * 0.55) * 16;
      y += Math.sin(phase * 0.55) * 12;
    }
    if (moving && item.motion === 'pulse') size *= 1 + Math.sin(phase * 1.2) * 0.08;
    push();
    translate(x, y);
    fill(item.color);
    noStroke();
    if (item.kind === 'circle') ellipse(0, 0, size);
    if (item.kind === 'rectangle') { rectMode(CENTER); rect(0, 0, size, size * 0.72, 10); }
    if (item.kind === 'triangle') triangle(0, -size / 2, -size / 2, size / 2, size / 2, size / 2);
    if (item.kind === 'star') {
      beginShape();
      for (let point = 0; point < 10; point++) {
        const radius = point % 2 === 0 ? size / 2 : size / 4;
        const angle = -HALF_PI + point * TWO_PI / 10;
        vertex(cos(angle) * radius, sin(angle) * radius);
      }
      endShape(CLOSE);
    }
    if (item.kind === 'words') {
      fill('#17212b');
      textAlign(CENTER, CENTER);
      textSize(18);
      text(item.label, 0, 0, 180);
    }
    pop();
  });
}

// Arrow keys move the selected object. Space or P pauses/resumes approved motion.
function keyPressed() {
  const item = gardenObjects[selectedObject];
  if (item && keyCode === LEFT_ARROW) item.x = max(0.06, item.x - 0.035);
  else if (item && keyCode === RIGHT_ARROW) item.x = min(0.94, item.x + 0.035);
  else if (item && keyCode === UP_ARROW) item.y = max(0.06, item.y - 0.035);
  else if (item && keyCode === DOWN_ARROW) item.y = min(0.94, item.y + 0.035);
  else if (key === ' ' || key === 'p' || key === 'P') {
    motionEnabled = !motionEnabled;
    if (motionEnabled && gardenObjects.some((shape) => shape.motionApproved && shape.motion !== 'still')) loop();
    else noLoop();
    return false;
  } else return;
  updateCanvasDescription();
  if (!motionEnabled) redraw();
  return false;
}

// Rules-only movement helper for an optional FaceMesh position estimate.
// Pass mirrored, normalized face coordinates (0–1); identity is never needed.
function moveFromFacePosition(faceX, faceY) {
  const item = gardenObjects[selectedObject];
  if (!item) return;
  if (faceX < 0.45) item.x = max(0.06, item.x - 0.012);
  else if (faceX > 0.55) item.x = min(0.94, item.x + 0.012);
  if (faceY < 0.45) item.y = max(0.06, item.y - 0.012);
  else if (faceY > 0.55) item.y = min(0.94, item.y + 0.012);
  updateCanvasDescription();
  if (!motionEnabled) redraw();
}

// Mouse and touch remain available in this standalone sketch. The keyboard path
// above moves the same selected object. Published work still needs semantic DOM
// controls beside the canvas to expose its task and state.
function mouseDragged() {
  const item = gardenObjects[selectedObject];
  if (!item) return false;
  item.x = constrain(mouseX / width, 0.06, 0.94);
  item.y = constrain(mouseY / height, 0.06, 0.94);
  updateCanvasDescription();
  if (!motionEnabled) redraw();
  return false;
}

// Intention, description, alternative choice, movement approval, and decisions
// travel with the sketch as metadata. describe() supplies the canvas description.
`;
    codeOutput.textContent = source;
    copyButton.disabled = false;
    downloadButton.disabled = false;
  }
  function updateControls(): void {
    const item = selected();
    for (const control of [inputs.intention, inputs.description, inputs.altRole, inputs.altText, inputs.color, inputs.size, inputs.motion, inputs.approval]) {
      control.disabled = !item;
    }
    if (!item) {
      inputs.intention.value = '';
      inputs.description.value = '';
      inputs.altRole.value = 'informative';
      inputs.altText.value = '';
      inputs.color.value = '#e63946';
      inputs.size.value = '72';
      inputs.sizeValue.value = '72';
      inputs.motion.value = 'still';
      inputs.approval.checked = false;
    } else {
      inputs.intention.value = item.intention;
      inputs.description.value = item.description;
      inputs.altRole.value = item.altRole;
      inputs.altText.value = item.altText;
      inputs.color.value = item.color;
      inputs.size.value = String(item.size);
      inputs.sizeValue.value = String(item.size);
      inputs.motion.value = item.motion;
      inputs.approval.checked = item.motionApproved;
    }
    inputs.altText.disabled = !item || item.altRole === 'decorative';
    itemsList.querySelectorAll<HTMLButtonElement>('[data-item-id]').forEach((button) => {
      if (Number(button.dataset.itemId) === selectedId) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
    sceneRefresh();
  }
  function renderItems(): void {
    itemsList.replaceChildren();
    for (const item of items) {
      const li = document.createElement('li');
      const select = document.createElement('button');
      select.type = 'button';
      select.dataset.itemId = String(item.id);
      select.textContent = `${item.label}${item.motionApproved ? ' (movement allowed)' : ''}`;
      select.setAttribute('aria-pressed', String(item.id === selectedId));
      select.addEventListener('click', () => {
        selectedId = item.id;
        updateControls();
        announce(`${item.label} selected. Edit its intention, description, alternative text, or movement settings.`);
      });
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = `Remove ${item.label}`;
      remove.addEventListener('click', () => {
        const index = items.findIndex((candidate) => candidate.id === item.id);
        if (index >= 0) items.splice(index, 1);
        if (selectedId === item.id) selectedId = items[0]?.id ?? null;
        record('Removed object', item.label);
        renderItems();
        updateControls();
        describeScene();
        announce(`${item.label} removed.`);
      });
      li.append(select, remove);
      itemsList.append(li);
    }
    updateControls();
    describeScene();
  }
  function createItem(kind: ShapeKind, label?: string): void {
    const names: Record<ShapeKind, string> = { circle: 'Circle', rectangle: 'Rectangle', triangle: 'Triangle', star: 'Star', words: 'Words' };
    const item: GardenItem = {
      id: nextId++,
      kind,
      label: label?.trim() || names[kind],
      color: ['#e63946', '#2a9d8f', '#f4a261', '#5865d9'][items.length % 4],
      size: 72,
      x: clamp(0.2 + (items.length % 4) * 0.18),
      y: clamp(0.25 + Math.floor(items.length / 4) * 0.2),
      motion: 'still',
      motionApproved: false,
      intention: '',
      description: '',
      altRole: 'informative',
      altText: '',
      phase: Math.random() * Math.PI * 2,
    };
    items.push(item);
    selectedId = item.id;
    renderItems();
    record('Added object', item.label);
    announce(`${item.label} added. Write its intention, description, and a text alternative, or mark it decorative.`);
  }
  function move(dx: number, dy: number, source: string): void {
    const item = selected();
    if (!item) {
      announce('Add or select an object before moving it.');
      return;
    }
    item.x = clamp(item.x + dx);
    item.y = clamp(item.y + dy);
    sceneRefresh();
    describeScene();
    record('Moved object', `${item.label} ${dx < 0 ? 'left' : dx > 0 ? 'right' : ''}${dx && dy ? ' and ' : ''}${dy < 0 ? 'up' : dy > 0 ? 'down' : ''} using ${source}.`);
  }
  function bindField<T extends HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    control: T,
    update: (item: GardenItem, value: T['value']) => void,
    action: string,
    detail: (item: GardenItem) => string,
  ): void {
    control.addEventListener('change', () => {
      const item = selected();
      if (!item) return;
      update(item, control.value);
      record(action, detail(item));
      renderItems();
      announce(`${action} saved for ${item.label}.`);
    });
  }

  document.querySelectorAll<HTMLButtonElement>('[data-garden-add]').forEach((button) => {
    button.addEventListener('click', () => createItem(button.dataset.gardenAdd as ShapeKind));
  });
  const words = byId<HTMLInputElement>('garden-new-words');
  byId<HTMLButtonElement>('garden-add-words').addEventListener('click', () => {
    const label = words.value.trim();
    if (!label) {
      announce('Enter a word or object name first.');
      words.focus();
      return;
    }
    createItem('words', label);
    words.value = '';
  });

  bindField(inputs.intention, (item, value) => { item.intention = value; }, 'Recorded intention', (item) => `${item.label}: ${item.intention || 'cleared'}`);
  bindField(inputs.description, (item, value) => { item.description = value; }, 'Updated description', (item) => `${item.label}: ${item.description || 'cleared'}`);
  bindField(inputs.altRole, (item, value) => {
    item.altRole = value as AltRole;
    if (item.altRole === 'decorative') item.altText = '';
  }, 'Changed text alternative choice', (item) => `${item.label}: ${item.altRole === 'decorative' ? 'decorative, no alternative text' : 'informative'}`);
  bindField(inputs.altText, (item, value) => { item.altText = value; }, 'Updated text alternative', (item) => `${item.label}: ${item.altText || 'cleared'}`);
  bindField(inputs.color, (item, value) => { item.color = value; }, 'Changed color', (item) => `${item.label}: ${item.color}`);
  inputs.size.addEventListener('input', () => {
    const item = selected();
    if (!item) return;
    item.size = Number(inputs.size.value);
    inputs.sizeValue.value = inputs.size.value;
    sceneRefresh();
  });
  inputs.size.addEventListener('change', () => {
    const item = selected();
    if (!item) return;
    record('Changed size', `${item.label}: ${item.size} pixels.`);
    describeScene();
  });
  bindField(inputs.motion, (item, value) => { item.motion = value as MotionKind; }, 'Proposed movement', (item) => `${item.label}: ${item.motion}`);
  inputs.approval.addEventListener('change', () => {
    const item = selected();
    if (!item) return;
    item.motionApproved = inputs.approval.checked;
    record(item.motionApproved ? 'Accepted movement' : 'Revoked movement', `${item.label}: ${item.motion}`);
    renderItems();
    announce(item.motionApproved ? `Movement approved for ${item.label}.` : `Movement stopped for ${item.label}.`);
  });
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches && inputs.animate.checked) {
      inputs.animate.checked = false;
      record('Paused movement', 'The device preference changed to reduced motion.');
      announce('Movement paused because your device now prefers reduced motion.');
      sceneRefresh();
    }
  });
  inputs.animate.addEventListener('change', () => {
    const hasApproved = items.some((item) => item.motionApproved);
    if (inputs.animate.checked && !hasApproved) {
      inputs.animate.checked = false;
      announce('Allow movement for at least one object before running motion.');
      return;
    }
    record(inputs.animate.checked ? 'Started approved movement' : 'Paused movement', inputs.animate.checked ? 'Only objects with permission can move.' : 'All movement paused.');
    sceneRefresh();
  });

  const steps: Array<[string, number, number]> = [
    ['garden-move-up', 0, -0.035],
    ['garden-move-left', -0.035, 0],
    ['garden-move-down', 0, 0.035],
    ['garden-move-right', 0.035, 0],
  ];
  for (const [id, dx, dy] of steps) byId<HTMLButtonElement>(id).addEventListener('click', () => move(dx, dy, 'keyboard control'));
  movementGroup.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) return;
    const arrows: Record<string, [number, number]> = { ArrowUp: [0, -0.035], ArrowLeft: [-0.035, 0], ArrowDown: [0, 0.035], ArrowRight: [0.035, 0] };
    const step = arrows[event.key];
    if (!step) return;
    event.preventDefault();
    move(step[0], step[1], 'arrow key');
  });

  document.querySelectorAll<HTMLInputElement>('input[name="garden-input-mode"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      if (!radio.checked) return;
      currentMode = radio.value as InputMode;
      if (currentMode !== 'face' && (stream || cameraBusy)) {
        stopCamera();
        record('Stopped camera', 'Input mode changed; camera stream ended.');
      }
      cameraControls.hidden = currentMode !== 'face';
      const help: Record<InputMode, string> = {
        keyboard: 'Select an object, then use the direction buttons or focus the movement controls and press an arrow key.',
        mouse: 'Select an object, then drag anywhere on the stage to move it. Touch drag works too.',
        face: 'Start the camera only when you are ready. Your face position is translated into simple directional rules.',
      };
      modeHelp.textContent = help[currentMode];
      record('Changed input mode', currentMode === 'face' ? 'Face position through ml5, with visible movement rules.' : currentMode);
      announce(`${currentMode === 'face' ? 'Face tracking' : currentMode} mode selected.`);
    });
  });

  byId<HTMLButtonElement>('garden-clear').addEventListener('click', () => {
    stopCamera();
    items.splice(0, items.length);
    selectedId = null;
    inputs.animate.checked = false;
    renderItems();
    record('Cleared scene', 'Removed all objects and stopped the camera.');
    announce('Garden cleared.');
  });

  copyButton.addEventListener('click', async () => {
    if (items.some((item) => !item.intention.trim() || !item.description.trim() || (item.altRole === 'informative' && !item.altText.trim()))) {
      announce('Before copying, add an intention, a description, and alternative text for each informative object. Decorative objects may have empty alternative text.');
      byId<HTMLTextAreaElement>('garden-intention').focus();
      return;
    }
    try {
      await navigator.clipboard.writeText(codeOutput.textContent || '');
      announce('p5.js code copied. Your action and decision trail is included.');
    } catch {
      announce('Clipboard access is unavailable. Focus the code block, select its text, and copy it with your keyboard.');
      codeOutput.tabIndex = 0;
      codeOutput.focus();
    }
  });
  downloadButton.addEventListener('click', () => {
    if (items.some((item) => !item.intention.trim() || !item.description.trim() || (item.altRole === 'informative' && !item.altText.trim()))) {
      announce('Before downloading, add an intention, a description, and alternative text for each informative object. Decorative objects may have empty alternative text.');
      byId<HTMLTextAreaElement>('garden-intention').focus();
      return;
    }
    const file = new Blob([codeOutput.textContent || ''], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'umada-garden-sketch.js';
    link.click();
    URL.revokeObjectURL(url);
    announce('p5.js sketch downloaded with its metadata and decision trail.');
  });

  function moveByFace(faces: FaceResult[]): void {
    if (currentMode !== 'face') return;
    const face = faces[0];
    if (!face?.keypoints?.length || !video.videoWidth || !video.videoHeight) return;
    const xs = face.keypoints.map((point) => point.x).filter(Number.isFinite);
    const ys = face.keypoints.map((point) => point.y).filter(Number.isFinite);
    if (!xs.length || !ys.length) return;
    const x = 1 - ((Math.min(...xs) + Math.max(...xs)) / 2) / video.videoWidth;
    const y = ((Math.min(...ys) + Math.max(...ys)) / 2) / video.videoHeight;
    const zone = `${x < 0.45 ? 'left' : x > 0.55 ? 'right' : 'center'}-${y < 0.45 ? 'up' : y > 0.55 ? 'down' : 'middle'}`;
    if (zone !== lastFaceZone) {
      lastFaceZone = zone;
      announce(`Face position is in the ${zone.replace('-', ' and ')} zone. The visible rule controls the selected object.`);
    }
    if (Date.now() - lastFaceMove < 150) return;
    const dx = x < 0.45 ? -0.012 : x > 0.55 ? 0.012 : 0;
    const dy = y < 0.45 ? -0.012 : y > 0.55 ? 0.012 : 0;
    if (!dx && !dy) return;
    const item = selected();
    if (!item) return;
    item.x = clamp(item.x + dx);
    item.y = clamp(item.y + dy);
    lastFaceMove = Date.now();
    sceneRefresh();
    describeScene();
    renderCode();
    // Log zone changes, not every camera frame: the trail remains readable.
    if (zone !== lastLoggedFaceZone) {
      lastLoggedFaceZone = zone;
      record('Rules moved object', `${item.label}: face center in the ${zone} zone; rule threshold 45% / 55%.`);
    }
  }
  async function loadMl5(): Promise<Ml5Api> {
    const win = window as Ml5Window;
    if (win.ml5) return win.ml5;
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/ml5@1.2.2/dist/ml5.min.js';
    script.async = true;
    await new Promise<void>((resolve, reject) => {
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('ml5 could not be loaded'));
      document.head.append(script);
    });
    if (!win.ml5) throw new Error('ml5 loaded without its API');
    return win.ml5;
  }
  async function startCamera(): Promise<void> {
    if (cameraBusy || stream) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      announce('Camera access is unavailable in this browser. Use keyboard or mouse/touch controls instead.');
      return;
    }
    cameraBusy = true;
    cameraStart.disabled = true;
    announce('Requesting camera permission. You can choose not to allow it and keep using keyboard or mouse controls.');
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      if (currentMode !== 'face') { stopCamera(); return; }
      video.srcObject = stream;
      video.hidden = false;
      await video.play();
      cameraStop.disabled = false;
      announce('Camera is on for this page. Loading the face-position model; video is not recorded by this sketch.');
      const ml5 = await loadMl5();
      if (!stream || currentMode !== 'face') { stopCamera(); return; }
      faceModel = await ml5.faceMesh({ maxFaces: 1 });
      if (!stream || currentMode !== 'face') { stopCamera(); return; }
      faceModel.detectStart(video, moveByFace);
      cameraStart.disabled = true;
      record('Started face tracking', 'One face position controls movement through the displayed rules.');
      announce('Face-position tracking started. Select Stop camera at any time.');
    } catch {
      stopCamera();
      announce('Face tracking could not start. Check camera permission or network access for the model, then use keyboard or mouse controls.');
    } finally {
      cameraBusy = false;
      cameraStart.disabled = Boolean(stream);
    }
  }
  function stopCamera(): void {
    faceModel?.detectStop?.();
    faceModel = null;
    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
    video.pause();
    video.srcObject = null;
    video.hidden = true;
    cameraStart.disabled = false;
    cameraStop.disabled = true;
    lastFaceZone = '';
    sceneRefresh();
  }
  cameraStart.addEventListener('click', () => { void startCamera(); });
  cameraStop.addEventListener('click', () => {
    stopCamera();
    record('Stopped camera', 'Camera stream ended; no video was stored.');
    announce('Camera stopped. Keyboard and mouse controls remain available.');
  });
  window.addEventListener('pagehide', stopCamera);

  void import('p5').then(({ default: P5 }) => new P5((p) => {
    const holder = byId<HTMLElement>('garden-canvas');
    const canvasSize = () => Math.max(260, Math.floor(holder.clientWidth || 520));
    p.setup = () => {
      p.createCanvas(canvasSize(), Math.round(canvasSize() * 0.62)).parent(holder);
      p.noLoop();
      scene = p;
      sceneRefresh = () => {
        if (!scene) return;
        if (inputs.animate.checked && items.some((item) => item.motionApproved && item.motion !== 'still')) scene.loop();
        else { scene.noLoop(); scene.redraw(); }
      };
      const resizeObserver = new ResizeObserver(() => {
        if (!scene) return;
        const size = canvasSize();
        scene.resizeCanvas(size, Math.round(size * 0.62));
        sceneRefresh();
      });
      resizeObserver.observe(holder);
      sceneRefresh();
      renderCode();
    };
    p.draw = () => {
      const styles = getComputedStyle(document.body);
      p.background(styles.getPropertyValue('--card-bg').trim() || '#f4f5f6');
      p.noStroke();
      const elapsed = p.millis() / 1000;
      for (const item of items) {
        const x = item.x * p.width;
        const y = item.y * p.height;
        const approvedMotion = inputs.animate.checked && item.motionApproved;
        const phase = elapsed + item.phase;
        let size = item.size;
        let offsetX = 0;
        let offsetY = 0;
        if (approvedMotion && item.motion === 'drift') offsetX = Math.sin(phase * 0.45) * 8;
        if (approvedMotion && item.motion === 'bounce') offsetY = Math.abs(Math.sin(phase * 1.1)) * -14;
        if (approvedMotion && item.motion === 'orbit') { offsetX = Math.cos(phase * 0.55) * 16; offsetY = Math.sin(phase * 0.55) * 12; }
        if (approvedMotion && item.motion === 'pulse') size *= 1 + Math.sin(phase * 1.2) * 0.08;
        p.push();
        p.translate(x + offsetX, y + offsetY);
        p.fill(item.color);
        if (item.kind === 'circle') p.ellipse(0, 0, size, size);
        if (item.kind === 'rectangle') p.rectMode(p.CENTER), p.rect(0, 0, size, size * 0.72, 10);
        if (item.kind === 'triangle') p.triangle(0, -size / 2, -size / 2, size / 2, size / 2, size / 2);
        if (item.kind === 'star') {
          p.beginShape();
          for (let point = 0; point < 10; point++) {
            const radius = point % 2 === 0 ? size / 2 : size / 4;
            const angle = -p.HALF_PI + point * p.TWO_PI / 10;
            p.vertex(Math.cos(angle) * radius, Math.sin(angle) * radius);
          }
          p.endShape(p.CLOSE);
        }
        if (item.kind === 'words') {
          p.fill('#17212b');
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(16);
          p.text(item.label, -90, -24, 180, 48);
        }
        p.pop();
      }
      if (!items.length) {
        p.fill('#3d4852');
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(16);
        p.text('Add a shape or words to start your garden', p.width / 2, p.height / 2, p.width - 28);
      }
    };
    const positionAtPointer = () => {
      if (currentMode !== 'mouse' || !selected()) return;
      const bounds = p.canvas.getBoundingClientRect();
      moveByPointer(clamp((p.mouseX / bounds.width)), clamp((p.mouseY / bounds.height)));
    };
    p.mousePressed = () => { positionAtPointer(); return false; };
    p.mouseDragged = () => { positionAtPointer(); return false; };
    p.touchStarted = () => { positionAtPointer(); return false; };
    p.touchMoved = () => { positionAtPointer(); return false; };
    p.mouseReleased = () => { commitPointerPosition(); return false; };
    p.touchEnded = () => { commitPointerPosition(); return false; };
  })).catch(() => {
    byId<HTMLElement>('garden-canvas').textContent = 'The visual stage could not load. Use the object list and controls; your scene description and code remain available.';
  });

  let lastPointerLog = 0;
  let lastPointerRender = 0;
  function commitPointerPosition(): void {
    if (currentMode !== 'mouse') return;
    const item = selected();
    if (!item) return;
    record('Placed object', `${item.label} at ${Math.round(item.x * 100)}% across and ${Math.round(item.y * 100)}% down with mouse or touch.`);
  }
  function moveByPointer(x: number, y: number): void {
    const item = selected();
    if (!item) return;
    item.x = clamp(x);
    item.y = clamp(y);
    sceneRefresh();
    describeScene();
    if (Date.now() - lastPointerRender > 250) {
      lastPointerRender = Date.now();
      renderCode();
    }
    if (Date.now() - lastPointerLog > 700) {
      lastPointerLog = Date.now();
      record('Moved object', `${item.label} to ${Math.round(x * 100)}% across and ${Math.round(y * 100)}% down with mouse or touch.`);
    }
  }

  renderItems();
  renderCode();
  announce('The garden is empty. Add a shape or some words.');
}
