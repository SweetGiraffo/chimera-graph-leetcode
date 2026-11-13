import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    let text = content;
    const tokens: Record<string, string> = {};
    let tokenCounter = 0;

    const makeToken = (prefix: string) => `%%__${prefix}_${tokenCounter++}__%%`;

    // 1. Preserve fenced code blocks: ```lang ... ```
    text = text.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const token = makeToken('CODEBLOCK');
      tokens[token] = `<pre class="bg-[#0b0f17] border border-slate-800 rounded-md p-3 my-2.5 overflow-x-auto text-xs font-mono text-emerald-300"><code>${escapeHtml(code.trim())}</code></pre>`;
      return token;
    });

    // 2. Preserve inline backtick code: `code`
    text = text.replace(/`([^`]+)`/g, (_, code) => {
      const token = makeToken('INLINECODE');
      tokens[token] = `<code class="bg-[#1e293b] text-indigo-300 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-700/60">${escapeHtml(code)}</code>`;
      return token;
    });

    // 3. Render display math: $$...$$
    text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
      const token = makeToken('MATHDISPLAY');
      try {
        const html = katex.renderToString(math.trim(), {
          displayMode: true,
          throwOnError: false,
          output: 'html', // Strictly prevent duplicate MathML text
        });
        tokens[token] = `<div class="katex-display-container my-3 p-3 bg-[#111827]/80 rounded-lg border border-slate-800 text-center overflow-x-auto">${html}</div>`;
      } catch (err) {
        tokens[token] = `<pre class="text-rose-400 text-xs">${escapeHtml(math)}</pre>`;
      }
      return token;
    });

    // 4. Render inline math: $...$
    text = text.replace(/(?<!\\)\$([^\$\n]+?)\$/g, (_, math) => {
      const token = makeToken('MATHINLINE');
      try {
        const html = katex.renderToString(math.trim(), {
          displayMode: false,
          throwOnError: false,
          output: 'html', // Strictly prevent duplicate MathML text
        });
        tokens[token] = `<span class="katex-inline-wrapper font-math">${html}</span>`;
      } catch (err) {
        tokens[token] = `<code class="text-rose-400 text-xs">${escapeHtml(math)}</code>`;
      }
      return token;
    });

    // 5. Basic markdown headings and typography
    text = text
      .replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-indigo-300 mt-4 mb-1.5 tracking-wide">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-base font-bold text-slate-100 mt-5 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-lg font-extrabold text-white mt-6 mb-3">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-100">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>');

    // 6. List items
    text = text
      .replace(/^\s*[-*]\s+(.*)$/gim, '<div class="flex items-start space-x-2 my-1 ml-1"><span class="text-indigo-400 select-none">•</span><span>$1</span></div>')
      .replace(/^\s*(\d+)\.\s+(.*)$/gim, '<div class="flex items-start space-x-2 my-1 ml-1"><span class="text-slate-400 font-mono text-xs select-none">$1.</span><span>$2</span></div>');

    // 7. Double newlines to paragraph break spacing
    text = text.replace(/\n\n/g, '<div class="h-2.5"></div>');

    // 8. Restore all preserved tokens
    Object.keys(tokens).forEach(token => {
      text = text.split(token).join(tokens[token]);
    });

    return text;
  }, [content]);

  return (
    <div
      className={`prose prose-invert max-w-none text-slate-300 leading-relaxed text-sm ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
