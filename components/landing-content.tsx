"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageSquare,
  ImageIcon,
  VideoIcon,
  Music,
  Code,
  Star,
  Zap,
  Shield,
  Clock,
} from "lucide-react";

const tools = [
  {
    label: "Conversation",
    icon: MessageSquare,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    description: "Chat with the smartest AI assistant to solve complex problems and answer questions.",
  },
  {
    label: "Image Generation",
    icon: ImageIcon,
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    description: "Turn your imagination into high-resolution visuals and art in seconds.",
  },
  {
    label: "Video Generation",
    icon: VideoIcon,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    description: "Generate captivating video clips and animations from simple text prompts.",
  },
  {
    label: "Music Generation",
    icon: Music,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    description: "Compose custom background tracks, beats, and melodies on the fly.",
  },
  {
    label: "Code Generation",
    icon: Code,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    description: "Generate clean, production-ready code in multiple languages instantly.",
  },
  {
    label: "Supercharged Speed",
    icon: Zap,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    description: "Low-latency responses powered by cutting-edge cloud infrastructure.",
  },
];

const testimonials = [
  {
    name: "Alex Rivera",
    avatar: "AR",
    title: "Senior Software Engineer",
    description: "This is hands down the best all-in-one AI platform. The code generation tool saved me hours every week.",
  },
  {
    name: "Sarah Chen",
    avatar: "SC",
    title: "Creative Director",
    description: "The image and video generation features are mind-blowing. The fidelity and quality are unmatched.",
  },
  {
    name: "David Kim",
    avatar: "DK",
    title: "Startup Founder",
    description: "Dune AI replaced 4 different AI subscriptions for my team. Simple, fast, and remarkably affordable.",
  },
  {
    name: "Elena Rostova",
    avatar: "ER",
    title: "Content Strategist",
    description: "I use the conversation tool every single day for ideation and drafting. Essential tool for modern workflows.",
  },
];

export const LandingContent = () => {
  return (
    <div className="px-6 sm:px-10 pb-20 max-w-7xl mx-auto space-y-28">
      {/* Tools Section */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Explore Powerful AI Tools
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto">
            Everything you need to create, brainstorm, and build with intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Card
              key={tool.label}
              className="bg-white/[0.04] border-white/10 text-white hover:bg-white/[0.07] hover:border-white/20 transition duration-300 backdrop-blur-sm"
            >
              <CardHeader className="flex flex-row items-center gap-x-4 pb-2">
                <div className={`p-3 w-fit rounded-xl ${tool.bgColor}`}>
                  <tool.icon className={`w-6 h-6 ${tool.color}`} />
                </div>
                <CardTitle className="text-xl font-semibold">{tool.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-400 text-sm leading-relaxed">{tool.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Loved by Thousands of Creators
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base">
            See what professionals are saying about Dune AI.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((item) => (
            <Card
              key={item.name}
              className="bg-[#192339] border-none text-white hover:scale-[1.02] transition duration-300"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="flex items-center gap-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-sm text-white shadow-md">
                    {item.avatar}
                  </div>
                  <div>
                    <p className="text-base font-semibold leading-none">{item.name}</p>
                    <p className="text-zinc-400 text-xs mt-1">{item.title}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-zinc-300 text-sm leading-relaxed italic">
                  &ldquo;{item.description}&rdquo;
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-pink-900/40 border border-white/10 p-8 sm:p-12 text-center space-y-4 backdrop-blur-md">
        <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
          Ready to supercharge your creativity?
        </h3>
        <p className="text-zinc-300 text-sm sm:text-base max-w-xl mx-auto">
          Join thousands of developers, designers, and creators who use Dune AI daily.
        </p>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
        <p>© {new Date().getFullYear()} Dune AI. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <span className="hover:text-zinc-400 cursor-pointer transition">Privacy Policy</span>
          <span className="hover:text-zinc-400 cursor-pointer transition">Terms of Service</span>
          <span className="hover:text-zinc-400 cursor-pointer transition">Support</span>
        </div>
      </footer>
    </div>
  );
};
