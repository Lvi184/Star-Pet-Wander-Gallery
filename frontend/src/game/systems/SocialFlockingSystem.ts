import Phaser from 'phaser';

interface Creature {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface SocialGraph {
  [creatureId: string]: { [targetId: string]: number };
}

export class SocialFlockingSystem {
  private enabled: boolean = true;
  private creatures: Creature[] = [];
  private socialGraph: SocialGraph = {};

  constructor() {}

  setEnabled(value: boolean) {
    this.enabled = value;
  }

  setData(creatures: Creature[], socialGraph: SocialGraph) {
    this.creatures = creatures;
    this.socialGraph = socialGraph;
  }

  update(delta: number) {
    if (!this.enabled) return;

    this.creatures.forEach((c) => {
      let fx = 0, fy = 0;
      const relations = this.socialGraph[c.id] || {};
      
      this.creatures.forEach((other) => {
        if (c.id === other.id) return;
        
        const dist = Phaser.Math.Distance.Between(c.x, c.y, other.x, other.y);
        const weight = relations[other.id] || 0;

        if (dist < 200 && dist > 0) {
          const force = (weight / 100) * (1 - dist / 200);
          fx += (other.x - c.x) / dist * force;
          fy += (other.y - c.y) / dist * force;
        }
      });

      if (Math.abs(fx) > 0.01 || Math.abs(fy) > 0.01) {
        const creatureIndex = this.creatures.findIndex((cr) => cr.id === c.id);
        if (creatureIndex !== -1) {
          this.creatures[creatureIndex].vx += fx * delta * 0.01;
          this.creatures[creatureIndex].vy += fy * delta * 0.01;
        }
      }
    });
  }
}