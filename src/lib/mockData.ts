import message from "@/assets/content-message.jpg";
import music from "@/assets/content-music.jpg";
import podcast from "@/assets/content-podcast.jpg";
import movie from "@/assets/content-movie.jpg";
import devotional from "@/assets/content-devotional.jpg";
import event from "@/assets/content-event.jpg";
import skit from "@/assets/content-skit.jpg";

export type ContentType =
  | "message" | "music" | "podcast" | "devotional"
  | "movie" | "skit" | "podcast-video" | "music-video" | "event";

export interface ContentItem {
  id: string;
  title: string;
  creator: string;
  creatorId: string;
  type: ContentType;
  medium: "audio" | "video" | "live";
  duration: string;
  description: string;
  image: string;
  tag?: string;
  date?: string;
}

export const images = { message, music, podcast, movie, devotional, event, skit };

export const creators = [
  { id: "c1", name: "Pastor David Adeleke", category: "Teaching Ministry", verified: true, followers: "248K", plays: "12.4M", image: message },
  { id: "c2", name: "Sounds of Heaven", category: "Worship Collective", verified: true, followers: "612K", plays: "48.1M", image: music },
  { id: "c3", name: "Kingdom Conversations", category: "Podcast", verified: true, followers: "94K", plays: "3.2M", image: podcast },
  { id: "c4", name: "Lightwave Films", category: "Christian Film Studio", verified: true, followers: "186K", plays: "7.8M", image: movie },
  { id: "c5", name: "Grace Iweka", category: "Devotional Author", verified: false, followers: "32K", plays: "980K", image: devotional },
  { id: "c6", name: "Light Bearers Co.", category: "Skit Creator", verified: false, followers: "58K", plays: "2.1M", image: skit },
];

export const content: ContentItem[] = [
  { id: "1", title: "Encountering Truth", creator: "Pastor David Adeleke", creatorId: "c1", type: "message", medium: "audio", duration: "42 min", description: "A grounding teaching on the unshakable truth of God's word in a noisy world.", image: message, tag: "New" },
  { id: "2", title: "Morning Light Devotional", creator: "Grace Iweka", creatorId: "c5", type: "devotional", medium: "audio", duration: "8 min", description: "Daily 8-minute devotionals to anchor your morning in scripture and prayer.", image: devotional, tag: "Daily" },
  { id: "3", title: "Sounds of Worship Vol. 1", creator: "Sounds of Heaven", creatorId: "c2", type: "music", medium: "audio", duration: "1h 12 min", description: "A live worship album recorded across three continents.", image: music, tag: "Trending" },
  { id: "4", title: "Kingdom Conversations", creator: "Kingdom Conversations", creatorId: "c3", type: "podcast", medium: "audio", duration: "56 min", description: "Honest dialogues on faith, culture, and calling.", image: podcast },
  { id: "5", title: "The Narrow Way", creator: "Lightwave Films", creatorId: "c4", type: "movie", medium: "video", duration: "1h 48 min", description: "A young man's journey of surrender across a fractured city.", image: movie, tag: "Featured" },
  { id: "6", title: "Grace in the Marketplace", creator: "Kingdom Conversations", creatorId: "c3", type: "podcast-video", medium: "video", duration: "1h 02 min", description: "How faith shapes leadership in business and beyond.", image: podcast },
  { id: "7", title: "Light Bearers", creator: "Light Bearers Co.", creatorId: "c6", type: "skit", medium: "video", duration: "12 min", description: "A short series exploring everyday faith moments.", image: skit },
  { id: "8", title: "Anchored — Live Sessions", creator: "Sounds of Heaven", creatorId: "c2", type: "music-video", medium: "video", duration: "28 min", description: "Intimate live worship from the studio.", image: music },
  { id: "9", title: "Light for Today: Encountering Truth", creator: "Pastor David Adeleke", creatorId: "c1", type: "message", medium: "video", duration: "38 min", description: "This week's signature teaching, exclusive on Nora.", image: message, tag: "Editor's Pick" },
  { id: "10", title: "Stillness Before Dawn", creator: "Grace Iweka", creatorId: "c5", type: "devotional", medium: "audio", duration: "6 min", description: "A guided reflection for quiet mornings.", image: devotional },
];

export const liveEvents = [
  { id: "e1", title: "Worship Night Lagos", host: "Sounds of Heaven", date: "Jun 14, 2026", time: "7:00 PM WAT", access: "Free" as const, status: "upcoming" as const, image: event },
  { id: "e2", title: "Kingdom Leadership Conference", host: "Pastor David Adeleke", date: "Jun 22, 2026", time: "9:00 AM GMT", access: "Paid" as const, status: "upcoming" as const, image: event },
  { id: "e3", title: "Youth Revival — Nairobi", host: "Generation Rising", date: "Live Now", time: "Streaming", access: "Free" as const, status: "live" as const, image: message },
  { id: "e4", title: "The Narrow Way — Premiere", host: "Lightwave Films", date: "Jul 04, 2026", time: "8:00 PM EST", access: "Paid" as const, status: "upcoming" as const, image: movie },
  { id: "e5", title: "Global Prayer Vigil", host: "Nora Collective", date: "May 28, 2026", time: "Replay", access: "Free" as const, status: "replay" as const, image: devotional },
  { id: "e6", title: "Hymns Reimagined", host: "Sounds of Heaven", date: "May 12, 2026", time: "Replay", access: "Free" as const, status: "replay" as const, image: music },
];

export const getContentById = (id: string) => content.find(c => c.id === id);
export const getCreatorById = (id: string) => creators.find(c => c.id === id);
export const contentByCreator = (id: string) => content.filter(c => c.creatorId === id);
