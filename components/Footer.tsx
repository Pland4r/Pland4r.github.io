import { getCopy, type Locale } from '@/data/i18n';
import { site } from '@/data/site';
import Logo from './Logo';

export default function Footer({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__inner">
          <Logo size={54} />
          <small>
            © {new Date().getFullYear()} {site.name}
            {site.contact.city ? ` · ${site.contact.city}` : ''}
          </small>
        </div>

        <p className="footer__note">{copy.footer.disclaimer(site.name)}</p>
      </div>
    </footer>
  );
}
