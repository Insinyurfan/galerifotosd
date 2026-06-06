import { ArrowRight, Camera, Clapperboard, Instagram, PlayCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { SCHOOL_SOCIALS } from "../constants/site.js";
import { useSession } from "../hooks/useSession.js";

export default function DashboardPage() {
  const session = useSession();

  return (
    <div className="app-shell-page">
      <Navbar session={session} />
      <main className="page-content">
        <section className="welcome-hero">
          <div className="welcome-copy">
            <span className="eyebrow">
              <Sparkles size={17} />
              Album Kenangan 2026
            </span>
            <h1>Selamat datang di ruang kenangan perpisahan kelas 6.</h1>
            <p>
              Setiap foto dan video di sini menyimpan cerita tentang kebersamaan, tawa, dan langkah baru keluarga besar
              SDN Wanasari 15. Mari melihat kembali momen indah yang akan selalu menjadi bagian dari perjalanan kita.
            </p>
            <div className="hero-actions">
              <Link to="/foto" className="primary-action">
                Lihat Galeri Foto
                <ArrowRight size={18} />
              </Link>
              <Link to="/video" className="secondary-action">
                Putar Video
                <PlayCircle size={18} />
              </Link>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-orbit hero-orbit-one" />
            <div className="hero-orbit hero-orbit-two" />
            <div className="hero-camera">
              <Camera size={62} strokeWidth={1.6} />
            </div>
            <span className="hero-year">2026</span>
          </div>
        </section>

        <section className="dashboard-grid">
          <article className="dashboard-card dashboard-card-wide">
            <span className="card-icon blue">
              <Camera size={24} />
            </span>
            <div>
              <p className="card-kicker">Dokumentasi Lengkap</p>
              <h2>Satu tempat untuk seluruh momen istimewa</h2>
              <p>Jelajahi hasil dokumentasi dari Kamera, iPhone, dan Drone dengan tampilan yang rapi dan mudah digunakan.</p>
            </div>
          </article>

          <article className="dashboard-card">
            <span className="card-icon pink">
              <Instagram size={24} />
            </span>
            <div>
              <p className="card-kicker">Instagram</p>
              <h2>SDN Wanasari 15</h2>
              <a href={SCHOOL_SOCIALS.instagram} target="_blank" rel="noreferrer">
                Kunjungi Instagram <ArrowRight size={16} />
              </a>
            </div>
          </article>

          <article className="dashboard-card">
            <span className="card-icon dark">
              <Clapperboard size={24} />
            </span>
            <div>
              <p className="card-kicker">TikTok</p>
              <h2>SDN Wanasari 15</h2>
              <a href={SCHOOL_SOCIALS.tiktok} target="_blank" rel="noreferrer">
                Kunjungi TikTok <ArrowRight size={16} />
              </a>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
