// Modulos de matter
const Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body;

let keys = {
    'kUp': new Key('ArrowUp'),
    'kDown': new Key('ArrowDown'),
    'kLeft': new Key('ArrowLeft'),
    'kRight': new Key('ArrowRight')
}

// Caracteristicas objetos
const PLANK_HEGHT = 10;
const PLANK_WIDTH = 305;
const PLANK_VEL = 3;

const WALLS = [
    [540, 350],
    [800, 500],
    [800, 800],
    [1100, 800],
    [1100, 500],
    [1360, 350],
    [1210, 90],
    [950, 240],
    [690, 90],
];

let velTot = 6;

// create an engine
let engine = Engine.create();

// create a renderer
var render = CustomRender.create({
    element: document.body,
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false
    }
});

engine.world.gravity.y = 0;

let angle = [-1.05,0,1.57,0,1.05,-0.52,1.05,-1.05,0.52];

let wallsMedio = [];
for (var i=0; i<WALLS.length; i++) {
    let nextInd = (i==WALLS.length-1)? 0:i+1;

    wallsMedio.push([
        (WALLS[i][0]+WALLS[nextInd][0])/2,
        (WALLS[i][1]+WALLS[nextInd][1])/2,
    ]);
}

let wallsWorld = [];

for(var i=0; i<wallsMedio.length; i++) {
    let tmp = Bodies.rectangle(wallsMedio[i][0], wallsMedio[i][1], PLANK_HEGHT, PLANK_WIDTH, 
        {
            isStatic:true,
            chamfer: { radius: 3 },
            angle: angle[i],
            render: {
                fillStyle: 'blue'
            }
        }
    );
    //Body.rotate(tmp, angle[i]);

    wallsWorld.push(tmp);
}

World.add(engine.world, wallsWorld);

var bola = Bodies.circle(950,500,16,
    {
        label: 'Pelota',
        inertia: 0,
        friction: 0,
        frictionStatic: 0,
        frictionAir: 0,
        restitution: 1,
        render: {
            fillStyle: 'red'
        }
    }
);

var paleta = Bodies.rectangle(950, 750, 10, 75, 
    {
        label: 'Paleta',
        isStatic: true,
        angle: 1.57,
        moving: 0,
        render: {
            fillStyle: 'red'
        }
    }
);

var puntos = 0;

var puntuacion = Bodies.rectangle(950, 900, 1, 1, 
    {
        label: "Contador",
        isStatic: true,
        render: {
            fillStyle: "red",
            text: {
                content: `Puntuación ${puntos}`,
                color: "#FFFFFF",
                size: 20
            }
        }
    }
);

keyAsignation(keys, paleta);

Events.on(engine, 'collisionStart', event => {
    let pairs = event.pairs;
    
    for (var i = 0, j = pairs.length; i != j; ++i) {
        let pair = pairs[i];

        if(pair.bodyB.label == 'Paleta' || pair.bodyA.label == 'Paleta'){
            console.log('Colisión paleta');
            puntos++;
            Composite.allBodies(engine.world).find(el => el.label == 'Contador').render.text.content = `Puntuación ${puntos}`;
        }
    }
});

Events.on(engine, 'collisionEnd', event => {
    let pairs = event.pairs;

    for (var i = 0, j = pairs.length; i != j; ++i) {
        let pair = pairs[i];

        if((pair.bodyB.label == 'Paleta' || pair.bodyA.label == 'Paleta') && velTot <= 16) velTot+=0.5;

        if(pair.bodyA.label == 'Pelota'){
            Body.setVelocity(pair.bodyA, Matter.Vector.create(
                pair.bodyA.velocity.x,
                ((pair.bodyB.velocity.y>0)?1:-1)*Math.sqrt(velTot**2-pair.bodyA.velocity.x**2)
            ));
        } else {
            Body.setVelocity(pair.bodyB, Matter.Vector.create(
                pair.bodyB.velocity.x,
                ((pair.bodyB.velocity.y>0)?1:-1)*Math.sqrt(velTot**2-pair.bodyB.velocity.x**2)                
            ));
        }
    }
});

Events.on(engine, 'beforeUpdate', event => {
    Body.setPosition(paleta, Vector.add(paleta.position, Vector.create(PLANK_VEL*paleta.moving,0)));
});

let velX = Math.random()*(velTot*2+1)-velTot;
Body.setVelocity(bola, Vector.create(
    velX,
    ((Math.random()>0.5)?1:-1)*Math.sqrt(velTot**2-velX**2)
));

World.add(engine.world, [bola, paleta, puntuacion]);

// run the engine
Engine.run(engine);

// run the renderer
CustomRender.run(render);