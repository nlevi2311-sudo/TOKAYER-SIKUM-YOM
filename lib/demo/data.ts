import {
  seedAnnouncements,
  seedCategories,
  seedContacts,
  seedEmergency,
  seedOnboarding,
  seedResources,
  seedTraining,
} from "@/lib/seed-data";

/** נתוני ההדגמה הם נתוני ה-seed, כך שמה שרואים בהדגמה זהה למה שייטען ל-Supabase */
export const demoData = {
  categories: seedCategories,
  resources: seedResources,
  training: seedTraining,
  announcements: seedAnnouncements,
  contacts: seedContacts,
  emergency: seedEmergency,
  onboarding: seedOnboarding,
};
