// Obtenemos scoreboard, canvas y contexto
const scoreboard = document.getElementById('scoreText')
const muteBtn = document.getElementById('muteBtn')
document.getElementById('gameOverScreen').style.display = 'none';
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');


/*** Variables globales ***/
let score = 0; // Puntuación actual
let highScore = 0 // Puntuación maxima
let game;
const box = 20; // Tamaño de cada parte de la serpiente
let dir = null; // Direccion actual de la serpiente
let nextDirs = [] // Cola de direcciones (Para evitar morir al hacer cambios de dirección rapido antes de actualizarse)
const eatSound = document.getElementById('eatSound') // Audio para comer
let isMuted = false
// La serpiente es una lista de coordenadas (segmentos)
let snake = [
    { x: 9 * box, y: 9 * box }
];
// Generamos posicion aleatoria para la comida
let foods = [
    generateFood(),
    generateFood()
]


// Dibujar todo el juego
function draw(){
    // Fondo
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar la serpiente
    for (let i = 0; i < snake.length; i++) {
        let t = snake.length > 1 ? 1 - i / (snake.length - 1) : 1;
        let r = Math.floor(10 + t * 90);
        let g = Math.floor(120 + t * 135);
        let b = Math.floor(70);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        let segment = snake[i];
        ctx.fillRect(segment.x, segment.y, box, box);
    }

    // Dibujar la comida
    ctx.fillStyle = 'red';
    for (const food of foods) {
        ctx.fillRect(food.x, food.y, box, box)
    }
}

draw();


// Detectamos tecla y actualizamos direccion
document.addEventListener('keydown', function(event){
    const lastDir = nextDirs.length ? nextDirs[nextDirs.length -1] : dir; // Busca la ultima dirección y si no hay coge la actual
    let newDir = null
    if(event.key === 'ArrowUp' && lastDir !== 'down') newDir = 'up';
    else if(event.key === 'ArrowDown' && lastDir !== 'up') newDir = 'down';
    else if(event.key === 'ArrowLeft' && lastDir !== 'right') newDir = 'left';
    else if(event.key === 'ArrowRight' && lastDir !== 'left') newDir = 'right';

    if(newDir) {
        if (newDir !== lastDir) { // Nueva dirección distinta a la última en cola
            nextDirs.push(newDir);
        }
    }
});


// Actualiza la posicion de la serpiente y redibuja el canvas
function update() {
    // Procesa todas las direcciones válidas en la cola en una actualización
    while (nextDirs.length > 0) {
        const nextDir = nextDirs.shift();
        // Solo actualiza si no es opuesta a la dirección actual
        if (
            (nextDir === 'up' && dir !== 'down') ||
            (nextDir === 'down' && dir !== 'up') ||
            (nextDir === 'left' && dir !== 'right') ||
            (nextDir === 'right' && dir !== 'left')
        ) {
            dir = nextDir;
            break; // Salimos del while tras aplicar la primera dirección, para no saltarnos la cola
        }
    }

    if(dir) {
        const head = { ...snake[0] }; //Clonamos la cabeza actual

        // Movemos la cabeza segun direccion
        if(dir === 'up') head.y -= box;
        else if(dir === 'down') head.y += box;
        else if(dir === 'left') head.x -= box;
        else if(dir === 'right') head.x += box;

        //Colision con los bordes
        if (
            head.x < 0 || head.x >= 20 * box || head.y < 0 || head.y >= 20 * box || collision (head, snake)
        ) {
            clearInterval(game); // Parar el juego
            document.getElementById('gameOverScreen').style.display = 'flex'; // Mostrar pantalla Game Over
            return; // Parar de ejecutar el update
        }

        snake.unshift(head); //Añadimos nueva cabeza

        // Si come la comida
        let ate = false;
        for (let i = 0; i < foods.length; i++) {
            if (head.x === foods[i].x && head.y === foods[i].y) {
                if (!isMuted){
                    eatSound.currentTime = 0;
                    eatSound.play();
                }
                score++;
                if ( score > highScore) {
                    highScore = score;
                }
                updateScoreboard();
                foods[i] = generateFood();
                ate = true;
                break; // Solo come una manzana por actualización
            }
        }
        if (!ate) {
            snake.pop();
        }
    }
    draw(); //Dibujamos serpiente actualizada
}




// Funcion de colisiones
function collision(head, array) {
    for (let i = 1; i < array.length; i++) {
        if (head.x ===array[i].x && head.y === array[i].y) {
            return true; //Colisión detectada
        }
    }
    return false
}


// Función para reiniciar el juego
function resetGame() {
    snake = [{ x:9 *box, y: 9 * box}];
    dir = null;
    nextDirs = []
    foods = [generateFood(), generateFood()];
    score = 0;
    document.getElementById('gameOverScreen').style.display = 'none'; // Ocultar pantalla Game Over
    updateScoreboard();
    clearInterval(game); // Paramos juego
    game = setInterval(update, 120);
}

document.getElementById('retryBtn').addEventListener('click', () => {
    document.getElementById('gameOverScreen').style.display = 'none'; // Ocultar pantalla Game Over
    resetGame(); // Reiniciar juego
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    if (document.getElementById('gameOverScreen').style.display === 'flex') {
      document.getElementById('retryBtn').click();
    } else if (document.getElementById('startScreen').style.display !== 'none') {
      document.getElementById('startButton').click();
    }
  }
});


// Función para generar comida en posición aleatoria y NO donde este la serpiente
function generateFood(){
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * 20) * box,
            y: Math.floor(Math.random() * 20) * box,
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
}

// Funcion para actualizar scoreboard
function updateScoreboard() {
    scoreText.textContent = `Puntuación: ${score} | Máxima: ${highScore}`
}

const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');

startButton.addEventListener('click', () => {
  startScreen.style.display = 'none';
  game = setInterval(update, 120); // empieza el juego aquí
});

muteBtn.addEventListener('click', () => {
    isMuted = !isMuted
    muteBtn.textContent = isMuted ? '🔇 Silenciado' : '🔊 Sonido';
})

document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'm') {
        isMuted = !isMuted;
        muteBtn.textContent = isMuted ? '🔇 Silenciado' : '🔊 Sonido';
    }
});