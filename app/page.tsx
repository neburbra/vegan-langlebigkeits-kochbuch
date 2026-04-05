import { promises as fs } from 'fs';
import path from 'path';
import CookbookClient from './CookbookClient';

interface Section {
  id: string;
  title: string;
  level: number;
}

export default async function Home() {
  const filePath = path.join(process.cwd(), 'KOCHBUCH_VOLLSTÄNDIG_FINAL.md');
  const content = await fs.readFile(filePath, 'utf8');
  
  // Inhaltsverzeichnis aus Markdown generieren
  const sections: Section[] = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      let title = match[2]
        .replace(/[🌱🍽️📑📊🎯⭐✅⚠️]/g, '')
        .replace(/\[(.+)\]\(.+\)/g, '$1')
        .trim();
      const id = `section-${index}`;
      sections.push({ id, title, level });
    }
  });

  return <CookbookClient content={content} sections={sections} />;
}
