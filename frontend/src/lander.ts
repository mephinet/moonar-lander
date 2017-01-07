import { Vector, add, LANDER_GEOMETRY, translate, Geometry } from './geometry';
import { rotate, angle, position, accelerate, collide } from './physics';
import { Commands } from './commands';

export type EngineState = "off" | "half" | "full";
export type RotationDirection = "off" | "cw" | "ccw";

const THRUST = 0.02;

export class Lander {
    constructor(
        public readonly position: Vector,
        public readonly velocity: Vector,
        public readonly angle: number,
        public readonly rotation: RotationDirection,
        public readonly rotationSpeed: number,
        public readonly engine: EngineState,
        public readonly fuel: number) { }
}

export function tick(no: number, commands: Commands, lander: Lander, terrainGeometry: Geometry): Lander {
    lander = execute(commands, lander);
    let nrotationSpeed = rotate(lander.rotation, lander.rotationSpeed);
    let nangle = angle(lander.angle, nrotationSpeed);
    let nposition = position(add(lander.position, lander.velocity));
    let nvelocity = accelerate(lander.velocity, THRUST, nangle, lander.engine);
    let landerGeometry = LANDER_GEOMETRY.map((v) => translate(v, nposition, nangle));
    let fuel = burn(lander.fuel, lander.engine)
    return collide(
        new Lander(nposition, nvelocity, nangle, lander.rotation, nrotationSpeed, lander.engine, fuel),
        landerGeometry,
        terrainGeometry);
}

function burn(fuel: number, engine: EngineState) {
    if (engine === "half") {
        return fuel - 0.25;
    } else if (engine === "full") {
        return fuel - 0.5;
    } else {
        return fuel;
    }
}

function execute(commands: Commands, lander: Lander): Lander {
    let engine = lander.engine;
    let rotation = lander.rotation;
    let fuel = lander.fuel;
    if (lander.fuel > 0) {
        commands.map((c) => {
            if (c.engine) engine = c.engine;
            if (c.rotation) rotation = c.rotation;
            console.log(c);
        });
    } else {
        engine = "off";
        rotation = "off";
        fuel = 0;
    }
    return new Lander(
        lander.position,
        lander.velocity,
        lander.angle,
        rotation,
        lander.rotationSpeed,
        engine,
        fuel);
}
