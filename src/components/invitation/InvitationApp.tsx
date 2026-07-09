"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import InvitationCover from "@/components/invitation/InvitationCover";
import InvitationNav from "@/components/invitation/InvitationNav";
import ScrollProgress from "@/components/invitation/ScrollProgress";
import WaveDivider from "@/components/invitation/WaveDivider";
import HomeSection from "@/components/invitation/sections/HomeSection";
import CoupleSection from "@/components/invitation/sections/CoupleSection";
import EventSection from "@/components/invitation/sections/EventSection";
import GallerySection from "@/components/invitation/sections/GallerySection";
import RsvpSection from "@/components/invitation/sections/RsvpSection";
import GiftSection from "@/components/invitation/sections/GiftSection";
import WishesSection from "@/components/invitation/sections/WishesSection";
import Reveal from "@/components/invitation/Reveal";
import { useEventSettings } from "@/hooks/useEventSettings";
import {
  getCoupleDisplayName,
  parseGuestName,
  type InvitationSection,
} from "@/lib/wedding-config";

const SECTION_IDS: InvitationSection[] = [
  "home",
  "couple",
  "event",
  "gallery",
  "rsvp",
  "gift",
  "wishes",
];

type Phase = "cover" | "curtain" | "open";

export default function InvitationApp() {
  const eventSettings = useEventSettings();
  const searchParams = useSearchParams();
  const guestName = parseGuestName(searchParams);

  const [phase, setPhase] = useState<Phase>("cover");
  const [activeSection, setActiveSection] = useState<InvitationSection>("home");
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigateTo = useCallback((section: InvitationSection) => {
    setIsNavigating(true);
    setActiveSection(section);

    const el = document.getElementById(section);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    window.history.replaceState(null, "", `#${section}`);

    if (navigateTimer.current) clearTimeout(navigateTimer.current);
    navigateTimer.current = setTimeout(() => setIsNavigating(false), 800);
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as InvitationSection;
    if (SECTION_IDS.includes(hash)) {
      setPhase("open");
      setActiveSection(hash);
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "auto" });
      }, 100);
    }
  }, []);

  useEffect(() => {
    if (phase !== "open") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isNavigating) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id as InvitationSection;
            if (SECTION_IDS.includes(id)) {
              setActiveSection(id);
            }
          }
        }
      },
      { threshold: 0.3, rootMargin: "-5% 0px -5% 0px" }
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [phase, isNavigating]);

  const handleOpen = () => {
    setPhase("curtain");
    setTimeout(() => {
      setPhase("open");
      window.scrollTo({ top: 0, behavior: "auto" });
      setTimeout(() => navigateTo("home"), 100);
    }, 1100);
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (musicPlaying) {
      audioRef.current.pause();
      setMusicPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setMusicPlaying(true);
    }
  };

  if (!eventSettings.settingsReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-champagne px-6">
        <div className="text-center animate-fade-in">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-royal/30 border-t-royal" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-royal">
            EdernDigital
          </p>
          <p className="mt-3 text-sm text-stone-500">Memuat undangan...</p>
        </div>
      </main>
    );
  }

  if (!eventSettings.settingsAvailable) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-champagne px-6">
        <div className="max-w-md text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-royal">
            EdernDigital
          </p>
          <h1 className="mt-3 font-display text-2xl text-navy">
            Pengaturan acara belum tersedia
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-stone-500">
            Silakan isi pengaturan acara dari halaman admin terlebih dahulu.
          </p>
          <Link href="/admin" className="btn-invite-primary mt-6 inline-flex">
            Buka Admin
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Curtain transition overlay */}
      {phase === "curtain" && (
        <div className="curtain-open pointer-events-none fixed inset-0 z-[100] flex">
          <div className="curtain-panel curtain-left h-full w-1/2 bg-navy-900" />
          <div className="curtain-panel curtain-right h-full w-1/2 bg-navy-900" />
        </div>
      )}

      {phase === "cover" && (
        <InvitationCover
          guestName={guestName}
          heroImage={eventSettings.heroImage}
          weddingDate={eventSettings.dateDisplay}
          onOpen={handleOpen}
        />
      )}

      {phase === "open" && (
        <div className="invitation-app invitation-app-enter bg-champagne pb-24 lg:pb-0">
          <ScrollProgress />
          <audio ref={audioRef} loop preload="none" />

          <InvitationNav
            active={activeSection}
            onNavigate={navigateTo}
            musicPlaying={musicPlaying}
            onToggleMusic={toggleMusic}
          />

          <HomeSection
            event={eventSettings}
            guestName={guestName}
            onNavigateRsvp={() => navigateTo("rsvp")}
          />

          <WaveDivider fill="#f9f0ed" />
          <CoupleSection />
          <WaveDivider fill="#1a2332" flip />
          <EventSection event={eventSettings} />
          <WaveDivider fill="#f3efe6" />
          <GallerySection />
          <WaveDivider fill="#f8f6f2" />
          <RsvpSection event={eventSettings} defaultName={guestName} />
          <WaveDivider fill="#faf7f2" />
          <GiftSection />
          <WaveDivider fill="#f3efe6" />
          <WishesSection defaultName={guestName} />

          <footer className="relative overflow-hidden border-t border-royal/10 bg-white px-6 py-16 text-center">
            <div className="absolute inset-0 bg-radial-gold opacity-50" />
            <Reveal direction="scale" className="relative">
              <p className="font-display text-3xl font-light text-navy">
                {getCoupleDisplayName()}
              </p>
              <div className="ornament-line mx-auto my-5 max-w-xs" />
              <p className="text-sm text-stone-500">
                Terima kasih atas doa dan kehadiran Anda
              </p>
              <p className="mt-8 text-[10px] uppercase tracking-[0.3em] text-stone-300">
                {eventSettings.organizer}
              </p>
              <Link
                href="/admin"
                className="mt-4 inline-block text-[10px] uppercase tracking-widest text-stone-300 transition-colors duration-300 hover:text-royal"
              >
                Staff Login
              </Link>
            </Reveal>
          </footer>
        </div>
      )}
    </>
  );
}
