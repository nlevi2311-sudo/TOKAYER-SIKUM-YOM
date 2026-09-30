import { ArrowLeft } from "lucide-react";
import { ButtonLink } from "./buttons";
import { CtaBand } from "./cta-band";

/** פס סיום לעמודים פנימיים שמוביל ליצירת קשר */
export function ContactCta() {
  return (
    <CtaBand
      id="more"
      title="רוצים לשמוע עוד?"
      text="נשמח לענות על שאלות ולספר על טוקאייר."
      actions={
        <ButtonLink href="/contact" variant="highlight">
          צור קשר
          <ArrowLeft />
        </ButtonLink>
      }
    />
  );
}
