import { Facebook, GraduationCap, Instagram, Laptop, Quote, UserRound } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import { DEVELOPER_PROFILE } from "../constants/site.js";
import { useSession } from "../hooks/useSession.js";

const socialLinks = [
  { label: "Instagram", href: DEVELOPER_PROFILE.socials.instagram, icon: Instagram },
  { label: "TikTok", href: DEVELOPER_PROFILE.socials.tiktok, icon: UserRound },
  { label: "Facebook", href: DEVELOPER_PROFILE.socials.facebook, icon: Facebook },
];

export default function AboutPage() {
  const session = useSession();

  return (
    <div className="app-shell-page">
      <Navbar session={session} />
      <main className="page-content">
        <section className="page-heading">
          <span className="eyebrow">Tentang Developer</span>
          <h1>Orang di balik website ini</h1>
          <p>Sebuah perkenalan singkat dari pengembang ruang kenangan digital SDN Wanasari 15.</p>
        </section>

        <section className="developer-card">
          <div className="developer-photo-wrap">
            {DEVELOPER_PROFILE.photo ? (
              <img src={DEVELOPER_PROFILE.photo} alt={`Foto profil ${DEVELOPER_PROFILE.name}`} className="developer-photo" />
            ) : (
              <div className="developer-photo developer-photo-fallback">I</div>
            )}
            <span className="developer-status">Developer Website</span>
          </div>

          <div className="developer-content">
            <Quote className="developer-quote" size={42} />
            <p className="card-kicker">Halo, saya</p>
            <h1>{DEVELOPER_PROFILE.name}</h1>
            <p className="developer-intro">{DEVELOPER_PROFILE.introduction}</p>

            <div className="developer-details">
              <div>
                <Laptop size={22} />
                <span>
                  <strong>Web Developer</strong>
                  Merancang dan membangun website ini.
                </span>
              </div>
              <div>
                <GraduationCap size={22} />
                <span>
                  <strong>Mahasiswa</strong>
                  {DEVELOPER_PROFILE.university}
                </span>
              </div>
            </div>

            <div className="developer-socials">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer">
                  <Icon size={19} />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
