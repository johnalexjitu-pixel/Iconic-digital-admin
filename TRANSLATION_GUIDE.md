# 🌍 Translation Guide - Admin Panel

This guide will help you translate all pages in the admin panel to support **English**, **Bangla**, and **Chinese** languages.

## ✅ Already Translated

- ✅ Header (Language selector)
- ✅ Sidebar (All navigation items)
- ✅ Dashboard (All stat cards)
- ✅ StatCard component

## 📝 How to Translate Any Page

### Step 1: Import useTranslation Hook

```typescript
import { useTranslation } from "react-i18next";
```

### Step 2: Use the Hook in Component

```typescript
export default function YourPage() {
  const { t } = useTranslation();
  
  // ... rest of your code
}
```

### Step 3: Replace Static Text

#### Before:
```typescript
<h2>Customer Management</h2>
<Button>Create Customer</Button>
<Label>Email:</Label>
```

#### After:
```typescript
<h2>{t('customerManagement')}</h2>
<Button>{t('createCustomer')}</Button>
<Label>{t('email')}:</Label>
```

## 🔑 Available Translation Keys

### Navigation
- `dashboard`
- `customerManagement`
- `taskManagement`
- `withdrawalManagement`
- `userManagement`
- `masterData`
- `vipLevel`
- `tasklistExpiration`

### Common Buttons
- `createCustomer`
- `editProfile`
- `editBalance`
- `filter`
- `back`
- `cancel`
- `confirm`
- `save`
- `update`
- `approve`
- `reject`
- `activate`
- `deactivate`
- `task`
- `comboTask`
- `resetTask`

### Form Labels
- `customerName`
- `email`
- `password`
- `phoneNumber`
- `level`
- `creditScore`
- `accountBalance`
- `totalEarnings`
- `campaignsCompleted`
- `membershipId`
- `referralCode`
- `createdDate`
- `loginUserName`
- `code`
- `ipAddress`
- `customerStatus`
- `onlineOffline`

### Table Headers
- `details`
- `accountManagement`
- `bankAccountDetails`
- `taskPlan`
- `setting`
- `status`
- `actions`

### Status Words
- `all`
- `active`
- `inactive`
- `online`
- `offline`
- `pending`
- `approved`
- `rejected`
- `today`
- `yesterday`
- `total`

### Account Management
- `actualAccount`
- `allowToStartTask`
- `allowToCompleteTask`
- `allowedToWithdraw`
- `allowToUseReferralCode`
- `walletBalance`
- `actualWalletBalance`
- `loginPassword`
- `payPassword`

### IP Information
- `ipAddress`
- `ipCountry`
- `ipRegion`
- `ipISP`

### Task Information
- `everyday`
- `completed`
- `totalDeposit`
- `todayCommission`
- `totalCommission`

### Withdrawal Management
- `date`
- `admin`
- `withdrawalAmount`
- `bankName`
- `bankAccountHolder`
- `iban`
- `contactNumber`
- `branch`
- `actualAmount`
- `updatedBy`

### User Management
- `adminName`
- `whatsappUrl`
- `telegramUrl`

### Task Management
- `productImage`
- `productName`
- `productPrice`
- `productCode`
- `rowsPerPage`

### Edit Balance Modal
- `editCustomerBalance`
- `customerInformation`
- `currentBalance`
- `operation`
- `amount`
- `add`
- `subtract`
- `enterAmount`
- `newBalanceWillBe`
- `updateBalance`
- `updating`

### Create/Edit Customer
- `autoGenerate`
- `recommendBy`
- `updateCustomerProfile`
- `confirmCreateCustomer`
- `enterCustomerName`
- `enterEmail`
- `enterPhoneNumber`
- `enterPassword`

## 📋 Translation Examples

### Example 1: Simple Text Replacement

```typescript
// Before
<h2 className="text-xl">Customer Management</h2>

// After
<h2 className="text-xl">{t('customerManagement')}</h2>
```

### Example 2: Button Text

```typescript
// Before
<Button>Create Customer</Button>

// After
<Button>{t('createCustomer')}</Button>
```

### Example 3: Label with Colon

```typescript
// Before
<Label>Email:</Label>

// After
<Label>{t('email')}:</Label>
```

### Example 4: Conditional Text

```typescript
// Before
{customer.isActive ? "Active" : "Inactive"}

// After
{customer.isActive ? t('active') : t('inactive')}
```

### Example 5: Complex Conditional

```typescript
// Before
{customer.allowTask ? "Allow To Start Task" : "Not Allowed To Start Task"}

// After
{customer.allowTask ? t('allowToStartTask') : t('notAllowedToStartTask')}
```

### Example 6: Table Headers

```typescript
// Before
<TableHead>Details</TableHead>
<TableHead>Account Management</TableHead>
<TableHead>Status</TableHead>

// After
<TableHead>{t('details')}</TableHead>
<TableHead>{t('accountManagement')}</TableHead>
<TableHead>{t('status')}</TableHead>
```

### Example 7: Placeholder Text

```typescript
// Before
<Input placeholder="Enter customer name" />

// After
<Input placeholder={t('enterCustomerName')} />
```

### Example 8: Select Options

```typescript
// Before
<SelectItem value="active">Active</SelectItem>
<SelectItem value="inactive">Inactive</SelectItem>

// After
<SelectItem value="active">{t('active')}</SelectItem>
<SelectItem value="inactive">{t('inactive')}</SelectItem>
```

## 📄 Pages to Translate

### Priority 1 (Main Pages)
- [ ] Customer Management (`client/src/pages/CustomerManagement.tsx`)
- [ ] User Management (`client/src/pages/UserManagement.tsx`)
- [ ] Task Management (`client/src/pages/TaskManagement.tsx`)
- [ ] Withdrawal Management (`client/src/pages/WithdrawalManagement.tsx`)

### Priority 2 (Secondary Pages)
- [ ] Create Customer (`client/src/pages/CreateCustomer.tsx`)
- [ ] Edit Customer Profile (`client/src/pages/EditCustomerProfile.tsx`)
- [ ] Master Data (`client/src/pages/MasterData.tsx`)
- [ ] VIP Level (`client/src/pages/VIPLevel.tsx`)
- [ ] Tasklist Expiration (`client/src/pages/TasklistExpiration.tsx`)

## 🔍 Quick Search & Replace

You can use VS Code's Find & Replace feature to speed up translation:

1. Open the file you want to translate
2. Press `Ctrl+H` (Windows) or `Cmd+H` (Mac)
3. Enable regex mode (click the `.*` button)
4. Use these patterns:

### Pattern 1: Simple Text in JSX
Find: `>Customer Management<`
Replace: `>{t('customerManagement')}<`

### Pattern 2: Button Text
Find: `<Button([^>]*)>Create Customer</Button>`
Replace: `<Button$1>{t('createCustomer')}</Button>`

### Pattern 3: Label Text
Find: `<Label([^>]*)>Email:</Label>`
Replace: `<Label$1>{t('email')}:</Label>`

## ⚠️ Important Notes

1. **Don't translate**:
   - Variable names
   - Function names
   - CSS classes
   - Data-testid attributes
   - API endpoints
   - Database field names

2. **Do translate**:
   - All visible text
   - Button labels
   - Form labels
   - Table headers
   - Error messages
   - Success messages
   - Placeholder text
   - Select options

3. **Keep formatting**:
   - Preserve colons (`:`)
   - Preserve asterisks (`*`) for required fields
   - Preserve dollar signs (`$`) for currency

## 🧪 Testing

After translating a page:

1. Open the page in browser
2. Change language from dropdown:
   - English → Check all text is in English
   - বাংলা → Check all text is in Bangla
   - 中文 → Check all text is in Chinese
3. Verify no text is broken or missing
4. Check that buttons and forms still work

## 🆘 Need Help?

If you encounter text that doesn't have a translation key:

1. Check `client/src/i18n/config.ts` for existing keys
2. If not found, add new translation keys in all three languages
3. Follow the existing pattern in the file

## 📊 Progress Tracking

Keep track of your progress:

```
✅ Header - DONE
✅ Sidebar - DONE
✅ Dashboard - DONE
✅ StatCard - DONE
⏳ Customer Management - IN PROGRESS
⏳ User Management - TODO
⏳ Task Management - TODO
⏳ Withdrawal Management - TODO
⏳ Create Customer - TODO
⏳ Edit Customer Profile - TODO
⏳ Master Data - TODO
⏳ VIP Level - TODO
⏳ Tasklist Expiration - TODO
```

## 🎯 Quick Start Example

Here's a complete example of translating a simple page:

```typescript
// Before
import { Button } from "@/components/ui/button";

export default function MyPage() {
  return (
    <div>
      <h1>Customer Management</h1>
      <Button>Create Customer</Button>
      <p>Total: 100</p>
    </div>
  );
}

// After
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function MyPage() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('customerManagement')}</h1>
      <Button>{t('createCustomer')}</Button>
      <p>{t('total')}: 100</p>
    </div>
  );
}
```

---

Happy Translating! 🌍🎉
