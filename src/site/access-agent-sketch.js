// Canvas is a visual companion; all interaction and status live in native HTML.
export async function mountFlow(getState) {
  const { default: P5 } = await import('p5');

  const holder = document.getElementById('flow-canvas');
  const labels = ['Expression', 'Interpretation', 'Preparation', 'Review', 'Action'];
  let instance;

  await new Promise((resolve) => {
    instance = new P5((p) => {
      const dimensions = () => {
        const width = Math.max(240, Math.floor(holder.clientWidth));
        return { width, height: width < 680 ? 370 : 115 };
      };

      p.setup = () => {
        const size = dimensions();
        p.createCanvas(size.width, size.height).parent(holder);
        p.noLoop();
        p.textFont('system-ui');
        resolve();
      };

      p.draw = () => {
        const styles = getComputedStyle(document.body);
        const color = (name) => styles.getPropertyValue(name).trim();
        const { state, prepared } = getState();
        const vertical = p.width < 680;
        const active = { input: 0, review: 3, approved: 3, blocked: 4, done: 4 }[state] ?? 0;
        const gap = vertical ? 16 : 24;
        const boxWidth = vertical ? p.width - 12 : (p.width - 12 - 4 * gap) / 5;
        const boxHeight = vertical ? 56 : 86;
        p.background(color('--bg'));
        p.textAlign(p.CENTER, p.CENTER);

        for (let index = 0; index < labels.length; index++) {
          const x = vertical ? 6 : 6 + index * (boxWidth + gap);
          const y = vertical ? 6 + index * (boxHeight + gap) : 10;
          const selected = index === active;
          const blocked = state === 'blocked' && index === 4;
          const accent = blocked ? color('--bad') : color('--good');
          if (index < 4) {
            p.stroke(color('--line'));
            p.strokeWeight(2);
            if (vertical) {
              const center = x + boxWidth / 2;
              const end = y + boxHeight + gap - 3;
              p.line(center, y + boxHeight, center, end);
              p.line(center, end, center - 4, end - 5);
              p.line(center, end, center + 4, end - 5);
            } else {
              const center = y + boxHeight / 2;
              const end = x + boxWidth + gap - 3;
              p.line(x + boxWidth, center, end, center);
              p.line(end, center, end - 5, center - 4);
              p.line(end, center, end - 5, center + 4);
            }
          }
          p.stroke(selected ? accent : color('--line'));
          p.strokeWeight(selected ? 3 : 1);
          p.fill(selected ? color('--card-bg') : color('--bg'));
          p.rect(x, y, boxWidth, boxHeight, 6);
          p.noStroke();
          p.fill(color('--text'));
          p.textStyle(p.BOLD);
          p.textSize(14);
          p.text(`${index + 1}. ${labels[index]}`, x + boxWidth / 2, y + boxHeight / 2 - 10);
          p.textStyle(p.NORMAL);
          p.textSize(12);
          const detail = blocked ? 'BLOCKED' : state === 'done' && index === 4 ? 'SIMULATED' :
            state === 'approved' && index === 3 ? 'APPROVED' : selected ? 'CURRENT' : prepared && index < active ? 'PREPARED' : 'WAITING';
          p.fill(selected ? accent : color('--text'));
          p.text(detail, x + boxWidth / 2, y + boxHeight / 2 + 12);
        }
      };

      const resize = new ResizeObserver(() => {
        if (!p.canvas) return;
        const size = dimensions();
        if (p.width !== size.width || p.height !== size.height) p.resizeCanvas(size.width, size.height);
      });
      resize.observe(holder);
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => p.redraw());
    });
  });

  return () => instance.redraw();
}
