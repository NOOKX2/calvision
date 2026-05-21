# Cal Vision

แอปวิเคราะห์โภชนาการจากรูปอาหารด้วย Dify พร้อมคำนวณ TDEE และติดตามโควต้าโปรตีน คาร์บ ไขมัน แคลอรี่รายวัน

## Stack

- Next.js 16 (App Router, Server Components + Server Actions)
- TypeScript, Drizzle ORM, PostgreSQL 18
- shadcn/ui, Tailwind CSS v4

## เริ่มต้น

### รันทั้งหมดใน Docker (แนะนำ — hot reload)

```bash
cp .env.example .env
# ใส่ DIFY_API_KEY ใน .env

bun run docker:dev
# หรือ: docker compose up --build
```

เปิด [http://localhost:3000](http://localhost:3000) — แก้โค้ดบนเครื่องแล้ว refresh อัตโนมัติ (volume mount + polling)

หยุด: `bun run docker:dev:down`

| Service | URL / Port |
|---------|------------|
| App | http://localhost:3000 |
| Drizzle Studio (Docker) | https://local.drizzle.studio → `localhost:4983` |
| PostgreSQL (จาก host) | `localhost:5433` |

> ใน container ใช้ `DATABASE_URL=...@db:5432/...` (compose ตั้งให้แล้ว) ไม่ใช้ `localhost:5433`

### รันบนเครื่อง (PostgreSQL ใน Docker อย่างเดียว)

```bash
cp .env.example .env
docker compose up -d db
bun run db:migrate   # หรือ db:push สำหรับ sync เร็วตอน dev
bun dev
```

### Drizzle Kit (migrations)

```bash
# สร้างไฟล์ migration หลังแก้ lib/db/schema.ts
bun run db:generate

# รัน migration ขึ้น PostgreSQL
bun run db:migrate

# ถ้าเคยใช้ db:push มาก่อน แล้ว migrate error "already exists"
bun run db:baseline   # หรือ migrate จะ baseline อัตโนมัติให้

# ทางเลือก: sync schema ตรงๆ ไม่ผ่านไฟล์ SQL (dev อย่างเดียว)
bun run db:push

# UI ดูข้อมูล (บนเครื่อง — ต้องมี db รันและ DATABASE_URL ชี้ localhost:5433)
bun run db:studio

# UI ดูข้อมูลผ่าน Docker — รันอัตโนมัติพร้อม `docker:dev` ที่พอร์ต 4983
# เปิด https://local.drizzle.studio
# Chrome: ไอคอนกุญแจในแถบ URL → เปิด "Local network access"
# ดู log: bun run docker:studio:logs
```

ไฟล์ migration อยู่ที่ `drizzle/` (เช่น `drizzle/0000_*.sql`)

ตั้งค่าใน `.env`:

- `DATABASE_URL` — PostgreSQL connection string
- `DIFY_API_KEY` — API key จาก Dify
- `DIFY_API_URL` — ค่าเริ่มต้น `https://api.dify.ai`
- `DIFY_APP_MODE` — `workflow` หรือ `chat`

## Dify

Workflow ควรรับ input รูปภาพ (เช่น `image` หรือ `food_image`) และตอบ JSON:

> ถ้าใน Dify ตั้งช่องรูปเป็น **File list** (หลายไฟล์) API จะต้องการ **array** ของไฟล์ — โค้ดส่งเป็น `[{ type, transfer_method, upload_file_id }]` ให้แล้ว

```json
{
  "food_name": "ข้าวผัดกุ้ง",
  "protein_g": 18,
  "carbs_g": 52,
  "fat_g": 12,
  "kcal": 420
}
```

สำหรับ Chat App ให้ตั้ง `DIFY_APP_MODE=chat` — ระบบจะส่งรูปพร้อม prompt ให้ตอบ JSON

## โครงสร้าง

```
app/
  page.tsx
  components/       # components ของหน้า home
  actions/          # server actions
lib/
  db/               # drizzle schema
  dify/             # Dify client
  nutrition/        # TDEE & quota
```
# calvision
