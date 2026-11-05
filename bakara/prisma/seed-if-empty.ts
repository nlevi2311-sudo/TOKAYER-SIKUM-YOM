// בפריסה: טוען נתוני דמה רק אם בסיס הנתונים ריק, כדי לא למחוק נתונים בכל עדכון
import { PrismaClient } from "@prisma/client";
import { seedDemo } from "../src/lib/demo-seed";

const db = new PrismaClient();
(async () => {
  const users = await db.user.count();
  if (users > 0) {
    console.log(`בבסיס הנתונים כבר יש ${users} משתמשים. לא טוען נתוני דמה.`);
    return;
  }
  await seedDemo(db);
})()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
