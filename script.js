// Seleção de Elementos do DOM
const generateBtn = document.getElementById('generateBtn');
const spinBtn = document.getElementById('spinBtn');
const itemsInput = document.getElementById('itemsInput');
const resultDiv = document.getElementById('result');

const canvas = document.getElementById('rouletteCanvas');
const ctx = canvas.getContext('2d');

let segments = [];
let angles = [];
let isSpinning = false;
let startAngle = 0;
let spinTimeout = null;
let spinAngleStart = 0;
let spinTime = 0;
let spinTimeTotal = 0;
let arc = 0;

// Função para gerar cores distintas
function generateColors(num) {
    const colors = [];
    const hueStep = Math.floor(360 / num);
    for (let i = 0; i < num; i++) {
        const hue = i * hueStep;
        colors.push(`hsl(${hue}, 70%, 50%)`);
    }
    return colors;
}

// Evento para gerar a roleta
generateBtn.addEventListener('click', () => {
    const input = itemsInput.value.trim();
    if (!input) {
        alert('Por favor, insira pelo menos um item.');
        return;
    }

    // Dividir a entrada por vírgula ou nova linha
    const items = input.split(/,|\n/).map(item => item.trim()).filter(item => item !== '');

    if (items.length < 2) {
        alert('Por favor, insira pelo menos dois itens.');
        return;
    }

    segments = items;
    arc = Math.PI * 2 / segments.length;
    angles = [];

    // Gerar cores
    const colors = generateColors(segments.length);

    // Desenhar a roleta
    drawRouletteWheel(colors);

    spinBtn.disabled = false;
    resultDiv.textContent = '';
});

function drawRouletteWheel(colors) {
    const outsideRadius = canvas.width / 2 - 10;
    const textRadius = outsideRadius - 50;
    const insideRadius = 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.font = 'bold 16px Helvetica, Arial';

    for (let i = 0; i < segments.length; i++) {
        const angle = startAngle + i * arc;
        angles[i] = angle;

        ctx.fillStyle = colors[i];

        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, outsideRadius, angle, angle + arc, false);
        ctx.arc(canvas.width / 2, canvas.height / 2, insideRadius, angle + arc, angle, true);
        ctx.fill();

        ctx.save();

        ctx.fillStyle = 'white';
        ctx.translate(
            canvas.width / 2 + Math.cos(angle + arc / 2) * textRadius,
            canvas.height / 2 + Math.sin(angle + arc / 2) * textRadius
        );
        ctx.rotate(angle + arc / 2 + Math.PI / 2);
        const text = segments[i];
        ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
        ctx.restore();
    }
}

// // Função para desenhar a roleta
// function drawRouletteWheel(colors) {
//     const outsideRadius = canvas.width / 2 - 10;
//     const textRadius = outsideRadius - 50;
//     const insideRadius = 0;

//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     ctx.strokeStyle = 'white';
//     ctx.lineWidth = 2;
//     ctx.font = 'bold 16px Helvetica, Arial';

//     for (let i = 0; i < segments.length; i++) {
//         const angle = startAngle + i * arc;
//         angles[i] = angle;

//         ctx.fillStyle = colors[i];

//         ctx.beginPath();
//         ctx.arc(canvas.width / 2, canvas.height / 2, outsideRadius, angle, angle + arc, false);
//         ctx.arc(canvas.width / 2, canvas.height / 2, insideRadius, angle + arc, angle, true);
//         ctx.fill();

//         ctx.save();

//         ctx.fillStyle = 'white';
//         ctx.translate(
//             canvas.width / 2 + Math.cos(angle + arc / 2) * textRadius,
//             canvas.height / 2 + Math.sin(angle + arc / 2) * textRadius
//         );
//         ctx.rotate(angle + arc / 2 + Math.PI / 2);
//         const text = segments[i];
//         ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
//         ctx.restore();
//     }
// }

// Evento para girar a roleta
spinBtn.addEventListener('click', spin);

function spin() {
    if (isSpinning) return;

    spinAngleStart = Math.random() * 10 + 10;
    spinTime = 0;
    spinTimeTotal = Math.random() * 3 + 4 * 1000; // Entre 4 e 7 segundos
    isSpinning = true;
    rotateWheel();
}

function rotateWheel() {
    spinTime += 30;
    if (spinTime >= spinTimeTotal) {
        stopRotateWheel();
        return;
    }
    const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
    startAngle += (spinAngle * Math.PI / 180);
    drawRouletteWheel(generateColors(segments.length));
    spinTimeout = setTimeout(rotateWheel, 30);
}

// function stopRotateWheel() {
//     clearTimeout(spinTimeout);
    
//     // Converte o ângulo de radianos para graus e ajusta para alinhar com a seta à esquerda (180 graus)
//     const degrees = (startAngle * 180 / Math.PI + 180) % 360;
    
//     // Calcula o ângulo de cada segmento em graus
//     const arcd = arc * 180 / Math.PI;
    
//     // Determina o índice do segmento sorteado com base no ângulo final
//     const index = Math.floor(degrees / arcd);
    
//     // Exibe o resultado sorteado
//     const text = segments[index];
//     resultDiv.textContent = `Você sorteou: ${text}`;
    
//     isSpinning = false;
// }

function stopRotateWheel() {
    clearTimeout(spinTimeout);
    // Ajuste para alinhar com a seta à esquerda (180 graus)
    const degrees = (startAngle * 180 / Math.PI) + 180;
    const arcd = (arc * 180 / Math.PI);
    const index = Math.floor(((360 - (degrees % 360)) / arcd)) % segments.length;

    ctx.save();
    ctx.font = 'bold 30px Helvetica, Arial';
    const text = segments[index];
    resultDiv.textContent = `Você sorteou: ${text}`;
    console.log(`Selected Index: ${index}, Item: ${text}`); // Linha adicionada para depuração
    isSpinning = false;
    ctx.restore();
}


// Função de desaceleração
function easeOut(t, b, c, d) {
    const ts = (t /= d) * t;
    const tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
}
