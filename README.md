# Cal Vision

แอปวิเคราะห์โภชนาการจากรูปอาหารด้วย Dify พร้อมคำนวณ TDEE และติดตามโควต้าโปรตีน คาร์บ ไขมัน แคลอรี่รายวัน

## Stack

- Next.js 16 (App Router, Server Components + Server Actions)
- TypeScript, Drizzle ORM, PostgreSQL 18
- shadcn/ui, Tailwind CSS v4

## เริ่มต้น

```bash
cp .env.example .env
docker compose up -d
bun run db:push
bun dev
```

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
