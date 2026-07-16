# วิธีติดตั้งและรัน Backend API

## ขั้นตอนการติดตั้ง MySQL

1. ติดตั้ง MySQL Server
   - Windows: ดาวน์โหลดจาก https://dev.mysql.com/downloads/mysql/
   - หรือใช้ XAMPP/WAMP ที่มาพร้อม MySQL

2. สร้างฐานข้อมูล
   ```bash
   mysql -u root -p < database.sql
   ```
   หรือใช้ phpMyAdmin แล้ว import ไฟล์ `database.sql`

3. แก้ไขไฟล์ `.env`
   - เปลี่ยน `DB_PASSWORD` เป็นรหัสผ่าน MySQL ของคุณ
   - ถ้าใช้ XAMPP/WAMP รหัสผ่านมักจะเป็นค่าว่าง

## ขั้นตอนการติดตั้ง Backend

1. ติดตั้ง Node.js จาก https://nodejs.org/

2. ติดตั้ง dependencies
   ```bash
   npm install
   ```

3. รัน server
   ```bash
   npm start
   ```
   หรือสำหรับ development (auto-reload):
   ```bash
   npm run dev
   ```

4. Server จะรันที่ http://localhost:3000

## API Endpoints

- `GET /api/records` - ดึงข้อมูลทั้งหมด
- `GET /api/records/:id` - ดึงข้อมูลตาม ID
- `POST /api/records` - สร้างข้อมูลใหม่
- `PUT /api/records/:id` - แก้ไขข้อมูล
- `DELETE /api/records/:id` - ลบข้อมูลตาม ID
- `DELETE /api/records` - ลบข้อมูลทั้งหมด
