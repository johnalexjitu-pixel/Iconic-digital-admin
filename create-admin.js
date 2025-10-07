// Simple script to create admin user
const adminData = {
  username: "admin",
  password: "admin123",
  email: "admin@iconicdigital.com",
  role: "superadmin"
};

fetch('http://localhost:3000/api/admin/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(adminData)
})
.then(response => response.json())
.then(data => {
  console.log('✅ Admin created successfully:');
  console.log(JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error('❌ Error creating admin:', error);
});

