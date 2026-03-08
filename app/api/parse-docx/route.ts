import { NextRequest, NextResponse } from 'next/server';
import AdmZip from 'adm-zip';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const zip = new AdmZip(buffer);
    const xml = zip.readAsText('word/document.xml');

    const paraRegex = /<w:p[ >][\s\S]*?<\/w:p>/g;
    const styleRegex = /<w:pStyle w:val="([^"]+)"/;
    const paras = xml.match(paraRegex) || [];

    let sections: { title: string; content: string }[] = [];
    let currentTitle = '';
    let currentContent = '';

    paras.forEach((para: string) => {
      const styleMatch = para.match(styleRegex);
      const style = styleMatch ? styleMatch[1] : 'Normal';

      let text = '';
      let m;
      const textRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
      while ((m = textRegex.exec(para)) !== null) {
        text += m[1];
      }
      text = text.trim();
      if (!text) return;

      if (style === 'Heading1') {
        if (currentTitle) sections.push({ title: currentTitle, content: currentContent });
        currentTitle = text;
        currentContent = '';
      } else if (style === 'Heading2') {
        if (currentTitle) sections.push({ title: currentTitle, content: currentContent });
        currentTitle = text;
        currentContent = '';
      } else if (style === 'CodeBlock') {
        currentContent += `<pre>${text}</pre>`;
      } else if (style === 'KeyConcept') {
        currentContent += `<blockquote><strong>💡 Key Concept</strong><br/>${text}</blockquote>`;
      } else if (style === 'Quote') {
        currentContent += `<blockquote>${text}</blockquote>`;
      } else if (style === 'points' || style === 'Points0') {
        currentContent += `<li>${text}</li>`;
      } else if (style === 'Heading3') {
        currentContent += `<h3>${text}</h3>`;
      } else if (style === 'Heading4') {
        currentContent += `<h4>${text}</h4>`;
      } else if (style === 'Heading5') {
        currentContent += `<h5>${text}</h5>`;
      } else {
        currentContent += `<p>${text}</p>`;
      }
    });

    if (currentTitle) sections.push({ title: currentTitle, content: currentContent });

    return NextResponse.json({ sections });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}