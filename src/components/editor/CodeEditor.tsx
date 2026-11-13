import React, { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { RotateCcw, Copy, Check, Terminal } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  onReset: () => void;
  language?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  onReset,
  language = 'python',
}) => {
  const [copied, setCopied] = React.useState(false);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Force remeasurement of fonts to prevent cursor drift
    monaco.editor.remeasureFonts();

    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        monaco.editor.remeasureFonts();
        editor.layout();
      });
    }

    // Safety checks at intervals to ensure zero cursor offset
    const t1 = setTimeout(() => {
      monaco.editor.remeasureFonts();
      editor.layout();
    }, 150);

    const t2 = setTimeout(() => {
      monaco.editor.remeasureFonts();
      editor.layout();
    }, 600);

    const t3 = setTimeout(() => {
      monaco.editor.remeasureFonts();
      editor.layout();
    }, 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-b border-slate-800">
      {/* Editor Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-slate-200">Python 3</span>
          <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
            CPython 3.14 + NumPy + NetworkX + PyTorch
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2 py-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={onReset}
            className="flex items-center space-x-1 px-2 py-1 rounded text-slate-400 hover:text-rose-300 hover:bg-slate-800 transition-colors"
            title="Reset code to starter template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Monaco Code Editor */}
      <div className="flex-1 w-full min-h-[280px]">
        <Editor
          height="100%"
          language={language}
          value={code}
          theme="vs-dark"
          onMount={handleEditorMount}
          onChange={val => onChange(val || '')}
          options={{
            fontSize: 14,
            lineHeight: 22,
            fontFamily: "'JetBrains Mono', Consolas, 'Courier New', monospace",
            fontLigatures: false, // Critical: prevent dynamic character width distortion
            letterSpacing: 0,
            cursorStyle: 'line',
            cursorWidth: 2,
            cursorBlinking: 'smooth',
            cursorSurroundingLines: 2,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            lineNumbers: 'on',
            folding: true,
            renderLineHighlight: 'all',
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    </div>
  );
};
