import { useEffect, useMemo, useState } from "react";
import { Download, Images, KeyRound, PlayCircle, Search, X } from "lucide-react";

const TUTORIAL_STORAGE_KEY = "sdn_wanasari_site_tutorial_seen_v1";

export default function SiteTutorial() {
  const [visible, setVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const steps = useMemo(
    () => [
      {
        icon: Images,
        title: "Galeri Foto dan Video",
        text: "Halaman utama berisi dokumentasi dari Google Drive. Pilih kategori Kamera, iPhone, atau Drone untuk melihat media sesuai sumbernya.",
      },
      {
        icon: Search,
        title: "Cari dan Filter Media",
        text: "Gunakan kolom pencarian, tombol Foto, dan tombol Video untuk menemukan momen tertentu dengan lebih cepat.",
      },
      {
        icon: Download,
        title: "Buka atau Unduh File",
        text: "Setiap media dapat dibuka langsung dari Drive. File foto dan video juga dapat diunduh melalui tombol yang tersedia.",
      },
      {
        icon: PlayCircle,
        title: "Galeri YouTube",
        text: "Menu YouTube menampilkan highlight acara dalam halaman terpisah, sehingga tidak bercampur dengan galeri Google Drive.",
      },
      {
        icon: KeyRound,
        title: "Akses Admin",
        text: "Admin dapat login untuk menambah, mengedit, menghapus media, mengelola video YouTube, dan mengatur akun admin.",
      },
    ],
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasSeenTutorial = window.localStorage.getItem(TUTORIAL_STORAGE_KEY) === "true";
    setVisible(!hasSeenTutorial);
  }, []);

  function closeTutorial() {
    window.localStorage.setItem(TUTORIAL_STORAGE_KEY, "true");
    setVisible(false);
  }

  function showNextStep() {
    if (activeStep >= steps.length - 1) {
      closeTutorial();
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
            <p className="text-xs font-black uppercase tracking-[0.16em] text-sapphire-700">
              Panduan Singkat
            </p>
            <h2 id="site-tutorial-title" className="mt-1 text-xl font-black text-slate-950">
              Kenali Fitur Website
            </h2>
          </div>
          <button
            type="button"
            onClick={closeTutorial}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Tutup tutorial"
            title="Tutup"
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
            onClick={closeTutorial}
            className="inline-flex h-11 items-center justify-center rounded-md border border-blue-100 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-sapphire-700"
          >
            Lewati
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
              {activeStep === steps.length - 1 ? "Selesai" : "Lanjut"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
