import { Code2, ImageIcon, MessageSquare, Mic2, Video, type LucideIcon } from "lucide-react";

export type ChatMode = "conversation" | "code" | "image" | "audio" | "video";

interface ChatTool {
  label: string;
  shortLabel: string;
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  placeholder: string;
  accent: string;
  available: boolean;
  suggestions: { title: string; prompt: string }[];
}

export const chatTools: Record<ChatMode, ChatTool> = {
  conversation: {
    label: "Conversation", shortLabel: "Chat", href: "/conversation", icon: MessageSquare,
    title: "What can I help you with?",
    description: "A little curiosity can go a long way. Ask a question, explore an idea, or make something new.",
    placeholder: "Ask Dune anything…", accent: "text-violet-600 dark:text-violet-400", available: true,
    suggestions: [
      { title: "Make a plan", prompt: "Help me turn a big goal into a realistic weekly plan. Ask me what I want to achieve first." },
      { title: "Find the right words", prompt: "Help me write a clear, thoughtful message. Ask me who it is for and what I want to say." },
      { title: "Learn something new", prompt: "Explain a complex topic with a simple analogy. Start by asking what I would like to learn." },
      { title: "Explore an idea", prompt: "Be my brainstorming partner. Ask me about my idea, then help me find three interesting directions." },
    ],
  },
  code: {
    label: "Code assistant", shortLabel: "Code", href: "/code", icon: Code2,
    title: "Let’s build something great.",
    description: "Go from an idea to working code. Build a component, untangle a bug, or understand how it all works.",
    placeholder: "Describe what you want to build, or paste your code…", accent: "text-emerald-600 dark:text-emerald-400", available: true,
    suggestions: [
      { title: "Build a component", prompt: "Build an accessible React toggle component with TypeScript and Tailwind CSS." },
      { title: "Debug my code", prompt: "Help me debug my code. Ask me for the code, the error, and the expected behavior first." },
      { title: "Explain a pattern", prompt: "Show me a practical example of debouncing a search input in React, with comments explaining each step." },
      { title: "Improve performance", prompt: "Help me improve the performance of a React component. Ask me to share the component first." },
    ],
  },
  image: {
    label: "Image studio", shortLabel: "Images", href: "/image", icon: ImageIcon,
    title: "A new canvas for your ideas.",
    description: "Create an image from a description. Explore a visual direction, then download the result.",
    placeholder: "Describe your image, its style, and the mood…", accent: "text-pink-600 dark:text-pink-400", available: true,
    suggestions: [
      { title: "Product concept", prompt: "A studio product photograph of a sculptural ceramic table lamp on a warm beige background. Soft side lighting, natural shadows, minimal composition, editorial design photography." },
      { title: "Editorial illustration", prompt: "An editorial illustration of a tiny reading nook inside a large leafy plant. Warm colors, textured paper, playful shapes, thoughtful composition, no text." },
      { title: "Quiet landscape", prompt: "A peaceful mountain lake at sunrise with soft mist, pale peach skies, and a small wooden cabin reflected in still water. Cinematic landscape photography, natural colors." },
      { title: "Brand moodboard", prompt: "A visual moodboard for a modern botanical skincare brand: sage green, cream, amber glass, natural linen, soft sunlight, and botanical leaves. Clean editorial layout, no text." },
    ],
  },
  audio: {
    label: "Audio studio", shortLabel: "Audio", href: "/audio", icon: Mic2,
    title: "Your words, spoken.",
    description: "Turn written scripts into spoken audio. Choose a voice and listen to a narration you can download.",
    placeholder: "Paste the words you want spoken…", accent: "text-teal-600 dark:text-teal-400", available: true,
    suggestions: [
      { title: "Welcome message", prompt: "Welcome to a space for your next idea. Take a moment to explore, get curious, and make something that feels like you." },
      { title: "Product introduction", prompt: "Meet your new everyday notebook. Thoughtfully designed, beautifully simple, and ready for everything from your first morning thought to your next big plan." },
      { title: "A mindful pause", prompt: "Take a slow breath in. Let your shoulders soften as you breathe out. For this moment, there is nothing you need to finish. Just notice where you are." },
      { title: "Story opening", prompt: "The little bookshop at the end of the street had one unusual rule: every visitor had to leave a story behind. On a rainy Tuesday, someone arrived with an empty notebook." },
    ],
  },
  video: {
    label: "Video studio", shortLabel: "Video", href: "/video", icon: Video,
    title: "Every story starts with an idea.",
    description: "Video generation is currently unavailable. Use Chat to develop a script, shot list, or storyboard.",
    placeholder: "Describe a scene, its movement, and visual style…", accent: "text-amber-600 dark:text-amber-400", available: false,
    suggestions: [],
  },
};

export const chatModes = Object.keys(chatTools) as ChatMode[];
