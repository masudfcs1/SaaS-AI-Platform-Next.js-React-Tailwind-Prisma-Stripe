"use client";

import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { CopyButton } from "@/components/chat/copy-button";

const components: Components = {
  p: ({ children }) => <p className="my-4 first:mt-0 last:mb-0">{children}</p>,
  h1: ({ children }) => <h1 className="mb-3 mt-7 text-xl font-semibold tracking-tight text-foreground first:mt-0 sm:text-2xl">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-3 mt-6 text-lg font-semibold tracking-tight text-foreground first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-2 mt-5 text-base font-semibold text-foreground first:mt-0">{children}</h3>,
  h4: ({ children }) => <h4 className="mb-2 mt-4 font-semibold text-foreground first:mt-0">{children}</h4>,
  h5: ({ children }) => <h5 className="mb-2 mt-4 font-semibold text-foreground first:mt-0">{children}</h5>,
  h6: ({ children }) => <h6 className="mb-2 mt-4 font-semibold text-foreground first:mt-0">{children}</h6>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  ul: ({ children }) => <ul className="my-4 list-disc space-y-2 pl-6 marker:text-muted-foreground first:mt-0 last:mb-0 [&>li>p]:my-1">{children}</ul>,
  ol: ({ children, start }) => <ol start={start} className="my-4 list-decimal space-y-2 pl-6 marker:font-medium marker:text-muted-foreground first:mt-0 last:mb-0 [&>li>p]:my-1">{children}</ol>,
  li: ({ children }) => <li className="pl-1 [&:has(>input)]:list-none">{children}</li>,
  blockquote: ({ children }) => <blockquote className="my-5 border-l-2 border-primary/30 pl-4 text-muted-foreground">{children}</blockquote>,
  a: ({ children, href, title }) => (
    <a href={href} title={title} target="_blank" rel="noopener noreferrer" className="rounded-sm font-medium text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {children}
    </a>
  ),
  code: ({ children }) => <code className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-primary">{children}</code>,
  pre: ({ children, node }) => {
    const code = node?.children.find((child) => child.type === "element" && child.tagName === "code");
    if (!code || code.type !== "element") {
      return <pre className="my-5 overflow-x-auto rounded-xl bg-slate-950 p-4 font-mono text-sm text-slate-100">{children}</pre>;
    }

    const language = /language-([\w#+.-]+)/.exec(String(code.properties.className ?? ""))?.[1] ?? "code";
    const text = code.children.map((child) => child.type === "text" ? child.value : "").join("").replace(/\n$/, "");

    return (
      <div className="my-5 min-w-0 max-w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950 first:mt-0 last:mb-0">
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-900 px-4 py-2">
          <span className="truncate font-mono text-xs text-slate-400">{language}</span>
          <CopyButton text={text} label="Copy code" className="shrink-0 text-slate-300 ring-offset-slate-900 hover:bg-slate-800 hover:text-white" />
        </div>
        <pre tabIndex={0} aria-label={`${language} code`} className="overflow-x-auto whitespace-pre p-4 font-mono text-[13px] leading-6 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:p-5">
          <code className="break-normal">{text}</code>
        </pre>
      </div>
    );
  },
  table: ({ children }) => (
    <div role="region" aria-label="Response table" tabIndex={0} className="my-5 max-w-full overflow-x-auto rounded-xl border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted text-foreground">{children}</thead>,
  tr: ({ children }) => <tr className="border-b border-border last:border-0">{children}</tr>,
  th: ({ children, style }) => <th style={style} className="whitespace-nowrap px-4 py-3 font-semibold">{children}</th>,
  td: ({ children, style }) => <td style={style} className="min-w-[120px] px-4 py-3 align-top">{children}</td>,
  hr: () => <hr className="my-6 border-border" />,
  input: ({ checked }) => <input type="checkbox" checked={checked} disabled className="mr-2 accent-primary" />,
  img: ({ src, alt }) => <a href={typeof src === "string" ? src : undefined} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-4">{alt || "View image"}</a>,
};

export function MessageContent({ content }: { content: string }) {
  return (
    <div className="min-w-0 max-w-full break-words text-sm leading-7 text-foreground/90 sm:text-[15px]">
      <Markdown remarkPlugins={[remarkGfm]} components={components} skipHtml>
        {content}
      </Markdown>
    </div>
  );
}
