"use client";

import Icon from "@/components/Icon";
import { getContact } from "@/lib/site-config";
import { useSiteSettings } from "@/lib/use-site-settings";

export default function FloatingContactButtons() {
  const contact = getContact(useSiteSettings());

  return (
    <div className="floating-contact" aria-label="Hızlı iletişim">
      <a className="floating-btn floating-btn--phone" href={contact.phoneHref} aria-label="Hemen ara">
        <Icon name="phone" size={22} />
      </a>
      <a
        className="floating-btn floating-btn--whatsapp"
        href={contact.whatsappHref()}
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp üzerinden yazın"
      >
        <Icon name="whatsapp" size={24} />
      </a>
    </div>
  );
}
