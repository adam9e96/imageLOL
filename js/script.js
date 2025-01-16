// DOM 요소 선택
const themeToggle = document.getElementById('themeToggle'); // 라이트 / 다크 테마 전환 버튼
const icon = themeToggle.querySelector('i'); // 아이콘 요소
const textArea = document.getElementById('text');
const charCountSpan = document.getElementById('charCount');
const byteCountSpan = document.getElementById('byteCount');
const fontSizeSlider = document.getElementById('fontSize');
const qualitySlider = document.getElementById('quality');
const imageWidthSlider = document.getElementById('imageWidth');
const previewImage = document.getElementById('previewImage');
const compressionSlider = document.getElementById('compression');
const imageFormatSelect = document.getElementById('imageFormat');
const alignButtons = document.querySelectorAll('.text-align-buttons button');


// 현재 텍스트 정렬 상태 저장
let currentTextAlign = 'left';


// 텍스트 정렬 버튼 이벤트
alignButtons.forEach(button => {
    button.addEventListener('click', function () {
        alignButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        currentTextAlign = this.dataset.align;
        updatePreview();
    });
});

/**
 * @description 테마 전환 함수
 * @function toggleTheme
 * @returns {void}
 */
function toggleTheme() {
    // https://getbootstrap.com/docs/5.3/customize/color-modes/
    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-bs-theme', newTheme);
    icon.className = newTheme === 'light' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
    updatePreview();
}


// 기본 테마 설정 (light)
document.documentElement.setAttribute('data-bs-theme', 'light');

// https://icons.getbootstrap.com/icons/sun-fill/
icon.className = 'bi bi-sun-fill';

// 테마 전환 버튼 클릭시 toggleTheme 함수 실행
themeToggle.addEventListener('click', toggleTheme);

/**
 * @description 문자열(글자수) 길이 계산 함수
 * @function countCharacters
 * @param {string} str - 입력 문자열
 * @returns {number} 문자열 길이
 */    function countCharacters(str) {
    return str.length;
}

/**
 * @description 바이트 수 계산 함수
 * @function countBytes
 * @param {string} str - 입력 문자열
 * @returns {number} 바이트 수
 */
function countBytes(str) {
    const encoder = new TextEncoder();
    return encoder.encode(str).length;
}

// https://lodash.com/docs/4.17.15#debounce
/**
 * @description Loadash 라이브러리의 debounce 함수를 사용하여 입력이 멈춘 후 300ms 후에 미리보기 업데이트
 * @function updatePreview
 * @debounce 300ms
 */
const updatePreview = _.debounce(function () {
    generateImage(false);
}, 300);


// ====================================================================================================
// 텍스트 입력시 글자수, 바이트수 세기 및 미리보기 업데이트
textArea.addEventListener('input', function () {
    const text = this.value;
    charCountSpan.textContent = countCharacters(text).toString();
    byteCountSpan.textContent = countBytes(text).toString();
    updatePreview();
});

// 폰트 크기, 이미지 품질, 이미지 폭 조절시 미리보기 업데이트
// JavaScript 부분 수정
fontSizeSlider.addEventListener('input', function () {
    document.getElementById('fontSizeValue').textContent = this.value + 'pt';
    updatePreview();
});

qualitySlider.addEventListener('input', function () {
    document.getElementById('qualityValue').textContent = this.value + 'x';
    updatePreview();
});

imageWidthSlider.addEventListener('input', function () {
    const width = this.value;
    document.getElementById('imageWidthValue').textContent = width + '%';
    previewImage.style.maxWidth = width + '%';
    updatePreview();
});


compressionSlider.addEventListener('input', function () {
    document.getElementById('compressionValue').textContent = this.value + '%';
    updatePreview();
});

// 폰트 선택시 미리보기 업데이트
document.getElementById('font').addEventListener('change', updatePreview);

// ====================================================================================================


function generateImage(download = false) {
    try {
        const text = textArea.value;

        if (!text) {
            previewImage.style.display = 'none';
            return;
        }

        // 사용자 입력값 가져오기
        const fontSizePt = parseInt(fontSizeSlider.value);
        const fontSizePx = Math.round(fontSizePt * 1.333); // pt를 px로 변환
        const fontFamily = document.getElementById('font').value;
        const quality = parseFloat(qualitySlider.value);
        const imageWidthPercent = parseInt(imageWidthSlider.value);
        const compression = parseInt(compressionSlider.value) / 100;
        const imageFormat = imageFormatSelect.value;

        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');

        // 텍스트를 줄바꿈으로 분리
        const lines = text.split('\n').map(line => String(line));

        // 각 줄의 너비 측정
        ctx.font = `${fontSizePx}px ${fontFamily}`;
        let maxWidth = 0;
        lines.forEach((line) => {
            const metrics = ctx.measureText(line);
            maxWidth = Math.max(maxWidth, metrics.width);
        });


        // 이미지 가로폭 조절 적용
        maxWidth = maxWidth * (imageWidthPercent / 100);

        // 캔버스 크기 설정
        const width = maxWidth + 40;
        const height = (fontSizePx * 1.5 * lines.length) + 40;

        canvas.width = width * quality;
        canvas.height = height * quality;

        ctx.scale(quality, quality);

        // 배경색 설정
        ctx.fillStyle = document.documentElement.getAttribute('data-bs-theme') === 'dark' ? '#212529' : 'white';
        ctx.fillRect(0, 0, width, height);

        // 텍스트 스타일 설정
        ctx.textBaseline = 'middle';
        ctx.textAlign = currentTextAlign;
        ctx.font = `${fontSizePx}px ${fontFamily}`;
        ctx.fillStyle = document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'white' : 'black';
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';


        // 텍스트 정렬에 따른 x 좌표 설정
        let xPosition;
        switch (currentTextAlign) {
            case 'left':
                xPosition = 20;
                break;
            case 'center':
                xPosition = width / 2;
                break;
            case 'right':
                xPosition = width - 20;
                break;
            default:
                xPosition = 20;
        }

        // 텍스트 그리기 (텍스트 정렬에 따른 위치 조정)
        lines.forEach((line, index) => {
            const y = (fontSizePx * 1.5 * (index + 0.5)) + 20;
            let x;
            switch (currentTextAlign) {
                case 'left':
                    x = 20;
                    break;
                case 'center':
                    x = width / 2;
                    break;
                case 'right':
                    x = width - 20;
                    break;
                default:
                    x = 20;
            }
            ctx.fillText(line, x, y);
        });


        // 이미지 포맷과 품질 설정에 따른 DataURL 생성
        let imageDataUrl;
        if (imageFormat === 'image/jpeg') {
            imageDataUrl = canvas.toDataURL('image/jpeg', compression);
        } else if (imageFormat === 'image/webp') {
            imageDataUrl = canvas.toDataURL('image/webp', compression);
        } else {
            imageDataUrl = canvas.toDataURL('image/png');
        }


        // 미리보기 업데이트
        previewImage.src = imageDataUrl;
        previewImage.style.display = 'inline-block';
        ;

        // 다운로드 처리
        if (download) {
            const link = document.createElement('a');
            const fileExtension = imageFormat.split('/')[1];
            link.download = `text-image.${fileExtension}`;
            link.href = imageDataUrl;
            link.click();
        }

    } catch (e) {
        console.error("이미지 생성 실패:", e);
    }
}

// 초기화
updatePreview();
