export interface DocumentProcessingResult {
  filename: string;
  fileType: string;
  text: string;
  urls: string[];
  indicators: string[];
  error?: string;
}

const IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/svg+xml',
];

const SUSPICIOUS_PATTERNS = [
  /<script[\s>]/i,
  /<iframe[\s>]/i,
  /\bmacro\b/i,
  /vbscript:/i,
  /javascript:/i,
  /<\?php/i,
  /\beval\s*\(/i,
  /\bexec\s*\(/i,
];

export class DocumentProcessor {
  async processFile(
    file: File | Buffer,
    filename: string,
    mimeType: string
  ): Promise<DocumentProcessingResult> {
    if (IMAGE_MIME_TYPES.includes(mimeType)) {
      return this.processImage(file, filename, mimeType);
    }

    if (mimeType === 'text/plain' || mimeType === 'text/markdown' || mimeType === 'text/x-markdown') {
      const buffer = file instanceof Buffer ? file : Buffer.from(await (file as File).arrayBuffer());
      const text = buffer.toString('utf-8');
      return {
        filename,
        fileType: mimeType,
        text,
        urls: this.extractUrls(text),
        indicators: this.checkSuspiciousContent(text),
      };
    }

    if (mimeType === 'application/pdf') {
      const buffer = file instanceof Buffer ? file : Buffer.from(await (file as File).arrayBuffer());
      try {
        console.log('[PDF] Starting PDF parse with pdf2json, buffer size:', buffer.length);
        const PDFParser = await import('pdf2json');
        const pdfParser = new PDFParser.default();
        
        const text = await new Promise<string>((resolve, reject) => {
          pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
            const extractedText = pdfData.Pages
              .map((p: any) => p.Texts.map((t: any) => decodeURIComponent(t.R.map((r: any) => r.T).join(''))).join(' '))
              .join('\n');
            resolve(extractedText);
          });
          pdfParser.on('pdfParser_dataError', (err: any) => {
            reject(new Error(err.parserError || 'PDF parsing failed'));
          });
          pdfParser.parseBuffer(buffer);
        });
        
        console.log('[PDF] Parse result, text length:', text.length);
        return {
          filename,
          fileType: mimeType,
          text,
          urls: this.extractUrls(text),
          indicators: this.checkSuspiciousContent(text),
        };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        const stack = e instanceof Error ? e.stack : '';
        console.error('[PDF] Parse error:', msg);
        console.error('[PDF] Stack:', stack);
        return {
          filename,
          fileType: mimeType,
          text: '',
          urls: [],
          indicators: ['PDF text extraction failed: ' + msg],
          error: 'PDF text extraction unavailable: ' + msg,
        };
      }
    }

    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      const buffer = file instanceof Buffer ? file : Buffer.from(await (file as File).arrayBuffer());
      try {
        const mammothMod = await import('mammoth');
        const result = await mammothMod.extractRawText({ buffer });
        const text = result.value;
        return {
          filename,
          fileType: mimeType,
          text,
          urls: this.extractUrls(text),
          indicators: this.checkSuspiciousContent(text),
        };
      } catch {
        return {
          filename,
          fileType: mimeType,
          text: '',
          urls: [],
          indicators: ['DOCX text extraction failed'],
          error: 'DOCX text extraction unavailable',
        };
      }
    }

    return {
      filename,
      fileType: mimeType,
      text: '',
      urls: [],
      indicators: [],
      error: `Unsupported file type: ${mimeType}`,
    };
  }

  private async processImage(
    _file: File | Buffer,
    filename: string,
    mimeType: string
  ): Promise<DocumentProcessingResult> {
    return {
      filename,
      fileType: mimeType,
      text: '',
      urls: [],
      indicators: [],
      error: 'Image OCR should be handled client-side via tesseract.js',
    };
  }

  private extractUrls(text: string): string[] {
    const urlRegex = /https?:\/\/[^\s<>"']+/gi;
    const matches = text.match(urlRegex);
    return matches ? [...new Set(matches)] : [];
  }

  private checkSuspiciousContent(text: string): string[] {
    const found: string[] = [];
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(text)) {
        found.push(`Suspicious pattern detected: ${pattern.source}`);
      }
    }
    return found;
  }
}

export const documentProcessor = new DocumentProcessor();
