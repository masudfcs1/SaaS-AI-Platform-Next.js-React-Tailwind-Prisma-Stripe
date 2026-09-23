import { Code2, ImageIcon, MessageSquare, Music2, Video, type LucideIcon } from "lucide-react";

export type ChatMode = "conversation" | "code" | "image" | "music" | "video";

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
    placeholder: "Ask Dune anything…", accent: "text-violet-500", available: true,
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
    placeholder: "Describe what you want to build, or paste your code…", accent: "text-emerald-500", available: true,
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
    description: "Image generation is coming soon. For now, use Chat to turn your visual idea into a detailed creative brief.",
    placeholder: "Describe your image, its style, and the mood…", accent: "text-pink-500", available: false,
    suggestions: [],
  },
  music: {
    label: "Music studio", shortLabel: "Music", href: "/music", icon: Music2,
    title: "Find the sound of your idea.",
    description: "Music generation is coming soon. Chat can help you explore lyrics, a musical direction, or a production brief.",
    placeholder: "Describe the mood, instruments, and style…", accent: "text-teal-500", available: false,
    suggestions: [],
  },
  video: {
    label: "Video studio", shortLabel: "Video", href: "/video", icon: Video,
    title: "Every story starts with an idea.",
    description: "Video generation is coming soon. Use Chat to develop a script, shot list, or storyboard in the meantime.",
    placeholder: "Describe a scene, its movement, and visual style…", accent: "text-amber-500", available: false,
    suggestions: [],
  },
};

export const chatModes = Object.keys(chatTools) as ChatMode[];
