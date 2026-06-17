const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
  '岐阜県', '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府',
  '兵庫県', '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県',
  '山口県', '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県',
  '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
];

const FIELD_IDS = [
  'lastNameKanji', 'firstNameKanji', 'lastNameKana', 'firstNameKana',
  'lastNameRoma', 'firstNameRoma',
  'birthYear', 'birthMonth', 'birthDay',
  'postalCode', 'prefecture', 'addressCity', 'addressStreet', 'addressBuilding',
  'homePhone', 'mobilePhone',
  'vacationPostalCode', 'vacationPrefecture',
  'vacationAddressCity', 'vacationAddressStreet', 'vacationAddressBuilding', 'vacationPhone',
  'labName', 'clubName',
  'graduationYear', 'graduationMonth', 'graduationStatus',
  'email', 'mobileEmail',
];

function addOption(select, value, label) {
  const opt = document.createElement('option');
  opt.value = value; opt.textContent = label; select.appendChild(opt);
}

function populateSelects() {
  const blank = (s) => addOption(s, '', '-▼-');
  const ybirth = document.getElementById('birthYear');
  blank(ybirth);
  const currentYear = new Date().getFullYear();
  for (let y = 1990; y <= currentYear; y++) addOption(ybirth, String(y), String(y));
  const mbirth = document.getElementById('birthMonth');
  blank(mbirth);
  for (let m = 1; m <= 12; m++) addOption(mbirth, String(m), String(m).padStart(2, '0'));
  const dbirth = document.getElementById('birthDay');
  blank(dbirth);
  for (let d = 1; d <= 31; d++) addOption(dbirth, String(d), String(d).padStart(2, '0'));
  for (const id of ['prefecture', 'vacationPrefecture']) {
    const sel = document.getElementById(id); blank(sel);
    for (const name of PREFECTURES) addOption(sel, name, name);
  }
  const syear = document.getElementById('graduationYear');
  blank(syear);
  for (let y = 2010; y <= 2030; y++) addOption(syear, String(y), String(y));
  const smonth = document.getElementById('graduationMonth');
  blank(smonth);
  for (let m = 1; m <= 12; m++) addOption(smonth, String(m), String(m).padStart(2, '0'));
}

function toggleVacationFields() {
  const checked = document.getElementById('sameAsHome').checked;
  document.getElementById('vacationFields').classList.toggle('hidden', checked);
}

function loadProfile() {
  chrome.storage.local.get('profile', (data) => {
    const profile = data.profile || {};
    for (const id of FIELD_IDS) {
      const el = document.getElementById(id);
      if (el && profile[id] !== undefined) el.value = profile[id];
    }
    if (profile.gender) {
      const radio = document.querySelector(`input[name="gender"][value="${profile.gender}"]`);
      if (radio) radio.checked = true;
    }
    document.getElementById('sameAsHome').checked = !!profile.sameAsHome;
    toggleVacationFields();
  });
}

function collectProfile() {
  const profile = {};
  for (const id of FIELD_IDS) {
    const el = document.getElementById(id);
    if (el) profile[id] = el.value.trim();
  }
  const genderEl = document.querySelector('input[name="gender"]:checked');
  profile.gender = genderEl ? genderEl.value : '';
  profile.sameAsHome = document.getElementById('sameAsHome').checked;
  return profile;
}

function showStatus(message, isError = false) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.classList.toggle('error', isError);
  if (!isError) setTimeout(() => { status.textContent = ''; }, 3000);
}

function saveProfile(e) {
  e.preventDefault();
  const profile = collectProfile();
  chrome.storage.local.set({ profile }, () => {
    if (chrome.runtime.lastError) showStatus('保存に失敗しました: ' + chrome.runtime.lastError.message, true);
    else showStatus('✓ 保存しました');
  });
}

function clearProfile() {
  if (!confirm('登録済みの個人情報をすべて削除します。よろしいですか？')) return;
  chrome.storage.local.remove('profile', () => {
    document.getElementById('profileForm').reset();
    toggleVacationFields();
    showStatus('✓ 削除しました');
  });
}

// ===== バックアップ / 復元 =====

function setBackupStatus(message, isError = false) {
  const el = document.getElementById('backupStatus');
  el.textContent = message;
  el.classList.toggle('error', isError);
  if (!isError) setTimeout(() => { el.textContent = ''; }, 4000);
}

function exportData() {
  chrome.storage.local.get(['profile', 'appliedCompanies'], (data) => {
    const backup = {
      app: 'shukatsu-autofill',
      type: 'backup',
      version: 1,
      exportedAt: new Date().toISOString(),
      profile: data.profile || {},
      appliedCompanies: data.appliedCompanies || [],
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const stamp = new Date().toISOString().slice(0, 10);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shukatsu-autofill-backup-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setBackupStatus('✓ バックアップを保存しました');
  });
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    let parsed;
    try {
      parsed = JSON.parse(reader.result);
    } catch {
      setBackupStatus('読み込みに失敗しました（JSON形式のバックアップファイルではありません）', true);
      return;
    }
    const hasProfile = parsed && typeof parsed.profile === 'object' && parsed.profile !== null;
    const hasApplied = parsed && Array.isArray(parsed.appliedCompanies);
    if (!hasProfile && !hasApplied) {
      setBackupStatus('このファイルは復元できません（対応していない形式です）', true);
      return;
    }
    if (!confirm('現在の個人情報・応募履歴を、ファイルの内容で上書きします。よろしいですか？')) return;
    const toSet = {};
    if (hasProfile) toSet.profile = parsed.profile;
    if (hasApplied) toSet.appliedCompanies = parsed.appliedCompanies;
    chrome.storage.local.set(toSet, () => {
      if (chrome.runtime.lastError) {
        setBackupStatus('復元に失敗しました: ' + chrome.runtime.lastError.message, true);
        return;
      }
      loadProfile();
      showMaster();
      setBackupStatus('✓ 復元しました');
    });
  };
  reader.onerror = () => setBackupStatus('ファイルの読み込みに失敗しました', true);
  reader.readAsText(file);
}

// ===== 応募履歴 + 企業メモ帳 =====

const STATUS_OPTIONS = [
  '未応募', '応募済み', '書類選考', 'Webテスト',
  '一次面接', '二次面接', '最終面接', '内定', 'お見送り', '辞退',
];

let currentDetailId = null;       // 開いている詳細（メモ帳）の企業ID
let detailSaveTimer = null;       // 自由入力の保存デバウンス用

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function getApplied(cb) {
  chrome.storage.local.get('appliedCompanies', (data) => cb(data.appliedCompanies || []));
}
function setApplied(list, cb) {
  chrome.storage.local.set({ appliedCompanies: list }, cb || (() => {}));
}

function statusClass(status) {
  switch (status) {
    case '内定': return 'st-offer';
    case 'お見送り':
    case '辞退': return 'st-closed';
    case '未応募':
    case '': return 'st-none';
    default: return 'st-active';
  }
}

function formatDate(iso) {
  return iso ? new Date(iso).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '';
}

// ----- 一覧（マスター）-----

function renderApplied(list) {
  const box = document.getElementById('appliedList');
  if (!list || !list.length) {
    box.innerHTML = '<p class="applied-empty">まだ記録がありません。対応サイトで自動入力を実行するか、「＋ 企業を追加」で手動登録できます。</p>';
    return;
  }
  const sorted = [...list].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  box.innerHTML = '';
  for (const item of sorted) {
    const row = document.createElement('div');
    row.className = 'applied-row';
    row.dataset.id = item.id;
    const status = item.status || '';
    const statusBadge = status
      ? `<span class="status-badge ${statusClass(status)}">${escapeHtml(status)}</span>` : '';
    const nextBadge = item.nextDate
      ? `<span class="next-badge">次回 ${escapeHtml(item.nextDate)}</span>` : '';
    const memoBadge = item.memo && item.memo.trim() ? '<span class="memo-badge">📝</span>' : '';
    row.innerHTML = `
      <button type="button" class="applied-open">
        <span class="applied-name-text">${escapeHtml(item.name || '（無題 — クリックして入力）')}</span>
        <span class="applied-badges">${statusBadge}${nextBadge}${memoBadge}</span>
        <span class="applied-meta">${escapeHtml(item.platform || '')} ・ ${escapeHtml(formatDate(item.date))}</span>
      </button>
      <button type="button" class="applied-del" data-id="${item.id}" title="この企業を削除">×</button>
    `;
    box.appendChild(row);
  }
}

function loadApplied() {
  getApplied(renderApplied);
}

function onAppliedListClick(e) {
  const delBtn = e.target.closest('.applied-del');
  if (delBtn) {
    const id = Number(delBtn.dataset.id);
    if (!confirm('この企業の記録とメモを削除します。よろしいですか？')) return;
    getApplied((list) => setApplied(list.filter((c) => c.id !== id), loadApplied));
    return;
  }
  const row = e.target.closest('.applied-row');
  if (row) openDetail(Number(row.dataset.id));
}

function addCompany() {
  const id = Date.now();
  const entry = {
    id, name: '', platform: '手動', url: '', key: 'manual:' + id,
    date: new Date().toISOString(), edited: true,
    status: '未応募', nextDate: '', memo: '',
  };
  getApplied((list) => {
    list.push(entry);
    setApplied(list, () => {
      openDetail(id);
      const el = document.getElementById('detailName');
      if (el) el.focus();
    });
  });
}

function clearApplied() {
  if (!confirm('応募履歴と企業メモをすべて削除します。よろしいですか？')) return;
  setApplied([], () => { loadApplied(); showStatus('✓ 応募履歴を削除しました'); });
}

function copyAppliedCsv() {
  getApplied((data) => {
    const list = [...data].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    if (!list.length) { showStatus('履歴がありません', true); return; }
    const esc = (s) => `"${String(s == null ? '' : s).replace(/"/g, '""')}"`;
    const header = ['企業名', '選考ステータス', '次回予定日', 'メモ', 'プラットフォーム', '記録日時', 'URL'];
    const rows = [header.map(esc).join(',')];
    for (const c of list) {
      const d = c.date ? new Date(c.date).toLocaleString('ja-JP') : '';
      rows.push([c.name, c.status, c.nextDate, c.memo, c.platform, d, c.url].map(esc).join(','));
    }
    navigator.clipboard.writeText(rows.join('\r\n')).then(
      () => showStatus('✓ CSVをコピーしました（Excel等に貼り付けできます）'),
      () => showStatus('コピーに失敗しました', true),
    );
  });
}

// ----- 詳細（企業メモ帳ページ）-----

function populateDetailStatus() {
  const sel = document.getElementById('detailStatus');
  addOption(sel, '', '（未設定）');
  for (const s of STATUS_OPTIONS) addOption(sel, s, s);
}

function openDetail(id) {
  getApplied((list) => {
    const item = list.find((c) => c.id === id);
    if (!item) return;
    currentDetailId = id;
    document.getElementById('detailName').value = item.name || '';
    document.getElementById('detailStatus').value = item.status || '';
    document.getElementById('detailNextDate').value = item.nextDate || '';
    document.getElementById('detailMemo').value = item.memo || '';
    const dateStr = item.date ? new Date(item.date).toLocaleString('ja-JP') : '';
    const link = item.url
      ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener">応募ページを開く</a>`
      : '手動で追加した企業';
    document.getElementById('detailMeta').innerHTML =
      `${escapeHtml(item.platform || '')}${dateStr ? ' ・ 記録 ' + escapeHtml(dateStr) : ''} ・ ${link}`;
    document.getElementById('detailSaveStatus').textContent = '';
    document.getElementById('appliedMaster').classList.add('hidden');
    document.getElementById('appliedDetail').classList.remove('hidden');
  });
}

function showMaster() {
  currentDetailId = null;
  document.getElementById('appliedDetail').classList.add('hidden');
  document.getElementById('appliedMaster').classList.remove('hidden');
  loadApplied();
}

function saveDetail() {
  if (currentDetailId == null) return;
  const name = document.getElementById('detailName').value.trim();
  const status = document.getElementById('detailStatus').value;
  const nextDate = document.getElementById('detailNextDate').value;
  const memo = document.getElementById('detailMemo').value;
  getApplied((list) => {
    const item = list.find((c) => c.id === currentDetailId);
    if (!item) return;
    item.name = name; item.edited = true;
    item.status = status; item.nextDate = nextDate; item.memo = memo;
    setApplied(list, () => {
      const s = document.getElementById('detailSaveStatus');
      s.textContent = '✓ 自動保存しました';
      clearTimeout(saveDetail._t);
      saveDetail._t = setTimeout(() => { s.textContent = ''; }, 1500);
    });
  });
}

function scheduleSaveDetail() {
  clearTimeout(detailSaveTimer);
  detailSaveTimer = setTimeout(saveDetail, 400);
}

function deleteCurrentDetail() {
  if (currentDetailId == null) return;
  if (!confirm('この企業の記録とメモを削除します。よろしいですか？')) return;
  getApplied((list) => setApplied(list.filter((c) => c.id !== currentDetailId), showMaster));
}

document.addEventListener('DOMContentLoaded', () => {
  populateSelects();
  populateDetailStatus();
  loadProfile();
  loadApplied();
  document.getElementById('profileForm').addEventListener('submit', saveProfile);
  document.getElementById('clearBtn').addEventListener('click', clearProfile);
  document.getElementById('sameAsHome').addEventListener('change', toggleVacationFields);

  // バックアップ / 復元
  document.getElementById('exportBtn').addEventListener('click', exportData);
  document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
  document.getElementById('importFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) importData(file);
    e.target.value = '';  // 同じファイルを連続選択できるようリセット
  });

  // 一覧
  document.getElementById('appliedList').addEventListener('click', onAppliedListClick);
  document.getElementById('addCompanyBtn').addEventListener('click', addCompany);
  document.getElementById('clearAppliedBtn').addEventListener('click', clearApplied);
  document.getElementById('copyCsvBtn').addEventListener('click', copyAppliedCsv);

  // 詳細（メモ帳）— 入力するたびに自動保存
  document.getElementById('backToListBtn').addEventListener('click', showMaster);
  document.getElementById('detailDeleteBtn').addEventListener('click', deleteCurrentDetail);
  document.getElementById('appliedDetail').addEventListener('input', scheduleSaveDetail);
});
