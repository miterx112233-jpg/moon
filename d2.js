const canvas = document.getElementById('dotCanvas');
const ctx = canvas.getContext('2d');
const loadingScreen = document.getElementById('loadingScreen');

let width, height;
let stars = [];

window.addEventListener('load', () => {
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 1800);
});

// ตั้งค่าสำหรับดวงดาว
const config = {
    starCount: 200,      // จำนวนดวงดาวทั้งหมด
    baseColor: '#ffffff',// สีขาว
    speedMultiplier: 0.2 // ความเร็วในการลอย
};

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class Star {
    constructor() {
        this.reset();
        this.x = Math.random() * width;
        this.y = Math.random() * height;
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        
        // สุ่มขนาดให้แตกต่างกันอย่างชัดเจน
        let sizeRandom = Math.random();
        if (sizeRandom < 0.7) {
            this.radius = Math.random() * 1.2;       // ดาวดวงเล็ก
        } else if (sizeRandom < 0.95) {
            this.radius = Math.random() * 2 + 1;     // ดาวขนาดกลาง
        } else {
            this.radius = Math.random() * 2.5 + 2;   // ดาวดวงใหญ่
        }
        
        // ตั้งค่าความเรืองแสง ยิ่งดาวดวงใหญ่ ยิ่งเรืองแสงกว้างและสว่าง
        this.glow = this.radius * (Math.random() * 10 + 5); 
        
        // ความสว่างเริ่มต้น
        this.opacity = Math.random() * 0.8 + 0.2;

        // ทิศทางและความเร็ว
        this.vx = (Math.random() - 0.5) * config.speedMultiplier;
        this.vy = (Math.random() - 0.5) * config.speedMultiplier;
        
        // ความเร็วในการกระพริบ
        this.flickerSpeed = Math.random() * 0.03;
        this.flickerDirection = Math.random() > 0.5 ? 1 : -1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        
        // ใส่เอฟเฟกต์เรืองแสง
        ctx.shadowBlur = this.glow;
        ctx.shadowColor = '#ffffff'; 
        
        ctx.fill();
        ctx.shadowBlur = 0; // รีเซ็ต
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // เอฟเฟกต์ดาวกระพริบ
        this.opacity += this.flickerSpeed * this.flickerDirection;
        if (this.opacity >= 1) {
            this.opacity = 1;
            this.flickerDirection = -1;
        } else if (this.opacity <= 0.1) {
            this.opacity = 0.1;
            this.flickerDirection = 1;
        }

        // เมื่อดาวลอยหลุดขอบจอ ให้โผล่กลับมาอีกฝั่ง
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
    }
}

function init() {
    stars = [];
    for (let i = 0; i < config.starCount; i++) {
        stars.push(new Star());
    }
}

// ฟังก์ชันสำหรับวาดพระจันทร์
function drawMoon() {
    // กำหนดตำแหน่งพระจันทร์มุมขวาบน (ตอบสนองตามขนาดจอ)
    const moonX = width >= 768 ? width - 150 : width - 80;
    const moonY = width >= 768 ? 150 : 100;
    const moonRadius = width >= 768 ? 60 : 40;

    ctx.save();
    
    // 1. ออร่าแสงจันทร์รอบนอก
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#fffdf0'; // สีเหลืองนวล
    ctx.shadowBlur = 100;      // ความกว้างของแสงออร่า
    ctx.shadowColor = '#fff5b5'; // สีเรืองรองรอบพระจันทร์
    ctx.fill();

    // 2. พื้นผิวพระจันทร์ (สร้างมิติแสงและเงาด้วย Gradient)
    const gradient = ctx.createRadialGradient(
        moonX - moonRadius * 0.3, moonY - moonRadius * 0.3, moonRadius * 0.2, // จุดแสงตกกระทบ
        moonX, moonY, moonRadius // ขอบพระจันทร์
    );
    gradient.addColorStop(0, '#ffffff'); // สว่างสุดที่มุมบนซ้าย
    gradient.addColorStop(0.7, '#fdfaf0');
    gradient.addColorStop(1, '#e6e0d4'); // เงาเข้มขึ้นที่ขอบ
    
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.shadowBlur = 0; // ปิดเงาแสงสำหรับผิวพระจันทร์
    ctx.fill();

    ctx.restore();
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    // วาดพระจันทร์เป็นพื้นหลังก่อน
    drawMoon();

    // วาดดวงดาวทับซ้อน
    for (let i = 0; i < stars.length; i++) {
        stars[i].update();
        stars[i].draw();
    }

    requestAnimationFrame(animate);
}

init();
animate();

// --- ส่วนควบคุมเสียง (Audio) ---
// อย่าลืมเปลี่ยนชื่อไฟล์ 'bg-sound.mp3' ให้ตรงกับไฟล์เสียงของคุณ
const bgMusic = new Audio('bg-sound.mp3'); 
bgMusic.loop = true;
bgMusic.volume = 0.5;

// เสียงจะเริ่มเล่นเมื่อคลิกหน้าจอครั้งแรก
window.addEventListener('click', () => {
    if (bgMusic.paused) {
        bgMusic.play().catch(error => {
            console.log("ไม่สามารถเล่นเสียงได้:", error);
        });
    }
});