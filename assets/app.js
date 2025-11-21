// ---------- TAB SWITCHING ----------
document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelector(".tab.active").classList.remove("active");
        tab.classList.add("active");

        document.querySelector(".tab-content.active").classList.remove("active");
        document.getElementById(tab.dataset.tab).classList.add("active");
    });
});

// ---------- DEFAULT DATA ----------
let data = {
    level: 1,
    xp: 40,
    streak: 0,
    proficiency: {
        maths: 70,
        physics: 60,
        oc: 55,
        pc: 65,
        ioc: 72
    }
};

// ---------- READ VALUES FROM URL ----------
let params = new URLSearchParams(location.search);
params.forEach((value, key) => {
    if (data.proficiency[key] !== undefined) {
        data.proficiency[key] = Number(value);
    }
});

// ---------- UPDATE PROFILE ----------
document.getElementById("playerLevel").innerText = "Level " + data.level;
document.getElementById("streakValue").innerText = data.streak;
document.getElementById("xpFill").style.width = data.xp + "%";

// Mini bars
let mini = "";
Object.entries(data.proficiency).forEach(([k, v]) => {
    mini += `
        <p>${k.toUpperCase()}</p>
        <div class="skill-bar"><div class="skill-fill" style="width:${v}%;"></div></div>
    `;
});
document.getElementById("miniBars").innerHTML = mini;

// Full bars
let full = "";
Object.entries(data.proficiency).forEach(([k, v]) => {
    full += `
        <div class="skill-item">
            <div class="skill-title-row">
                <span>${k.toUpperCase()}</span>
                <span>${v}%</span>
            </div>
            <div class="skill-bar">
                <div class="skill-fill" style="width:${v}%;"></div>
            </div>
        </div>
    `;
});
document.getElementById("skillsContainer").innerHTML = full;

// ---------- SIMPLE RADAR ----------
let canvas = document.getElementById("radarCanvas");
let ctx = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 500;

function drawRadar() {
    ctx.clearRect(0, 0, 500, 500);
    ctx.strokeStyle = "#00d0ff";
    ctx.lineWidth = 2;

    let centerX = 250;
    let centerY = 250;
    let radiusMax = 180;
    let values = Object.values(data.proficiency);
    let angleStep = (Math.PI * 2) / values.length;

    ctx.beginPath();
    values.forEach((val, i) => {
        let angle = i * angleStep - Math.PI / 2;
        let r = (val / 100) * radiusMax;

        let x = centerX + r * Math.cos(angle);
        let y = centerY + r * Math.sin(angle);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });

    ctx.closePath();
    ctx.stroke();
}

drawRadar();
