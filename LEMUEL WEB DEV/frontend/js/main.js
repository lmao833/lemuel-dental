// main.js - Handles form submissions and dynamic content
const API = 'http://127.0.0.1:5000';

// Helper: Show message
function showMsg(el, msg, isError = false) {
  el.textContent = msg;
  el.style.color = isError ? '#d32f2f' : '#1976D2';
  el.style.display = 'block';
}

// Registration
if (document.getElementById('register-form')) {
  document.getElementById('register-form').onsubmit = async (e) => {
    e.preventDefault();
    const data = {
      name: e.target.name.value,
      email: e.target.email.value,
      phone: e.target.phone.value,
      address: e.target.address.value,
      password: e.target.password.value,
      user_type: e.target.user_type.value
    };
    const msg = document.getElementById('register-msg');
    try {
      const res = await fetch(`${API}/register`, {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)
      });
      const out = await res.json();
      if (out.success) {
        showMsg(msg, 'Registration successful! Please login.');
        e.target.reset();
      } else {
        showMsg(msg, out.error || 'Registration failed.', true);
      }
    } catch {
      showMsg(msg, 'Server error.', true);
    }
  };
}

// Login
if (document.getElementById('login-form')) {
  document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const data = {
      email: e.target.email.value,
      password: e.target.password.value
    };
    const msg = document.getElementById('login-msg');
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)
      });
      const out = await res.json();
      if (out.success) {
        localStorage.setItem('user_id', out.user_id);
        localStorage.setItem('is_staff', out.is_staff ? '1' : '0');
        localStorage.setItem('user_email', data.email);
        if (out.is_staff) {
          window.location.href = 'dashboard.html#staff';
        } else {
          window.location.href = 'dashboard.html#user';
        }
      } else {
        showMsg(msg, out.error || 'Login failed.', true);
      }
    } catch {
      showMsg(msg, 'Server error.', true);
    }
  };
}

// Book Appointment
if (document.getElementById('book-form')) {
  document.getElementById('book-form').onsubmit = async (e) => {
    e.preventDefault();
    const user_id = localStorage.getItem('user_id');
    if (!user_id) {
      alert('Please login first.');
      window.location.href = 'login.html';
      return;
    }
    const data = {
      user_id,
      service: e.target.service.value,
      date: e.target.date.value,
      time: e.target.time.value
    };
    const msg = document.getElementById('book-msg');
    try {
      const res = await fetch(`${API}/book-appointment`, {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)
      });
      const out = await res.json();
      if (out.success) {
        showMsg(msg, 'Appointment booked!');
        e.target.reset();
      } else {
        showMsg(msg, out.error || 'Booking failed.', true);
      }
    } catch {
      showMsg(msg, 'Server error.', true);
    }
  };
}

// Dashboard
if (document.getElementById('dashboard')) {
  const user_id = localStorage.getItem('user_id');
  const is_staff = localStorage.getItem('is_staff') === '1';
  if (!user_id) {
    window.location.href = 'login.html';
  }
  // Appointments
  fetch(`${API}/appointments?user_id=${user_id}&is_staff=${is_staff ? 1 : 0}`)
    .then(r => r.json())
    .then(data => {
      const tbody = document.getElementById('appt-tbody');
      tbody.innerHTML = '';
      data.appointments.forEach(a => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${a.id}</td><td>${a.name}</td><td>${a.service}</td><td>${a.date}</td><td>${a.time}</td>`;
        tbody.appendChild(tr);
      });
    });
  // Users (staff only)
  if (is_staff) {
    fetch(`${API}/users`).then(r => r.json()).then(data => {
      const tbody = document.getElementById('users-tbody');
      tbody.innerHTML = '';
      data.users.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${u.id}</td><td>${u.name}</td><td>${u.email}</td><td>${u.phone}</td><td>${u.address}</td>`;
        tbody.appendChild(tr);
      });
      document.getElementById('users-table').style.display = 'table';
    });
  }
  // Logout
  document.getElementById('logout-btn').onclick = () => {
    localStorage.clear();
    window.location.href = 'login.html';
  };
}

// Profile page logic
if (document.getElementById('profile-form')) {
  const user_id = localStorage.getItem('user_id');
  if (!user_id) window.location.href = 'login.html';
  // Fetch user details
  fetch(`http://127.0.0.1:5000/users`).then(r=>r.json()).then(data=>{
    const user = data.users.find(u=>u.id==user_id);
    if (user) {
      document.getElementById('profile-name').value = user.name;
      document.getElementById('profile-email').value = user.email;
      document.getElementById('profile-phone').value = user.phone;
      document.getElementById('profile-address').value = user.address;
    }
  });
  // Update profile
  document.getElementById('profile-form').onsubmit = async (e) => {
    e.preventDefault();
    const data = {
      name: e.target.name.value,
      phone: e.target.phone.value,
      address: e.target.address.value
    };
    const msg = document.getElementById('profile-msg');
    try {
      const res = await fetch(`http://127.0.0.1:5000/users/${user_id}`, {
        method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)
      });
      const out = await res.json();
      if (out.success) {
        showMsg(msg, 'Profile updated!');
      } else {
        showMsg(msg, out.error || 'Update failed.', true);
      }
    } catch {
      showMsg(msg, 'Server error.', true);
    }
  };
  // List appointments
  fetch(`http://127.0.0.1:5000/appointments?user_id=${user_id}&is_staff=0`).then(r=>r.json()).then(data=>{
    const tbody = document.getElementById('my-appt-tbody');
    tbody.innerHTML = '';
    data.appointments.forEach(a=>{
      const isFuture = new Date(a.date) >= new Date().setHours(0,0,0,0);
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${a.service}</td><td>${a.date}</td><td>${a.time}</td><td>${isFuture ? 'Upcoming' : 'Past'}</td><td>${isFuture ? `<button class='btn btn-cancel' data-id='${a.id}'>Cancel</button>` : ''}</td>`;
      tbody.appendChild(tr);
    });
    // Cancel logic
    document.querySelectorAll('.btn-cancel').forEach(btn=>{
      btn.onclick = async ()=>{
        if (confirm('Cancel this appointment?')) {
          const res = await fetch(`http://127.0.0.1:5000/appointments/${btn.dataset.id}`, {method:'DELETE'});
          const out = await res.json();
          if (out.success) btn.closest('tr').remove();
        }
      };
    });
  });
}

// Show user initials in navbar if logged in
(function showUserInitials() {
  const initialsDiv = document.getElementById('user-initials');
  if (!initialsDiv) return;
  const email = localStorage.getItem('user_email');
  if (email) {
    const initials = email.split('@')[0].split(/[. _-]/).map(s => s[0]).join('').slice(0,2).toUpperCase();
    initialsDiv.textContent = initials;
    initialsDiv.title = email;
    initialsDiv.style.display = 'flex';
  } else {
    initialsDiv.style.display = 'none';
  }
})();
