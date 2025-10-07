# 🔐 Create Admin User - Instructions

## Step 1: Open Browser Console

1. Open your browser (Chrome/Edge/Firefox)
2. Go to: `http://localhost:3000`
3. Press `F12` or `Ctrl+Shift+I` to open Developer Tools
4. Click on the **Console** tab

## Step 2: Run This Command

Copy and paste this code into the console and press Enter:

```javascript
fetch('http://localhost:3000/api/admin/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: "admin",
    password: "admin123",
    email: "admin@iconicdigital.com",
    role: "superadmin"
  })
})
.then(r => r.json())
.then(d => {
  console.log('✅ Admin created successfully!');
  console.log(d);
})
.catch(e => {
  console.error('❌ Error:', e);
  console.log('Note: If you see "Admin already exists", that means the admin user is already created. You can proceed to login.');
});
```

## Step 3: Expected Response

You should see:

```json
{
  "success": true,
  "data": {
    "id": "...",
    "username": "admin",
    "email": "admin@iconicdigital.com",
    "role": "superadmin"
  },
  "message": "Admin created successfully"
}
```

## Step 4: Go to Login Page

Navigate to: `http://localhost:3000/login`

## Step 5: Login with These Credentials

```
Username: admin
Password: admin123
```

---

## 🎉 That's It!

After successful login, you'll be redirected to the dashboard.

---

## 🔄 If Admin Already Exists

If you get an error saying "Admin already exists", that's fine! Just go directly to the login page and use the credentials above.

---

## 🚪 Logout

Click the **Logout** button in the top-right corner of the header to logout.

---

## 🔑 Create Additional Admin Users

To create more admin users, use the same command but change the username and email:

```javascript
fetch('http://localhost:3000/api/admin/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: "newadmin",  // Change this
    password: "password123",  // Change this
    email: "newadmin@iconicdigital.com",  // Change this
    role: "admin"  // Can be "admin" or "superadmin"
  })
})
.then(r => r.json())
.then(d => console.log('✅ Success:', d))
.catch(e => console.error('❌ Error:', e));
```

---

## 📝 Notes

- All passwords are stored in **plain text** for development purposes
- In production, you should use **bcrypt** or similar hashing
- The admin user is stored in MongoDB in the `admins` collection
- Session is managed using `localStorage`

---

**Happy Coding! 🚀**
