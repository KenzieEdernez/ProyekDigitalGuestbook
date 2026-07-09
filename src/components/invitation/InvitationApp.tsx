"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import InvitationCover from "@/components/invitation/InvitationCover";
import InvitationNav from "@/components/invitation/InvitationNav";
import HomeSection from "@/components/invitation/sections/HomeSection";
import CoupleSection from "@/components/invitation/sections/CoupleSection";
import EventSection from "@/components/invitation/sections/EventSection";
import GallerySection from "@/components/invitation/sections/GallerySection";
import RsvpSection from "@/components/invitation/sections/RsvpSection";
import GiftSection from "@/components/invitation/sections/GiftSection";
import WishesSection from "@/components/invitation/sections/WishesSection";
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

export default function InvitationApp() {
  const eventSettings = useEventSettings();
  const searchParams = useSearchParams();
  const guestName = parseGuestName(searchParams);

  const [opened, setOpened] = useState(false);
  const [activeSection, setActiveSection] = useState<InvitationSection>("home");
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const navigateTo = useCallback((section: InvitationSection) => {
    setActiveSection(section);
    const el = document.getElementById(section);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    window.history.replaceState(null, "", `#${section}`);
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as InvitationSection;
    if (SECTION_IDS.includes(hash)) {
      setOpened(true);
      setActiveSection(hash);
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "auto" });
      }, 100);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id as InvitationSection;
            if (SECTION_IDS.includes(id)) {
              setActiveSection(id);
            }
          }
        }
      },
      { threshold: 0.35, rootMargin: "-10% 0px -10% 0px" }
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [opened]);

  const handleOpen = () => {
    setOpened(true);
    setTimeout(() => navigateTo("home"), 300);
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (musicPlaying) {
      audioRef.current.pause();
      setMusicPlaying(false);
    } else {
      audioRef.current.play().catch(() => {
        // autoplay blocked
      });
      setMusicPlaying(true);
    }
  };

  if (!eventSettings.settingsReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream px-6">
        <div className="text-center">
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
      <main className="flex min-h-screen items-center justify-center bg-cream px-6">
        <div className="max-w-md text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-royal">
            EdernDigital
          </p>
          <h1 className="mt-3 font-serif text-2xl font-bold text-navy">
            Pengaturan acara belum tersedia
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-stone-500">
            Silakan isi pengaturan acara dari halaman admin terlebih dahulu.
          </p>
          <Link href="/admin" className="btn-navy mt-6 inline-flex">
            Buka Admin
          </Link>
        </div>
      </main>
    );
  }

  if (!opened) {
    return (
      <InvitationCover
        guestName={guestName}
        heroImage={eventSettings.heroImage}
        weddingDate={eventSettings.dateDisplay}
        onOpen={handleOpen}
      />
    );
  }

  return (
    <div className="invitation-app bg-cream pb-20 lg:pb-0">
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
      <CoupleSection />
      <EventSection event={eventSettings} />
      <GallerySection />
      <RsvpSection event={eventSettings} defaultName={guestName} />
      <GiftSection />
      <WishesSection defaultName={guestName} />

      <footer className="border-t border-stone-200 bg-white px-6 py-12 text-center">
        <p className="font-serif text-xl text-navy">
          {getCoupleDisplayName()}
        </p>
        <p className="mt-2 text-sm text-stone-500">
          Terima kasih atas doa dan kehadiran Anda
        </p>
        <p className="mt-6 text-[10px] uppercase tracking-[0.25em] text-stone-300">
          {eventSettings.organizer}
        </p>
        <Link
          href="/admin"
          className="mt-4 inline-block text-[10px] uppercase tracking-widest text-stone-300 hover:text-royal"
        >
          Staff Login
        </Link>
      </footer>
    </div>
  );
}
