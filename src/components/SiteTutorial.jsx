import { useEffect, useMemo, useState } from "react";
import {
  Clapperboard,
  Download,
  Home,
  Image,
  KeyRound,
  PlayCircle,
  Search,
  UserRound,
  Video,
  X,
  Youtube,
} from "lucide-react";

const TUTORIAL_STORAGE_KEY = "sdn_wanasari_site_tutorial_date_v2";

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMillisecondsUntilMidnight() {
  const now = new Date();
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return nextMidnight.getTime() - now.getTime() + 250;
}

export default function SiteTutorial() {
  const [visible, setVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const steps = useMemo(
    () => [
      {
        icon: Home,
        title: "Dashboard Utama",
        text: "Website dibuka dari Dashboard yang berisi sambutan, akses cepat menuju galeri, serta tautan Instagram dan TikTok SDN Wanasari 15.",
      },
      {
        icon: Image,
        title: "Galeri Foto",
        text: "Buka menu Foto untuk melihat dokumentasi berdasarkan sumber Kamera, iPhone, atau Drone. Klik foto untuk memperbesar dan melihatnya dengan jelas.",
      },
      {
        icon: Video,
        title: "Galeri Video",
        text: "Menu Video berisi dokumentasi bergerak dari Kamera, iPhone, dan Drone dengan filter yang terpisah dari galeri foto.",
      },
      {
        icon: Search,
        title: "Cari dan Filter Media",
        text: "Gunakan kolom pencarian dan pilihan kategori untuk menemukan foto atau video tertentu dengan lebih cepat.",
      },
      {
        icon: Download,
        title: "Buka atau Unduh File",
        text: "Media dari Google Drive dapat dibuka pada ukuran penuh dan diunduh melalui tombol yang tersedia pada setiap kartu.",
      },
      {
        icon: Youtube,
        title: "Halaman YouTube",
        text: "Menu YouTube menampilkan video highlight khusus YouTube tanpa filter Kamera, iPhone, atau Drone.",
      },
      {
        icon: Clapperboard,
        title: "Halaman TikTok",
        text: "Menu TikTok menampilkan video singkat yang telah ditambahkan oleh admin dan dapat dibuka langsung menuju TikTok.",
      },
      {
        icon: UserRound,
        title: "Tentang Saya",
        text: "Halaman Tentang Saya berisi profil developer website, perkenalan singkat, informasi pendidikan, dan tautan sosial media.",
      },
      {
        icon: KeyRound,
        title: "Akses Admin",
        text: "Setelah login, admin dapat mengelola foto, video, YouTube, TikTok, akun admin, serta mengedit teks dan gambar pada halaman publik.",
      },
      {
        icon: PlayCircle,
        title: "Panduan Harian",
        text: "Panduan ini tampil satu kali setiap hari. Jika dilewati atau diselesaikan, panduan akan muncul kembali setelah pukul 00.00 pada hari berikutnya.",
      },
    ],
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    let midnightTimer;

    function showTutorialWhenNewDay() {
      const lastSeenDate = window.localStorage.getItem(TUTORIAL_STORAGE_KEY);
      if (lastSeenDate !== getLocalDateKey()) {
        setActiveStep(0);
        setVisible(true);
      }
    }

    function scheduleMidnightReset() {
      window.clearTimeout(midnightTimer);
      midnightTimer = window.setTimeout(() => {
        showTutorialWhenNewDay();
        scheduleMidnightReset();
      }, getMillisecondsUntilMidnight());
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") showTutorialWhenNewDay();
    }

    showTutorialWhenNewDay();
    scheduleMidnightReset();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearTimeout(midnightTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  function closeTutorialForToday() {
    window.localStorage.setItem(TUTORIAL_STORAGE_KEY, getLocalDateKey());
    setVisible(false);
  }

  function showNextStep() {
    if (activeStep >= steps.length - 1) {
      closeTutorialForToday();
      return;
    }

    setActiveStep((current) => current + 1);
  }

  if (!visible) return null;

  const step = steps[activeStep];
  const StepIcon = step.icon;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="site-tutorial-title"
        className="w-full max-w-lg overflow-hidden rounded-lg border border-blue-100 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.24)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-blue-100 px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-sapphire-700">Panduan Harian</p>
            <h2 id="site-tutorial-title" className="mt-1 text-xl font-black text-slate-950">
              Kenali Fitur Website
            </h2>
          </div>
          <button
            type="button"
            onClick={closeTutorialForToday}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Tutup tutorial untuk hari ini"
            title="Tutup untuk hari ini"
          >
            <X size={19} />
          </button>
        </div>

        <div className="px-5 py-6">
          <div className="mb-5 grid h-12 w-12 place-items-center rounded-lg bg-blue-50 text-sapphire-700">
            <StepIcon size={24} />
          </div>
          <p className="text-sm font-bold text-sapphire-700">
            Langkah {activeStep + 1} dari {steps.length}
          </p>
          <h3 className="mt-2 text-2xl font-black tracking-normal text-slate-950">{step.title}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{step.text}</p>

          <div className="mt-6 flex gap-2">
            {steps.map((item, index) => (
              <span
                key={item.title}
                className={`h-2 flex-1 rounded-full ${index <= activeStep ? "bg-sapphire-700" : "bg-slate-200"}`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-blue-100 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={closeTutorialForToday}
            className="inline-flex h-11 items-center justify-center rounded-md border border-blue-100 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-sapphire-700"
          >
            Lewati Hari Ini
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setActiveStep((current) => Math.max(0, current - 1))}
              disabled={activeStep === 0}
              className="inline-flex h-11 items-center justify-center rounded-md border border-blue-100 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-sapphire-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={showNextStep}
              className="inline-flex h-11 items-center justify-center rounded-md bg-sapphire-700 px-5 text-sm font-bold text-white transition hover:bg-sapphire-800"
            >
              {activeStep === steps.length - 1 ? "Selesai Hari Ini" : "Lanjut"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
