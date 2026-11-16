import type { ReactNode } from 'react';

/** A deliberately small, safe text renderer. User text is never interpreted as HTML/JSX/MDX. */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={index}>{part.slice(2, -2)}</strong>
      : <span key={index}>{part}</span>);
}
export function MarkdownArticle({ text }: { text: string }) {
  const blocks = text.replace(/\r\n/g, '\n').split(/\n\s*\n/);
  return <div className="studio-markdown">{blocks.map((block, index) => {
    const lines = block.split('\n');
    if (lines.every(line => /^\s*[-*] /.test(line))) return <ul key={index}>{lines.map((line, i) => <li key={i}>{inline(line.replace(/^\s*[-*] /, ''))}</li>)}</ul>;
    if (/^### /.test(block)) return <h3 key={index}>{inline(block.slice(4))}</h3>;
    if (/^## /.test(block)) return <h2 key={index}>{inline(block.slice(3))}</h2>;
    if (/^# /.test(block)) return <h1 key={index}>{inline(block.slice(2))}</h1>;
    return <p key={index}>{lines.map((line, i) => <span key={i}>{i > 0 && <br />}{inline(line)}</span>)}</p>;
  })}</div>;
}
