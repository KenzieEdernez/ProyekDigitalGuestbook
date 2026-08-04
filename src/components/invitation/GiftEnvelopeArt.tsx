/** Transparent envelope illustration — sits alone, no plate behind it. */
export default function GiftEnvelopeArt() {
  return (
    <div className="gift-envelope-art" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/invitation/gift-envelope-art.png"
        alt=""
        className="gift-envelope-art-img"
        draggable={false}
      />
    </div>
  );
}
