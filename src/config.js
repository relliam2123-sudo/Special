// ============================================================
//  EDIT EVERYTHING YOU NEED RIGHT HERE. Nothing else to touch.
// ============================================================
export const CONFIG = {
    herName: "Ms Future R",
    introLine: "I made something for you",
    heroLine: "Take your time. Scroll slowly.",

    // Dates removed. To bring a countdown back, set meetDate like "2027-03-01T09:00:00".
    meetDate: "",
    meetDateLabel: "",

    // Distance section (the dotted map between the two pins)
    miles: "490 miles",
    placeFrom: "Manila",
    placeTo: "Mindanao",
    distanceText:
        "490 miles from Manila to Mindanao. Every one of them is a reason I want to close the gap, and every mile makes the day I reach you worth more.",
    arrivedText: "Today is the day. I'm coming to you.",

    // MUSIC: song file lives at public/assets/song.mp3. Set music to "" for no music.
    music: "./assets/song.mp3",
    musicVolume: 0.35, // VOLUME: 0 = silent, 0.5 = half, 1 = full. Change this number only.

    // icon: "game" | "phone" | "heart" | "pin".  "when" can be a real date, e.g. "March 2024".
    story: [
        { icon: "game", when: "Where it began", title: "How we met", text: "Two players, one lobby. Between Valorant clutches and Project Zomboid nights, you became my favorite person to play with." },
        { icon: "phone", when: "The first call", title: "Our first call", text: "Hours felt like minutes. I didn't want to hang up, and you didn't either." },
        { icon: "heart", when: "The first \"I miss you\"", title: "Our first \"I miss you\"", text: "Saying it out loud made the distance real, and made you realer. That was the night I knew." },
        { icon: "pin", when: "Right now", title: "Choosing us", text: "Miles apart, still choosing each other every single day. This is me asking to make it official." },
    ],

    reasons: [
        "The way you laugh mid-sentence on our late-night calls.",
        "You sing along to OPM like nobody is listening, and I'd listen all night forever and ever.",
        "You make me feel love.",
        "You listen like I'm the only thing in the world.",
        "You're kind when nobody is watching sometimes.....",
        "You make the distance feel brave instead of sad.",
    ],

    letter:
        "My love,\n\nIt started with a game and turned into the best part of every day. Even with all these miles between us, you're the first person I want to tell everything to, and the last voice I want to hear at night.\n\nSo I made you this, because you deserve more than a message.\n\nAlways yours.",

    vows: [
        "I will call you on the good days and the tired ones.",
        "I will be honest, even when it's hard to say.",
        "I will keep every promise I make through a screen, and mean each one [Food].",
        "I will hold your hand in real life the moment we meet, and not let go for a while.",
    ],

    question: {
        message: "I can't give you a candlelit table tonight, only this screen and everything I feel. So here it is, plainly and from the heart.",
        ask: "Will you be mine, officially?",
        yes: "Yes",
        no: "No",
    },

    // SEND MY ANSWER button: fill ONE of these (leave "" to skip).
    // Formspree: make a free form at formspree.io, paste its URL here, e.g. "https://formspree.io/f/abcdwxyz"
    answerEndpoint: "",
    // Or an email address: her phone opens a ready-made email to you.
    answerEmail: "",
    sentText: "Sent. I got it ♥",

    // Live time + weather cards (free Open-Meteo, no key). Change lat/lon to her city.
    // The Mindanao coordinates below are Davao City as a placeholder.
    togetherLine: "Same sky, same moment.",
    places: [
        { name: "Pateros", lat: 14.5446, lon: 121.0686, tz: "Asia/Manila" },
        { name: "Mindanao", lat: 7.1907, lon: 125.4553, tz: "Asia/Manila" },
    ],

    celebrationTitle: "She said yes.",
    closing: "Even miles apart, you're my person. I can't wait to hold your hand in real life.",

    shareButton: "Send me your answer",
    shareText: "Yes. Officially yours. ♥ Count me in, until we're together and beyond.",
    copiedText: "Copied. Paste it into our chat.",
};