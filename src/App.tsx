import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
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
// @ts-ignore: Vite-style worker URL import
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Volume2, Plus, Minus } from "lucide-react";

// Asset URLs via Vite's import meta URL to ensure correct production paths
const logoImg = new URL('./assets/images/logo-1.png', import.meta.url).href;
const logoWebp = new URL('./assets/images/logo.webp', import.meta.url).href;
const phoneImg = new URL('./assets/images/phone.webp', import.meta.url).href;
const headerBg = new URL('./assets/images/header.webp', import.meta.url).href;


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

        // Render at device pixel ratio to keep canvas crisp on high-DPI displays
        const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
        const cssViewport = page.getViewport({ scale: scale });
        const renderViewport = page.getViewport({ scale: scale * dpr });

        // Use higher-resolution backing store while keeping CSS size equal to logical viewport
        canvas.width = Math.round(renderViewport.width);
        canvas.height = Math.round(renderViewport.height);
        canvas.style.width = `${Math.round(cssViewport.width)}px`;
        canvas.style.height = `${Math.round(cssViewport.height)}px`;

        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const renderContext = {
          canvasContext: ctx,
          viewport: renderViewport
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
          
          const scaleX = cssViewport.width / pdfPageWidth;
          const scaleY = cssViewport.height / pdfPageHeight;
          
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
                className={`absolute rounded-sm pointer-events-none ${
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
  const [speechVolume, setSpeechVolume] = useState(1.0);
  const [totalPages, setTotalPages] = useState(0);
  
  // container-based measurement for PDF layout (replaces window-based PDF_BASE_WIDTH)
  
  const pdfContainerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const safeContainerWidth = containerWidth || 800;
  const VIEW_FIT = {
    single: 1.25,
    double: 0.5,
  };

  // Measurement useLayoutEffect moved below after viewMode declaration to avoid TDZ


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

    // Audio settings
    u.volume = speechVolume; // Controlled by header buttons
    u.rate = 1.0;
    u.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();

    const preferred =
      voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en')) ||
      voices[0];

    if (preferred) {
      u.voice = preferred;
    }

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



const increaseVolume = () => {
  setSpeechVolume(prev => Math.min(1, prev + 0.1));
};

const decreaseVolume = () => {
  setSpeechVolume(prev => Math.max(0, prev - 0.1));
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

  // PDF Viewer View State (per-document)
  const [viewModes, setViewModes] = useState<Record<string, 'single' | 'double'>>({});
  const currentViewMode = (activeManualId ? viewModes[activeManualId] : undefined) as 'single' | 'double' | undefined;
  console.log("VIEW_MODE:", currentViewMode);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  // Remove pagination indices: we use continuous vertical scroll instead
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  // Measure the actual rendered container width and keep it in sync.
  // Use ResizeObserver so measurements run when the viewer mounts (e.g. after intro screen)
  useLayoutEffect(() => {
    const update = () => {
      if (pdfContainerRef.current) {
        setContainerWidth(pdfContainerRef.current.clientWidth);
      }
    };

    // Call once if available
    update();

    const ro = new ResizeObserver(() => {
      update();
    });

    if (pdfContainerRef.current) {
      try { ro.observe(pdfContainerRef.current); } catch (e) {}
    }

    const onWin = () => update();
    window.addEventListener('resize', onWin);

    return () => {
      window.removeEventListener('resize', onWin);
      try { ro.disconnect(); } catch (e) {}
    };
  }, [showMainApp]); // re-run when viewer becomes visible so initial measurement is accurate

  // Mouse middle-click pan state & refs
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const scrollStartRef = useRef({ left: 0, top: 0 });
  const panOriginRef = useRef({ x: 0, y: 0 });
  const panLayerRef = useRef<HTMLDivElement | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Reset panning status and handle global window mouseup to release panning mode cleanly
  useEffect(() => {
    const handleGlobalMouseUp = (e: MouseEvent) => {
      // Release panning on any mouseup (left or middle)
      setIsPanning(false);
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
    if (isDraggingSlider) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const updateFromScroll = () => {
      const pages = Array.from(container.querySelectorAll('[data-page-number]')) as HTMLElement[];
      if (!pages || pages.length === 0) return;

      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.top + (containerRect.height / 2);

      let closestIdx = 0;
      let minDist = Infinity;

      pages.forEach((el, idx) => {
        const elRect = el.getBoundingClientRect();
        const elCenter = elRect.top + (elRect.height / 2);
        const dist = Math.abs(elCenter - containerCenter);
        if (dist < minDist) {
          minDist = dist;
          closestIdx = idx;
        }
      });

      setSliderValue(closestIdx);
    };

    updateFromScroll();
    const intervalId = window.setInterval(updateFromScroll, 250);
    return () => clearInterval(intervalId);
  }, [currentViewMode, totalPagesInManual, isDraggingSlider]);
  

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
        const numPages = pdf.numPages;
        setTotalPages(numPages);

        // defer UI mode change safely
        // Ensure this document has a view mode set (default to 'single' for all manuals)
        setViewModes(prev => {
          if (prev[activeManualId]) return prev;
          return { ...prev, [activeManualId]: 'single' };
        });

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

  // Reset pan whenever the active manual changes or zoom/layout changes
  useEffect(() => {
    setPan({ x: 0, y: 0 });
    panOriginRef.current = { x: 0, y: 0 };
  }, [activeManualId, zoomLevel, containerWidth, currentViewMode]);

  // Ensure each document has a view mode entry when selected
  useEffect(() => {
    if (!activeManualId) return;
    if (viewModes[activeManualId]) return;

    const pages = pdfPagesMap[activeManualId];
    if (pages && pages.length > 0) {
      setViewModes(prev => ({ ...prev, [activeManualId]: 'single' }));
    }
  }, [activeManualId, pdfPagesMap, viewModes]);

  // When changing active manual, reset page views and clear search
  const handleSelectManual = (manualId: string) => {
    console.log('[DOCS] handleSelectManual clicked:', manualId, 'pdfMapping has key?', Object.prototype.hasOwnProperty.call(pdfMapping, manualId));
    console.log('[DOCS] pdfMapping value:', pdfMapping[manualId]);
    // Reset view mode for this manual explicitly so it does not carry over from previous manuals
    // Default all manuals to 'single' view on selection
    setViewModes(prev => ({ ...prev, [manualId]: 'single' }));
    setActiveManualId(manualId);
    setSearchQuery('');
    setActiveSearchTerm('');
    setSearchResults([]);
    setCurrentSearchIndex(-1);
    setSearchError('');
    setIsPanning(false);
    // Reset vertical scroll and pan transform (no horizontal scrolling used anymore)

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

  // Reset scroll when manual changes and keep slider synced to scroll position
  useEffect(() => {
    const container = scrollContainerRef.current;

  }, [activeManualId, isDraggingSlider, totalPagesInManual, currentViewMode, containerWidth, zoomLevel]);

  // Handle standard viewport scroll tracking is now optional as only the active page spread is rendered
  const handleViewerScroll = () => {
    // Scroll event tracking disabled for active spread mode
  };

  // Immediate view mode transition handler
  const handleViewModeChange = (mode: 'single' | 'double') => {
    if (!activeManualId) return;
    // Prevent enabling double view on single-page PDFs
    const pagesForManual = pdfPagesMap[activeManualId];
    if (mode === 'double' && pagesForManual && pagesForManual.length === 1) return;
    setViewModes(prev => ({ ...prev, [activeManualId]: mode }));

    setZoomLevel(100);

  };
  // Page navigation controls (previous / next) using existing scroll container
  const handlePrevPage = () => {
    if (!scrollContainerRef.current || !currentManualPages || currentManualPages.length === 0) return;
    const curIdx = Math.min(Math.max(0, sliderValue), currentManualPages.length - 1);
    const targetIdx = Math.max(0, curIdx - 1);
    const targetPage = currentManualPages[targetIdx];
    if (!targetPage) return;
    const container = scrollContainerRef.current;
    const el = container.querySelector(`[data-page-number="${targetPage.pageNumber}"]`) as HTMLElement | null;
    if (el) {
      setSliderValue(targetIdx);
    }
  };

  const handleNextPage = () => {
    if (!scrollContainerRef.current || !currentManualPages || currentManualPages.length === 0) return;
    const curIdx = Math.min(Math.max(0, sliderValue), currentManualPages.length - 1);
    const targetIdx = Math.min(currentManualPages.length - 1, curIdx + 1);
    const targetPage = currentManualPages[targetIdx];
    if (!targetPage) return;
    const container = scrollContainerRef.current;
    const el = container.querySelector(`[data-page-number="${targetPage.pageNumber}"]`) as HTMLElement | null;
    if (el) {
      setSliderValue(targetIdx);
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
        const target = pdfContainerRef.current?.querySelector(`[data-page-number="${currentManualPages[foundIdx].pageNumber}"]`);
        if (target && scrollContainerRef.current) {
          (target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setSliderValue(foundIdx);
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
        // Scroll the found page into view in the vertical container
        const target = pdfContainerRef.current?.querySelector(`[data-page-number="${currentManualPages[foundIdx].pageNumber}"]`);
        if (target && scrollContainerRef.current) {
          (target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        // update sliderValue optimistically
        setSliderValue(foundIdx);
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
    const page = currentManualPages[Math.max(0, Math.min(pageIdx, currentManualPages.length - 1))];
    if (!page) return;
    const target = pdfContainerRef.current?.querySelector(`[data-page-number="${page.pageNumber}"]`);
    if (target && scrollContainerRef.current) {
      (target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Mouse drag panning handlers (left-click while zoomed in, and middle-click remain supported)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Left button (0) when zoomed in should start panning
    const isLeft = e.button === 0;
    const isMiddle = e.button === 1;
    const canPanWithLeft = zoomLevel > 100; // only enable left-drag panning when zoomed
    if (isMiddle || (isLeft && canPanWithLeft)) {
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY };
      panOriginRef.current = { x: pan.x, y: pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning || !scrollContainerRef.current) return;
    e.preventDefault();
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;

    // compute content and viewport sizes
    const viewportW = scrollContainerRef.current.clientWidth;
    const viewportH = scrollContainerRef.current.clientHeight;

    const PAGE_GAP_PX = 20;
    let contentW = 0;
    if (currentViewMode === 'single') {
      const baseWidth = isPdfManual ? safeContainerWidth : safeContainerWidth;
      contentW = baseWidth * (zoomLevel / 100);
    } else {
      const baseSingle = isPdfManual ? (safeContainerWidth * VIEW_FIT.double) : safeContainerWidth;
      contentW = (baseSingle * (zoomLevel / 100)) * 2 + PAGE_GAP_PX;
    }

    const contentH = scrollContainerRef.current.scrollHeight;

    const minPanX = Math.min(0, viewportW - contentW);
    const maxPanX = 0;
    const minPanY = Math.min(0, viewportH - contentH);
    const maxPanY = 0;

    let newX = panOriginRef.current.x + dx;
    let newY = panOriginRef.current.y + dy;

    if (newX < minPanX) newX = minPanX;
    if (newX > maxPanX) newX = maxPanX;
    if (newY < minPanY) newY = minPanY;
    if (newY > maxPanY) newY = maxPanY;

    setPan({ x: newX, y: newY });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    // Stop panning on mouse release (any button)
    setIsPanning(false);
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
        <img src={logoWebp} alt="ELCOM Logo" className="w-auto object-contain" style={{ height: 'clamp(48px, 7vw, 95px)', whiteSpace: 'nowrap' ,transform: 'translateY(-170px)'}} />

        <div style={{ width: '100%', maxWidth: 720 }} className="flex flex-col items-center text-center space-y-3">
          <a href="http://www.elcominnovations.com" target="_blank" rel="noopener noreferrer" className="font-medium" style={{ whiteSpace: 'nowrap', fontSize: 'clamp(1px, 2.2vw, 30px)' ,transform: 'translateY(-190px)' }}>www.elcominnovations.com</a>

          <h2 className="font-black" style={{ fontSize: 'clamp(20px, 2.6vw, 30px)', whiteSpace: 'nowrap', margin: 0 }}>Interactive Electronic Technical Manual (IETM)</h2>

          <div style={{ fontStyle: 'italic', fontSize: 'clamp(12px, 1.4vw, 14px)', whiteSpace: 'nowrap' ,marginTop: '16px' ,marginBottom: '16px' }}>for</div>

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

    // Compute page label for toolbar (single vs double view)
    const isSinglePdf = isPdfManual && pdfPagesMap[activeManualId] && pdfPagesMap[activeManualId].length === 1;
    let pageLabel = '';
    if (!currentManualPages || currentManualPages.length === 0) {
      pageLabel = `Page 0 of 0`;
    } else {
      const curIdx = Math.min(Math.max(0, sliderValue), currentManualPages.length - 1);
      if (currentViewMode === 'single' || isSinglePdf) {
        const p = currentManualPages[curIdx].pageNumber;
        pageLabel = `Page ${p} of ${totalPagesInManual}`;
      } else {
        const firstNum = currentManualPages[curIdx].pageNumber;
        let secondNum: number | undefined = undefined;
        if (curIdx < currentManualPages.length - 1) {
          secondNum = currentManualPages[curIdx + 1].pageNumber;
        } else if (curIdx > 0) {
          secondNum = currentManualPages[curIdx - 1].pageNumber;
        } else {
          secondNum = firstNum;
        }
        const start = Math.min(firstNum, secondNum);
        const end = Math.max(firstNum, secondNum);
        pageLabel = start === end ? `Page ${start} of ${totalPagesInManual}` : `Page ${start}-${end} of ${totalPagesInManual}`;
      }
    }

    return (
      <div id="main_ietm_interface" className="h-screen w-screen flex flex-col bg-neutral-100 font-sans overflow-hidden">
        
        {/* FIXED TOP WINDOW TITLE BAR - MODERN ENTERPRISE HEADER */}
        <div
          id="retro_top_header"
          ref={headerRef}
          className="relative overflow-hidden text-[#000000] px-4 py-2 flex items-center justify-between text-sm font-semibold shrink-0 select-none shadow-md border-b border-sky-400/50"
          style={{
            backgroundImage: `url('${headerBg}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Subtle Technical/Engineering Blueprints Grid Mesh */}
          <div
            className="absolute inset-0 opacity-[0.20] pointer-events-none mix-blend-multiply"
            style={{
              backgroundImage:
                'radial-gradient(circle, #0284c7 1px, transparent 1px), linear-gradient(to right, rgba(14,165,233,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(14,165,233,0.18) 1px, transparent 1px)',
              backgroundSize: '18px 18px',
              backgroundPosition: 'center center'
            }}
          />

          {/* Logo */}
          <div
            className="flex items-center gap-3 relative z-10"
            style={{ minWidth: 72 }}
          >
            <img
              src={logoWebp}
              alt="ELCOM Logo"
              className="w-auto object-contain"
              style={{
                height: 'clamp(28px, 3.5vw, 50px)',
                minHeight: 28,
                minWidth: 28,
                margin: '25px',
                transform: 'translateY(0px)'
              }}
            />
          </div>

          {/* Center Title */}
          <div
            className="text-center font-sans relative z-10 flex-1"
            style={{ minWidth: 0 }}
          >
            <h1
              className="font-black uppercase leading-tight text-center"
              style={{
                fontSize: 'clamp(16px, 1.8vw, 28px)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              INTERACTIVE ELECTRONIC TECHNICAL MANUAL
            </h1>

            <div
              className="text-sm tracking-widest mt-1 text-center uppercase"
              style={{
                fontSize: 'clamp(10px, 1.5vw, 16px)',
                color: '#e67339',
                textShadow: '0px 0px 8px rgba(255,255,255,2)'
              }}
            >
              FEILD TELEPHONE SET WITH MAGNETO AND AUTO MODE (RFT1001)
            </div>
          </div>

          {/* Version + Volume Controls */}
          <div
            className="relative z-10 flex flex-col items-end gap-2"
            style={{ minWidth: 180, flexShrink: 0 }}
          >
            <div
              className="text-xs font-mono text-[#001570] font-semibold"
              style={{
                fontSize: 'clamp(10px, 1.5vw, 12px)',
                transform: 'translateY(-22px)'
              }}
            >
              RFT1001 IETM v1.10
            </div>

            <div
              className="flex items-center gap-2"
              style={{ transform: 'translateY(-10px)' }}
            >
              <button
                onClick={decreaseVolume}
                title="Decrease Speech Volume"
                className="w-9 h-9 rounded-full bg-white border border-neutral-300 shadow-sm hover:bg-neutral-100 transition-all flex items-center justify-center text-lg font-bold"
              >
                −
              </button>

              <button
                onClick={increaseVolume}
                title="Increase Speech Volume"
                className="w-9 h-9 rounded-full bg-white border border-neutral-300 shadow-sm hover:bg-neutral-100 transition-all flex items-center justify-center text-lg font-bold"
              >
                +
              </button>

              {/* Volume Level Indicator */}

              <div className="px-3 py-1 rounded-full bg-white border border-neutral-300 shadow-md text-xs font-semibold text-neutral-700 w-[110px] text-center">
                Volume: {String(Math.round(speechVolume * 100)).padStart(3, ' ')}%
              </div>
            </div>
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
            <div className="flex-grow overflow-y-auto overflow-x-hidden pr-1 space-y-1">
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
              <div
                className="text-xs font-normal truncate"
                title={`Active Document: ${manualsInfo[activeManualId]?.title}`}
              >
                <span className="font-bold text-neutral-800">Active Document:</span>{" "}
                <span className="text-[#0ea5e9] font-semibold">
                  {manualsInfo[activeManualId]?.title}
                </span>
              </div>
              <div className="flex justify-between text-xs pt-1">
                <span className="text-neutral-500 font-bold">Total Pages:</span>
                <span className="text-neutral-800 font-semibold">{totalPagesInManual}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowMainApp(false)}
            className="absolute top-2 left-2 z-50 w-7 h-7 flex items-center justify-center border border-gray-400 bg-white hover:bg-gray-100 rounded-sm text-sm font-bold transition-colors shadow-sm"
            title="Return to Cover Page"
          >
            ←
          </button>




          {/* RIGHT COLUMN: PDF VIEWING PLATFORM */}
          <div className="flex-grow flex flex-col overflow-hidden min-h-0 bg-transparent">
            
            {/* VIEWING TOOLBAR - Top: left (view/zoom), center (page navigation), right (search) */}
            <div id="viewer_toolbar" ref={toolbarRef} className="bg-white border border-neutral-200 rounded-lg p-2 gap-2 flex flex-nowrap items-center relative shrink-0 mb-3 shadow-sm font-sans" style={{ alignContent: 'flex-start' }}>
              {/* LEFT: View mode + Zoom controls */}
              <div className="viewer-toolbar-group flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0 relative z-10">
                {/* View Mode Selection Control */}
                <div className="flex border border-[#e2e8f0] rounded overflow-hidden shadow-sm h-8 select-none font-sans bg-white items-center">
                  <button 
                    onClick={() => handleViewModeChange('single')}
                    className={`px-3 text-sm font-semibold h-full transition-colors ${currentViewMode === 'single' ? 'bg-[#7dd3fc] text-[#000000] font-bold border-r border-[#38bdf8]' : 'bg-white text-neutral-700 hover:bg-neutral-50'}`}
                    title="Single Page View"
                  >
                    Single
                  </button>
                  <div className="w-px h-full bg-neutral-200" />
                  <button 
                    onClick={() => handleViewModeChange('double')}
                    disabled={isPdfManual && pdfPagesMap[activeManualId] && pdfPagesMap[activeManualId].length === 1}
                    className={`px-3 text-sm font-semibold h-full transition-colors ${currentViewMode === 'double' ? 'bg-[#7dd3fc] text-[#000000] font-bold border-l border-[#38bdf8]' : 'bg-white text-neutral-700 hover:bg-neutral-50'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    title="Double Page View"
                  >
                    Double
                  </button>
                </div>

                {/* Zoom controls + Reset */}
                <div className="flex items-center gap-2">
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

                  <button 
                    id="reset_zoom_btn"
                    onClick={handleResetZoom}
                    className="flex items-center gap-1.5 text-sm font-semibold border border-neutral-200 bg-white hover:bg-neutral-50 h-8 px-3 rounded shadow-sm cursor-pointer transition-colors duration-150"
                    title="Reset Zoom to 100%"
                  >
                    <RotateCcw size={13} />
                  </button>
                </div>
              </div>

              {/* CENTER: Page navigation (prev, current, next) */}
              <div className="viewer-toolbar-group flex items-center gap-1 sm:gap-2 lg:gap-3 justify-center flex-1 min-w-0">
                <button
                  type="button"
                  onClick={handlePrevPage}
                  className="flex items-center justify-center border border-neutral-200 bg-white hover:bg-[#f8fafc] text-neutral-800 h-8 w-8 rounded shadow-sm cursor-pointer"
                  title="Previous Page"
                >
                  <ArrowLeft size={14} />
                </button>

                  <div className="bg-neutral-50 border border-neutral-200 px-3 h-8 flex items-center justify-center font-sans font-medium text-neutral-700 text-sm rounded select-none text-center whitespace-nowrap" style={{ minWidth: '80px', whiteSpace: 'nowrap' }}>
                  {pageLabel}
                </div>

                <button
                  type="button"
                  onClick={handleNextPage}
                  className="flex items-center justify-center border border-neutral-200 bg-white hover:bg-[#f8fafc] text-neutral-800 h-8 w-8 rounded shadow-sm cursor-pointer"
                  title="Next Page"
                >
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* RIGHT: Search function input field (keeps existing behavior) */}
              <div className="viewer-toolbar-group flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0 relative z-10">
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
                      style={{ minWidth: '20px', maxWidth: 'clamp(120px, 12vw, 180px)' }}
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
                  className="flex-1 overflow-y-auto overflow-x-hidden"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
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

                {/* PDF pages rendered in continuous vertical flow (scroll-based) */}
                <div ref={pdfContainerRef} className="m-auto w-full py-2">
                  <div className="w-full relative overflow-hidden">
                    <div
                      ref={panLayerRef}
                      style={{
                        transform: `translate(${pan.x}px, ${pan.y}px)`,
                        transformOrigin: "top left",
                        width: "max-content",
                        display: "inline-block"
                      }}
>
                  {
                    // Precompute stable widths so the grid keeps exact spacing on resize
                    (() => {
                      const baseWidthForPdf = isPdfManual
                        ? ((currentViewMode as any) === 'single' ? safeContainerWidth : safeContainerWidth * ((currentViewMode as any) === 'single' ? VIEW_FIT.single : VIEW_FIT.double))
                        : safeContainerWidth;
                      const visualWidthForGrid = baseWidthForPdf * (zoomLevel / 100);
                      const PAGE_GAP_PX = 20; // keep gap-20 equivalent (5rem ~= 80px)

                      if (currentViewMode === 'single') {
                        return (
                          <div className="flex flex-col items-center gap-6 w-full">
                            {(!currentManualPages || !Array.isArray(currentManualPages)) ? (
                              <div className="w-full py-20 text-center text-neutral-500">Loading document...</div>
                            ) : currentManualPages.map((page, idx) => {
                              const baseWidth = isPdfManual
                                ? ((currentViewMode as any) === 'single'
                                    ? safeContainerWidth
                                    : safeContainerWidth * ((currentViewMode as any) === 'single' ? VIEW_FIT.single : VIEW_FIT.double))
                                : safeContainerWidth;

                              const visualWidth = baseWidth * (zoomLevel / 100);
                              
                              return (
                                <div key={page.id} data-page-number={page.pageNumber} data-page-id={page.id} className={isPdfManual ? 'relative select-text w-full flex justify-center' : 'bg-white border border-neutral-200 text-black p-8 relative flex flex-col justify-between rounded-md shadow-md mx-auto'}>
                                  <div style={{ width: `${visualWidth}px`, minHeight: `${Math.max(400, 540 * (zoomLevel / 100))}px` }}>
                                    {isPdfManual ? (
                                      loadingManuals[activeManualId] ? (
                                        <div className="flex-grow flex flex-col items-center justify-center text-xs font-mono text-neutral-500 py-20 min-h-[200px]">
                                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0ea5e9] mb-4"></div>
                                          <span>LOADING PDF...</span>
                                        </div>
                                      ) : pdfDocsMap[activeManualId] ? (
                                        <div className="w-full flex items-center justify-center">
                                          <div style={{ width: `${visualWidth}px` }} className="relative">
                                            <PdfPageRenderer
                                              pdfDoc={pdfDocsMap[activeManualId]}
                                              pageNumber={page.pageNumber}
                                              zoomLevel={zoomLevel}
                                              activeSearchTerm={activeSearchTerm}
                                              activeMatchIndexOnPage={
                                                selectedResult && selectedResult.pageNumber === page.pageNumber
                                                  ? searchResults.slice(0, currentSearchIndex).filter(r => r.pageNumber === page.pageNumber).length
                                                  : -1
                                              }
                                              width={Math.max(1, baseWidth)}
                                              padding={0}
                                            />
                                          </div>
                                          {/* OCR overlay for this page */}
                                          {page?.isImageBased && page?.paragraphs && page?.paragraphs.length > 0 && activeSearchTerm && (
                                            <div className="absolute left-1/2 translate-x-[-50%] bottom-4 bg-neutral-900/95 text-white p-2.5 rounded shadow-lg font-sans text-[10px] leading-normal z-20 max-h-28 overflow-y-auto border border-neutral-700 text-left select-text" style={{ width: `${Math.min(visualWidth, 560)}px` }}>
                                              <div className="text-[9px] font-mono font-bold text-yellow-400 mb-1 flex justify-between">
                                                <span>OCR TEXT CONTENT (SCANNED PAGE)</span>
                                                <span>{page.paragraphs.filter(p => p.toLowerCase().includes(activeSearchTerm.toLowerCase())).length} occurrences</span>
                                              </div>
                                              <div className="space-y-1">
                                                {page.paragraphs.map((line, lIdx) => {
                                                  if (!line.toLowerCase().includes(activeSearchTerm.toLowerCase())) return null;
                                                  return (
                                                    <div key={lIdx} className="border-l-2 border-yellow-400 pl-1.5 py-0.5">
                                                      {highlightMatches(line, activeSearchTerm, isSelectedResult(page.pageNumber, 'Technical Body', line))}
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="flex-grow flex items-center justify-center text-xs text-red-500 font-semibold min-h-[200px]">
                                          Failed to load PDF document
                                        </div>
                                      )
                                    ) : (
                                      <div>
                                        <div className="border-b border-gray-800 pb-2 mb-4 flex justify-between items-center text-[10px] font-mono text-gray-500">
                                          <span>ELCOM RFT1001 IETM</span>
                                          <span>P. {page.pageNumber}</span>
                                        </div>

                                        <h2 className="text-xs font-mono font-bold text-gray-900 tracking-wide mb-1">
                                          {highlightMatches(page.sectionTitle, activeSearchTerm)}
                                        </h2>
                                        {page.subTitle && (
                                          <h3 className="text-[11px] font-mono text-blue-900 border-b border-dashed border-gray-300 pb-1 mb-3">
                                            {highlightMatches(page.subTitle, activeSearchTerm)}
                                          </h3>
                                        )}

                                        <div className="space-y-3 font-serif text-[11px] leading-relaxed text-gray-800 text-justify">
                                          {page.paragraphs.map((p, pIdx) => (
                                            <p key={pIdx}>
                                              {highlightMatches(p, activeSearchTerm)}
                                            </p>
                                          ))}
                                        </div>

                                        {page.diagramType && (
                                          <div className="mt-4">
                                            <EngineeringDiagram type={page.diagramType} />
                                          </div>
                                        )}

                                        {page.table && (
                                          <div className="mt-4 win-border-sunken bg-white p-1 overflow-x-auto">
                                            <table className="w-full text-left font-mono text-[9px] border-collapse min-w-[300px]">
                                              <thead>
                                                <tr className="bg-gray-200 text-gray-900 border-b border-gray-400 font-bold">
                                                  {page.table.headers.map((h, hIdx) => (
                                                    <th key={hIdx} className="p-1 px-1.5 border border-gray-300">{h}</th>
                                                  ))}
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {page.table.rows.map((row, rIdx) => (
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
                                </div>
                              );
                            })}
                          </div>
                        );
                      }

                      // Double-page grid mode: explicit column sizes to preserve gap on resize
                      return (
                        <div
                          className="w-full"
                          style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(2, ${Math.max(1, visualWidthForGrid)}px)`,
                            columnGap: `${PAGE_GAP_PX}px`,
                            justifyContent: 'center',
                            rowGap: '32px'
                          }}
                        >
                          {(!currentManualPages || !Array.isArray(currentManualPages)) ? (
                            <div className="w-full py-20 text-center text-neutral-500">Loading document...</div>
                          ) : currentManualPages.map((page, idx) => {
                            const baseWidth = isPdfManual
                              ? ((currentViewMode as any) === 'single'
                                  ? safeContainerWidth
                                  : safeContainerWidth * ((currentViewMode as any) === 'single' ? VIEW_FIT.single : VIEW_FIT.double))
                              : safeContainerWidth;

                            const visualWidth = baseWidth * (zoomLevel / 100);
                            
                            return (
                              <div key={page.id} data-page-number={page.pageNumber} data-page-id={page.id} className={isPdfManual ? 'relative select-text w-full flex justify-center' : 'bg-white border border-neutral-200 text-black p-8 relative flex flex-col justify-between rounded-md shadow-md mx-auto'}>
                                <div style={{ width: `${visualWidth}px`, minHeight: `${Math.max(400, 540 * (zoomLevel / 100))}px` }}>
                                  {isPdfManual ? (
                                    loadingManuals[activeManualId] ? (
                                      <div className="flex-grow flex flex-col items-center justify-center text-xs font-mono text-neutral-500 py-20 min-h-[200px]">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0ea5e9] mb-4"></div>
                                        <span>LOADING PDF...</span>
                                      </div>
                                    ) : pdfDocsMap[activeManualId] ? (
                                      <div className="w-full flex items-center justify-center">
                                        <div style={{ width: `${visualWidth}px` }} className="relative">
                                          <PdfPageRenderer
                                            pdfDoc={pdfDocsMap[activeManualId]}
                                            pageNumber={page.pageNumber}
                                            zoomLevel={zoomLevel}
                                            activeSearchTerm={activeSearchTerm}
                                            activeMatchIndexOnPage={
                                              selectedResult && selectedResult.pageNumber === page.pageNumber
                                                ? searchResults.slice(0, currentSearchIndex).filter(r => r.pageNumber === page.pageNumber).length
                                                : -1
                                            }
                                            width={Math.max(1, baseWidth)}
                                            padding={0}
                                          />
                                        </div>
                                        {/* OCR overlay for this page */}
                                        {page?.isImageBased && page?.paragraphs && page?.paragraphs.length > 0 && activeSearchTerm && (
                                          <div className="absolute left-1/2 translate-x-[-50%] bottom-4 bg-neutral-900/95 text-white p-2.5 rounded shadow-lg font-sans text-[10px] leading-normal z-20 max-h-28 overflow-y-auto border border-neutral-700 text-left select-text" style={{ width: `${Math.min(visualWidth, 560)}px` }}>
                                            <div className="text-[9px] font-mono font-bold text-yellow-400 mb-1 flex justify-between">
                                              <span>OCR TEXT CONTENT (SCANNED PAGE)</span>
                                              <span>{page.paragraphs.filter(p => p.toLowerCase().includes(activeSearchTerm.toLowerCase())).length} occurrences</span>
                                            </div>
                                            <div className="space-y-1">
                                              {page.paragraphs.map((line, lIdx) => {
                                                if (!line.toLowerCase().includes(activeSearchTerm.toLowerCase())) return null;
                                                return (
                                                  <div key={lIdx} className="border-l-2 border-yellow-400 pl-1.5 py-0.5">
                                                    {highlightMatches(line, activeSearchTerm, isSelectedResult(page.pageNumber, 'Technical Body', line))}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="flex-grow flex items-center justify-center text-xs text-red-500 font-semibold min-h-[200px]">
                                        Failed to load PDF document
                                      </div>
                                    )
                                  ) : (
                                    <div>
                                      <div className="border-b border-gray-800 pb-2 mb-4 flex justify-between items-center text-[10px] font-mono text-gray-500">
                                        <span>ELCOM RFT1001 IETM</span>
                                        <span>P. {page.pageNumber}</span>
                                      </div>

                                      <h2 className="text-xs font-mono font-bold text-gray-900 tracking-wide mb-1">
                                        {highlightMatches(page.sectionTitle, activeSearchTerm)}
                                      </h2>
                                      {page.subTitle && (
                                        <h3 className="text-[11px] font-mono text-blue-900 border-b border-dashed border-gray-300 pb-1 mb-3">
                                          {highlightMatches(page.subTitle, activeSearchTerm)}
                                        </h3>
                                      )}

                                      <div className="space-y-3 font-serif text-[11px] leading-relaxed text-gray-800 text-justify">
                                        {page.paragraphs.map((p, pIdx) => (
                                          <p key={pIdx}>
                                            {highlightMatches(p, activeSearchTerm)}
                                          </p>
                                        ))}
                                      </div>

                                      {page.diagramType && (
                                        <div className="mt-4">
                                          <EngineeringDiagram type={page.diagramType} />
                                        </div>
                                      )}

                                      {page.table && (
                                        <div className="mt-4 win-border-sunken bg-white p-1 overflow-x-auto">
                                          <table className="w-full text-left font-mono text-[9px] border-collapse min-w-[300px]">
                                            <thead>
                                              <tr className="bg-gray-200 text-gray-900 border-b border-gray-400 font-bold">
                                                {page.table.headers.map((h, hIdx) => (
                                                  <th key={hIdx} className="p-1 px-1.5 border border-gray-300">{h}</th>
                                                ))}
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {page.table.rows.map((row, rIdx) => (
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
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()
                  }
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom controls removed per layout cleanup - keep PDF viewer as-is */}

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
