const matList = [
  { name: "750size", size: 750, area: 562500, lossRate: 0.08 },
  { name: "1200size", size: 1200, area: 1440000, lossRate: 0.12 },
  { name: "1300size", size: 1300, area: 1690000, lossRate: 0.12 }
];

const defaultSpaces = [
  { name: "거실", width: 3600, height: 3600 }
];

function makeSpaceCard(space = { name: "", width: "", height: "" }) {
  const card = document.createElement("div");
  card.className = "space-card";
  card.innerHTML = `
    <div class="space-top">
      <input class="space-title" type="text" value="${space.name || ""}" placeholder="공간명">
      <button type="button" class="btn delete" onclick="removeSpace(this)">삭제</button>
    </div>
    <div class="input-grid">
      <div>
        <label>가로(mm)</label>
        <input class="space-width" type="number" value="${space.width || ""}" placeholder="예: 3600">
      </div>
      <div>
        <label>세로(mm)</label>
        <input class="space-height" type="number" value="${space.height || ""}" placeholder="예: 3600">
      </div>
    </div>
  `;
  return card;
}

function renderSpaces(spaces = defaultSpaces) {
  const container = document.getElementById("spaces");
  container.innerHTML = "";
  spaces.forEach(space => container.appendChild(makeSpaceCard(space)));
  updateSpaceCount();
}

function updateSpaceCount() {
  const count = document.querySelectorAll(".space-card").length;
  document.getElementById("spaceCount").textContent = `${count}개 공간`;
}

function addSpace() {
  document.getElementById("spaces").appendChild(makeSpaceCard({ name: "", width: "", height: "" }));
  updateSpaceCount();
}

function removeSpace(button) {
  const cards = document.querySelectorAll(".space-card");
  if (cards.length <= 1) {
    alert("최소 1개의 공간은 필요합니다.");
    return;
  }
  button.closest(".space-card").remove();
  updateSpaceCount();
}

function resetAll() {
  renderSpaces(defaultSpaces);
  document.getElementById("summary").innerHTML = "공간을 입력한 뒤 계산하기를 눌러주세요.";
  document.getElementById("resultTableBody").innerHTML = `<tr><td colspan="5">계산 결과가 여기에 표시됩니다.</td></tr>`;
  document.getElementById("resultCards").innerHTML = `<div class="empty-card">계산 결과가 여기에 표시됩니다.</div>`;
}

function getSpaceData() {
  const cards = document.querySelectorAll(".space-card");
  const data = [];
  cards.forEach((card, index) => {
    const name = card.querySelector(".space-title").value.trim() || `공간${index + 1}`;
    const width = Number(card.querySelector(".space-width").value);
    const height = Number(card.querySelector(".space-height").value);
    if (width > 0 && height > 0) data.push({ name, width, height, area: width * height });
  });
  return data;
}

function makeDetailHTML(spaces, totalArea, finalCount) {
  let html = "";
  let allocated = 0;

  spaces.forEach((space, idx) => {
    let count = Math.floor((space.area / totalArea) * finalCount);
    if (idx === spaces.length - 1) count = finalCount - allocated;
    allocated += count;

    html += `
      <div>
        <strong>${space.name}</strong> / ${space.width.toLocaleString()} × ${space.height.toLocaleString()}mm / 약 ${count}장
      </div>
    `;
  });

  html += `<hr><div>전체 최종 예상장수: <strong>${finalCount}장</strong></div>`;
  return html;
}

function calculate() {
  const spaces = getSpaceData();
  if (spaces.length === 0) {
    alert("가로와 세로 치수를 입력해주세요.");
    return;
  }

  const totalArea = spaces.reduce((sum, item) => sum + item.area, 0);
  document.getElementById("summary").innerHTML = `입력 공간 ${spaces.length}개 / 전체 시공면적 ${totalArea.toLocaleString()}㎟`;

  let tableHTML = "";
  let cardHTML = "";

  matList.forEach((mat, index) => {
    const rawAreaCount = totalArea / mat.area;
    const areaBaseCount = Math.floor(rawAreaCount);
    const finalRawCount = rawAreaCount * (1 + mat.lossRate);
    const finalCount = Math.floor(finalRawCount);
    const detailId = `detail-${index}`;
    const mobileDetailId = `mobile-detail-${index}`;
    const detailHTML = makeDetailHTML(spaces, totalArea, finalCount);

    tableHTML += `
      <tr>
        <td><strong>${mat.name}</strong></td>
        <td>${totalArea.toLocaleString()}㎟</td>
        <td>${areaBaseCount}장<br><small>(${rawAreaCount.toFixed(1)}장 내림)</small></td>
        <td><strong>${finalCount}장</strong><br><small>(${finalRawCount.toFixed(1)}장 내림)</small></td>
        <td>
          <button class="detail-btn" onclick="toggleDetail('${detailId}')">상세보기</button>
          <div id="${detailId}" class="detail-box">${detailHTML}</div>
        </td>
      </tr>
    `;

    cardHTML += `
      <article class="result-card">
        <div class="result-card-head">
          <div class="result-card-title">${mat.name}</div>
          <div class="result-count">${finalCount}장</div>
        </div>
        <div class="result-meta">
          <div class="meta-box">
            <div class="meta-label">전체 시공면적</div>
            <div class="meta-value">${totalArea.toLocaleString()}㎟</div>
          </div>
          <div class="meta-box">
            <div class="meta-label">단순 면적기준</div>
            <div class="meta-value">${areaBaseCount}장</div>
          </div>
        </div>
        <button class="detail-btn" onclick="toggleDetail('${mobileDetailId}')">공간별 산출 보기</button>
        <div id="${mobileDetailId}" class="detail-box">${detailHTML}</div>
      </article>
    `;
  });

  document.getElementById("resultTableBody").innerHTML = tableHTML;
  document.getElementById("resultCards").innerHTML = cardHTML;
}

function toggleDetail(id) {
  document.getElementById(id).classList.toggle("active");
}

renderSpaces();
