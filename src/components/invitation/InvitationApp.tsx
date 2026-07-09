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
import WishLettersSection from "@/components/invitation/sections/WishLettersSection";
import Reveal from "@/components/invitation/Reveal";
import { useEventSettings } from "@/hooks/useEventSettings";
import { useWeddingSettings } from "@/hooks/useWeddingSettings";
import { getCoupleDisplayName, parseGuestName, type InvitationSection } from "@/lib/wedding-config";

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
  const { wedding, weddingReady } = useWeddingSettings();
  const searchParams = useSearchParams();
  const guestName = parseGuestName(searchParams);

  const [phase, setPhase] = useState<Phase>("cover");
  const [activeSection, setActiveSection] = useState<InvitationSection>("home");
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanUrl = useCallback(() => {
    const url = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(null, "", url);
  }, []);

  const navigateTo = useCallback(
    (section: InvitationSection) => {
      setIsNavigating(true);
      setActiveSection(section);

      const el = document.getElementById(section);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      cleanUrl();

      if (navigateTimer.current) clearTimeout(navigateTimer.current);
      navigateTimer.current = setTimeout(() => setIsNavigating(false), 800);
    },
    [cleanUrl]
  );

  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as InvitationSection;
    if (SECTION_IDS.includes(hash)) {
      setPhase("open");
      setActiveSection(hash);
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "auto" });
        cleanUrl();
      }, 100);
    }
  }, [cleanUrl]);

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
      setActiveSection("home");
      cleanUrl();
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

  if (!eventSettings.settingsReady || !weddingReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-champagne px-6">
        <div className="text-center animate-fade-in">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-royal/30 border-t-royal" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-royal">
            EdernDigital
          </p>
          <p className="mt-3 text-sm text-stone-500">Loading invitation...</p>
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
            Event settings are not available
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-stone-500">
            Please configure event settings from the admin page first.
          </p>
          <Link href="/admin" className="btn-invite-primary mt-6 inline-flex">
            Open Admin
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
          coupleName={getCoupleDisplayName(wedding)}
          onOpen={handleOpen}
        />
      )}

      {phase === "open" && (
        <div className="invitation-app invitation-app-enter bg-champagne">
          <ScrollProgress />
          <audio
            ref={audioRef}
            key={wedding.musicUrl}
            src={wedding.musicUrl}
            loop
            preload="none"
          />

          <InvitationNav
            active={activeSection}
            coupleName={getCoupleDisplayName(wedding)}
            onNavigate={navigateTo}
            musicPlaying={musicPlaying}
            onToggleMusic={toggleMusic}
          />

          <main>
            <HomeSection
              event={eventSettings}
              wedding={wedding}
              guestName={guestName}
              onNavigateRsvp={() => navigateTo("rsvp")}
            />

            <WaveDivider fill="#f9f0ed" />
            <CoupleSection wedding={wedding} />
            <WaveDivider fill="#1a2332" flip />
            <EventSection event={eventSettings} ceremonies={wedding.ceremonies} />
            <WaveDivider fill="#f3efe6" />
            <GallerySection gallery={wedding.gallery} />
            <WaveDivider fill="#f8f6f2" />
            <RsvpSection
              event={eventSettings}
              defaultName={guestName}
              onNavigateWishes={() => navigateTo("wishes")}
            />
            <WaveDivider fill="#faf7f2" />
            <GiftSection gifts={wedding.gifts} giftAddress={wedding.giftAddress} />
            <WaveDivider fill="#f5f0ea" />
            <WishLettersSection onNavigateRsvp={() => navigateTo("rsvp")} />
          </main>

          <footer className="relative overflow-hidden border-t border-royal/10 bg-white px-6 py-16 text-center lg:py-20">
            <div className="absolute inset-0 bg-radial-gold opacity-50" />
            <Reveal direction="scale" className="relative">
              <p className="font-display text-3xl font-light text-navy">
                {getCoupleDisplayName(wedding)}
              </p>
              <div className="ornament-line mx-auto my-5 max-w-xs" />
              <p className="text-sm text-stone-500">
                Thank you for your blessings and presence
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
