"use client"

import { useRef, useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import TiptapImage from "@tiptap/extension-image"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  ImageIcon,
  Upload,
  Link2,
  Loader2,
  X,
} from "lucide-react"

type ToolbarButtonProps = {
  onClick: () => void
  isActive?: boolean
  title: string
  children: React.ReactNode
}

function ToolbarButton({ onClick, isActive, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        onClick()
      }}
      title={title}
      className={`flex h-7 w-7 items-center justify-center rounded text-sm transition ${
        isActive
          ? "bg-[#B87333]/[0.18] text-[#B87333]"
          : "text-slate-500 hover:bg-white/[0.08] hover:text-slate-200"
      }`}
    >
      {children}
    </button>
  )
}

type ImagePopoverProps = {
  onInsert: (url: string) => void
  onClose: () => void
}

function ImagePopover({ onInsert, onClose }: ImagePopoverProps) {
  const [url, setUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      if (!res.ok) throw new Error("Upload failed")
      const data = (await res.json()) as { url: string }
      onInsert(data.url)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="absolute left-0 top-full z-10 mt-1 w-72 rounded-lg border border-white/[0.10] bg-[#0c1524] p-3 shadow-xl">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400">Insert Image</span>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            onClose()
          }}
          className="rounded p-0.5 text-slate-500 hover:text-slate-200"
        >
          <X size={12} />
        </button>
      </div>

      <div className="flex gap-1.5">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && url.trim()) {
              e.preventDefault()
              onInsert(url.trim())
            }
          }}
          placeholder="Paste image URL…"
          className="min-w-0 flex-1 rounded-lg border border-white/[0.10] bg-white/[0.06] px-2.5 py-1.5 text-xs text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-[#B87333]/40"
        />
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            if (url.trim()) onInsert(url.trim())
          }}
          disabled={!url.trim()}
          className="flex items-center gap-1 rounded-lg bg-[#B87333] px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-[#c8833a] disabled:opacity-40"
        >
          <Link2 size={11} />
          Insert
        </button>
      </div>

      <div className="my-2 flex items-center gap-2">
        <div className="h-px flex-1 bg-white/[0.08]" />
        <span className="text-[10px] text-slate-600">or</span>
        <div className="h-px flex-1 bg-white/[0.08]" />
      </div>

      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          fileRef.current?.click()
        }}
        disabled={uploading}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/[0.10] bg-white/[0.04] py-1.5 text-xs font-medium text-slate-400 transition hover:bg-white/[0.08] hover:text-slate-200 disabled:opacity-50"
      >
        {uploading ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <Upload size={12} />
        )}
        {uploading ? "Uploading…" : "Upload from device"}
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) uploadFile(file)
          e.target.value = ""
        }}
      />
    </div>
  )
}

type Props = {
  name: string
  defaultValue?: string | null
  placeholder?: string
}

export function RichTextEditor({ name, defaultValue = "", placeholder }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [imgPopoverOpen, setImgPopoverOpen] = useState(false)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: placeholder ?? "Write something…" }),
      TiptapImage.configure({ inline: false, allowBase64: false }),
    ],
    content: defaultValue ?? "",
    onUpdate({ editor }) {
      if (inputRef.current) {
        inputRef.current.value = editor.getHTML()
      }
    },
  })

  function insertImage(url: string) {
    editor?.chain().focus().setImage({ src: url, alt: "" }).run()
    setImgPopoverOpen(false)
  }

  return (
    <div className="overflow-hidden rounded-lg border border-white/[0.10] bg-white/[0.04] focus-within:border-[#B87333]/40">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 border-b border-white/[0.08] bg-white/[0.03] px-2 py-1.5">
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          isActive={editor?.isActive("bold")}
          title="Bold"
        >
          <Bold size={13} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          isActive={editor?.isActive("italic")}
          title="Italic"
        >
          <Italic size={13} />
        </ToolbarButton>
        <div className="mx-1 h-4 w-px bg-white/[0.10]" />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor?.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={13} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor?.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={13} />
        </ToolbarButton>
        <div className="mx-1 h-4 w-px bg-white/[0.10]" />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          isActive={editor?.isActive("bulletList")}
          title="Bullet list"
        >
          <List size={13} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          isActive={editor?.isActive("orderedList")}
          title="Ordered list"
        >
          <ListOrdered size={13} />
        </ToolbarButton>
        <div className="mx-1 h-4 w-px bg-white/[0.10]" />

        <div className="relative">
          <ToolbarButton
            onClick={() => setImgPopoverOpen((v) => !v)}
            isActive={imgPopoverOpen}
            title="Insert image"
          >
            <ImageIcon size={13} />
          </ToolbarButton>
          {imgPopoverOpen && (
            <ImagePopover
              onInsert={insertImage}
              onClose={() => setImgPopoverOpen(false)}
            />
          )}
        </div>
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="prose prose-sm prose-invert max-w-none px-3 py-2.5 text-sm text-slate-200 [&_.tiptap]:min-h-[120px] [&_.tiptap]:outline-none [&_.tiptap_img]:max-w-full [&_.tiptap_img]:rounded-lg [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none [&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_p.is-editor-empty:first-child::before]:h-0 [&_.tiptap_p.is-editor-empty:first-child::before]:text-slate-600 [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]"
      />

      <input
        ref={inputRef}
        type="hidden"
        name={name}
        defaultValue={defaultValue ?? ""}
      />
    </div>
  )
}
