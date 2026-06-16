import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Search, 
  ArrowLeft, 
  ArrowRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  HelpCircle,
  Clock,
  Printer,
  ShieldAlert,
  Menu,
  Minimize,
  Maximize,
  X,
  Play,
  BookOpen,
  Notebook,
  Info,
  Compass,
  Wrench,
  Hammer,
  Package,
  ClipboardList,
  Image,
  Network
} from 'lucide-react';
import { PAGES_DATABASE, ManualPage, DocumentSection } from './data';
import { EngineeringDiagram } from './components/EngineeringDiagram';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Asset URLs via Vite's import meta URL to ensure correct production paths
const logoImg = new URL('./assets/images/logo-1.png', import.meta.url).href;
const logoWebp = new URL('./assets/images/logo.webp', import.meta.url).href;
const phoneImg = new URL('./assets/images/phone.webp', import.meta.url).href;
const headerBg = new URL('./assets/images/header.webp', import.meta.url).href;
const PDF_BASE_WIDTH = 500; // increased base width for larger default PDF view

// Configure the worker to use the local module via Vite's URL handling for deployment stability
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

// PDF mappings and document structure are loaded at runtime from
// `src/assets/config/documents.xml` and PDF files under `src/assets/pdf/`.

interface PdfPageRendererProps {
  pdfDoc: any;
  pageNumber: number;
  zoomLevel: number;
  activeSearchTerm?: string;
  activeMatchIndexOnPage?: number;
  width: number;
  padding: number;
}

const PdfPageRenderer: React.FC<PdfPageRendererProps> = ({
  pdfDoc,
  pageNumber,
  zoomLevel,
  activeSearchTerm,
  activeMatchIndexOnPage = -1,
  width,
  padding
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [renderError, setRenderError] = useState<string>('');
  const [highlights, setHighlights] = useState<{ x: number; y: number; w: number; h: number }[]>([]);
  const renderTaskRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;
      
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (!isMounted) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const originalViewport = page.getViewport({ scale: 1 });
        const targetWidth = width * (zoomLevel / 100) - padding;
        const scale = targetWidth / originalViewport.width;
        const viewport = page.getViewport({ scale: scale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport
        };
        
        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        
        await renderTask.promise;
        if (!isMounted) return;
        
        if (activeSearchTerm && activeSearchTerm.trim().length > 0) {
          const textContent = await page.getTextContent();
          if (!isMounted) return;
          
          const query = activeSearchTerm.toLowerCase().trim();
          const items: any[] = textContent.items;
          const matchedHighlights: { x: number; y: number; w: number; h: number }[] = [];
          
          const pdfPageWidth = page.view[2];
          const pdfPageHeight = page.view[3];
          
          const scaleX = viewport.width / pdfPageWidth;
          const scaleY = viewport.height / pdfPageHeight;
          
          items.forEach(item => {
            if (item.str.toLowerCase().includes(query)) {
              const x = item.transform[4];
              const y = item.transform[5];
              const w = item.width || (item.str.length * item.transform[0] * 0.5);
              const h = item.height || item.transform[0];
              
              matchedHighlights.push({
                x: x * scaleX,
                y: (pdfPageHeight - y - h) * scaleY,
                w: w * scaleX,
                h: h * scaleY
              });
            }
          });
          
          setHighlights(matchedHighlights);
        } else {
          setHighlights([]);
        }
      } catch (err: any) {
        if (err.name !== 'RenderingCancelledException') {
          console.error('Error rendering PDF page:', err);
          if (isMounted) {
            setRenderError(err.message || 'Page render error');
          }
        }
      }
    };

    renderPage();

    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, pageNumber, zoomLevel, activeSearchTerm, width, padding]);

  return (
    <div className="relative w-full h-full flex justify-center items-center overflow-hidden">
      {renderError ? (
        <div className="text-red-500 text-xs font-semibold p-4 text-center">
          Failed to render page: {renderError}
        </div>
      ) : (
        <div className="relative inline-block w-full h-full">
          <canvas ref={canvasRef} className="block w-full h-auto select-none rounded-sm" />
          {highlights.map((hl, index) => {
            const isCurrentlySelected = index === activeMatchIndexOnPage;
            return (
              <div 
                key={index} 
                className={`absolute mix-blend-multiply rounded-sm pointer-events-none transition-all duration-150 ${
                  isCurrentlySelected 
                    ? 'bg-red-500/50 border-2 border-red-700 shadow-[0_0_8px_rgba(239,68,68,0.8)] z-10 scale-105' 
                    : 'bg-yellow-400/35 border border-amber-600/50'
                }`}
                style={{
                  left: `${hl.x}px`,
                  top: `${hl.y}px`,
                  width: `${hl.w}px`,
                  height: `${hl.h}px`,
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 200, 300, 400, 500, 600];

const pageVariants = {
  initial: (custom: any) => {
    const dir = typeof custom === 'object' ? custom.direction : custom;
    const isDragging = typeof custom === 'object' ? custom.isDraggingSlider : false;
    return {
      opacity: isDragging ? 1 : 0,
      x: isDragging ? 0 : (dir === 'next' ? 60 : -60),
      rotateY: isDragging ? 0 : (dir === 'next' ? 8 : -8),
      scale: isDragging ? 1 : 0.98,
    };
  },
  animate: (custom: any) => {
    const isDragging = typeof custom === 'object' ? custom.isDraggingSlider : false;
    return {
      opacity: 1,
      x: 0,
      rotateY: 0,
      scale: 1,
      transition: {
        duration: isDragging ? 0 : 0.22,
        ease: [0.25, 1, 0.5, 1], // fluid easeOutQuart
      }
    };
  },
  exit: (custom: any) => {
    const dir = typeof custom === 'object' ? custom.direction : custom;
    const isDragging = typeof custom === 'object' ? custom.isDraggingSlider : false;
    return {
      opacity: isDragging ? 1 : 0,
      x: isDragging ? 0 : (dir === 'next' ? -60 : 60),
      rotateY: isDragging ? 0 : (dir === 'next' ? -8 : 8),
      scale: isDragging ? 1 : 0.98,
      transition: {
        duration: isDragging ? 0 : 0.22,
        ease: [0.25, 1, 0.5, 1],
      }
    };
  }
};

export default function App() {
  // Global Navigation State
  const [showMainApp, setShowMainApp] = useState<boolean>(false);
  const [activeManualId, setActiveManualId] = useState<string>('');
  const [documentStructure, setDocumentStructure] = useState<DocumentSection[]>([]);
  const [pdfMapping, setPdfMapping] = useState<Record<string, string>>({});
  const [manualsInfo, setManualsInfo] = useState<Record<string, { title: string; pagesCount: number; startPage: number }>>({});
  const navPanelRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const bottomTrackRef = useRef<HTMLDivElement | null>(null);
  const lowerStatusRef = useRef<HTMLDivElement | null>(null);
  // viewerHeight removed: rely on CSS flexbox for responsive sizing

  // Hover drawer & speech state
  const [hoverInfo, setHoverInfo] = useState<null | { id: string; title: string; desc: string; top: number; left: number }>(null);
  const [spokenId, setSpokenId] = useState<string | null>(null);

  const HOVER_DESCRIPTIONS: Record<string, string> = {
    'user-handbook': 'General operating instructions, safety guidance, and basic system usage procedures.',
    'tech-manual-1': 'Technical reference documentation and detailed engineering information.',
    'tech-1-1': 'System architecture, functionality, specifications, and operational characteristics.',
    'tech-1-2': 'Engineering drawings, layouts, diagrams, and technical illustrations.',
    'tech-manual-2': 'Scheduled maintenance procedures, inspections, and servicing requirements.',
    'tech-2': 'Scheduled maintenance procedures, inspections, and servicing requirements.',
    'tech-manual-3': 'Overhaul procedures, restoration activities, and major component servicing.',
    'tech-3': 'Overhaul procedures, restoration activities, and major component servicing.',
    'tech-4-1': 'Component identification, part references, and equipment breakdown structure.',
    'tech-4-2': 'Visual references, exploded views, and supporting graphical information.',
    'product-tree': 'System hierarchy, assemblies, subassemblies, and product structure relationships.'
  };

  // Speak description once per hover entry
  const speakDescription = (id: string, text: string) => {
    try {
      if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      // Stop previous speech
      window.speechSynthesis.cancel();
      setSpokenId(id);
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en')) || voices[0];
      if (preferred) u.voice = preferred;
      // Speak
      window.speechSynthesis.speak(u);
    } catch (err) {
      console.error('Speech error:', err);
    }
  };

  const clearHover = () => {
    setHoverInfo(null);
    setSpokenId(null);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };
  
  // Navigation Section Expand/Collapse State - empty map so all sections remain collapsed by default
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Slide dragging state
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const [sliderValue, setSliderValue] = useState<number>(0);

  // Global window mouseup/touchend to safely release dragging mode
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDraggingSlider(false);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);

  // PDF Viewer View State
  const [viewMode, setViewMode] = useState<'single' | 'double'>('double');
  const [zoomLevel, setZoomLevel] = useState<number>(140); 
  const [currentPairIndex, setCurrentPairIndex] = useState<number>(0);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  // Mouse middle-click pan state & refs
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const scrollStartRef = useRef({ left: 0, top: 0 });

  // Reset panning status and handle global window mouseup to release panning mode cleanly
  useEffect(() => {
    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (e.button === 1) { // Middle mouse button
        setIsPanning(false);
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSearchTerm, setActiveSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<{ pageNumber: number; textSnippet: string; fieldName: string }[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState<number>(-1);
  const [searchError, setSearchError] = useState<string>('');

  // Status indicators for Windows 95 feel
  const [systemTime, setSystemTime] = useState<string>('');
  
  // PDF state hooks
  const [pdfPagesMap, setPdfPagesMap] = useState<Record<string, ManualPage[]>>({});
  const [pdfDocsMap, setPdfDocsMap] = useState<Record<string, any>>({});
  const [loadingManuals, setLoadingManuals] = useState<Record<string, boolean>>({});

  const isPdfManual = pdfMapping[activeManualId] !== undefined;
  
  // Ref to the scroll container to manage clicking and tracking page positions
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isSelfScrolling = useRef<boolean>(false);

  // Filter page database to only have pages of current active manual
  const currentManualPages = (isPdfManual && pdfPagesMap[activeManualId])
    ? pdfPagesMap[activeManualId]
    : PAGES_DATABASE.filter(p => p.manualId === activeManualId);
  const totalPagesInManual = currentManualPages.length;
  const totalPairs = Math.ceil(totalPagesInManual / 2);

  // Synchronize sliderValue with the current position when not actively dragging
  useEffect(() => {
    if (!isDraggingSlider) {
      setSliderValue(viewMode === 'single' ? currentPageIndex : Math.max(0, Math.min(currentPairIndex * 2, totalPagesInManual - 1)));
    }
  }, [currentPageIndex, currentPairIndex, viewMode, totalPagesInManual, isDraggingSlider]);

  // Generate systemic clock for status bar
  useEffect(() => {
    // Load XML configuration mapping documents to PDF files
    const loadConfig = async () => {
      try {
        const cfgUrl = new URL('./assets/config/documents.xml', import.meta.url).href;
        const resp = await fetch(cfgUrl);
        if (!resp.ok) return;
        const xmlText = await resp.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, 'application/xml');

        const newStructure: DocumentSection[] = [];
        const newPdfMap: Record<string, string> = {};
        const newManualsInfo: Record<string, { title: string; pagesCount: number; startPage: number }> = {};

        const sections = Array.from(xml.querySelectorAll('section'));
        console.log('[DOCS] Parsed XML sections count:', sections.length);
        for (const s of sections) {
          console.log('[DOCS] Section node:', { id: s.getAttribute('id'), title: s.getAttribute('title'), file: s.getAttribute('file') });
          const sid = s.getAttribute('id') || '';
          const stitle = s.getAttribute('title') || sid;
          const file = s.getAttribute('file');

          const subdocs = Array.from(s.querySelectorAll('subdocument'));
          if (subdocs.length > 0) {
            console.log('[DOCS] Found subdocuments for section', sid, 'count:', subdocs.length);
            const subs: any[] = [];
            for (const sd of subdocs) {
              console.log('[DOCS] Subdocument node:', { id: sd.getAttribute('id'), title: sd.getAttribute('title'), file: sd.getAttribute('file') });
              const subId = sd.getAttribute('id') || '';
              const subTitle = sd.getAttribute('title') || subId;
              const subFile = sd.getAttribute('file') || '';
              subs.push({ id: subId, title: subTitle, docId: subId });
              try {
                newPdfMap[subId] = new URL(`./assets/pdf/${encodeURIComponent(subFile)}`, import.meta.url).href;
              } catch (e) {
                // fallback: try without encoding
                newPdfMap[subId] = new URL(`./assets/pdf/${subFile}`, import.meta.url).href;
              }
              newManualsInfo[subId] = { title: subTitle, pagesCount: 0, startPage: 1 };
            }
            newStructure.push({ id: sid, title: stitle, isExpandable: true, subDocuments: subs });
          } else if (file) {
            // Single-file section
            try {
              newPdfMap[sid] = new URL(`./assets/pdf/${encodeURIComponent(file)}`, import.meta.url).href;
            } catch (e) {
              newPdfMap[sid] = new URL(`./assets/pdf/${file}`, import.meta.url).href;
            }
            newManualsInfo[sid] = { title: stitle, pagesCount: 0, startPage: 1 };
            newStructure.push({ id: sid, title: stitle, isExpandable: false, docId: sid });
          }
        }

        // Log generated structures for debugging
        console.log('[DOCS] Generated documentStructure:', newStructure);
        console.log('[DOCS] Generated pdfMapping (keys):', Object.keys(newPdfMap));
        console.log('[DOCS] Generated pdfMapping (sample):', Object.entries(newPdfMap).slice(0,20));

        setDocumentStructure(newStructure);
        setPdfMapping(newPdfMap);
        setManualsInfo(newManualsInfo);

        // Verify that the mapped URLs resolve (HEAD request) and log results
        for (const [k, url] of Object.entries(newPdfMap)) {
          if (!url) {
            console.warn('[DOCS] pdfMapping entry has falsy URL for key:', k);
            continue;
          }
          fetch(url, { method: 'HEAD' })
            .then(r => {
              console.log(`[DOCS] HEAD ${k} -> ${url} status:`, r.status);
              if (!r.ok) console.warn(`[DOCS] HEAD check failed for ${k}: ${url}`);
            })
            .catch(err => console.error('[DOCS] HEAD check error for', k, url, err));
        }

        // Create simple alias keys to support legacy manualId naming in PAGES_DATABASE
        for (const sid of Object.keys(newPdfMap)) {
          const m = sid.match(/^tech-manual-(\d+)$/);
          if (m) {
            const alias = `tech-${m[1]}`;
            if (!newPdfMap[alias]) {
              newPdfMap[alias] = newPdfMap[sid];
              console.log('[DOCS] Created alias pdfMapping key:', alias, '->', sid);
            }
          }
        }

        // Default active manual to first found docId if none selected yet
        if (!activeManualId) {
          const firstDoc = (Object.keys(newPdfMap)[0]) || '';
          if (firstDoc) setActiveManualId(firstDoc);
        }
      } catch (err) {
        console.error('Failed to load documents XML config:', err);
      }
    };

    loadConfig();

    const updateTime = () => {
      const now = new Date();
      setSystemTime(now.toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sequentially process background OCR for empty/scanned pages using /api/ocr
  const triggerBackgroundOCR = async (
    pdf: any, 
    manualId: string, 
    pageNums: number[]
  ) => {
    for (const pageNum of pageNums) {
      try {
        console.log(`[OCR] Processing digital OCR content for Page ${pageNum} under manual ${manualId}...`);
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        await page.render({ canvasContext: ctx, viewport }).promise;
        const imageBase64 = canvas.toDataURL('image/png');

        const ocrRes = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64 })
        });

        if (ocrRes.ok) {
          const data = await ocrRes.json();
          if (data.text && data.text.trim().length > 0) {
            const ocrLines = data.text.split('\n').map((l: string) => l.trim()).filter(Boolean);
            
            // Map back and update state
            setPdfPagesMap(prev => {
              const pages = prev[manualId];
              if (!pages) return prev;
              const updated = pages.map(p => {
                if (p.pageNumber === pageNum) {
                  return {
                    ...p,
                    paragraphs: ocrLines,
                    sectionTitle: ocrLines.find((l: string) => l.trim().length > 3)?.substring(0, 100) || p.sectionTitle,
                    isOcrDone: true,
                  };
                }
                return p;
              });
              return { ...prev, [manualId]: updated };
            });
          }
        }
        
        // Wait 4000ms between requests to avoid Gemini Free Tier rate limits (15 RPM -> 1 per 4 seconds)
        await new Promise(resolve => setTimeout(resolve, 4000));
        
      } catch (err) {
        console.error(`Background OCR failed for page ${pageNum}:`, err);
      }
    }
  };

  // Back-end PDF parsing and loading effect
  useEffect(() => {
    console.log('[DOCS] useEffect: activeManualId changed ->', activeManualId);
    console.log('[DOCS] current pdfMapping keys:', Object.keys(pdfMapping));
    const pdfUrl = pdfMapping[activeManualId];
    console.log('[DOCS] resolved pdfUrl for', activeManualId, ':', pdfUrl);
    if (!pdfUrl) {
      console.warn('[DOCS] No pdfUrl found for activeManualId:', activeManualId);
      return;
    }

    if (pdfPagesMap[activeManualId]) return;

    let isMounted = true;
    
    const loadPdfData = async () => {
      setLoadingManuals(prev => ({ ...prev, [activeManualId]: true }));
      try {
        const response = await fetch(pdfUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF file: ${response.status} ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const pdfData = new Uint8Array(arrayBuffer);
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        const pdf = await loadingTask.promise;
        if (!isMounted) return;

        const parsedPages: ManualPage[] = [];
        const imageBasedPageNumbers: number[] = [];

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          if (!isMounted) return;

          const textItems = textContent.items as any[];
          const lineMap: Record<number, any[]> = {};
          
          textItems.forEach(item => {
            const y = Math.round(item.transform[5]);
            let foundYKey = Object.keys(lineMap).map(Number).find(keyY => Math.abs(keyY - y) < 5);
            if (foundYKey !== undefined) {
              lineMap[foundYKey].push(item);
            } else {
              lineMap[y] = [item];
            }
          });

          const sortedYKeys = Object.keys(lineMap).map(Number).sort((a, b) => b - a);
          const lines: string[] = [];

          sortedYKeys.forEach(yKey => {
            const lineItems = lineMap[yKey];
            lineItems.sort((a, b) => a.transform[4] - b.transform[4]);
            const lineText = lineItems.map(item => item.str).join(' ').trim();
            if (lineText) lines.push(lineText);
          });

          const pageTextLength = lines.join(' ').trim().length;
          const isImageBased = pageTextLength < 15;
          if (isImageBased) {
            imageBasedPageNumbers.push(pageNum);
          }

          const firstLineWithText = lines.find(l => l.trim().length > 3) || `Page ${pageNum}`;

          parsedPages.push({
            id: `${activeManualId}-pdf-p-${pageNum}`,
            manualId: activeManualId,
            pageNumber: pageNum,
            sectionTitle: firstLineWithText.trim().substring(0, 100),
            subTitle: '',
            paragraphs: lines,
            isImageBased: isImageBased,
          });
        }

        if (isMounted) {
          setPdfPagesMap(prev => ({ ...prev, [activeManualId]: parsedPages }));
          setPdfDocsMap(prev => ({ ...prev, [activeManualId]: pdf }));
          setLoadingManuals(prev => ({ ...prev, [activeManualId]: false }));

          // Run background OCR for empty/image pages
          if (imageBasedPageNumbers.length > 0) {
            triggerBackgroundOCR(pdf, activeManualId, imageBasedPageNumbers);
          }
        }
      } catch (err) {
        console.error(`Error loading or parsing PDF at ${pdfUrl}:`, err);
        if (isMounted) {
          setLoadingManuals(prev => ({ ...prev, [activeManualId]: false }));
        }
      }
    };

    loadPdfData();

    return () => {
      isMounted = false;
    };
  }, [activeManualId]);

  // When changing active manual, reset page views and clear search
  const handleSelectManual = (manualId: string) => {
    console.log('[DOCS] handleSelectManual clicked:', manualId, 'pdfMapping has key?', Object.prototype.hasOwnProperty.call(pdfMapping, manualId));
    console.log('[DOCS] pdfMapping value:', pdfMapping[manualId]);
    setActiveManualId(manualId);
    setCurrentPageIndex(0);
    setCurrentPairIndex(0);
    setSearchQuery('');
    setActiveSearchTerm('');
    setSearchResults([]);
    setCurrentSearchIndex(-1);
    setSearchError('');
    setIsPanning(false);
    
    // Scroll viewport to top
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
      scrollContainerRef.current.scrollLeft = 0;
    }
  };

  const handleHoverEnter = (e: React.MouseEvent, id: string | undefined, title: string) => {
    if (!id) return;
    const panel = navPanelRef.current;
    const target = e.currentTarget as HTMLElement;
    if (!panel || !target) return;
    const panelRect = panel.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    const top = rect.top - panelRect.top + rect.height + 8; // position below the item
    const left = Math.min(panelRect.width - 20, rect.left - panelRect.left + 36);
    const desc = HOVER_DESCRIPTIONS[id] || HOVER_DESCRIPTIONS[title.toLowerCase()] || manualsInfo[id]?.title || '';

    setHoverInfo({ id, title, desc, top, left });
    // speak once per enter
    if (spokenId !== id && desc) {
      speakDescription(id, desc);
    }
  };

  // Toggle tree node expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Reset scroll on paging
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [currentPageIndex, currentPairIndex, activeManualId]);

  // Previous Page / Next Page operators with explicit animation direction setting
  const handlePrevPage = () => {
    setDirection('prev');
    if (viewMode === 'single') {
      if (currentPageIndex > 0) {
        const newIndex = currentPageIndex - 1;
        setCurrentPageIndex(newIndex);
        setCurrentPairIndex(Math.floor(newIndex / 2));
      }
    } else {
      if (currentPairIndex > 0) {
        const newIndex = currentPairIndex - 1;
        setCurrentPairIndex(newIndex);
        setCurrentPageIndex(newIndex * 2);
      }
    }
  };

  const handleNextPage = () => {
    setDirection('next');
    if (viewMode === 'single') {
      if (currentPageIndex < totalPagesInManual - 1) {
        const newIndex = currentPageIndex + 1;
        setCurrentPageIndex(newIndex);
        setCurrentPairIndex(Math.floor(newIndex / 2));
      }
    } else {
      if (currentPairIndex < totalPairs - 1) {
        const newIndex = currentPairIndex + 1;
        setCurrentPairIndex(newIndex);
        setCurrentPageIndex(newIndex * 2);
      }
    }
  };

  // Synchronize handler references for key down listeners to avoid stale closure re-bind churn
  const handleNextPageRef = useRef(handleNextPage);
  const handlePrevPageRef = useRef(handlePrevPage);

  useEffect(() => {
    handleNextPageRef.current = handleNextPage;
    handlePrevPageRef.current = handlePrevPage;
  });

  // Global keyboard listener for Left/Right page navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Priority handling: do not trigger page turning when typing inside input, select or textarea fields
      const activeEl = document.activeElement;
      if (activeEl) {
        const tagName = activeEl.tagName.toUpperCase();
        if (
          tagName === 'INPUT' || 
          tagName === 'TEXTAREA' || 
          tagName === 'SELECT' ||
          activeEl.hasAttribute('contenteditable') ||
          (activeEl as HTMLElement).isContentEditable
        ) {
          return;
        }
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextPageRef.current();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevPageRef.current();
      }
    };

    if (showMainApp) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showMainApp]);

  // Handle standard viewport scroll tracking is now optional as only the active page spread is rendered
  const handleViewerScroll = () => {
    // Scroll event tracking disabled for active spread mode
  };

  // Immediate view mode transition handler
  const handleViewModeChange = (mode: 'single' | 'double') => {
    setViewMode(mode);
    if (mode === 'single') {
      const targetIdx = currentPairIndex * 2;
      setCurrentPageIndex(targetIdx);
    } else {
      const targetIdx = Math.floor(currentPageIndex / 2);
      setCurrentPairIndex(targetIdx);
    }
  };

  // Search Logic in active manual
  const handleSearchExecute = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchError('');
    
    if (!searchQuery.trim()) {
      setActiveSearchTerm('');
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const results: { pageNumber: number; textSnippet: string; fieldName: string }[] = [];

    currentManualPages.forEach(page => {
      // Check Section Title
      if (page.sectionTitle.toLowerCase().includes(query)) {
        results.push({
          pageNumber: page.pageNumber,
          textSnippet: page.sectionTitle,
          fieldName: 'Header Title'
        });
      }
      // Check Sub Title
      if (page.subTitle && page.subTitle.toLowerCase().includes(query)) {
        results.push({
          pageNumber: page.pageNumber,
          textSnippet: page.subTitle,
          fieldName: 'Section Subtitle'
        });
      }
      // Check Paragraphs
      page.paragraphs.forEach(pText => {
        if (pText.toLowerCase().includes(query)) {
          results.push({
            pageNumber: page.pageNumber,
            textSnippet: pText,
            fieldName: 'Technical Body'
          });
        }
      });
      // Check Table Cells
      if (page.table) {
        page.table.rows.forEach(row => {
          row.forEach(cell => {
            if (cell.toLowerCase().includes(query)) {
              results.push({
                pageNumber: page.pageNumber,
                textSnippet: `Table Element: ${cell}`,
                fieldName: 'Specification Grid'
              });
            }
          });
        });
      }
    });

    if (results.length > 0) {
      setActiveSearchTerm(searchQuery.trim());
      setSearchResults(results);
      setCurrentSearchIndex(0);
      
      // Navigate instantly to page pair containing first result
      const targetPage = results[0].pageNumber;
      // Map global page number back to manual index (0-based list)
      const foundIdx = currentManualPages.findIndex(p => p.pageNumber === targetPage);
      if (foundIdx !== -1) {
        setDirection(foundIdx > currentPageIndex ? 'next' : 'prev');
        if (viewMode === 'single') {
          setCurrentPageIndex(foundIdx);
          setCurrentPairIndex(Math.floor(foundIdx / 2));
        } else {
          const pairIdx = Math.floor(foundIdx / 2);
          setCurrentPairIndex(pairIdx);
          setCurrentPageIndex(pairIdx * 2);
        }
      }
    } else {
      setActiveSearchTerm('');
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      setSearchError(`"${searchQuery}" not found in current document.`);
    }
  };

  // Jump to specific search result index
  const handleJumpToSearchResult = (index: number) => {
    if (searchResults.length === 0 || index < 0 || index >= searchResults.length) return;
    
    setCurrentSearchIndex(index);
    const targetPage = searchResults[index].pageNumber;
    const foundIdx = currentManualPages.findIndex(p => p.pageNumber === targetPage);
    if (foundIdx !== -1) {
      setDirection(foundIdx > currentPageIndex ? 'next' : 'prev');
      if (viewMode === 'single') {
        setCurrentPageIndex(foundIdx);
        setCurrentPairIndex(Math.floor(foundIdx / 2));
      } else {
        const pairIdx = Math.floor(foundIdx / 2);
        setCurrentPairIndex(pairIdx);
        setCurrentPageIndex(pairIdx * 2);
      }
    }
  };

  // Check if a rendered text field matches the selected search result
  const isSelectedResult = (pageNum: number, fieldName: string, textSnippet: string) => {
    if (currentSearchIndex < 0 || currentSearchIndex >= searchResults.length) return false;
    const sel = searchResults[currentSearchIndex];
    return sel.pageNumber === pageNum && sel.fieldName === fieldName && textSnippet.includes(sel.textSnippet);
  };

  // Highlight matches helper (now supports active match styled in red with glow)
  const highlightMatches = (text: string, searchWord: string, isActiveMatch: boolean = false) => {
    if (!searchWord || !text) return text;
    
    const parts = text.split(new RegExp(`(${searchWord.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, index) => {
          const isMatch = part.toLowerCase() === searchWord.toLowerCase();
          if (isMatch) {
            return (
              <span 
                key={index} 
                className={`px-1 font-bold rounded-sm border transition-all duration-150 ${
                  isActiveMatch 
                    ? 'bg-red-500 text-white border-red-700 shadow-[0_0_6px_rgba(239,68,68,0.6)] animate-pulse' 
                    : 'bg-yellow-300 border border-amber-600/35 text-black'
                }`}
              >
                {part}
              </span>
            );
          }
          return part;
        })}
      </>
    );
  };

  // Reset Zoom
  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  const handleZoomOut = () => {
    const currentIdx = ZOOM_LEVELS.indexOf(zoomLevel);
    if (currentIdx > 0) {
      setZoomLevel(ZOOM_LEVELS[currentIdx - 1]);
    } else {
      const smaller = [...ZOOM_LEVELS].reverse().find(z => z < zoomLevel);
      if (smaller !== undefined) {
        setZoomLevel(smaller);
      }
    }
  };

  const handleZoomIn = () => {
    const currentIdx = ZOOM_LEVELS.indexOf(zoomLevel);
    if (currentIdx !== -1 && currentIdx < ZOOM_LEVELS.length - 1) {
      setZoomLevel(ZOOM_LEVELS[currentIdx + 1]);
    } else {
      const larger = ZOOM_LEVELS.find(z => z > zoomLevel);
      if (larger !== undefined) {
        setZoomLevel(larger);
      }
    }
  };

  // Direct page click jump indicator with direction logic
  const handleDirectPageJump = (pageIdx: number) => {
    const currentIdx = viewMode === 'single' ? currentPageIndex : currentPairIndex * 2;
    if (pageIdx > currentIdx) {
      setDirection('next');
    } else if (pageIdx < currentIdx) {
      setDirection('prev');
    }

    if (viewMode === 'single') {
      if (pageIdx >= 0 && pageIdx < totalPagesInManual) {
        setCurrentPageIndex(pageIdx);
        setCurrentPairIndex(Math.floor(pageIdx / 2));
      }
    } else {
      const pairIdx = Math.floor(pageIdx / 2);
      if (pairIdx >= 0 && pairIdx < totalPairs) {
        setCurrentPairIndex(pairIdx);
        setCurrentPageIndex(pairIdx * 2);
      }
    }
  };

  // Middle-click mouse drag panning handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 1) { // Middle mouse click
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY };
      scrollStartRef.current = {
        left: scrollContainerRef.current?.scrollLeft || 0,
        top: scrollContainerRef.current?.scrollTop || 0
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning || !scrollContainerRef.current) return;
    e.preventDefault();
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    scrollContainerRef.current.scrollLeft = scrollStartRef.current.left - dx;
    scrollContainerRef.current.scrollTop = scrollStartRef.current.top - dy;
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 1) {
      setIsPanning(false);
    }
  };

  // Clean corporate cover introduction screen
  const IntroScreen = () => (
    <div id="ietm_intro_container" className="w-full h-screen bg-white text-black flex relative overflow-hidden">
      {/* LEFT SIDE - Product Image only (about 40-45% of page width) */}
      <div className="w-[42%] flex items-center justify-center p-8 bg-white border-none shrink-0">
        <img 
          src={phoneImg} 
          alt="Product Image" 
          className="max-h-[80vh] w-auto object-contain border-none shadow-none"
          referrerPolicy="no-referrer"
          style={{ display: 'block' }}
        />
      </div>

      {/* RIGHT SIDE - Corporate & IETM information (vertically and center aligned) */}
      <div className="flex-1 flex flex-col justify-center items-center p-12 pr-16 bg-white text-center space-y-4 select-text border-none">
        {/* Right column: logo at top, then website and text content centered below */}
        <img src={logoWebp} alt="ELCOM Logo" className="w-auto object-contain" style={{ height: 'clamp(56px, 9vw, 120px)', whiteSpace: 'nowrap' }} />

        <div style={{ width: '100%', maxWidth: 720 }} className="flex flex-col items-center text-center space-y-3">
          <a href="http://www.elcominnovations.com" target="_blank" rel="noopener noreferrer" className="font-medium" style={{ whiteSpace: 'nowrap', fontSize: 'clamp(13px, 1.8vw, 18px)' }}>www.elcominnovations.com</a>

          <h2 className="font-black" style={{ fontSize: 'clamp(20px, 2.6vw, 30px)', whiteSpace: 'nowrap', margin: 0 }}>Interactive Electronic Technical Manual (IETM)</h2>

          <div style={{ fontStyle: 'italic', fontSize: 'clamp(12px, 1.4vw, 14px)', whiteSpace: 'nowrap' }}>for</div>

          <div className="font-semibold" style={{ fontSize: 'clamp(16px, 2.0vw, 22px)', whiteSpace: 'nowrap' }}>Field Telephone Set with Magneto and Auto Mode (RFT1001)</div>

          <div style={{ fontSize: 'clamp(13px, 1.6vw, 16px)', whiteSpace: 'nowrap' }}>Make: Elcom Innovations Pvt Ltd</div>
          <div style={{ fontSize: 'clamp(13px, 1.6vw, 16px)', whiteSpace: 'nowrap' }}>Model: RFT1001</div>
        </div>
      </div>

      {/* BOTTOM RIGHT CORNER - "Click Here To Proceed" button */}
      <div className="absolute bottom-12 right-12 md:bottom-16 md:right-16 bg-white border-none">
        <button
          onClick={() => setShowMainApp(true)}
          className="win-btn-blue font-sans"
        >
          Click Here To Proceed
        </button>
      </div>
    </div>
  );

  // Main PDF Document screen view
  const MainViewerScreen = () => {
    const getNodeIcon = (id: string) => {
      const lowerId = id.toLowerCase();
      if (lowerId.includes('user-handbook')) {
        return <BookOpen size={14} className="text-[#0ea5e9] shrink-0" />;
      }
      if (lowerId.includes('tech-manual-1') || lowerId === 'tech-1-1' || lowerId === 'tech-1-2') {
        return <Notebook size={14} className="text-[#0ea5e9] shrink-0" />;
      }
      if (lowerId.includes('t1v1') || lowerId.includes('description') || lowerId === 'tech-1-1') {
        return <Info size={14} className="text-[#0ea5e9] shrink-0" />;
      }
      if (lowerId.includes('t1v2') || lowerId.includes('drawings') || lowerId === 'tech-1-2') {
        return <Compass size={14} className="text-[#0ea5e9] shrink-0" />;
      }
      if (lowerId.includes('tech-manual-2') || lowerId.includes('maintenance') || lowerId === 'tech-2') {
        return <Wrench size={14} className="text-[#0ea5e9] shrink-0" />;
      }
      if (lowerId.includes('tech-manual-3') || lowerId.includes('overhauling') || lowerId === 'tech-3') {
        return <Hammer size={14} className="text-[#0ea5e9] shrink-0" />;
      }
      if (lowerId.includes('tech-manual-4')) {
        return <Package size={14} className="text-[#0ea5e9] shrink-0" />;
      }
      if (lowerId.includes('t4v1') || lowerId.includes('part-list') || lowerId.includes('parts') || lowerId === 'tech-4-1') {
        return <ClipboardList size={14} className="text-[#0ea5e9] shrink-0" />;
      }
      if (lowerId.includes('t4v2') || lowerId.includes('illustrations') || lowerId === 'tech-4-2') {
        return <Image size={14} className="text-[#0ea5e9] shrink-0" />;
      }
      if (lowerId.includes('product-tree') || lowerId === 'product-tree') {
        return <Network size={14} className="text-[#0ea5e9] shrink-0" />;
      }
      return <FileText size={14} className="text-[#0ea5e9] shrink-0" />;
    };

    // Left Tree document items rendered recursively or explicitly
    const renderTreeItem = (node: DocumentSection) => {
      if (node.isExpandable) {
        const isExpanded = expandedSections[node.id];
        return (
          <div key={node.id} className="text-left select-none text-sm">
            {/* Explorable folder row header */}
            <div 
              onClick={() => toggleSection(node.id)}
              onMouseEnter={(e) => handleHoverEnter(e as React.MouseEvent, node.id, node.title)}
              onMouseLeave={() => clearHover()}
              className="nav-item-hover flex items-center gap-2.5 py-1.5 pl-3 pr-2.5 rounded hover:bg-neutral-50 cursor-pointer text-neutral-800 font-semibold transition-colors border-l-2 border-transparent"
            >
              {getNodeIcon(node.id)}
              <span className="truncate font-sans text-[13px]">{node.title}</span>
            </div>
            
            {/* Expandable Children leaves */}
            {isExpanded && node.subDocuments && (
              <div className="py-0.5 space-y-0.5">
                {node.subDocuments.map(subDoc => {
                  const isActive = activeManualId === subDoc.docId;
                  return (
                    <div 
                      key={subDoc.id}
                      onClick={() => handleSelectManual(subDoc.docId)}
                      onMouseEnter={(e) => handleHoverEnter(e as React.MouseEvent, subDoc.docId, subDoc.title)}
                      onMouseLeave={() => clearHover()}
                      className={`nav-item-hover flex items-center gap-2.5 py-1.5 pr-2.5 pl-9 rounded cursor-pointer text-[13px] transition-colors duration-150 ${isActive ? 'bg-sky-100 text-neutral-900 font-semibold border-l-2 border-[#0ea5e9]' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 border-l-2 border-transparent'}`}
                    >
                      {getNodeIcon(subDoc.id)}
                      <span className="truncate font-sans" title={subDoc.title}>{subDoc.title}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      } else {
        // Single PDF manuals
        const isActive = activeManualId === node.docId;
        return (
          <div key={node.id} className="text-left select-none text-sm">
            <div 
              onClick={() => node.docId && handleSelectManual(node.docId)}
              onMouseEnter={(e) => handleHoverEnter(e as React.MouseEvent, node.docId || node.id, node.title)}
              onMouseLeave={() => clearHover()}
              className={`nav-item-hover flex items-center gap-2.5 py-1.5 pr-2.5 pl-3 rounded cursor-pointer font-semibold transition-colors duration-150 ${isActive ? 'bg-sky-100 text-neutral-900 font-semibold border-l-2 border-[#0ea5e9]' : 'text-neutral-700 hover:bg-neutral-50 border-l-2 border-transparent'}`}
            >
              {node.docId ? getNodeIcon(node.docId) : getNodeIcon(node.id)}
              <span className="truncate font-sans text-[13px]" title={node.title}>{node.title}</span>
            </div>
          </div>
        );
      }
    };

    const selectedResult = searchResults[currentSearchIndex];

    return (
      <div id="main_ietm_interface" className="h-screen w-screen flex flex-col bg-neutral-100 font-sans overflow-hidden">
        
        {/* FIXED TOP WINDOW TITLE BAR - MODERN ENTERPRISE HEADER */}
        <div id="retro_top_header" ref={headerRef} className="relative overflow-hidden text-[#000000] px-4 py-6 flex items-center justify-between text-sm font-semibold shrink-0 select-none shadow-md border-b border-sky-400/50" style={{ backgroundImage: `url('${headerBg}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          {/* Subtle Technical/Engineering Blueprints Grid Mesh */}
          <div className="absolute inset-0 opacity-[0.20] pointer-events-none mix-blend-multiply" style={{ 
            backgroundImage: 'radial-gradient(circle, #0284c7 1px, transparent 1px), linear-gradient(to right, rgba(14,165,233,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(14,165,233,0.18) 1px, transparent 1px)', 
            backgroundSize: '18px 18px',
            backgroundPosition: 'center center'
          }}></div>
          <div className="flex items-center gap-3 relative z-10" style={{ minWidth: 72 }}>
            <img src={logoWebp} alt="ELCOM Logo" className="w-auto object-contain" style={{ height: 'clamp(28px, 4.5vw, 50px)', minHeight: 28, minWidth: 28 }} />
          </div>

            <div className="text-center font-sans relative z-10 flex-1" style={{ minWidth: 0 }}>
            <h1 className="font-black uppercase leading-tight text-center" style={{ fontSize: 'clamp(16px, 1.8vw, 28px)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Field Telephone Set with Magneto and Auto Mode (RFT1001)
            </h1>
            <div className="text-sm tracking-widest mt-1 text-center uppercase" style={{ fontSize: 'clamp(10px, 1.2vw, 13px)' }}>
              INTERACTIVE ELECTRONIC TECHNICAL MANUAL
            </div>
          </div>

          {/* Version top-right */}
          <div className="relative z-10 text-right" style={{ minWidth: 120 }}>
            <div className="text-xs font-mono text-[#0ea5e9] font-semibold">RFT1001 IETM v1.10</div>
          </div>
        </div>

        {/* INNER MENUBAR removed per requirements */}

        {/* WORKSPACE ZONE (SPLIT: NAVIGATION & VIEWING CONTAINER) */}
        <div className="flex-grow flex flex-row overflow-hidden min-h-0 bg-neutral-100 p-3 gap-3">
          
          {/* LEFT COLUMN: NAVIGATION EXPLORER PANEL */}
          <div id="left_nav_panel" ref={navPanelRef} className="relative w-[300px] shrink-0 flex flex-col h-full min-h-0 bg-white border border-neutral-200 rounded-lg p-3 shadow-sm" onMouseLeave={() => { clearHover(); }}>
            <div className="text-[#0ea5e9] text-sm font-bold font-sans tracking-wide border-b border-neutral-100 pb-2 mb-3 uppercase flex items-center gap-2">
              <span className="w-1.5 h-3 bg-[#0ea5e9] rounded-sm inline-block"></span>
              <span>Document Explorer</span>
            </div>
            
            {/* Explorable scrollable tree box */}
            <div className="flex-grow overflow-y-auto pr-1 space-y-1">
              {documentStructure.map(node => renderTreeItem(node))}
            </div>

            {/* Hover info drawer rendered inside nav panel */}
            {hoverInfo && (
              <div
                className={`nav-hover-drawer show`}
                style={{ top: hoverInfo.top, left: hoverInfo.left }}
                role="tooltip"
                aria-live="polite"
              >
                <div className="title">{hoverInfo.title}</div>
                <div className="desc">{hoverInfo.desc}</div>
              </div>
            )}

            {/* Quick terminal quick-stats overview (anchored to bottom) */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-md mt-auto p-3 text-xs font-sans text-left text-neutral-600 space-y-1.5">
              <span className="font-bold text-neutral-800 border-b border-neutral-100 block pb-1 mb-1.5 text-xs uppercase tracking-wider">Active Document</span>
              <div className="text-[#0ea5e9] truncate font-semibold text-[13px]" title={manualsInfo[activeManualId]?.title}>
                {manualsInfo[activeManualId]?.title}
              </div>
              <div className="flex justify-between text-xs pt-1">
                <span className="text-neutral-500">Total Pages:</span>
                <span className="text-neutral-800 font-semibold">{totalPagesInManual}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-500">Current Page:</span>
                <span className="text-neutral-800 font-semibold">
                  {viewMode === 'single' 
                    ? (currentManualPages[currentPageIndex]?.pageNumber ?? '')
                    : (currentManualPages[currentPairIndex * 2 + 1]?.pageNumber 
                        ? `${currentManualPages[currentPairIndex * 2]?.pageNumber} - ${currentManualPages[currentPairIndex * 2 + 1]?.pageNumber}`
                        : (currentManualPages[currentPairIndex * 2]?.pageNumber ?? ''))
                  }
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: PDF VIEWING PLATFORM */}
          <div className="flex-grow flex flex-col overflow-hidden min-h-0 bg-transparent">
            
            {/* VIEWING TOOLBAR - TOP POSITION */}
            <div id="viewer_toolbar" ref={toolbarRef} className="bg-white border border-neutral-200 rounded-lg p-2 gap-2 flex flex-wrap items-center justify-start shrink-0 mb-3 shadow-sm font-sans" style={{ alignContent: 'flex-start' }}>
              {/* GROUP 1: Prev / Page / Next */}
              <div className="viewer-toolbar-group flex items-center gap-2 flex-shrink-0">
              
                <div className="flex items-center gap-2">
                {/* Prev Button */}
                <button 
                  id="prev_page_btn"
                  onClick={handlePrevPage}
                  disabled={viewMode === 'single' ? currentPageIndex === 0 : currentPairIndex === 0}
                  className="flex items-center gap-1 text-sm font-semibold border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-805 disabled:opacity-40 disabled:hover:bg-white h-8 px-3 rounded shadow-sm cursor-pointer disabled:cursor-not-allowed select-none transition-colors duration-150"
                  title="Previous"
                >
                  <ArrowLeft size={13} />
                  <span className="hidden sm:inline">Prev</span>
                </button>

                {/* Current Page numbering */}
                <div className="bg-neutral-50 border border-neutral-200 px-1 h-8 flex items-center justify-center font-sans font-medium text-neutral-700 text-sm rounded select-none text-center whitespace-nowrap" style={{ minWidth: '48px', maxWidth: '90px' }}>
                  {viewMode === 'single' 
                    ? currentManualPages[currentPageIndex]?.pageNumber || ''
                    : `Page ${currentManualPages[currentPairIndex * 2]?.pageNumber || ''}-${currentManualPages[currentPairIndex * 2 + 1]?.pageNumber || currentManualPages[currentPairIndex * 2]?.pageNumber || ''}`
                  }
                </div>

                {/* Next Button */}
                <button 
                  id="next_page_btn"
                  onClick={handleNextPage}
                  disabled={viewMode === 'single' ? currentPageIndex >= totalPagesInManual - 1 : currentPairIndex >= totalPairs - 1}
                  className="flex items-center gap-1 text-sm font-semibold border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-805 disabled:opacity-40 disabled:hover:bg-white h-8 px-3 rounded shadow-sm cursor-pointer disabled:cursor-not-allowed select-none transition-colors duration-150"
                  title="Next"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ArrowRight size={13} />
                </button>
                </div>
              </div>

              {/* GROUP 2: View Mode (Single/Double) */}
              <div className="viewer-toolbar-group flex items-center gap-3 flex-shrink-0">
                {/* View Mode Selection Control */}
                <div className="flex border border-[#e2e8f0] rounded overflow-hidden shadow-sm h-8 select-none font-sans bg-white items-center">
                  <button 
                    onClick={() => handleViewModeChange('single')}
                    className={`px-3 text-sm font-semibold h-full transition-colors ${viewMode === 'single' ? 'bg-[#7dd3fc] text-[#000000] font-bold border-r border-[#38bdf8]' : 'bg-white text-neutral-700 hover:bg-neutral-50'}`}
                    title="Single Page View"
                  >
                    Single Page
                  </button>
                  <div className="w-px h-full bg-neutral-200" />
                  <button 
                    onClick={() => handleViewModeChange('double')}
                    className={`px-3 text-sm font-semibold h-full transition-colors ${viewMode === 'double' ? 'bg-[#7dd3fc] text-[#000000] font-bold border-l border-[#38bdf8]' : 'bg-white text-neutral-700 hover:bg-neutral-50'}`}
                    title="Double Page View"
                  >
                    Double Page
                  </button>
                </div>
              </div>

              {/* GROUP 3: Zoom controls + Reset */}
              <div className="viewer-toolbar-group flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1.5 font-sans">
                  <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Zoom</span>
                  <button 
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 25}
                    className="flex items-center justify-center text-sm border border-neutral-200 bg-white hover:bg-slate-50 text-neutral-800 disabled:opacity-45 disabled:hover:bg-white h-8 w-8 rounded shadow-sm cursor-pointer disabled:cursor-not-allowed transition-colors duration-150"
                    title="Zoom Out"
                  >
                    -
                  </button>
                  <div className="bg-neutral-50 border border-neutral-200 h-8 w-12 flex items-center justify-center font-bold text-neutral-800 text-sm rounded">
                    {zoomLevel}%
                  </div>
                  <button 
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 600}
                    className="flex items-center justify-center text-sm border border-neutral-200 bg-white hover:bg-slate-50 text-neutral-800 disabled:opacity-45 disabled:hover:bg-white h-8 w-8 rounded shadow-sm cursor-pointer disabled:cursor-not-allowed transition-colors duration-150"
                    title="Zoom In"
                  >
                    +
                  </button>
                </div>

                <button 
                  id="reset_zoom_btn"
                  onClick={handleResetZoom}
                  className="flex items-center gap-1.5 text-sm font-semibold border border-neutral-200 bg-white hover:bg-neutral-50 h-8 px-3 rounded shadow-sm cursor-pointer transition-colors duration-150"
                  title="Reset Zoom to 100%"
                >
                  <RotateCcw size={13} />
                  <span>Reset</span>
                </button>
              </div>

              {/* Search function input field */}
              <div className="viewer-toolbar-group flex items-center gap-2 flex-shrink-0">
                <form onSubmit={handleSearchExecute} className="flex items-center gap-1">
                  <div className="relative" style={{ minWidth: 0 }}>
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-400">
                      <Search size={13} />
                    </span>
                    <input 
                      id="search_input"
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search"
                      className="h-8 pl-8 pr-2 border border-neutral-200 rounded text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 font-sans transition-colors w-auto"
                      style={{ minWidth: '48px', maxWidth: '140px' }}
                    />
                  </div>
                  <button 
                    id="search_submit_btn"
                    type="submit" 
                    className="flex items-center gap-1 text-sm font-semibold bg-[#7dd3fc] hover:bg-[#38bdf8] text-[#000000] h-8 px-2 rounded shadow-sm cursor-pointer select-none border border-[#38bdf8] transition-all duration-150 font-bold font-sans"
                    title="Find phrase"
                  >
                    <span>Search</span>
                  </button>
                </form>

                {/* Search result operators */}
                {searchResults.length > 0 && (
                  <div className="flex items-center gap-1 font-sans">
                    <span className="text-sm text-sky-950 font-bold ml-1.5 bg-sky-100/85 px-2.5 py-1 rounded border border-sky-200">
                      {currentSearchIndex + 1} of {searchResults.length}
                    </span>
                    <button 
                      type="button"
                      onClick={() => handleJumpToSearchResult((currentSearchIndex - 1 + searchResults.length) % searchResults.length)}
                      className="flex items-center justify-center border border-neutral-200 bg-white hover:bg-[#f8fafc] text-neutral-800 h-8 w-8 rounded shadow-sm cursor-pointer"
                      title="Prev Match"
                    >
                      ▲
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleJumpToSearchResult((currentSearchIndex + 1) % searchResults.length)}
                      className="flex items-center justify-center border border-neutral-200 bg-white hover:bg-[#f8fafc] text-neutral-800 h-8 w-8 rounded shadow-sm cursor-pointer"
                      title="Next Match"
                    >
                      ▼
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* MAIN PDF VIEW AREA - ACTIVE CHANNELS IN MIDDLE */}
            <div className="flex-grow border border-neutral-200 rounded-lg flex flex-col min-h-0 relative overflow-hidden bg-[#edf0f2]">
              {/* Actual Dual-Page Render Arena */}
                <div 
                ref={scrollContainerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onAuxClick={(e) => { if (e.button === 1) e.preventDefault(); }}
                className={`overflow-auto p-2 relative flex select-none bg-[#edf0f2] flex-grow min-h-0 ${isPanning ? 'cursor-grabbing select-none' : (zoomLevel > 100 ? 'cursor-grab' : '')}`}
                style={{ scrollbarGutter: 'stable', perspective: 1500 }}
              >
                
                {/* Search error alert dialog */}
                {searchError && (
                  <div className="mx-auto my-4 max-w-md bg-white border border-neutral-200 rounded-lg shadow-lg text-sm text-left overflow-hidden z-20">
                    <div className="bg-neutral-50 border-b border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-800 flex justify-between items-center">
                      <span>Search Query Outcome</span>
                      <button onClick={() => setSearchError('')} className="text-neutral-400 hover:text-neutral-600 font-bold">
                        <X size={14} />
                      </button>
                    </div>
                    <div className="p-4 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center font-bold text-sm shrink-0">
                        <ShieldAlert size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-neutral-800 mb-0.5">Database Query Alert</p>
                        <p className="text-neutral-600 line-clamp-2">{searchError}</p>
                      </div>
                    </div>
                    <div className="p-2 px-3 bg-neutral-50 border-t border-neutral-100 flex justify-end">
                      <button onClick={() => setSearchError('')} className="flex items-center justify-center text-sm font-semibold bg-[#7dd3fc] hover:bg-[#38bdf8] text-[#000000] h-7 px-4 rounded shadow-sm cursor-pointer select-none border border-[#38bdf8] transition-colors font-bold font-sans">
                        Close
                      </button>
                    </div>
                  </div>
                )}

                {/* Dynamic Viewport Layout List with Framer Motion Page Turn Transitions */}
                <div className="m-auto min-w-max min-h-max flex justify-center items-center py-2">
                  {viewMode === 'single' ? (
                    <AnimatePresence mode="wait" custom={direction} initial={false}>
                      {currentManualPages[currentPageIndex] && (
                        <motion.div
                          key={isDraggingSlider ? `${activeManualId}-dragging` : `${activeManualId}-${currentPageIndex}`}
                          custom={{ direction, isDraggingSlider }}
                          variants={pageVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          className="flex flex-col justify-center items-center"
                        >
                          <div 
                            className={isPdfManual ? "relative select-text" : "bg-white border border-neutral-200 text-black p-8 text-left relative flex flex-col justify-between rounded-md shadow-md"}
                            style={isPdfManual ? { 
                              width: `${PDF_BASE_WIDTH * (zoomLevel / 100)}px`
                            } : { 
                              width: `${PDF_BASE_WIDTH * (zoomLevel / 100)}px`, 
                              minHeight: `${540 * (zoomLevel / 100)}px`,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)'
                            }}
                          >
                            {isPdfManual ? (
                              loadingManuals[activeManualId] ? (
                                <div className="flex-grow flex flex-col items-center justify-center text-xs font-mono text-neutral-500 py-20 min-h-[400px]">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0ea5e9] mb-4"></div>
                                  <span>LOADING ACTUAL PDF...</span>
                                </div>
                              ) : pdfDocsMap[activeManualId] ? (
                                <div className="flex-grow flex flex-col min-h-0 w-full h-full">
                                  <div className="flex-grow flex items-center justify-center min-h-0 w-full h-full relative">
                                    <PdfPageRenderer 
                                      pdfDoc={pdfDocsMap[activeManualId]}
                                      pageNumber={currentManualPages[currentPageIndex].pageNumber}
                                      zoomLevel={zoomLevel}
                                      activeSearchTerm={activeSearchTerm}
                                      activeMatchIndexOnPage={
                                        selectedResult && selectedResult.pageNumber === currentManualPages[currentPageIndex].pageNumber
                                          ? searchResults.slice(0, currentSearchIndex).filter(r => r.pageNumber === currentManualPages[currentPageIndex].pageNumber).length
                                          : -1
                                      }
                                      width={PDF_BASE_WIDTH}
                                      padding={0}
                                    />
                                    {/* OCR text overlay */}
                                    {currentManualPages[currentPageIndex]?.isImageBased && currentManualPages[currentPageIndex]?.paragraphs && currentManualPages[currentPageIndex]?.paragraphs.length > 0 && activeSearchTerm && (
                                      <div className="absolute inset-x-2 bottom-2 bg-neutral-900/95 text-white p-2.5 rounded shadow-lg font-sans text-[10px] leading-normal z-20 max-h-28 overflow-y-auto border border-neutral-700 text-left select-text">
                                        <div className="text-[9px] font-mono font-bold text-yellow-400 mb-1 flex justify-between">
                                          <span>OCR TEXT CONTENT (SCANNED PAGE)</span>
                                          <span>{currentManualPages[currentPageIndex].paragraphs.filter(p => p.toLowerCase().includes(activeSearchTerm.toLowerCase())).length} occurrences</span>
                                        </div>
                                        <div className="space-y-1">
                                          {currentManualPages[currentPageIndex].paragraphs.map((line, lIdx) => {
                                            if (!line.toLowerCase().includes(activeSearchTerm.toLowerCase())) return null;
                                            return (
                                              <div key={lIdx} className="border-l-2 border-yellow-400 pl-1.5 py-0.5">
                                                {highlightMatches(line, activeSearchTerm, isSelectedResult(currentManualPages[currentPageIndex].pageNumber, 'Technical Body', line))}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex-grow flex items-center justify-center text-xs text-red-500 font-semibold min-h-[400px]">
                                  Failed to load PDF document
                                </div>
                              )
                            ) : (
                              <div>
                                <div className="border-b border-gray-800 pb-2 mb-4 flex justify-between items-center text-[10px] font-mono text-gray-500">
                                  <span>ELCOM RFT1001 IETM</span>
                                  <span>P. {currentManualPages[currentPageIndex].pageNumber}</span>
                                </div>

                                <h2 className="text-xs font-mono font-bold text-gray-900 tracking-wide mb-1">
                                  {highlightMatches(currentManualPages[currentPageIndex].sectionTitle, activeSearchTerm)}
                                </h2>
                                {currentManualPages[currentPageIndex].subTitle && (
                                  <h3 className="text-[11px] font-mono text-blue-900 border-b border-dashed border-gray-300 pb-1 mb-3">
                                    {highlightMatches(currentManualPages[currentPageIndex].subTitle, activeSearchTerm)}
                                  </h3>
                                )}

                                <div className="space-y-3 font-serif text-[11px] leading-relaxed text-gray-800 text-justify">
                                  {currentManualPages[currentPageIndex].paragraphs.map((p, pIdx) => (
                                    <p key={pIdx}>
                                      {highlightMatches(p, activeSearchTerm)}
                                    </p>
                                  ))}
                                </div>

                                {currentManualPages[currentPageIndex].diagramType && (
                                  <div className="mt-4">
                                    <EngineeringDiagram type={currentManualPages[currentPageIndex].diagramType} />
                                  </div>
                                )}

                                {currentManualPages[currentPageIndex].table && (
                                  <div className="mt-4 win-border-sunken bg-white p-1 overflow-x-auto">
                                    <table className="w-full text-left font-mono text-[9px] border-collapse min-w-[300px]">
                                      <thead>
                                        <tr className="bg-gray-200 text-gray-900 border-b border-gray-400 font-bold">
                                          {currentManualPages[currentPageIndex].table.headers.map((h, hIdx) => (
                                            <th key={hIdx} className="p-1 px-1.5 border border-gray-300">{h}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {currentManualPages[currentPageIndex].table.rows.map((row, rIdx) => (
                                          <tr key={rIdx} className="hover:bg-blue-50 border-b border-gray-200">
                                            {row.map((cell, cIdx) => (
                                              <td key={cIdx} className="p-1 px-1.5 border border-gray-200 text-gray-800">
                                                {highlightMatches(cell, activeSearchTerm)}
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            )}

                            {!isPdfManual && (
                              <div className="border-t border-gray-300 pt-2 mt-4 text-[9px] font-mono text-gray-400 flex justify-between select-none">
                                <span>CONFIDENTIAL - MIL-USE</span>
                                <span>ELCOM INNOVATIONS</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  ) : (
                    <AnimatePresence mode="wait" custom={direction} initial={false}>
                      <motion.div
                        key={isDraggingSlider ? `${activeManualId}-dragging` : `${activeManualId}-${currentPairIndex}`}
                        custom={{ direction, isDraggingSlider }}
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="flex flex-row justify-center items-stretch gap-6"
                      >
                        {/* PAGE A */}
                        {currentManualPages[currentPairIndex * 2] && (
                          <div 
                            className={isPdfManual ? "relative select-text" : "bg-white border border-neutral-200 text-black p-8 text-left relative flex flex-col justify-between rounded-md shadow-md"}
                            style={isPdfManual ? { 
                              width: `${PDF_BASE_WIDTH * (zoomLevel / 100)}px`
                            } : { 
                              width: `${PDF_BASE_WIDTH * (zoomLevel / 100)}px`, 
                              minHeight: `${540 * (zoomLevel / 100)}px`,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)'
                            }}
                          >
                            {isPdfManual ? (
                              loadingManuals[activeManualId] ? (
                                <div className="flex-grow flex flex-col items-center justify-center text-xs font-mono text-neutral-500 py-20 min-h-[400px]">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0ea5e9] mb-4"></div>
                                  <span>LOADING...</span>
                                </div>
                              ) : pdfDocsMap[activeManualId] ? (
                                <div className="flex-grow flex flex-col min-h-0 w-full h-full">
                                  <div className="flex-grow flex items-center justify-center min-h-0 w-full h-full relative">
                                    <PdfPageRenderer 
                                      pdfDoc={pdfDocsMap[activeManualId]}
                                      pageNumber={currentManualPages[currentPairIndex * 2].pageNumber}
                                      zoomLevel={zoomLevel}
                                      activeSearchTerm={activeSearchTerm}
                                      activeMatchIndexOnPage={
                                        selectedResult && selectedResult.pageNumber === currentManualPages[currentPairIndex * 2].pageNumber
                                          ? searchResults.slice(0, currentSearchIndex).filter(r => r.pageNumber === currentManualPages[currentPairIndex * 2].pageNumber).length
                                          : -1
                                      }
                                      width={PDF_BASE_WIDTH}
                                      padding={0}
                                    />
                                    {/* OCR text overlay */}
                                    {currentManualPages[currentPairIndex * 2]?.isImageBased && currentManualPages[currentPairIndex * 2]?.paragraphs && currentManualPages[currentPairIndex * 2]?.paragraphs.length > 0 && activeSearchTerm && (
                                      <div className="absolute inset-x-2 bottom-2 bg-neutral-900/95 text-white p-2.5 rounded shadow-lg font-sans text-[10px] leading-normal z-20 max-h-28 overflow-y-auto border border-neutral-700 text-left select-text">
                                        <div className="text-[9px] font-mono font-bold text-yellow-400 mb-1 flex justify-between">
                                          <span>OCR TEXT CONTENT (SCANNED PAGE)</span>
                                          <span>{currentManualPages[currentPairIndex * 2].paragraphs.filter(p => p.toLowerCase().includes(activeSearchTerm.toLowerCase())).length} occurrences</span>
                                        </div>
                                        <div className="space-y-1">
                                          {currentManualPages[currentPairIndex * 2].paragraphs.map((line, lIdx) => {
                                            if (!line.toLowerCase().includes(activeSearchTerm.toLowerCase())) return null;
                                            return (
                                              <div key={lIdx} className="border-l-2 border-yellow-400 pl-1.5 py-0.5">
                                                {highlightMatches(line, activeSearchTerm, isSelectedResult(currentManualPages[currentPairIndex * 2].pageNumber, 'Technical Body', line))}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex-grow flex items-center justify-center text-xs text-red-500 font-semibold min-h-[400px]">
                                  Failed to load PDF document
                                </div>
                              )
                            ) : (
                              <div>
                                <div className="border-b border-gray-800 pb-2 mb-4 flex justify-between items-center text-[10px] font-mono text-gray-500">
                                  <span>ELCOM RFT1001 IETM</span>
                                  <span>P. {currentManualPages[currentPairIndex * 2].pageNumber}</span>
                                </div>

                                <h2 className="text-xs font-mono font-bold text-gray-900 tracking-wide text-left mb-1">
                                  {highlightMatches(currentManualPages[currentPairIndex * 2].sectionTitle, activeSearchTerm)}
                                </h2>
                                {currentManualPages[currentPairIndex * 2].subTitle && (
                                  <h3 className="text-[11px] font-mono text-blue-900 border-b border-dashed border-gray-300 pb-1 mb-3">
                                    {highlightMatches(currentManualPages[currentPairIndex * 2].subTitle, activeSearchTerm)}
                                  </h3>
                                )}

                                <div className="space-y-3 font-serif text-[11px] leading-relaxed text-gray-800 text-justify">
                                  {currentManualPages[currentPairIndex * 2].paragraphs.map((p, pIdx) => (
                                    <p key={pIdx}>
                                      {highlightMatches(p, activeSearchTerm)}
                                    </p>
                                  ))}
                                </div>

                                {currentManualPages[currentPairIndex * 2].diagramType && (
                                  <div className="mt-4">
                                    <EngineeringDiagram type={currentManualPages[currentPairIndex * 2].diagramType} />
                                  </div>
                                )}

                                {currentManualPages[currentPairIndex * 2].table && (
                                  <div className="mt-4 win-border-sunken bg-white p-1 overflow-x-auto">
                                    <table className="w-full text-left font-mono text-[9px] border-collapse min-w-[300px]">
                                      <thead>
                                        <tr className="bg-gray-200 text-gray-900 border-b border-gray-400 font-bold">
                                          {currentManualPages[currentPairIndex * 2].table.headers.map((h, hIdx) => (
                                            <th key={hIdx} className="p-1 px-1.5 border border-gray-300">{h}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {currentManualPages[currentPairIndex * 2].table.rows.map((row, rIdx) => (
                                          <tr key={rIdx} className="hover:bg-blue-50 border-b border-gray-200">
                                            {row.map((cell, cIdx) => (
                                              <td key={cIdx} className="p-1 px-1.5 border border-gray-200 text-gray-800">
                                                {highlightMatches(cell, activeSearchTerm)}
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            )}

                            {!isPdfManual && (
                              <div className="border-t border-gray-300 pt-2 mt-4 text-[9px] font-mono text-gray-400 flex justify-between select-none">
                                <span>CONFIDENTIAL - MIL-USE</span>
                                <span>ELCOM INNOVATIONS</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* PAGE B */}
                        {currentManualPages[currentPairIndex * 2 + 1] ? (
                          <div 
                            className={isPdfManual ? "relative select-text" : "bg-white border border-neutral-200 text-black p-8 text-left relative flex flex-col justify-between rounded-md shadow-md"}
                            style={isPdfManual ? { 
                              width: `${PDF_BASE_WIDTH * (zoomLevel / 100)}px`
                            } : { 
                              width: `${PDF_BASE_WIDTH * (zoomLevel / 100)}px`, 
                              minHeight: `${540 * (zoomLevel / 100)}px`,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)'
                            }}
                          >
                            {isPdfManual ? (
                              loadingManuals[activeManualId] ? (
                                <div className="flex-grow flex flex-col items-center justify-center text-xs font-mono text-neutral-500 py-20 min-h-[400px]">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0ea5e9] mb-4"></div>
                                  <span>LOADING...</span>
                                </div>
                              ) : pdfDocsMap[activeManualId] ? (
                                <div className="flex-grow flex flex-col min-h-0 w-full h-full">
                                  <div className="flex-grow flex items-center justify-center min-h-0 w-full h-full relative">
                                    <PdfPageRenderer 
                                      pdfDoc={pdfDocsMap[activeManualId]}
                                      pageNumber={currentManualPages[currentPairIndex * 2 + 1].pageNumber}
                                      zoomLevel={zoomLevel}
                                      activeSearchTerm={activeSearchTerm}
                                      activeMatchIndexOnPage={
                                        selectedResult && selectedResult.pageNumber === currentManualPages[currentPairIndex * 2 + 1].pageNumber
                                          ? searchResults.slice(0, currentSearchIndex).filter(r => r.pageNumber === currentManualPages[currentPairIndex * 2 + 1].pageNumber).length
                                          : -1
                                      }
                                      width={PDF_BASE_WIDTH}
                                      padding={0}
                                    />
                                    {/* OCR text overlay */}
                                    {currentManualPages[currentPairIndex * 2 + 1]?.isImageBased && currentManualPages[currentPairIndex * 2 + 1]?.paragraphs && currentManualPages[currentPairIndex * 2 + 1]?.paragraphs.length > 0 && activeSearchTerm && (
                                      <div className="absolute inset-x-2 bottom-2 bg-neutral-900/95 text-white p-2.5 rounded shadow-lg font-sans text-[10px] leading-normal z-20 max-h-28 overflow-y-auto border border-neutral-700 text-left select-text">
                                        <div className="text-[9px] font-mono font-bold text-yellow-400 mb-1 flex justify-between">
                                          <span>OCR TEXT CONTENT (SCANNED PAGE)</span>
                                          <span>{currentManualPages[currentPairIndex * 2 + 1].paragraphs.filter(p => p.toLowerCase().includes(activeSearchTerm.toLowerCase())).length} occurrences</span>
                                        </div>
                                        <div className="space-y-1">
                                          {currentManualPages[currentPairIndex * 2 + 1].paragraphs.map((line, lIdx) => {
                                            if (!line.toLowerCase().includes(activeSearchTerm.toLowerCase())) return null;
                                            return (
                                              <div key={lIdx} className="border-l-2 border-yellow-400 pl-1.5 py-0.5">
                                                {highlightMatches(line, activeSearchTerm, isSelectedResult(currentManualPages[currentPairIndex * 2 + 1].pageNumber, 'Technical Body', line))}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex-grow flex items-center justify-center text-xs text-red-500 font-semibold min-h-[400px]">
                                  Failed to load PDF document
                                </div>
                              )
                            ) : (
                              <div>
                                <div className="border-b border-gray-800 pb-2 mb-4 flex justify-between items-center text-[10px] font-mono text-gray-500">
                                  <span>ELCOM RFT1001 IETM</span>
                                  <span>P. {currentManualPages[currentPairIndex * 2 + 1].pageNumber}</span>
                                </div>

                                <h2 className="text-xs font-mono font-bold text-gray-900 tracking-wide text-left mb-1">
                                  {highlightMatches(currentManualPages[currentPairIndex * 2 + 1].sectionTitle, activeSearchTerm)}
                                </h2>
                                {currentManualPages[currentPairIndex * 2 + 1].subTitle && (
                                  <h3 className="text-[11px] font-mono text-blue-900 border-b border-dashed border-gray-300 pb-1 mb-3">
                                    {highlightMatches(currentManualPages[currentPairIndex * 2 + 1].subTitle, activeSearchTerm)}
                                  </h3>
                                )}

                                <div className="space-y-3 font-serif text-[11px] leading-relaxed text-gray-800 text-justify">
                                  {currentManualPages[currentPairIndex * 2 + 1].paragraphs.map((p, pIdx) => (
                                    <p key={pIdx}>
                                      {highlightMatches(p, activeSearchTerm)}
                                    </p>
                                  ))}
                                </div>

                                {currentManualPages[currentPairIndex * 2 + 1].diagramType && (
                                  <div className="mt-4">
                                    <EngineeringDiagram type={currentManualPages[currentPairIndex * 2 + 1].diagramType} />
                                  </div>
                                )}

                                {currentManualPages[currentPairIndex * 2 + 1].table && (
                                  <div className="mt-4 win-border-sunken bg-white p-1 overflow-x-auto">
                                    <table className="w-full text-left font-mono text-[9px] border-collapse min-w-[300px]">
                                      <thead>
                                        <tr className="bg-gray-200 text-gray-900 border-b border-gray-400 font-bold">
                                          {currentManualPages[currentPairIndex * 2 + 1].table.headers.map((h, hIdx) => (
                                            <th key={hIdx} className="p-1 px-1.5 border border-gray-300">{h}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {currentManualPages[currentPairIndex * 2 + 1].table.rows.map((row, rIdx) => (
                                          <tr key={rIdx} className="hover:bg-blue-50 border-b border-gray-200">
                                            {row.map((cell, cIdx) => (
                                              <td key={cIdx} className="p-1 px-1.5 border border-gray-200 text-gray-800">
                                                {highlightMatches(cell, activeSearchTerm)}
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            )}

                            {!isPdfManual && (
                              <div className="border-t border-gray-300 pt-2 mt-4 text-[9px] font-mono text-gray-400 flex justify-between select-none">
                                <span>CONFIDENTIAL - MIL-USE</span>
                                <span>ELCOM INNOVATIONS</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Blank Page placeholder to preserve exact book styling for odd pagination if any */
                          <div 
                            className="bg-gray-400/20 border border-neutral-200 flex items-center justify-center text-gray-400 font-mono text-xs rounded-md shadow-md"
                            style={{ 
                              width: `${PDF_BASE_WIDTH * (zoomLevel / 100)}px`, 
                              minHeight: `${540 * (zoomLevel / 100)}px` 
                            }}
                          >
                            [ END OF VOLUME ]
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>

              </div>

            </div>

            {/* BOTTOM HORIZONTAL DRAGGABLE RAPID-NAVIGATION TRACK */}
            <div ref={bottomTrackRef} className="bg-white border-t border-neutral-200 px-3 py-1.5 mx-0 mb-0 shadow-sm select-none font-sans shrink-0">
              <div className="relative w-full h-[12px] flex items-center">
                {/* Unfilled background track */}
                <div className="absolute inset-x-0 h-[3px] bg-neutral-200 rounded-full pointer-events-none" />

                {/* Colored active fill track */}
                <div 
                  className="h-[3px] bg-[#0ea5e9] rounded-full pointer-events-none absolute left-0" 
                  style={{ 
                    width: `${(sliderValue / Math.max(1, totalPagesInManual - 1)) * 100}%` 
                  }}
                />

                {/* Range Slider control */}
                <input 
                  type="range"
                  min={0}
                  max={totalPagesInManual - 1}
                  step={0.01}
                  value={sliderValue}
                  onMouseDown={() => setIsDraggingSlider(true)}
                  onTouchStart={() => setIsDraggingSlider(true)}
                  onMouseUp={() => {
                    setIsDraggingSlider(false);
                    handleDirectPageJump(Math.round(sliderValue));
                  }}
                  onTouchEnd={() => {
                    setIsDraggingSlider(false);
                    handleDirectPageJump(Math.round(sliderValue));
                  }}
                  onChange={(e) => {
                    const floatVal = parseFloat(e.target.value);
                    setSliderValue(floatVal);
                    React.startTransition(() => {
                      handleDirectPageJump(Math.round(floatVal));
                    });
                  }}
                  className="custom-slider absolute w-full h-[24px] opacity-100 appearance-none bg-transparent cursor-pointer left-0 top-1/2 -translate-y-1/2"
                  style={{
                    WebkitAppearance: 'none'
                  }}
                />
              </div>
            </div>

            {/* LOWER STATUS STRIP */}
            <div id="lower_status_bar" ref={lowerStatusRef} className="bg-neutral-50 border-t border-neutral-200 p-1.5 flex justify-end font-sans text-xs text-neutral-500 shrink-0 select-none rounded-b-lg">
              <div className="border border-neutral-200 rounded-md bg-white px-3 py-1 font-bold text-[#0ea5e9] shadow-sm flex items-center">
                {/* footer version removed per requirements */}
              </div>
            </div>

          </div>

        </div>

      </div>
    );
  };

  // Cancel speech on unmount and ensure no overlapping speech
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
      }
    };
  }, []);

  // Removed manual measurement and resize handlers. Layout now uses CSS flexbox and
  // relative sizing so panels remain stable during window resize.

  return (
    <div className={`min-h-screen overflow-hidden select-none ${showMainApp ? 'bg-neutral-100' : 'bg-white'}`}>
      {showMainApp ? MainViewerScreen() : IntroScreen()}
    </div>
  );
}
