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

### รูปอาหาร — Cloudflare R2 (บังคับบน production)

Local dev ใช้โฟลเดอร์ `data/meal-images/` ได้โดยไม่ตั้ง R2  
บน Vercel **ต้อง** ตั้ง R2 (serverless เขียน disk ไม่ได้)

1. Cloudflare Dashboard → **R2** → Create bucket (เช่น `calvision-meals`)
2. **Manage R2 API Tokens** → สร้าง token (Object Read & Write)
3. (แนะนำ) เปิด **Public access** หรือ custom domain → ได้ URL สำหรับ `R2_PUBLIC_URL`
4. ใส่ใน `.env` / Vercel:

| Variable | ตัวอย่าง |
|----------|----------|
| `R2_ACCOUNT_ID` | จาก Cloudflare dashboard |
| `R2_ACCESS_KEY_ID` | จาก API token |
| `R2_SECRET_ACCESS_KEY` | จาก API token |
| `R2_BUCKET_NAME` | `calvision-meals` |
| `R2_PUBLIC_URL` | `https://pub-xxxx.r2.dev` หรือ custom domain (optional) |

ใน DB คอลัมน์ `image_path` เก็บ **R2 public URL** เต็ม (เช่น `https://pub-xxxx.r2.dev/meals/{mealId}.jpg`) หลัง `uploadToR2` — ต้องตั้ง `R2_PUBLIC_URL`

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

## Deploy บน Vercel

ข้อผิดพลาด `Failed query: select ... from "profiles"` มักเกิดจาก **ฐานข้อมูล production ยังไม่พร้อม** ไม่ใช่บั๊กของหน้าเว็บโดยตรง

ทุก request จะ query `profiles` ใน `app/layout.tsx` (แถบนำทาง) — ถ้า DB ล้ม หน้า `/` จะได้ **500**

### Checklist

1. **PostgreSQL บนคลาวด์** — ใช้ [Neon](https://neon.tech), Supabase, Vercel Postgres ฯลฯ (Docker บนเครื่อง Vercel เข้าไม่ถึง)
2. **Environment Variables** ใน Vercel → Project → Settings → Environment Variables:
   - `DATABASE_URL` — connection string จากผู้ให้บริการ (มักลงท้าย `?sslmode=require`)
   - `DIFY_API_KEY`, `DIFY_API_URL`, `DIFY_APP_MODE` ตาม `.env` บนเครื่อง
   - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` — เก็บรูปอาหาร
   - `R2_PUBLIC_URL` — (แนะนำ) URL สาธารณะของ bucket
3. **รัน migration ขึ้น Neon** (ครั้งแรก) — ใช้ connection string **เดียวกับ** ที่ใส่ใน Vercel:

   ```bash
   # ใน .env บนเครื่อง เปลี่ยน DATABASE_URL เป็น Neon ชั่วคราว แล้วรัน
   bun run db:migrate
   ```

   ต้องเห็นตาราง `profiles` และ `meal_logs` ใน Neon Console → Tables

   > ใช้ **Pooled connection** จาก Neon (host ลงท้าย `-pooler`) สำหรับ Vercel แนะนำใน dashboard

4. **Redeploy** หลังตั้ง env แล้ว (Production + Preview ถ้าใช้)

### Neon ยัง error อยู่?

- `.env` บนเครื่องยังเป็น `localhost` ได้ — แต่ **Vercel ใช้ค่าใน Dashboard เท่านั้น**
- ต้อง **migrate บน Neon** แยกจาก Docker local (ตาราง local ไม่ sync ไป Neon เอง)
- ใน Vercel ตั้ง `DATABASE_URL` ครบทุก environment ที่ deploy (Production)

### ตรวจว่าเชื่อมต่อได้

```bash
DATABASE_URL="..." bun run db:studio
```

หรือ `psql` แล้ว `\dt` ต้องมี `profiles`

> โค้ดเปิด `ssl: require` อัตโนมัติเมื่อ `NODE_ENV=production` และ host ไม่ใช่ localhost — หรือใส่ `?sslmode=require` ใน `DATABASE_URL`

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
