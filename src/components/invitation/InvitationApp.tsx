"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import FlyingBirds from "@/components/invitation/FlyingBirds";
import InvitationCover from "@/components/invitation/InvitationCover";
import InvitationNav from "@/components/invitation/InvitationNav";
import ScrollProgress from "@/components/invitation/ScrollProgress";
import ClosingSection from "@/components/invitation/sections/ClosingSection";
import DressCodeSection from "@/components/invitation/sections/DressCodeSection";
import HomeSection from "@/components/invitation/sections/HomeSection";
import CoupleSection from "@/components/invitation/sections/CoupleSection";
import EventSection from "@/components/invitation/sections/EventSection";
import GallerySection from "@/components/invitation/sections/GallerySection";
import RsvpSection from "@/components/invitation/sections/RsvpSection";
import GiftSection from "@/components/invitation/sections/GiftSection";
import WishLettersSection from "@/components/invitation/sections/WishLettersSection";
import { useEventSettings } from "@/hooks/useEventSettings";
import { useWeddingSettings } from "@/hooks/useWeddingSettings";
import { getCoupleDisplayName, parseGuestName, type InvitationSection } from "@/lib/wedding-config";

const SECTION_IDS: InvitationSection[] = [
  "home",
  "couple",
  "event",
  "dresscode",
  "gallery",
  "rsvp",
  "gift",
  "wishes",
];

type Phase = "cover" | "curtain" | "open";

export default function InvitationApp() {
  const eventSettings = useEventSettings();
  const { wedding, weddingReady, musicAvailable } = useWeddingSettings();
  const searchParams = useSearchParams();
  const guestName = parseGuestName(searchParams);

  const [phase, setPhase] = useState<Phase>("cover");
  const [activeSection, setActiveSection] = useState<InvitationSection>("home");
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showRsvpReminder, setShowRsvpReminder] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userPausedMusicRef = useRef(false);
  const invitationOpenedRef = useRef(false);
  const phaseRef = useRef<Phase>(phase);
  phaseRef.current = phase;

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

  const stopMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setMusicPlaying(false);
  }, []);

  const primeMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !musicAvailable || userPausedMusicRef.current) return;

    audio.muted = false;
    audio.volume = 1;

    const playAttempt = audio.play();
    if (!playAttempt) return;

    playAttempt
      .then(() => setMusicPlaying(true))
      .catch(() => {
        const retryOnCanPlay = () => {
          audio.removeEventListener("canplay", retryOnCanPlay);
          void audio.play().then(() => setMusicPlaying(true)).catch(() => {});
        };
        audio.addEventListener("canplay", retryOnCanPlay);
      });
  }, [musicAvailable]);

  const handleMusicEnded = useCallback(() => {
    if (userPausedMusicRef.current) {
      setMusicPlaying(false);
      return;
    }

    const audio = audioRef.current;
    if (!audio || !musicAvailable) {
      setMusicPlaying(false);
      return;
    }

    audio.currentTime = 0;
    void audio
      .play()
      .then(() => setMusicPlaying(true))
      .catch(() => setMusicPlaying(false));
  }, [musicAvailable]);

  const handleOpen = () => {
    userPausedMusicRef.current = false;
    invitationOpenedRef.current = true;
    // Start on the same user gesture as "Open Invitation"
    primeMusic();

    setPhase("curtain");
    setTimeout(() => {
      setPhase("open");
      setShowRsvpReminder(true);
      window.scrollTo({ top: 0, behavior: "auto" });
      setActiveSection("home");
      cleanUrl();
      // Keep playing after curtain; browsers can drop playback on route/UI updates
      if (!userPausedMusicRef.current) {
        primeMusic();
      }
    }, 900);
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio || !musicAvailable) return;

    if (musicPlaying) {
      userPausedMusicRef.current = true;
      audio.pause();
      setMusicPlaying(false);
      return;
    }

    userPausedMusicRef.current = false;
    primeMusic();
  };

  useEffect(() => {
    if (!musicAvailable) return;

    const audio = audioRef.current;
    if (audio) {
      audio.preload = "auto";
      audio.load();
    }

    void fetch("/api/wedding-music", { cache: "force-cache" }).catch(() => {});
  }, [musicAvailable]);

  // After invitation is open, keep trying to play unless the guest muted it.
  useEffect(() => {
    if (
      (phase !== "open" && phase !== "curtain") ||
      !musicAvailable ||
      !invitationOpenedRef.current ||
      userPausedMusicRef.current
    ) {
      return;
    }

    primeMusic();
  }, [phase, musicAvailable, primeMusic]);

  // Pause when leaving the site/tab; autoplay again when returning.
  useEffect(() => {
    if (!musicAvailable) return;

    const canResume = () =>
      invitationOpenedRef.current &&
      !userPausedMusicRef.current &&
      (phaseRef.current === "open" || phaseRef.current === "curtain");

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        stopMusic();
        return;
      }
      if (document.visibilityState === "visible" && canResume()) {
        primeMusic();
      }
    };

    const handlePageHide = () => {
      stopMusic();
    };

    const handlePageShow = () => {
      if (canResume()) {
        primeMusic();
      }
    };

    const handleFocus = () => {
      if (canResume()) {
        primeMusic();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("focus", handleFocus);
    };
  }, [musicAvailable, primeMusic, stopMusic]);

  // Only stop audio when the invitation app unmounts.
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

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

  return (
    <>
      {musicAvailable && (
        <audio
          ref={audioRef}
          src="/api/wedding-music"
          preload="auto"
          playsInline
          onPlay={() => setMusicPlaying(true)}
          onPause={() => setMusicPlaying(false)}
          onEnded={handleMusicEnded}
        />
      )}

      {phase === "cover" && (
        <InvitationCover
          guestName={guestName}
          heroImage={eventSettings.heroImage}
          heroImagePortrait={eventSettings.heroImagePortrait}
          heroImageCard={eventSettings.heroImageCard}
          coupleName={getCoupleDisplayName(wedding)}
          copy={wedding.invitationCopy}
          heroLogoImage={
            wedding.heroLogoImageDark || wedding.heroLogoImage || undefined
          }
          onOpen={handleOpen}
          onPrimeMusic={primeMusic}
        />
      )}

      {(phase === "curtain" || phase === "open") && (
        <div
          className={`invitation-app bg-champagne ${
            phase === "curtain" ? "invitation-app-enter" : ""
          }`}
        >
          <ScrollProgress />
          <FlyingBirds
            birdImage={eventSettings.birdImage}
            birdImageIos={eventSettings.birdImageIos}
            birdFrames={eventSettings.birdFrames}
            birdCount={eventSettings.birdCount}
          />

          <InvitationNav
            active={activeSection}
            coupleName={getCoupleDisplayName(wedding)}
            onNavigate={navigateTo}
            musicPlaying={musicPlaying}
            musicAvailable={musicAvailable}
            onToggleMusic={toggleMusic}
            showRsvpReminder={phase === "open" && showRsvpReminder}
            onRsvpReminder={() => setShowRsvpReminder(false)}
            onRsvpReminderDismiss={() => setShowRsvpReminder(false)}
            rsvpReminderEyebrow={wedding.invitationCopy.rsvpReminderEyebrow}
            rsvpReminderTitle={wedding.invitationCopy.rsvpReminderTitle}
            rsvpReminderMessage={wedding.invitationCopy.rsvpReminderMessage}
          />

          <main>
            <HomeSection
              event={eventSettings}
              wedding={wedding}
              copy={wedding.invitationCopy}
              guestName={guestName}
            />
            <CoupleSection
              wedding={wedding}
              logoImage={eventSettings.logoImage}
              weddingReady={weddingReady}
            />
            <EventSection ceremonies={wedding.ceremonies} />
            <DressCodeSection
              event={eventSettings}
              copy={wedding.invitationCopy}
            />
            <GallerySection gallery={wedding.gallery} />
            <RsvpSection
              event={eventSettings}
              wedding={wedding}
              defaultName={guestName}
              onNavigateWishes={() => navigateTo("wishes")}
            />
            <GiftSection
              gifts={wedding.gifts}
              copy={wedding.invitationCopy}
              cardImage={
                eventSettings.heroImagePortrait || eventSettings.heroImage
              }
            />
            <WishLettersSection onNavigateRsvp={() => navigateTo("rsvp")} />
            <ClosingSection
              wedding={wedding}
              copy={wedding.invitationCopy}
              organizer={eventSettings.organizer}
            />
          </main>
        </div>
      )}
    </>
  );
}
