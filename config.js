// ═══════════════════════════════════════════════════════════════
//  Personalize your story here — edit these values and refresh!
// ═══════════════════════════════════════════════════════════════

const STORY_CONFIG = {
  herName: "Her Name",
  yourName: "Your Name",
  birthdayDate: "July 7", // optional, for display only

  chapters: [
    {
      id: "chapter-1",
      label: "Chapter 1",
      title: "The day we met",
      paragraphs: [
        "Some stories begin with fireworks. Ours began quieter — a moment that didn't feel loud at the time, but somehow rearranged everything.",
        "I didn't know yet that you'd become my favorite person to talk to, my calm in chaos, the reason ordinary days started to feel extraordinary.",
      ],
      quote: "I still remember exactly how you smiled.",
    },
    {
      id: "chapter-2",
      label: "Chapter 2",
      title: "Little moments",
      paragraphs: [
        "It's not always the big adventures. It's the way you laugh at something silly. The late-night conversations. The comfortable silences.",
        "These are the pages I keep turning back to — the ones I never want to end.",
      ],
      moments: [
        { icon: "☕", text: "Morning coffees together" },
        { icon: "🌙", text: "Late-night talks" },
        { icon: "🎵", text: "Our songs on repeat" },
        { icon: "🌸", text: "Random adventures" },
      ],
    },
    {
      id: "chapter-3",
      label: "Chapter 3",
      title: "Why you",
      reasons: [
        "Your kindness — the real, quiet kind",
        "How you see the best in people (and in me)",
        "Your laugh — I could listen to it forever",
        "The way you make every place feel like home",
        "Because with you, even ordinary feels like magic",
      ],
    },
  ],

  photos: [
    { src: "", alt: "Our first adventure", caption: "Our first adventure" },
    { src: "", alt: "A day I'll never forget", caption: "A day I'll never forget", wide: true },
    { src: "", alt: "Just us", caption: "Just us" },
    { src: "", alt: "My favorite smile", caption: "My favorite smile" },
  ],

  finale: {
    message:
      "Thank you for being you. For every chapter we've written so far, and for all the ones still waiting for us. I love you — today and always.",
  },
};
