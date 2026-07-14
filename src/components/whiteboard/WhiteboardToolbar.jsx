import React from 'react';
import { 
  ChevronRight, 
  MousePointer, 
  Pencil, 
  Eraser, 
  Highlighter, 
  Zap, 
  Minus, 
  ArrowUpRight, 
  Square, 
  Circle, 
  Type, 
  Image as ImageIcon, 
  ChevronLeft 
} from 'lucide-react';

export default function WhiteboardToolbar({
  isToolbarCollapsed,
  setIsToolbarCollapsed,
  activeTool,
  setActiveTool,
  setSelectedElement,
  fileInputRef,
  isCollaborating,
  hasDrawAccess,
  isHost
}) {
  // If user is collaborator and does not have drawing access, toolbar shouldn't render
  if (!isHost && isCollaborating && !hasDrawAccess) return null;

  if (isToolbarCollapsed) {
    return (
      <button 
        className="whiteboard-floating-trigger toolbar-trigger"
        onClick={() => setIsToolbarCollapsed(false)}
        data-tooltip="Expand Toolbar"
      >
        <ChevronRight size={20} />
      </button>
    );
  }

  return (
    <div className="whiteboard-toolbar">
      <button 
        className={`toolbar-btn ${activeTool === 'select' ? 'active' : ''}`} 
        onClick={() => { setActiveTool('select'); setSelectedElement(null); }}
        data-tooltip="Select & Move Objects"
      >
        <MousePointer size={20} />
      </button>
      
      <button 
        className={`toolbar-btn ${activeTool === 'pen' ? 'active' : ''}`} 
        onClick={() => { setActiveTool('pen'); setSelectedElement(null); }}
        data-tooltip="Smart Handwriting Ink"
      >
        <Pencil size={20} />
      </button>

      <button 
        className={`toolbar-btn ${activeTool === 'eraser' ? 'active' : ''}`} 
        onClick={() => { setActiveTool('eraser'); setSelectedElement(null); }}
        data-tooltip="Stroke Eraser"
      >
        <Eraser size={20} />
      </button>

      <button 
        className={`toolbar-btn ${activeTool === 'highlighter' ? 'active' : ''}`} 
        onClick={() => { setActiveTool('highlighter'); setSelectedElement(null); }}
        data-tooltip="Fluorescent Highlighter"
      >
        <Highlighter size={20} />
      </button>

      <button 
        className={`toolbar-btn ${activeTool === 'laser' ? 'active' : ''}`} 
        onClick={() => { setActiveTool('laser'); setSelectedElement(null); }}
        data-tooltip="Glowing Laser Pointer"
      >
        <Zap size={20} />
      </button>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />

      <button 
        className={`toolbar-btn ${activeTool === 'line' ? 'active' : ''}`} 
        onClick={() => { setActiveTool('line'); setSelectedElement(null); }}
        data-tooltip="Draw Straight Line"
      >
        <Minus size={20} style={{ transform: 'rotate(-45deg)' }} />
      </button>

      <button 
        className={`toolbar-btn ${activeTool === 'arrow' ? 'active' : ''}`} 
        onClick={() => { setActiveTool('arrow'); setSelectedElement(null); }}
        data-tooltip="Draw Annotation Arrow"
      >
        <ArrowUpRight size={20} />
      </button>

      <button 
        className={`toolbar-btn ${activeTool === 'rectangle' ? 'active' : ''}`} 
        onClick={() => { setActiveTool('rectangle'); setSelectedElement(null); }}
        data-tooltip="Draw Rectangle"
      >
        <Square size={20} />
      </button>

      <button 
        className={`toolbar-btn ${activeTool === 'circle' ? 'active' : ''}`} 
        onClick={() => { setActiveTool('circle'); setSelectedElement(null); }}
        data-tooltip="Draw Circle"
      >
        <Circle size={20} />
      </button>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />

      <button 
        className={`toolbar-btn ${activeTool === 'text' ? 'active' : ''}`} 
        onClick={() => { setActiveTool('text'); setSelectedElement(null); }}
        data-tooltip="Insert Typography Label"
      >
        <Type size={20} />
      </button>

      <button 
        className="toolbar-btn" 
        onClick={() => fileInputRef.current.click()}
        data-tooltip="Insert Picture/Image"
      >
        <ImageIcon size={20} />
      </button>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />

      <button 
        className="toolbar-btn collapse-btn"
        onClick={() => setIsToolbarCollapsed(true)}
        data-tooltip="Collapse Toolbar"
        style={{ color: '#f87171' }}
      >
        <ChevronLeft size={20} />
      </button>
    </div>
  );
}
