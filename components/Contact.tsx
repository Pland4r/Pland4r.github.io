import { getCopy, type Locale } from '@/data/i18n';
import { enquiryLink, site } from '@/data/site';
import { ArrowRight } from './Icons';
import Reveal from './Reveal';

type Link = { label: string; href: string };

export default function Contact({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const { phone, whatsapp, instagram, email } = site.contact;

  const links: Link[] = [];
  // Pre-filled, so a general enquiry opens the same way an order does.
  if (whatsapp) {
    links.push({ label: copy.contact.whatsapp, href: enquiryLink(copy) ?? `https://wa.me/${whatsapp}` });
  }
  if (instagram) links.push({ label: `@${instagram}`, href: `https://instagram.com/${instagram}` });
  if (email) links.push({ label: email, href: `mailto:${email}` });
  if (phone) links.push({ label: phone, href: `tel:${phone.replace(/\s/g, '')}` });

  return (
    <section className="section section--tint" id="contact">
      <div className="wrap">
        <Reveal>
          <div className="cta">
            <div className="cta__glow" aria-hidden="true" />
            <p className="eyebrow">{copy.contact.eyebrow}</p>
            <h2 className="h1">{copy.contact.heading}</h2>
            {/* With no channel to reach us on yet, "tell us which case" would
                be asking for something the page cannot receive. */}
            <p className="lede" style={{ textAlign: 'center' }}>
              {links.length > 0 ? copy.contact.ledeOpen : copy.contact.ledeClosed}
            </p>

            {links.length > 0 ? (
              <div className="contactlist">
                {links.map((l, i) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={i === 0 ? 'btn btn--primary' : 'btn btn--ghost'}
                  >
                    {l.label} <ArrowRight />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
