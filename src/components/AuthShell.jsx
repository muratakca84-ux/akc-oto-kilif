import Link from "next/link";
import Image from "next/image";
import Icon from "@/components/Icon";

export default function AuthShell({ title, subtitle, children, aside }) {
  return (
    <main className="auth">
      <aside className="auth-aside">
        <Link className="brand brand--light" href="/">
          <Image className="brand-logo" src="/images/akc-logo-square.png" alt="" width={44} height={44} />
          <span className="brand-text">
            <strong>AKC Oto Kılıf</strong>
            <small>Müşteri hesabı</small>
          </span>
        </Link>

        <div className="auth-aside-copy">
          <h2>{aside.title}</h2>
          <ul>
            {aside.points.map((point) => (
              <li key={point}>
                <Icon name="check" size={18} />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="auth-aside-foot">© {new Date().getFullYear()} AKC Oto Kılıf · Konya</p>
      </aside>

      <section className="auth-main">
        <div className="auth-top">
          <Link className="link-muted" href="/">
            ← Siteye dön
          </Link>
        </div>
        <div className="auth-card">
          <h1>{title}</h1>
          <p className="muted">{subtitle}</p>
          {children}
        </div>
      </section>
    </main>
  );
}
