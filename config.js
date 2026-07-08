// ═══════════════════════════════════════════════════════════════
//  Personalize your story here — edit these values and refresh!
// ═══════════════════════════════════════════════════════════════

const STORY_CONFIG = {
  herName: "Lívia Stein",
  yourName: "Your Name",
  birthdayDate: "July 7", // optional, for display only

  // Photo used to "fill" the giant hero name. Leave "" for a gradient.
  // Tip: a bright, high-contrast photo works best. e.g. "photos/her.jpg"
  heroNameImage: "",

  // Emojis that float up the screen. Swap in her favorites!
  floaties: ["🎉", "🎂", "✨", "🩵", "🥳", "⭐", "🎈", "💫", "🩷"],

  // Spotify embed — folklore album (legal streaming, no file needed).
  spotify: {
    albumId: "1pzvBxYgT6OVwJLtHkrdQK",
    title: "folklore — Taylor Swift",
  },

  chapters: [
    {
      id: "chapter-1",
      label: "01",
      title: "the main character",
      paragraphs: [
        "ok but the world really said \"let's make this better\" the day you showed up. warm, funny, lowkey chaotic, endlessly kind — the whole package fr.",
        "you walk in and the vibe just shifts. everyone clocks it. i clock it every single day. no notes, just you.",
      ],
      quote: "you're literally the moment. always have been.",
    },
    {
      id: "chapter-2",
      label: "02",
      title: "the little things that make you iconic",
      paragraphs: [
        "it's the laugh. it's how you notice the people everyone else scrolls past. the random 2am ideas, the big dreams, the way you care with your whole chest.",
        "these are the details i hope you never lose — the ones that are so you it's kind of unreal.",
      ],
      moments: [
        { icon: "😭", text: "that unhinged laugh" },
        { icon: "🧠", text: "the 2am ideas" },
        { icon: "🎨", text: "everything you make" },
        { icon: "🫶", text: "how hard you love" },
      ],
    },
    {
      id: "chapter-3",
      label: "03",
      title: "reasons you're that girl",
      reasons: [
        "your kindness — the real, no-clout-needed kind",
        "the way you chase what you love, zero apologies",
        "your laugh (genuinely my roman empire)",
        "how brave you are even when it's scary",
        "the main character energy in every single room",
      ],
    },
  ],

  photos: [
    { src: "public/1.jpeg", alt: "espontânea", caption: "espontânea ☕️" },
    { src: "public/2.jpeg", alt: "radical", caption: "radical" },
    { src: "public/3.jpeg", alt: "babilônica", caption: "babilônica 💅🏻" },
  ],

  finale: {
    message:
      "today's all about you — every iconic, one-of-one part of you. thank you for being exactly who you are. praying this year is as obsessed with you as i am. 🎉",
  },
};
