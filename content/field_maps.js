// プラットフォーム別フィールドマップ
// scripting.executeScript で注入されるため window スコープに置く
// 2回目以降の注入で const 再宣言エラーが起きないようガード
if (!window.JOBHUNT_PLATFORMS) {

// ===== 共通 =====

// 都道府県名 → 数値コード（JIS X 0401 準拠）
const PREFECTURE_INDEX = {
  '北海道': 1, '青森県': 2, '岩手県': 3, '宮城県': 4, '秋田県': 5,
  '山形県': 6, '福島県': 7, '茨城県': 8, '栃木県': 9, '群馬県': 10,
  '埼玉県': 11, '千葉県': 12, '東京都': 13, '神奈川県': 14, '新潟県': 15,
  '富山県': 16, '石川県': 17, '福井県': 18, '山梨県': 19, '長野県': 20,
  '岐阜県': 21, '静岡県': 22, '愛知県': 23, '三重県': 24, '滋賀県': 25,
  '京都府': 26, '大阪府': 27, '兵庫県': 28, '奈良県': 29, '和歌山県': 30,
  '鳥取県': 31, '島根県': 32, '岡山県': 33, '広島県': 34, '山口県': 35,
  '徳島県': 36, '香川県': 37, '愛媛県': 38, '高知県': 39, '福岡県': 40,
  '佐賀県': 41, '長崎県': 42, '熊本県': 43, '大分県': 44, '宮崎県': 45,
  '鹿児島県': 46, '沖縄県': 47,
};

// snar.jp 独自都道府県コード（JIS順と異なる）
const SNAR_PREFECTURE_INDEX = {
  '北海道': 1,  '青森県': 2,  '岩手県': 3,  '秋田県': 4,  '山形県': 5,
  '宮城県': 6,  '福島県': 7,  '茨城県': 8,  '栃木県': 9,  '群馬県': 10,
  '埼玉県': 11, '千葉県': 12, '東京都': 13, '神奈川県': 14, '山梨県': 15,
  '長野県': 16, '新潟県': 17, '富山県': 18, '石川県': 19, '福井県': 20,
  '岐阜県': 21, '静岡県': 22, '愛知県': 23, '三重県': 24, '滋賀県': 25,
  '京都府': 26, '大阪府': 27, '兵庫県': 28, '奈良県': 29, '鳥取県': 30,
  '和歌山県': 31, '島根県': 32, '岡山県': 33, '広島県': 34, '山口県': 35,
  '徳島県': 36, '香川県': 37, '愛媛県': 38, '高知県': 39, '福岡県': 40,
  '佐賀県': 41, '長崎県': 42, '熊本県': 43, '大分県': 44, '宮崎県': 45,
  '鹿児島県': 46, '沖縄県': 47,
};

const T = {
  pad2:        (v) => v ? String(v).padStart(2, '0') : v,
  raw:         (v) => v,
  prefPadded:  (name) => { const n = PREFECTURE_INDEX[name]; return n ? String(n).padStart(2, '0') : ''; },
  prefRaw:     (name) => { const n = PREFECTURE_INDEX[name]; return n ? String(n) : ''; },
  prefSnar:    (name) => { const n = SNAR_PREFECTURE_INDEX[name]; return n ? String(n) : ''; },
  snarGender:  (v) => v === '1' ? 'rbt_sex1' : v === '2' ? 'rbt_sex2' : '',
};

// ===== i-webs.jp 用マップ =====
// 対応: i-webs.jp 本体 / 三菱UFJ銀行 / ソニー / 野村総研 / 三井住友銀行 / SCSK 等
const FIELD_MAP_IWEBS = {
  lastNameKanji:  { selector: 'input[name="kname1"]', type: 'text' },
  firstNameKanji: { selector: 'input[name="kname2"]', type: 'text' },
  lastNameKana:   { selector: 'input[name="yname1"]', type: 'text' },
  firstNameKana:  { selector: 'input[name="yname2"]', type: 'text' },
  birthYear:      { selector: 'select[name="ybirth"]', type: 'select' },
  birthMonth:     { selector: 'select[name="mbirth"]', type: 'select', transform: T.pad2 },
  birthDay:       { selector: 'select[name="dbirth"]', type: 'select', transform: T.pad2 },
  gender:         { selector: 'input[name="sexcd"]', type: 'radio' },
  postalCode: { type: 'split', parts: [{ selector: 'input[name="gyubin1"]' }, { selector: 'input[name="gyubin2"]' }], delimiter: '-' },
  prefecture:     { selector: 'select[name="gken"]', type: 'select', transform: T.prefPadded },
  addressCombined1: { selector: 'input[name="gadrs1"]', type: 'composite', compose: (p) => [p.addressCity, p.addressStreet].filter(Boolean).join('') },
  addressBuilding: { selector: 'input[name="gadrs2"]', type: 'text' },
  homePhone:   { type: 'split', parts: [{ selector: 'input[name="gtel1"]' }, { selector: 'input[name="gtel2"]' }, { selector: 'input[name="gtel3"]' }], delimiter: '-' },
  mobilePhone: { type: 'split', parts: [{ selector: 'input[name="kttel1"]' }, { selector: 'input[name="kttel2"]' }, { selector: 'input[name="kttel3"]' }], delimiter: '-' },
  sameAsHome: { selector: 'input[name="adch"]', type: 'checkbox' },
  vacationPostalCode: { type: 'split', parts: [{ selector: 'input[name="kyubin1"]' }, { selector: 'input[name="kyubin2"]' }], delimiter: '-', skipIf: 'sameAsHome' },
  vacationPrefecture: { selector: 'select[name="kken"]', type: 'select', transform: T.prefPadded, skipIf: 'sameAsHome' },
  vacationAddressCombined1: { selector: 'input[name="kadrs1"]', type: 'composite', compose: (p) => [p.vacationAddressCity, p.vacationAddressStreet].filter(Boolean).join(''), skipIf: 'sameAsHome' },
  vacationAddressBuilding: { selector: 'input[name="kadrs2"]', type: 'text', skipIf: 'sameAsHome' },
  vacationPhone: { type: 'split', parts: [{ selector: 'input[name="ktel1"]' }, { selector: 'input[name="ktel2"]' }, { selector: 'input[name="ktel3"]' }], delimiter: '-', skipIf: 'sameAsHome' },
  labName:          { selector: 'input[name="bikoa"]',  type: 'text' },
  clubName:         { selector: 'input[name="bikob"]',  type: 'text' },
  graduationYear:   { selector: 'select[name="syear"]', type: 'select' },
  graduationMonth:  { selector: 'select[name="smonth"]', type: 'select', transform: T.pad2 },
  graduationStatus: { selector: 'select[name="shikbn"]', type: 'select' },
  email:        { type: 'email', accountSelectors: ['input[name="account1"]', 'input[name="account2"]'], domainSelectors: ['input[name="domain1"]', 'input[name="domain2"]'] },
  mobileEmail:  { type: 'email', accountSelectors: ['input[name="account3"]', 'input[name="account4"]'], domainSelectors: ['input[name="domain3"]', 'input[name="domain4"]'] },
};

// ===== axol.jp 用マップ =====
// 対応: axol.jp / job.axol.jp（TIS・信越化学・東芝・みずほFG・野村證券・KDDI・TDK・富士ソフト・NECグループなど）
const FIELD_MAP_AXOL = {
  lastNameKanji:  { selector: 'input[name="kanji_sei"]', type: 'text' },
  firstNameKanji: { selector: 'input[name="kanji_na"]',  type: 'text' },
  lastNameKana:   { selector: 'input[name="kana_sei"]',  type: 'text' },
  firstNameKana:  { selector: 'input[name="kana_na"]',   type: 'text' },
  lastNameRoma:   { selector: 'input[name="roma_sei"]',  type: 'text' },
  firstNameRoma:  { selector: 'input[name="roma_na"]',   type: 'text' },
  birthYear:      { selector: 'select[name="birth_Y"]', type: 'select' },
  birthMonth:     { selector: 'select[name="birth_m"]', type: 'select' },
  birthDay:       { selector: 'select[name="birth_d"]', type: 'select' },
  gender:         { selector: 'input[name="sex"]',      type: 'radio' },
  postalCode: { type: 'split', parts: [{ selector: 'input[name="yubing_h"]' }, { selector: 'input[name="yubing_l"]' }], delimiter: '-' },
  prefecture:      { selector: 'select[name="keng"]',   type: 'select', transform: T.prefRaw },
  addressCity:     { selector: 'input[name="jushog1"]', type: 'text' },
  addressStreet:   { selector: 'input[name="jushog2"]', type: 'text' },
  addressBuilding: { selector: 'input[name="jushog3"]', type: 'text' },
  homePhone:   { type: 'split', parts: [{ selector: 'input[name="telg_h"]' }, { selector: 'input[name="telg_m"]' }, { selector: 'input[name="telg_l"]' }], delimiter: '-' },
  mobilePhone: { type: 'split', parts: [{ selector: 'input[name="keitai_h"]' }, { selector: 'input[name="keitai_m"]' }, { selector: 'input[name="keitai_l"]' }], delimiter: '-' },
  sameAsHome: { selector: 'input[name="jushosame"]', type: 'checkbox' },
  vacationPostalCode: { type: 'split', parts: [{ selector: 'input[name="yubink_h"]' }, { selector: 'input[name="yubink_l"]' }], delimiter: '-', skipIf: 'sameAsHome' },
  vacationPrefecture:      { selector: 'select[name="kenk"]',   type: 'select', transform: T.prefRaw, skipIf: 'sameAsHome' },
  vacationAddressCity:     { selector: 'input[name="jushok1"]', type: 'text', skipIf: 'sameAsHome' },
  vacationAddressStreet:   { selector: 'input[name="jushok2"]', type: 'text', skipIf: 'sameAsHome' },
  vacationAddressBuilding: { selector: 'input[name="jushok3"]', type: 'text', skipIf: 'sameAsHome' },
  vacationPhone: { type: 'split', parts: [{ selector: 'input[name="telk_h"]' }, { selector: 'input[name="telk_m"]' }, { selector: 'input[name="telk_l"]' }], delimiter: '-', skipIf: 'sameAsHome' },
  labName:  { selector: 'input[name="zemi"]', type: 'text' },
  clubName: { selector: 'input[name="club"]', type: 'text' },
  email:       { type: 'email_single', selectors: ['input[name="email"]', 'input[name="email2"]'] },
  mobileEmail: { type: 'email_single', selectors: ['input[name="kmail"]', 'input[name="kmail2"]'] },
};

// ===== snar.jp 用マップ =====
// 対応: NTTデータ / NTTドコモ / NTT東日本 / ソフトバンク 等 *.snar.jp
// 都道府県: snar独自コード（T.prefSnar）
// 性別: rbt_sex1=男, rbt_sex2=女（T.snarGender で変換）
const FIELD_MAP_SNAR = {
  lastNameKanji:  { selector: 'input[name="tbx_name1"]', type: 'text' },
  firstNameKanji: { selector: 'input[name="tbx_name2"]', type: 'text' },
  lastNameKana:   { selector: 'input[name="tbx_kana1"]', type: 'text' },
  firstNameKana:  { selector: 'input[name="tbx_kana2"]', type: 'text' },
  birthYear:      { selector: 'select[name="ddl_birthY"]', type: 'select' },
  birthMonth:     { selector: 'select[name="ddl_birthM"]', type: 'select', transform: T.pad2 },
  birthDay:       { selector: 'select[name="ddl_birthD"]', type: 'select', transform: T.pad2 },
  gender:         { selector: 'input[name="rbt_sex"]', type: 'radio', transform: T.snarGender },
  mobilePhone: { type: 'split', parts: [{ selector: 'input[name="tbx_keitai1"]' }, { selector: 'input[name="tbx_keitai2"]' }, { selector: 'input[name="tbx_keitai3"]' }], delimiter: '-' },
  homePhone:   { type: 'split', parts: [{ selector: 'input[name="tbx_tel11"]' }, { selector: 'input[name="tbx_tel12"]' }, { selector: 'input[name="tbx_tel13"]' }], delimiter: '-' },
  postalCode:  { type: 'split', parts: [{ selector: 'input[name="tbx_zip1"]' }, { selector: 'input[name="tbx_zip2"]' }], delimiter: '-' },
  prefecture:      { selector: 'select[name="ddl_ken"]',  type: 'select', transform: T.prefSnar },
  addressCombined1: { selector: 'input[name="tbx_addr1"]', type: 'composite', compose: (p) => [p.addressCity, p.addressStreet].filter(Boolean).join('') },
  addressBuilding: { selector: 'input[name="tbx_addr2"]', type: 'text' },
  sameAsHome: { selector: 'input[name="cbx_kflg"]', type: 'checkbox' },
  vacationPostalCode:      { type: 'split', parts: [{ selector: 'input[name="tbx_kzip1"]' }, { selector: 'input[name="tbx_kzip2"]' }], delimiter: '-', skipIf: 'sameAsHome' },
  vacationPrefecture:      { selector: 'select[name="ddl_kken"]',  type: 'select', transform: T.prefSnar, skipIf: 'sameAsHome' },
  vacationAddressCombined1: { selector: 'input[name="tbx_kaddr1"]', type: 'composite', compose: (p) => [p.vacationAddressCity, p.vacationAddressStreet].filter(Boolean).join(''), skipIf: 'sameAsHome' },
  vacationAddressBuilding: { selector: 'input[name="tbx_kaddr2"]', type: 'text', skipIf: 'sameAsHome' },
  graduationYear:  { selector: 'select[name="ddl_sotsuyY"]', type: 'select' },
  graduationMonth: { selector: 'select[name="ddl_sotsuyM"]', type: 'select', transform: T.pad2 },
  email:       { type: 'email_single', selectors: ['input[name="tbx_mail"]',  'input[name="tbx_mail_R"]'] },
  mobileEmail: { type: 'email_single', selectors: ['input[name="tbx_smail"]', 'input[name="tbx_smail_R"]'] },
};

// ===== e2r.jp 用マップ =====
// 対応: 大和証券 / 三井住友信託銀行
// 生年月日はテキスト入力（年4桁、月・日ゼロ埋め2桁）
// 都道府県は value = 都道府県名そのまま（transform不要）
// 性別: 1=男性, 2=女性
const FIELD_MAP_E2R = {
  lastNameKanji:  { selector: 'input[name="I1_D1"]', type: 'text' },
  firstNameKanji: { selector: 'input[name="I1_D2"]', type: 'text' },
  lastNameKana:   { selector: 'input[name="I2_D1"]', type: 'text' },
  firstNameKana:  { selector: 'input[name="I2_D2"]', type: 'text' },
  birthYear:      { selector: 'input[name="I4_D1"]', type: 'text' },
  birthMonth:     { selector: 'input[name="I4_D2"]', type: 'text', transform: T.pad2 },
  birthDay:       { selector: 'input[name="I4_D3"]', type: 'text', transform: T.pad2 },
  gender:         { selector: 'input[name="I68"]',   type: 'radio' },
  mobilePhone: { type: 'split', parts: [{ selector: 'input[name="I5_D1"]' }, { selector: 'input[name="I5_D2"]' }, { selector: 'input[name="I5_D3"]' }], delimiter: '-' },
  postalCode:  { type: 'split', parts: [{ selector: 'input[name="I12_D1"]' }, { selector: 'input[name="I12_D2"]' }], delimiter: '-' },
  prefecture:      { selector: 'select[name="I13"]', type: 'select' },
  addressCity:     { selector: 'input[name="I14"]',  type: 'text' },
  addressStreet:   { selector: 'input[name="I15"]',  type: 'text' },
  addressBuilding: { selector: 'input[name="I16"]',  type: 'text' },
  email:       { type: 'email_single', selectors: ['input[name="I9"]',  'input[name="I9_chk"]'] },
  mobileEmail: { type: 'email_single', selectors: ['input[name="I10"]', 'input[name="I10_chk"]'] },
};

// ===== プラットフォーム登録 =====
window.JOBHUNT_PLATFORMS = {
  iwebs: {
    name: 'i-webs.jp 系',
    hostPattern: /(^|\.)i-webs\.jp$|(^|\.)i-web\.jpn\.com$|^www\.mypage\.bk\.mufg\.jp$|^www\.recruit\.sony\.co\.jp$|^working\.nri\.co\.jp$|^mypage\.smbc-recruitment\.jp$/,
    fieldMap: FIELD_MAP_IWEBS,
  },
  axol: {
    name: 'axol.jp 系',
    hostPattern: /(^|\.)axol\.jp$/,
    fieldMap: FIELD_MAP_AXOL,
  },
  e2r: {
    name: 'e2r.jp 系',
    hostPattern: /^(www\.)?e2r\.jp$/,
    fieldMap: FIELD_MAP_E2R,
  },
  snar: {
    name: 'snar.jp 系',
    hostPattern: /(^|\.)snar\.jp$/,
    fieldMap: FIELD_MAP_SNAR,
  },
};

window.JOBHUNT_DETECT_PLATFORM = function (hostname) {
  for (const [key, def] of Object.entries(window.JOBHUNT_PLATFORMS)) {
    if (def.hostPattern.test(hostname)) return key;
  }
  return null;
};

} // end if (!window.JOBHUNT_PLATFORMS)
