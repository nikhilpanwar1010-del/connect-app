/**
 * PROPOSAL EXPERIENCE CONFIGURATION
 * 
 * Personalize this file with your partner's name, your personal love message,
 * questions, and playful runaway button text!
 */

export interface ProposalConfig {
  recipientName: string;
  senderName: string;
  introLines: string[];
  questionText: string;
  yesButtonText: string;
  noButtonText: string;
  runawayResponses: string[];
  celebrationTitle: string;
  celebrationSubtitle: string;
  celebrationButtonText: string;
  romanticQuotes: string[];
  backgroundMusicUrl?: string; // Optional audio file or uses built-in Web Audio chime lullaby
  anniversaryDate: string; // YYYY-MM-DD
}

export const proposalConfig: ProposalConfig = {
  // Her name and your name
  recipientName: "My Sweetheart",
  senderName: "Yours Forever",

  // The 3 typewriter lines shown before the question
  introLines: [
    "Hey My Sweetheart 💕",
    "I made something just for you...",
    "From late-night talks to everyday smiles, every moment with you is magic ✨"
  ],

  // The big romantic question in Dancing Script
  questionText: "Will you be mine? 💖",

  // The pulsing YES button text
  yesButtonText: "YES 💗",

  // The runaway playful NO button text
  noButtonText: "No 🥺",

  // Playful evasion responses when she attempts to click or hover "No"
  runawayResponses: [
    "Are you sure? 🥺",
    "Think again 💔",
    "Pretty please with sprinkles? 🌹",
    "There's only one right answer! 🥰",
    "Nice try, you can't click me! 😜",
    "Look how big the YES button is! 💖",
    "My heart says you mean YES! 💞",
    "Error 404: 'No' not found in my dictionary! 💌"
  ],

  // Celebration screen content when she taps YES
  celebrationTitle: "You just made me the happiest person alive 💞",
  celebrationSubtitle: "I promise to cherish, adore, and make you smile every single day.",
  celebrationButtonText: "Let's start our story 💌",

  // Daily love notes & romantic quotes shown in the chat header card
  romanticQuotes: [
    "In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine.",
    "Whatever our souls are made of, yours and mine are the same.",
    "I saw that you were perfect, and so I loved you. Then I saw that you were not perfect and I loved you even more.",
    "If I had a flower for every time I thought of you... I could walk through my garden forever.",
    "You are my today and all of my tomorrows. 💕",
    "Every love story is beautiful, but ours is my absolute favorite. ✨",
    "Just hearing your voice or seeing your text turns my entire day into sunshine. ☀️",
    "I fell in love with the way you touch my soul without even trying."
  ],

  // Relationship anniversary / start date for the Days Together counter (Format: YYYY-MM-DD)
  anniversaryDate: "2024-02-14"
};
