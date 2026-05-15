const ATPT_OFCDC_SC_CODE = "B10"; // 서울특별시교육청
const SD_SCHUL_CODE = "7010703"; // 자운고등학교

// DOM 요소
const datePicker = document.getElementById('datePicker');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const displayDate = document.getElementById('displayDate');
const calorieInfo = document.getElementById('calorieInfo');
const menuList = document.getElementById('menuList');
const emptyMessage = document.getElementById('emptyMessage');
const loading = document.getElementById('loading');
const menuContainer = document.getElementById('menuContainer');

// 날짜 유틸리티
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

function getDisplayDate(date) {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayName = days[date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${dayName})`;
}

// 초기 로드
document.addEventListener('DOMContentLoaded', () => {
    // 오늘 날짜로 초기화
    const today = new Date();
    
    // date picker value 설정 (YYYY-MM-DD)
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    datePicker.value = `${year}-${month}-${day}`;

    fetchLunchData(today);
});

// 이벤트 리스너
datePicker.addEventListener('change', (e) => {
    const selectedDate = new Date(e.target.value);
    fetchLunchData(selectedDate);
});

prevBtn.addEventListener('click', () => {
    const currentDate = new Date(datePicker.value);
    currentDate.setDate(currentDate.getDate() - 1);
    updateDateAndFetch(currentDate);
});

nextBtn.addEventListener('click', () => {
    const currentDate = new Date(datePicker.value);
    currentDate.setDate(currentDate.getDate() + 1);
    updateDateAndFetch(currentDate);
});

function updateDateAndFetch(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    datePicker.value = `${year}-${month}-${day}`;
    fetchLunchData(date);
}

// API 호출
async function fetchLunchData(date) {
    // UI 상태 변경
    menuContainer.classList.add('hidden');
    loading.classList.remove('hidden');
    menuList.innerHTML = '';
    calorieInfo.classList.add('hidden');
    emptyMessage.classList.add('hidden');
    
    displayDate.textContent = getDisplayDate(date);
    const dateStr = formatDate(date);
    
    const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json&pIndex=1&pSize=10&ATPT_OFCDC_SC_CODE=${ATPT_OFCDC_SC_CODE}&SD_SCHUL_CODE=${SD_SCHUL_CODE}&MLSV_YMD=${dateStr}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.mealServiceDietInfo) {
            const rowData = data.mealServiceDietInfo[1].row[0];
            renderMenu(rowData.DDISH_NM, rowData.CAL_INFO);
        } else {
            showEmpty();
        }
    } catch (error) {
        console.error("API Fetch Error:", error);
        showEmpty();
    } finally {
        loading.classList.add('hidden');
        menuContainer.classList.remove('hidden');
    }
}

// 메뉴 렌더링
function renderMenu(menuString, calorie) {
    // "메뉴명 (알레르기번호)" 형태 파싱
    const menuItems = menuString.split('<br/>');
    
    menuItems.forEach(item => {
        if (!item.trim()) return;
        
        const li = document.createElement('li');
        li.className = 'menu-item';
        
        // 정규식을 사용하여 메뉴명과 알레르기 정보 분리
        const match = item.match(/^(.*?)\s*(\([0-9\.]+\))?$/);
        const foodName = match[1].trim();
        const allergy = match[2] ? match[2] : '';

        const nameSpan = document.createElement('span');
        nameSpan.textContent = foodName;
        li.appendChild(nameSpan);

        if (allergy) {
            const allergySpan = document.createElement('span');
            allergySpan.className = 'allergy-info';
            allergySpan.textContent = allergy;
            li.appendChild(allergySpan);
        }

        menuList.appendChild(li);
    });

    calorieInfo.textContent = `⚡ ${calorie}`;
    calorieInfo.classList.remove('hidden');
}

function showEmpty() {
    emptyMessage.classList.remove('hidden');
}
