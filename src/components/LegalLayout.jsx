import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Icon from "@/components/Icon";

export default function LegalLayout({ eyebrow, title, updated, children }) {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero">
          <div className="container container--narrow">
            <nav className="breadcrumb" aria-label="İçerik yolu">
              <Link href="/">Ana Sayfa</Link>
              <Icon name="chevron" size={14} />
              <span>{title}</span>
            </nav>
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p className="muted">Son güncelleme: {updated}</p>
          </div>
        </section>
        <section className="section section--tight">
          <article className="container container--narrow prose">{children}</article>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
