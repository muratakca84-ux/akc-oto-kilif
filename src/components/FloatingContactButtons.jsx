export default function FloatingContactButtons({ phoneHref, whatsappHref }) {
  return (
    <div className="floating-contact-buttons" aria-label="Hızlı iletişim">
      <a className="floating-contact floating-contact--phone" href={phoneHref} aria-label="Hemen ara">
        <span aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M6.6 10.8c1.7 3.3 3.3 5 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.2 1.2.4 2.5.7 3.8.7.6 0 1 .4 1 1v3.6c0 .6-.4 1-1 1A17.3 17.3 0 0 1 3 4c0-.6.4-1 1-1h3.7c.6 0 1 .4 1 1 0 1.3.2 2.6.7 3.8.1.4 0 .8-.3 1.1l-2.5 1.9Z" /></svg>
        </span>
      </a>
      <a className="floating-contact floating-contact--whatsapp" href={whatsappHref} target="_blank" rel="noreferrer" aria-label="WhatsApp üzerinden teklif al">
        <span aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 2a9.7 9.7 0 0 0-8.4 14.5L2 22l5.7-1.5A10 10 0 1 0 12 2Zm0 17.8c-1.5 0-3-.4-4.2-1.1l-.3-.2-3.3.9.9-3.2-.2-.3a7.8 7.8 0 1 1 7.1 3.9Zm4.3-5.8c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.6.2l-.8 1c-.1.2-.3.2-.5.1-1.4-.7-2.4-1.3-3.3-2.9-.2-.3.2-.4.7-1.1.1-.2.1-.4 0-.5l-.7-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2.1 3.2 5 4.4 1.9.8 2.7.9 3.7.7.6-.1 1.4-.6 1.6-1.1.2-.6.2-1 .2-1.1-.1-.2-.3-.3-.5-.4Z" /></svg>
        </span>
      </a>
    </div>
  );
}
