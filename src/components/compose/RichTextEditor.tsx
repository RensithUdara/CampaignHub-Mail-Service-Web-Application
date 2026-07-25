"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, Link2, List, ListOrdered, Pilcrow, RemoveFormatting, Underline as UnderlineIcon } from "lucide-react";
import { useEffect } from "react";

type Props = {
  content: string;
  onChange: (html: string) => void;
};

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-8 min-w-8 items-center justify-center px-2 text-sm font-semibold transition ${
        active ? "bg-teal-700 text-white" : "text-stone-600 hover:bg-stone-100 hover:text-stone-950"
      }`}
      style={{ borderRadius: 8 }}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-stone-200 bg-stone-50/70 px-2 py-2">
      <ToolbarButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton label="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-stone-200" />
      <ToolbarButton label="Heading" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Pilcrow className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-stone-200" />
      <ToolbarButton
        label="Link"
        active={editor.isActive("link")}
        onClick={() => {
          const previousUrl = editor.getAttributes("link").href as string | undefined;
          const url = window.prompt("URL", previousUrl ?? "https://");
          if (url === null) return;
          if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
          }
          editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }}
      >
        <Link2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton label="Clear formatting" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
        <RemoveFormatting className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}

export default function RichTextEditor({ content, onChange }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Write your message..." }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[320px] px-4 py-4 focus:outline-none prose-headings:text-stone-950 prose-p:text-stone-700 prose-a:text-teal-700",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (content === "" && editor.getHTML() !== "<p></p>") {
      editor.commands.clearContent();
      return;
    }
    if (content && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="overflow-hidden border border-stone-300 bg-white shadow-sm" style={{ borderRadius: 8 }}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
