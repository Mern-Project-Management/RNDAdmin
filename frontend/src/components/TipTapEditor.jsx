import React, { useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
  Heading1, Heading2, Heading3, List, ListOrdered, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Link as LinkIcon, Image as ImageIcon, Unlink, Table as TableIcon
} from 'lucide-react';
import { Button } from './ui/button';

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt('URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50 rounded-t-md">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`text-gray-700 hover:text-gray-900 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
      >
        <Bold className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`text-gray-700 hover:text-gray-900 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
      >
        <Italic className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`text-gray-700 hover:text-gray-900 ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
      >
        <UnderlineIcon className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`text-gray-700 hover:text-gray-900 ${editor.isActive('strike') ? 'bg-gray-200' : ''}`}
      >
        <Strikethrough className="w-4 h-4" />
      </Button>
      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`text-gray-700 hover:text-gray-900 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 font-bold' : 'font-bold'}`}
      >
        H1
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`text-gray-700 hover:text-gray-900 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 font-bold' : 'font-bold'}`}
      >
        H2
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`text-gray-700 hover:text-gray-900 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 font-bold' : 'font-bold'}`}
      >
        H3
      </Button>
      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`text-gray-700 hover:text-gray-900 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
      >
        <List className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`text-gray-700 hover:text-gray-900 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
      >
        <ListOrdered className="w-4 h-4" />
      </Button>
      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`text-gray-700 hover:text-gray-900 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
      >
        <AlignLeft className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`text-gray-700 hover:text-gray-900 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
      >
        <AlignCenter className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`text-gray-700 hover:text-gray-900 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
      >
        <AlignRight className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        className={`text-gray-700 hover:text-gray-900 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200' : ''}`}
      >
        <AlignJustify className="w-4 h-4" />
      </Button>
      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={setLink}
        className={`text-gray-700 hover:text-gray-900 ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
      >
        <LinkIcon className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().unsetLink().run()}
        disabled={!editor.isActive('link')}
        className="text-gray-700 hover:text-gray-900 disabled:opacity-30"
      >
        <Unlink className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={addImage}
        className="text-gray-700 hover:text-gray-900"
      >
        <ImageIcon className="w-4 h-4" />
      </Button>
      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        className="text-gray-700 hover:text-gray-900"
        title="Insert Table"
      >
        <TableIcon className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().addColumnAfter().run()}
        disabled={!editor.can().addColumnAfter()}
        className="text-gray-700 hover:text-gray-900 text-xs font-bold"
        title="Add Column"
      >
        Col+
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().deleteColumn().run()}
        disabled={!editor.can().deleteColumn()}
        className="text-gray-700 hover:text-gray-900 text-xs font-bold"
        title="Delete Column"
      >
        Col-
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().addRowAfter().run()}
        disabled={!editor.can().addRowAfter()}
        className="text-gray-700 hover:text-gray-900 text-xs font-bold"
        title="Add Row"
      >
        Row+
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().deleteRow().run()}
        disabled={!editor.can().deleteRow()}
        className="text-gray-700 hover:text-gray-900 text-xs font-bold"
        title="Delete Row"
      >
        Row-
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().deleteTable().run()}
        disabled={!editor.can().deleteTable()}
        className="text-red-500 hover:text-red-700 text-xs font-bold"
        title="Delete Table"
      >
        Del Tbl
      </Button>
    </div>
  );
};

const TipTapEditor = ({ value, onChange, placeholder, className = "h-[500px]" }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Image,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[300px] p-4 bg-white tiptap-table-styles',
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
  });

  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      // Set content if editor is empty or value was updated externally (e.g. from DB load or form reset)
      if (editor.isEmpty || (value === '' && !editor.isEmpty)) {
        editor.commands.setContent(value || '');
      } else if (Math.abs((value || '').length - editor.getHTML().length) > 10) {
        // If content is significantly different, force update
        editor.commands.setContent(value || '');
      }
    }
  }, [value, editor]);

  return (
    <div className={`border rounded-md shadow-sm overflow-hidden flex flex-col w-full ${className}`}>
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-y-auto bg-white border-t">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TipTapEditor;
