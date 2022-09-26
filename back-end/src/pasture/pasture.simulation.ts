type Position = {
  x: number;
  y: number;
};

type StepResult = {
  wolf: Position;
  sheep: Position[];
  eatenLambs: number;
  frame: number;
  isLastFrame: boolean;
};

export class PastureSimulation {
  private readonly width: number;
  private readonly height: number;
  private sheepCount: number;
  private eatenLambs: number;
  private wolfPosition: Position;
  private wolfSpeed: number;
  private readonly wolfSpeedReductionStep: number;
  private sheepPositions: Position[];
  private readonly lambSpeed: number;
  private frame: number;
  private isLastFrame: boolean;
  private static instance: PastureSimulation;

  private constructor() {
    this.width = 640;
    this.height = 640;
    this.sheepCount = 100;
    this.eatenLambs = 0;
    this.wolfPosition = this.getRandomPosition();
    this.wolfSpeed = 4;
    this.lambSpeed = 0.5;
    this.wolfSpeedReductionStep =
      (this.wolfSpeed - (this.lambSpeed + 0.5)) / this.sheepCount;
    this.sheepPositions = [];
    for (let i = 0; i < this.sheepCount; i += 1) {
      this.sheepPositions.push(this.getRandomPosition());
    }
    this.frame = 1;
    this.isLastFrame = false;
  }

  private getRandomPosition(): Position {
    const x = Math.floor(Math.random() * this.width);
    const y = Math.floor(Math.random() * this.height);
    return { x, y };
  }

  public static getInstance(): PastureSimulation {
    if (!PastureSimulation.instance) {
      PastureSimulation.instance = new PastureSimulation();
    } else if (PastureSimulation.instance.isLastFrame) {
      PastureSimulation.instance = new PastureSimulation();
    }
    return PastureSimulation.instance;
  }

  private static getDirection(p1: Position, p2: Position): number {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }

  private static getDistance(p1: Position, p2: Position): number {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  }

  private getNewPosition(
    currentPos: Position,
    direction: number,
    speed: number,
  ): Position {
    const newPos = {
      x: currentPos.x + Math.cos(direction) * speed,
      y: currentPos.y + Math.sin(direction) * speed,
    };
    return {
      x: newPos.x >= 0 && newPos.x < this.width ? newPos.x : currentPos.x,
      y: newPos.y >= 0 && newPos.y < this.height ? newPos.y : currentPos.y,
    };
  }

  private getNewWolfPosition(target: Position): Position {
    return this.getNewPosition(
      this.wolfPosition,
      PastureSimulation.getDirection(this.wolfPosition, target),
      this.wolfSpeed,
    );
  }

  private getNewSheepPosition(sheep: Position): Position {
    return this.getNewPosition(
      sheep,
      PastureSimulation.getDirection(this.wolfPosition, sheep),
      this.lambSpeed,
    );
  }

  public getNextStep(): StepResult {
    if (!this.isLastFrame) {
      const newSheepPos: Position[] = [];
      let closestSheep = { distance: Number.POSITIVE_INFINITY, index: 0 };
      for (let i = 0; i < this.sheepPositions.length; i += 1) {
        const currentSheep = this.sheepPositions[i];
        const wolfDistance = PastureSimulation.getDistance(
          currentSheep,
          this.wolfPosition,
        );
        if (wolfDistance < closestSheep.distance) {
          closestSheep = { distance: wolfDistance, index: i };
        }
        newSheepPos.push(this.getNewSheepPosition(currentSheep));
      }
      const targetIndex = closestSheep.index;
      const target: Position = this.sheepPositions[targetIndex];
      this.wolfPosition = this.getNewWolfPosition(target);
      const targetDistance = PastureSimulation.getDistance(
        this.wolfPosition,
        newSheepPos[targetIndex],
      );
      if (targetDistance <= this.wolfSpeed) {
        newSheepPos.splice(targetIndex, 1);
        this.eatenLambs += 1;
        this.wolfSpeed -= this.wolfSpeedReductionStep;
      }
      this.sheepPositions = newSheepPos;
      this.sheepCount = newSheepPos.length;
      this.frame = this.frame + 1;
      this.isLastFrame = !this.sheepCount;
      return {
        wolf: this.wolfPosition,
        sheep: this.sheepPositions,
        eatenLambs: this.eatenLambs,
        frame: this.frame,
        isLastFrame: this.isLastFrame,
      };
    }
    return undefined;
  }
}
