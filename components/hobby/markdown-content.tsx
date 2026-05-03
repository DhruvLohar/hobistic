"use client"

import * as React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import Image from "next/image"

import type { SubtopicImage } from "@/hooks/use-guide-detail"

interface MarkdownContentProps {
  content: string
  images: SubtopicImage[]
}

function processContentWithImages(
  content: string,
  images: SubtopicImage[]
): string {
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order)
  let processed = content

  const pattern = /\[IMAGE-(\d+)-HERE\]/g
  processed = processed.replace(pattern, (_match, indexStr) => {
    const idx = parseInt(indexStr, 10) - 1
    const img = sorted[idx]
    if (img) {
      return `<img data-subtopic-image="${idx}" src="${img.url}" alt="Illustration ${idx + 1}" />`
    }
    return ""
  })

  return processed
}

const MarkdownContent = React.memo(function MarkdownContent({
  content,
  images,
}: MarkdownContentProps) {
  const processedContent = React.useMemo(
    () => processContentWithImages(content, images),
    [content, images]
  )

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        img: ({ src, alt }) => {
          if (!src || typeof src !== "string") return null
          return (
            <span className="my-6 block overflow-hidden rounded-xl">
              <Image
                src={src}
                alt={alt ?? "Guide image"}
                width={800}
                height={450}
                className="h-auto w-full rounded-xl object-cover"
                unoptimized
              />
            </span>
          )
        },
        h1: ({ children }) => (
          <h1 className="mb-4 mt-8 font-heading text-2xl font-bold text-foreground">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-3 mt-6 font-heading text-xl font-semibold text-foreground">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-2 mt-5 font-heading text-lg font-semibold text-foreground">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="mb-4 text-base leading-[1.8] text-foreground/85">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="mb-4 ml-1 list-inside list-disc space-y-1.5 text-foreground/85">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-4 ml-1 list-inside list-decimal space-y-1.5 text-foreground/85">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="text-base leading-relaxed">{children}</li>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-4 border-l-3 border-primary/40 pl-4 italic text-muted-foreground">
            {children}
          </blockquote>
        ),
        code: ({ children, className }) => {
          const isInline = !className
          if (isInline) {
            return (
              <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm text-primary">
                {children}
              </code>
            )
          }
          return (
            <code className="block overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">
              {children}
            </code>
          )
        },
      }}
    >
      {processedContent}
    </ReactMarkdown>
  )
})

export default MarkdownContent
