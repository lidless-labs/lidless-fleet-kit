# Frozen banner anchors (v1)

Human style targets for Lidless watercolor banners. They are reference images a
person compares a render against, not inputs to the image model (generation is
text-only). They are frozen and checksummed so "on-style" cannot drift.

Lidless shares the **watercolor medium** with the Escoffier fleet (owls instead
of lobsters, cyan accent instead of amber). The anchor's job is the *treatment* -
wet-on-wet washes, bare cream paper, slate-navy linework - not the subject, so
these three clean non-owl watercolors are the correct north-star for the medium.

- `jellyfin.jpg` - dark-variant anchor (clean character, real washes, hex-free)
- `usage-tracker.jpg` - light-flatlay anchor (loose watercolor, on-brand)
- `tokenjuice.jpg` - origin north-star (bright clean character watercolor)

Rules:
- This set is immutable. `SHA256SUMS` is enforced by `banner/anchors.test.mjs`.
- NEVER add a generated or shipped banner here. Re-feeding outputs as references
  is the exact cause of the hexagonal drift this set exists to prevent.
- A new version (anchors-v2) is a deliberate, reviewed change, never a drop-in.
