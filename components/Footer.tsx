import { site } from '@/data/site';
import Logo from './Logo';

export default function Footer() {
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

        <p className="footer__note">
          Product photography on this site shows the actual cases as supplied. Vehicle
          names, model designations and marque logos appearing in the printed artwork
          are the property of their respective manufacturers; {site.name} is not
          affiliated with, endorsed by or sponsored by any of them.
        </p>
      </div>
    </footer>
  );
}
