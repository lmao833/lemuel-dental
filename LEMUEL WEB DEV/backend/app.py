from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime, date

app = Flask(__name__)
CORS(app)
DB = 'lemuel.db'

def init_db():
    conn = sqlite3.connect(DB, timeout=10)
    c = conn.cursor()
    # Users: id, name, email, phone, address, password, is_staff
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        address TEXT,
        password TEXT NOT NULL,
        is_staff INTEGER DEFAULT 0
    )''')
    # Appointments: id, user_id, service, date, time
    c.execute('''CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        service TEXT,
        date TEXT,
        time TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )''')
    conn.commit()
    conn.close()

# Initialize DB once at startup
init_db()

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    required = ['name', 'email', 'phone', 'address', 'password', 'user_type']
    for field in required:
        if not data.get(field):
            return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400
    is_staff = 1 if data.get('user_type') == 'staff' else 0
    try:
        conn = sqlite3.connect(DB, timeout=10)
        c = conn.cursor()
        c.execute('INSERT INTO users (name, email, phone, address, password, is_staff) VALUES (?, ?, ?, ?, ?, ?)',
                  (data['name'], data['email'], data['phone'], data['address'], data['password'], is_staff))
        conn.commit()
        conn.close()
        return jsonify({'success': True}), 201
    except sqlite3.IntegrityError:
        return jsonify({'success': False, 'error': 'Email already registered'}), 400

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    conn = sqlite3.connect(DB, timeout=10)
    c = conn.cursor()
    c.execute('SELECT id, is_staff FROM users WHERE email=? AND password=?', (data['email'], data['password']))
    user = c.fetchone()
    conn.close()
    if user:
        return jsonify({'success': True, 'user_id': user[0], 'is_staff': bool(user[1])})
    else:
        return jsonify({'success': False, 'error': 'Invalid credentials'}), 401

@app.route('/book-appointment', methods=['POST'])
def book_appointment():
    data = request.json
    conn = sqlite3.connect(DB, timeout=10)
    c = conn.cursor()
    c.execute('INSERT INTO appointments (user_id, service, date, time) VALUES (?, ?, ?, ?)',
              (data['user_id'], data['service'], data['date'], data['time']))
    conn.commit()
    conn.close()
    return jsonify({'success': True}), 201

@app.route('/appointments', methods=['GET'])
def get_appointments():
    user_id = request.args.get('user_id')
    is_staff = request.args.get('is_staff') == '1'
    conn = sqlite3.connect(DB, timeout=10)
    c = conn.cursor()
    if is_staff:
        c.execute('''SELECT a.id, u.name, a.service, a.date, a.time FROM appointments a JOIN users u ON a.user_id = u.id''')
    else:
        c.execute('''SELECT a.id, u.name, a.service, a.date, a.time FROM appointments a JOIN users u ON a.user_id = u.id WHERE a.user_id=?''', (user_id,))
    rows = c.fetchall()
    conn.close()
    appointments = [{'id': r[0], 'name': r[1], 'service': r[2], 'date': r[3], 'time': r[4]} for r in rows]
    return jsonify({'appointments': appointments})

@app.route('/users', methods=['GET'])
def get_users():
    conn = sqlite3.connect(DB, timeout=10)
    c = conn.cursor()
    c.execute('SELECT id, name, email, phone, address, is_staff FROM users')
    users = [{'id': r[0], 'name': r[1], 'email': r[2], 'phone': r[3], 'address': r[4], 'is_staff': bool(r[5])} for r in c.fetchall()]
    conn.close()
    return jsonify({'users': users})

@app.route('/promote', methods=['POST'])
def promote_to_staff():
    data = request.json
    email = data.get('email')
    if not email:
        return jsonify({'success': False, 'error': 'Email required'}), 400
    conn = sqlite3.connect(DB, timeout=10)
    c = conn.cursor()
    c.execute('UPDATE users SET is_staff=1 WHERE email=?', (email,))
    conn.commit()
    updated = c.rowcount
    conn.close()
    if updated:
        return jsonify({'success': True, 'message': f'{email} promoted to staff.'})
    else:
        return jsonify({'success': False, 'error': 'User not found.'}), 404

@app.route('/patients', methods=['GET'])
def get_patients():
    # Staff only: list all patients (users who are not staff)
    conn = sqlite3.connect(DB, timeout=10)
    c = conn.cursor()
    c.execute('SELECT id, name, email, phone, address FROM users WHERE is_staff=0')
    patients = [{'id': r[0], 'name': r[1], 'email': r[2], 'phone': r[3], 'address': r[4]} for r in c.fetchall()]
    conn.close()
    return jsonify({'patients': patients})

@app.route('/appointments/future', methods=['GET'])
def get_future_appointments():
    # Staff only: list all future appointments
    today = date.today().isoformat()
    conn = sqlite3.connect(DB, timeout=10)
    c = conn.cursor()
    c.execute('''SELECT a.id, u.name, a.service, a.date, a.time FROM appointments a JOIN users u ON a.user_id = u.id WHERE a.date >= ? ORDER BY a.date, a.time''', (today,))
    rows = c.fetchall()
    conn.close()
    appointments = [{'id': r[0], 'name': r[1], 'service': r[2], 'date': r[3], 'time': r[4]} for r in rows]
    return jsonify({'appointments': appointments})

@app.route('/appointments/past', methods=['GET'])
def get_past_appointments():
    # Staff only: list all past appointments
    today = date.today().isoformat()
    conn = sqlite3.connect(DB, timeout=10)
    c = conn.cursor()
    c.execute('''SELECT a.id, u.name, a.service, a.date, a.time FROM appointments a JOIN users u ON a.user_id = u.id WHERE a.date < ? ORDER BY a.date DESC, a.time DESC''', (today,))
    rows = c.fetchall()
    conn.close()
    appointments = [{'id': r[0], 'name': r[1], 'service': r[2], 'date': r[3], 'time': r[4]} for r in rows]
    return jsonify({'appointments': appointments})

@app.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.json
    conn = sqlite3.connect(DB, timeout=10)
    c = conn.cursor()
    c.execute('UPDATE users SET name=?, phone=?, address=? WHERE id=?',
              (data.get('name'), data.get('phone'), data.get('address'), user_id))
    conn.commit()
    updated = c.rowcount
    conn.close()
    if updated:
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'error': 'User not found'}), 404

@app.route('/appointments/<int:appt_id>', methods=['DELETE'])
def cancel_appointment(appt_id):
    conn = sqlite3.connect(DB, timeout=10)
    c = conn.cursor()
    c.execute('DELETE FROM appointments WHERE id=?', (appt_id,))
    conn.commit()
    deleted = c.rowcount
    conn.close()
    if deleted:
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'error': 'Appointment not found'}), 404

if __name__ == '__main__':
    app.run(debug=True)
