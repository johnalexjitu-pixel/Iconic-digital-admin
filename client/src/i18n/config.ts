import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  english: {
    translation: {
      // Navigation
      dashboard: "Dashboard",
      customerManagement: "Customer Management",
      taskManagement: "Task Management",
      withdrawalManagement: "Withdrawal Management",
      userManagement: "User Management",
      masterData: "Master Data Management",
      vipLevel: "VIP Level Management",
      tasklistExpiration: "Customer Tasklist Expiration",
      
      // Dashboard
      deposit: "Deposit",
      approvedWithdrawal: "Approved Withdrawal",
      pendingWithdrawal: "Pending Withdrawal",
      rejectedWithdrawal: "Rejected Withdrawal",
      customer: "Customer",
      today: "Today",
      yesterday: "Yesterday",
      total: "Total",
      
      // Common
      language: "Language",
      filter: "Filter",
      createCustomer: "Create Customer",
      editProfile: "Edit Profile",
      editBalance: "Edit Balance",
      back: "Back",
      cancel: "Cancel",
      confirm: "Confirm",
      save: "Save",
      update: "Update",
      delete: "Delete",
      search: "Search",
      actions: "Actions",
      status: "Status",
      
      // Customer Management
      createdDate: "Created Date",
      loginUserName: "Login User Name",
      code: "Code",
      ipAddress: "IP Address",
      phoneNumber: "Phone Number",
      customerStatus: "Customer Status",
      onlineOffline: "Online/Offline",
      details: "Details",
      accountManagement: "Account Management",
      bankAccountDetails: "Bank Account Details",
      taskPlan: "Task Plan",
      setting: "Setting",
      
      // Forms
      customerName: "Customer Name",
      email: "Email",
      password: "Password",
      level: "Level",
      creditScore: "Credit Score",
      accountBalance: "Account Balance",
      totalEarnings: "Total Earnings",
      campaignsCompleted: "Campaigns Completed",
      membershipId: "Membership ID",
      referralCode: "Referral Code",
      
      // Buttons
      task: "Task",
      comboTask: "Combo Task",
      resetTask: "Reset Task",
      activate: "Activate",
      deactivate: "Deactivate",
      suspend: "Suspend",
      inactive: "Inactive",
      save: "Save",
      approve: "Approve",
      reject: "Reject",
      
      // Messages
      success: "Success",
      error: "Error",
      loading: "Loading...",
      noData: "No data available",
      
      // Customer Management Page
      all: "All",
      active: "Active",
      inactive: "Inactive",
      online: "Online",
      offline: "Offline",
      actualAccount: "Actual Account",
      allowToStartTask: "Allow To Start Task",
      allowToCompleteTask: "Allow To Complete Task",
      allowedToWithdraw: "Allowed To Withdraw",
      allowToUseReferralCode: "Allow To Use Referral Code",
      walletBalance: "Wallet Balance",
      actualWalletBalance: "Actual Wallet Balance",
      loginPassword: "Login Password",
      payPassword: "Pay Password",
      enterLoginPassword: "Enter login password",
      enterWithdrawalPassword: "Enter withdrawal password",
      ipCountry: "IP Country",
      ipRegion: "IP Region",
      ipISP: "IP ISP",
      everyday: "Everyday",
      completed: "Completed",
      totalDeposit: "Total Deposit",
      todayCommission: "Today Commission",
      totalCommission: "Total Commission",
      
      // User Management Page
      adminName: "Admin Name",
      whatsappUrl: "Whatsapp Url",
      telegramUrl: "Telegram Url",
      
      // Task Management Page
      productImage: "Product Image",
      productName: "Product Name",
      productPrice: "Product Price",
      productCode: "Product Code",
      action: "Action",
      rowsPerPage: "Rows per page",
      
      // Withdrawal Management Page
      date: "Date",
      admin: "Admin",
      withdrawalAmount: "Withdrawal Amount",
      bankName: "Bank Name",
      bankAccountHolder: "Bank Account Holder",
      iban: "IBAN",
      contactNumber: "Contact Number",
      branch: "Branch",
      actualAmount: "Actual Amount",
      updatedBy: "Updated By",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      
      // Create/Edit Customer
      autoGenerate: "Auto Generate",
      recommendBy: "Recommend By",
      updateCustomerProfile: "Update Customer Profile",
      confirmCreateCustomer: "Confirm Create Customer",
      enterCustomerName: "Enter customer name",
      enterEmail: "Enter email",
      enterPhoneNumber: "Enter phone number",
      enterPassword: "Enter password",
      
      // Edit Balance Modal
      editCustomerBalance: "Edit Customer Balance",
      customerInformation: "Customer Information",
      currentBalance: "Current Balance",
      operation: "Operation",
      amount: "Amount",
      add: "Add",
      subtract: "Subtract",
      enterAmount: "Enter amount",
      newBalanceWillBe: "New Balance will be",
      updateBalance: "Update Balance",
      updating: "Updating...",
      
      // Additional Common Keys
      name: "Name",
      userName: "User Name",
      by: "By",
      created: "Created",
      updated: "Updated",
      updatedAt: "Updated At",
      recommend: "Recommend",
      creating: "Creating...",
      
      // Create/Edit Customer Additional
      pleaseSelectAdmin: "Please select admin...",
      enterLoginUsername: "Enter login username",
      enterReferralCode: "Enter referral code",
      editCustomerProfile: "Edit Customer Profile",
      
      // Withdrawal Management Additional
      bankDetails: "Bank Details",
      
      // Task Management
      createProduct: "Create Product",
      
      // Status Messages
      pleaseSelectStatus: "Please select status...",
      
      // Master Data Management
      dailyCheckIn: "Daily Check In",
      confirmUpdateAmount: "Confirm Update Amount",
      
      // VIP Level Management
      withdrawalLimitation: "Withdrawal Limitation",
      minAmount: "Min Amount",
      taskCount: "Task Count",
      commissionPercentage: "Commission Percentage",
      comboCommissionPercentage: "Combo Commission Percentage",
      productRange: "Product Range",
      minWithdrawalAmount: "Min Withdrawal Amount",
      maxWithdrawalAmount: "Max Withdrawal Amount",
      completedTaskDayToWithdraw: "Completed Task/Day To Withdraw",
      withdrawalFees: "Withdrawal Fees",
      edit: "Edit",
      
      // Tasklist Expiration
      expiredDate: "Expired Date",
      expired: "Expired",
      noRecordsFound: "No Records Found",
      noExpiredTasklists: "There are no expired tasklists matching your criteria",
    }
  },
  bangla: {
    translation: {
      // Navigation
      dashboard: "ড্যাশবোর্ড",
      customerManagement: "কাস্টমার ম্যানেজমেন্ট",
      taskManagement: "টাস্ক ম্যানেজমেন্ট",
      withdrawalManagement: "উত্তোলন ম্যানেজমেন্ট",
      userManagement: "ইউজার ম্যানেজমেন্ট",
      masterData: "মাস্টার ডেটা ম্যানেজমেন্ট",
      vipLevel: "ভিআইপি লেভেল ম্যানেজমেন্ট",
      tasklistExpiration: "কাস্টমার টাস্কলিস্ট মেয়াদ",
      
      // Dashboard
      deposit: "জমা",
      approvedWithdrawal: "অনুমোদিত উত্তোলন",
      pendingWithdrawal: "মুলতুবি উত্তোলন",
      rejectedWithdrawal: "প্রত্যাখ্যাত উত্তোলন",
      customer: "কাস্টমার",
      today: "আজ",
      yesterday: "গতকাল",
      total: "মোট",
      
      // Common
      language: "ভাষা",
      filter: "ফিল্টার",
      createCustomer: "কাস্টমার তৈরি করুন",
      editProfile: "প্রোফাইল সম্পাদনা",
      editBalance: "ব্যালেন্স সম্পাদনা",
      back: "ফিরে যান",
      cancel: "বাতিল",
      confirm: "নিশ্চিত করুন",
      save: "সংরক্ষণ",
      update: "আপডেট",
      delete: "মুছুন",
      search: "খুঁজুন",
      actions: "কার্যক্রম",
      status: "অবস্থা",
      
      // Customer Management
      createdDate: "তৈরির তারিখ",
      loginUserName: "লগইন ইউজার নাম",
      code: "কোড",
      ipAddress: "আইপি ঠিকানা",
      phoneNumber: "ফোন নম্বর",
      customerStatus: "কাস্টমার স্ট্যাটাস",
      onlineOffline: "অনলাইন/অফলাইন",
      details: "বিস্তারিত",
      accountManagement: "অ্যাকাউন্ট ম্যানেজমেন্ট",
      bankAccountDetails: "ব্যাংক অ্যাকাউন্ট বিবরণ",
      taskPlan: "টাস্ক প্ল্যান",
      setting: "সেটিং",
      
      // Forms
      customerName: "কাস্টমার নাম",
      email: "ইমেইল",
      password: "পাসওয়ার্ড",
      level: "লেভেল",
      creditScore: "ক্রেডিট স্কোর",
      accountBalance: "অ্যাকাউন্ট ব্যালেন্স",
      totalEarnings: "মোট আয়",
      campaignsCompleted: "সম্পন্ন ক্যাম্পেইন",
      membershipId: "সদস্যপদ আইডি",
      referralCode: "রেফারেল কোড",
      
      // Buttons
      task: "টাস্ক",
      comboTask: "কম্বো টাস্ক",
      resetTask: "টাস্ক রিসেট",
      activate: "সক্রিয়",
      deactivate: "নিষ্ক্রিয়",
      suspend: "স্থগিত",
      inactive: "নিষ্ক্রিয়",
      save: "সংরক্ষণ",
      approve: "অনুমোদন",
      reject: "প্রত্যাখ্যান",
      
      // Messages
      success: "সফল",
      error: "ত্রুটি",
      loading: "লোড হচ্ছে...",
      noData: "কোন ডেটা নেই",
      
      // Customer Management Page
      all: "সব",
      active: "সক্রিয়",
      inactive: "নিষ্ক্রিয়",
      online: "অনলাইন",
      offline: "অফলাইন",
      actualAccount: "প্রকৃত অ্যাকাউন্ট",
      allowToStartTask: "টাস্ক শুরু করার অনুমতি",
      allowToCompleteTask: "টাস্ক সম্পন্ন করার অনুমতি",
      allowedToWithdraw: "উত্তোলনের অনুমতি",
      allowToUseReferralCode: "রেফারেল কোড ব্যবহারের অনুমতি",
      walletBalance: "ওয়ালেট ব্যালেন্স",
      actualWalletBalance: "প্রকৃত ওয়ালেট ব্যালেন্স",
      loginPassword: "লগইন পাসওয়ার্ড",
      payPassword: "পে পাসওয়ার্ড",
      enterLoginPassword: "লগইন পাসওয়ার্ড লিখুন",
      enterWithdrawalPassword: "উইথড্রল পাসওয়ার্ড লিখুন",
      ipCountry: "আইপি দেশ",
      ipRegion: "আইপি অঞ্চল",
      ipISP: "আইপি আইএসপি",
      everyday: "প্রতিদিন",
      completed: "সম্পন্ন",
      totalDeposit: "মোট জমা",
      todayCommission: "আজকের কমিশন",
      totalCommission: "মোট কমিশন",
      
      // User Management Page
      adminName: "অ্যাডমিন নাম",
      whatsappUrl: "হোয়াটসঅ্যাপ ইউআরএল",
      telegramUrl: "টেলিগ্রাম ইউআরএল",
      
      // Task Management Page
      productImage: "পণ্য ছবি",
      productName: "পণ্যের নাম",
      productPrice: "পণ্যের দাম",
      productCode: "পণ্য কোড",
      action: "কার্যক্রম",
      rowsPerPage: "প্রতি পৃষ্ঠায় সারি",
      
      // Withdrawal Management Page
      date: "তারিখ",
      admin: "অ্যাডমিন",
      withdrawalAmount: "উত্তোলন পরিমাণ",
      bankName: "ব্যাংকের নাম",
      bankAccountHolder: "ব্যাংক অ্যাকাউন্ট ধারক",
      iban: "আইবিএএন",
      contactNumber: "যোগাযোগ নম্বর",
      branch: "শাখা",
      actualAmount: "প্রকৃত পরিমাণ",
      updatedBy: "আপডেট করেছেন",
      pending: "মুলতুবি",
      approved: "অনুমোদিত",
      rejected: "প্রত্যাখ্যাত",
      
      // Create/Edit Customer
      autoGenerate: "স্বয়ংক্রিয় তৈরি",
      recommendBy: "সুপারিশকারী",
      updateCustomerProfile: "কাস্টমার প্রোফাইল আপডেট",
      confirmCreateCustomer: "কাস্টমার তৈরি নিশ্চিত করুন",
      enterCustomerName: "কাস্টমার নাম লিখুন",
      enterEmail: "ইমেইল লিখুন",
      enterPhoneNumber: "ফোন নম্বর লিখুন",
      enterPassword: "পাসওয়ার্ড লিখুন",
      
      // Edit Balance Modal
      editCustomerBalance: "কাস্টমার ব্যালেন্স সম্পাদনা",
      customerInformation: "কাস্টমার তথ্য",
      currentBalance: "বর্তমান ব্যালেন্স",
      operation: "অপারেশন",
      amount: "পরিমাণ",
      add: "যোগ করুন",
      subtract: "বিয়োগ করুন",
      enterAmount: "পরিমাণ লিখুন",
      newBalanceWillBe: "নতুন ব্যালেন্স হবে",
      updateBalance: "ব্যালেন্স আপডেট",
      updating: "আপডেট হচ্ছে...",
      
      // Additional Common Keys
        name: "নাম",
        userName: "ইউজার নাম",
      by: "দ্বারা",
      created: "তৈরি হয়েছে",
      updated: "আপডেট হয়েছে",
      updatedAt: "আপডেট সময়",
      recommend: "সুপারিশ",
      creating: "তৈরি হচ্ছে...",
      
      // Create/Edit Customer Additional
      pleaseSelectAdmin: "অ্যাডমিন নির্বাচন করুন...",
      enterLoginUsername: "লগইন ইউজারনেম লিখুন",
      enterReferralCode: "রেফারেল কোড লিখুন",
      editCustomerProfile: "কাস্টমার প্রোফাইল সম্পাদনা",
      
        // Withdrawal Management Additional
        bankDetails: "ব্যাংক বিবরণ",
      
      // Task Management
      createProduct: "প্রোডাক্ট তৈরি করুন",
      
      // Status Messages
      pleaseSelectStatus: "স্ট্যাটাস নির্বাচন করুন...",
      
      // Master Data Management
      dailyCheckIn: "দৈনিক চেক ইন",
      confirmUpdateAmount: "পরিমাণ আপডেট নিশ্চিত করুন",
      
        // VIP Level Management
        withdrawalLimitation: "উত্তোলন সীমাবদ্ধতা",
      minAmount: "সর্বনিম্ন পরিমাণ",
      taskCount: "টাস্ক সংখ্যা",
      commissionPercentage: "কমিশন শতাংশ",
      comboCommissionPercentage: "কম্বো কমিশন শতাংশ",
      productRange: "প্রোডাক্ট রেঞ্জ",
      minWithdrawalAmount: "সর্বনিম্ন উত্তোলন পরিমাণ",
      maxWithdrawalAmount: "সর্বোচ্চ উত্তোলন পরিমাণ",
      completedTaskDayToWithdraw: "উত্তোলনের জন্য সম্পন্ন টাস্ক/দিন",
      withdrawalFees: "উত্তোলন ফি",
      edit: "সম্পাদনা",
      
        // Tasklist Expiration
        expiredDate: "মেয়াদ শেষের তারিখ",
      expired: "মেয়াদ শেষ",
      noRecordsFound: "কোন রেকর্ড পাওয়া যায়নি",
      noExpiredTasklists: "আপনার মানদণ্ড অনুযায়ী কোন মেয়াদ শেষ টাস্কলিস্ট নেই",
    }
  },
  chinese: {
    translation: {
      // Navigation
      dashboard: "仪表板",
      customerManagement: "客户管理",
      taskManagement: "任务管理",
      withdrawalManagement: "提款管理",
      userManagement: "用户管理",
      masterData: "主数据管理",
      vipLevel: "VIP等级管理",
      tasklistExpiration: "客户任务列表到期",
      
      // Dashboard
      deposit: "存款",
      approvedWithdrawal: "已批准提款",
      pendingWithdrawal: "待处理提款",
      rejectedWithdrawal: "已拒绝提款",
      customer: "客户",
      today: "今天",
      yesterday: "昨天",
      total: "总计",
      
      // Common
      language: "语言",
      filter: "筛选",
      createCustomer: "创建客户",
      editProfile: "编辑资料",
      editBalance: "编辑余额",
      back: "返回",
      cancel: "取消",
      confirm: "确认",
      save: "保存",
      update: "更新",
      delete: "删除",
      search: "搜索",
      actions: "操作",
      status: "状态",
      
      // Customer Management
      createdDate: "创建日期",
      loginUserName: "登录用户名",
      code: "代码",
      ipAddress: "IP地址",
      phoneNumber: "电话号码",
      customerStatus: "客户状态",
      onlineOffline: "在线/离线",
      details: "详情",
      accountManagement: "账户管理",
      bankAccountDetails: "银行账户详情",
      taskPlan: "任务计划",
      setting: "设置",
      
      // Forms
      customerName: "客户姓名",
      email: "电子邮件",
      password: "密码",
      level: "等级",
      creditScore: "信用评分",
      accountBalance: "账户余额",
      totalEarnings: "总收入",
      campaignsCompleted: "已完成活动",
      membershipId: "会员ID",
      referralCode: "推荐码",
      
      // Buttons
      task: "任务",
      comboTask: "组合任务",
      resetTask: "重置任务",
      activate: "激活",
      deactivate: "停用",
      suspend: "暂停",
      inactive: "非活跃",
      save: "保存",
      approve: "批准",
      reject: "拒绝",
      
      // Messages
      success: "成功",
      error: "错误",
      loading: "加载中...",
      noData: "无数据",
      
      // Customer Management Page
      all: "全部",
      active: "活跃",
      inactive: "不活跃",
      online: "在线",
      offline: "离线",
      actualAccount: "实际账户",
      allowToStartTask: "允许开始任务",
      allowToCompleteTask: "允许完成任务",
      allowedToWithdraw: "允许提款",
      allowToUseReferralCode: "允许使用推荐码",
      walletBalance: "钱包余额",
      actualWalletBalance: "实际钱包余额",
      loginPassword: "登录密码",
      payPassword: "支付密码",
      enterLoginPassword: "输入登录密码",
      enterWithdrawalPassword: "输入提现密码",
      ipCountry: "IP国家",
      ipRegion: "IP地区",
      ipISP: "IP ISP",
      everyday: "每天",
      completed: "已完成",
      totalDeposit: "总存款",
      todayCommission: "今日佣金",
      totalCommission: "总佣金",
      
      // User Management Page
      adminName: "管理员姓名",
      whatsappUrl: "WhatsApp链接",
      telegramUrl: "Telegram链接",
      
      // Task Management Page
      productImage: "产品图片",
      productName: "产品名称",
      productPrice: "产品价格",
      productCode: "产品代码",
      action: "操作",
      rowsPerPage: "每页行数",
      
      // Withdrawal Management Page
      date: "日期",
      admin: "管理员",
      withdrawalAmount: "提款金额",
      bankName: "银行名称",
      bankAccountHolder: "银行账户持有人",
      iban: "IBAN",
      contactNumber: "联系电话",
      branch: "分行",
      actualAmount: "实际金额",
      updatedBy: "更新者",
      pending: "待处理",
      approved: "已批准",
      rejected: "已拒绝",
      
      // Create/Edit Customer
      autoGenerate: "自动生成",
      recommendBy: "推荐人",
      updateCustomerProfile: "更新客户资料",
      confirmCreateCustomer: "确认创建客户",
      enterCustomerName: "输入客户姓名",
      enterEmail: "输入电子邮件",
      enterPhoneNumber: "输入电话号码",
      enterPassword: "输入密码",
      
      // Edit Balance Modal
      editCustomerBalance: "编辑客户余额",
      customerInformation: "客户信息",
      currentBalance: "当前余额",
      operation: "操作",
      amount: "金额",
      add: "添加",
      subtract: "减去",
      enterAmount: "输入金额",
      newBalanceWillBe: "新余额将为",
      updateBalance: "更新余额",
      updating: "更新中...",
      
      // Additional Common Keys
        name: "姓名",
        userName: "用户名",
      by: "由",
      created: "已创建",
      updated: "已更新",
      updatedAt: "更新时间",
      recommend: "推荐",
      creating: "创建中...",
      
      // Create/Edit Customer Additional
      pleaseSelectAdmin: "请选择管理员...",
      enterLoginUsername: "输入登录用户名",
      enterReferralCode: "输入推荐码",
      editCustomerProfile: "编辑客户资料",
      
        // Withdrawal Management Additional
        bankDetails: "银行详情",
      
      // Task Management
      createProduct: "创建产品",
      
      // Status Messages
      pleaseSelectStatus: "请选择状态...",
      
      // Master Data Management
      dailyCheckIn: "每日签到",
      confirmUpdateAmount: "确认更新金额",
      
        // VIP Level Management
        withdrawalLimitation: "提款限制",
      minAmount: "最低金额",
      taskCount: "任务数量",
      commissionPercentage: "佣金百分比",
      comboCommissionPercentage: "组合佣金百分比",
      productRange: "产品范围",
      minWithdrawalAmount: "最低提款金额",
      maxWithdrawalAmount: "最高提款金额",
      completedTaskDayToWithdraw: "提款所需完成任务/天",
      withdrawalFees: "提款费用",
      edit: "编辑",
      
        // Tasklist Expiration
        expiredDate: "过期日期",
      expired: "已过期",
      noRecordsFound: "未找到记录",
      noExpiredTasklists: "没有符合您条件的过期任务列表",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'english',
    fallbackLng: 'english',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
