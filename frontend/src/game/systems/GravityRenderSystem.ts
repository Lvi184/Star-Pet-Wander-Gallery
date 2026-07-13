import Phaser from 'phaser';

interface Creature {
  id: string;
  x: number;
  y: number;
  needs: Record<string, number>;
}

interface Resource {
  x: number;
  y: number;
  type: string;
}

export class GravityRenderSystem {
  private graphics: Phaser.GameObjects.Graphics;
  private enabled: boolean = true;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(100);
  }

  setEnabled(value: boolean) {
    this.enabled = value;
  }

  update(creatures: Creature[], resources: Resource[]) {
    if (!this.enabled) return;

    this.graphics.clear();
    this.graphics.lineStyle(1, 0x00ffcc, 0.3);

    creatures.forEach((c) => {
      resources.forEach((r) => {
        const dist = Phaser.Math.Distance.Between(c.x, c.y, r.x, r.y);
        const need = c.needs?.[r.type] || 0;

        if (dist < 300 && need > 0.5) {
          this.graphics.beginPath();
          this.graphics.moveTo(c.x, c.y);
          this.graphics.lineTo(r.x, r.y);
          this.graphics.strokePath();
        }
      });
    });
  }

  destroy() {
    this.graphics.destroy();
  }
}