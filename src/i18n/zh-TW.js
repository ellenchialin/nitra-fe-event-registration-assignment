export default {
  steps: {
    attendee: '報名者資料',
    sessions: '議程',
    addons: '加購項目',
    review: '確認送出',
  },
  step1: {
    ticketTypeTitle: '選擇票種',
    attendeeTitle: '報名者資料',
    selected: '已選擇',
  },
  step2: {
    title: '選擇議程',
    selectDay: '會議日期',
    // Chinese has no plural forms, but the message must carry the same number of branches as
    // en-US: Vue I18n's default rule reads a two-branch message as singular|plural, which maps
    // count 0 to the second branch and count 1 to the first.
    selectedCount: '尚未選擇議程 | 已選擇 {count} 場議程 | 已選擇 {count} 場議程',
  },
  tracks: {
    main: '主議程',
    frontend: '前端',
    backend: '後端',
    devops: 'DevOps',
  },
  capacity: {
    spotsLeft: '剩餘 {count} 個名額',
    soldOut: '已額滿',
  },
  fields: {
    fullName: { label: '姓名', placeholder: '請輸入姓名' },
    email: { label: '電子郵件', placeholder: '請輸入電子郵件' },
    phone: { label: '電話', placeholder: '請輸入電話號碼' },
    company: { label: '公司', placeholder: '請輸入公司名稱' },
    jobTitle: { label: '職稱', placeholder: '請輸入職稱' },
    shippingAddress: {
      label: '寄送地址',
      labelOptional: '寄送地址（選填）',
      labelRequired: '寄送地址 *',
      placeholder: '請輸入寄送地址',
      requiredForMerchandise: '訂購周邊商品時必須填寫寄送地址',
    },
  },
  nav: {
    back: '上一步',
    next: {
      sessions: '下一步：選擇議程',
      addons: '下一步：加購項目',
      review: '下一步：確認資料',
    },
    submit: '送出報名',
  },
  a11y: {
    language: '語言',
    progress: '報名進度',
    stepOf: '第 {number} 步，共 {total} 步：{label}',
    stepCompleted: '已完成',
    stepHasErrors: '有錯誤',
  },
}
