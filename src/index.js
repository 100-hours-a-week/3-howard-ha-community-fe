new TypeIt("#header-text", {
    speed: 50,
    startDelay: 900,
})
    .type("이야기", { delay: 100 })
    .move(-7, { delay: 100 })
    .type("당신의 ", { delay: 400 })
    .move(null, { to: "START", instant: true, delay: 300 })
    .move(8, { delay: 200 })
    .type("💬", { delay: 225 })
    .pause(200)
    .move(2, { instant: true })
    .pause(200)
    .move(5, { instant: true })
    .move(5, { delay: 200 })
    .type('<br>우리의 ', { delay: 200 })
    .type('<span style="color: #dc3545">자랑이니까🎈</span>', { delay: 350 })
    .delete(6, { delay: 350 })
    .type('<span id="place" style="color: cornflowerblue">경쟁력이니까 🔥</span>', { delay: 400 })
    .delete(21, { delay: 350 })
    .type("당신의 일상📝", { delay: 400 })
    .type("<br>우리의 이야기가 될 때💭", { delay: 400 })
    .type("<br><span style='color: coral'>이음🧶</span>", { delay: 400 })
    .go();

document.addEventListener('DOMContentLoaded', () => {
    // 1. 색상 팔레트
    const colors = [
        '#a2d2ff', '#b8e0d4', '#ffe0b2', '#d8a4e1', '#ffb3a7',
        '#fde4a0', '#c8e6c9', '#ffc0cb', '#b2dfdb', '#dcedc8',
        '#f0e68c', '#ffccbc'
    ];

    // 2. 헬퍼 함수
    function getRandom(min, max) {
        return Math.random() * (max - min) + min;
    }

    // 3. 모든 말풍선 요소 선택
    const bubbles = document.querySelectorAll('.message-bubble');

    bubbles.forEach(bubble => {
        // 4. --- 랜덤 속성 생성 ---
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomWidth = getRandom(50, 110);
        const randomHeight = randomWidth * getRandom(0.7, 0.9);
        const randomTop = getRandom(5, 95);
        const randomDuration = getRandom(15, 25);
        const randomDelay = getRandom(0, 10);
        const randomFontSize = randomHeight / 40;
        // 5. --- 생성된 속성 적용 ---
        bubble.style.backgroundColor = randomColor;
        bubble.style.width = `${randomWidth}px`;
        bubble.style.height = `${randomHeight}px`;
        bubble.style.top = `${randomTop}%`;
        bubble.style.animationDuration = `${randomDuration}s`;
        bubble.style.animationDelay = `${randomDelay}s`;
        bubble.style.setProperty('--bubble-font-size', `${randomFontSize}rem`);
    });
});