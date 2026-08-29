const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const states = `
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isTopCollapsed, setIsTopCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(440);
  const [isDragging, setIsDragging] = useState(false);
`;
code = code.replace(/  const \[notification, setNotification\] = useState<string \| null>\(null\);/, states + '\n  const [notification, setNotification] = useState<string | null>(null);');

// Mouse drag
const mouseDrag = `
  // Gerenciamento de arrasto do mouse para redimensionamento da barra lateral
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      if (e.clientX < 140) {
        setIsSidebarCollapsed(true);
        setIsDragging(false);
        return;
      }
      const newWidth = Math.max(260, Math.min(900, e.clientX - 20));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);
`;
code = code.replace(/  const showNotify = \(msg: string\) => \{[\s\S]*?  \};\r?\n/, match => match + '\n' + mouseDrag + '\n');


// Wrapping sidebar and fixing grid
code = code.replace(/<div style=\{\{ display: 'flex', gap: '32px' \}\}>/, 
  `<button onClick={() => setIsTopCollapsed(!isTopCollapsed)} style={{ position: 'absolute', top: 10, right: 10, zIndex: 99, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer', padding: '4px 8px' }}>
     {isTopCollapsed ? 'Mostrar Topo' : 'Esconder Topo'}
   </button>
   <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} style={{ position: 'absolute', top: 10, right: 130, zIndex: 99, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer', padding: '4px 8px' }}>
     {isSidebarCollapsed ? 'Mostrar Sidebar' : 'Esconder Sidebar'}
   </button>
   <div style={{ display: 'grid', gridTemplateColumns: isSidebarCollapsed ? '0px 1fr' : \`\${sidebarWidth}px 1fr\`, gap: isSidebarCollapsed ? '0px' : '32px', transition: 'grid-template-columns 0.3s ease, gap 0.3s ease' }}>`);

// Handle header visibility
code = code.replace("{/* MAIN HEADER */}", `{!isTopCollapsed && (\n        <>\n          {/* MAIN HEADER */}`);
code = code.replace("        {/* ACTIONS & SETTINGS */}", `        </>\n      )}\n        {/* ACTIONS & SETTINGS */}`);

// Sidebar wrapper
code = code.replace("        {/* LEFT SIDE: CITY CONFIGURATOR */}", 
  `        {/* LEFT SIDE: CITY CONFIGURATOR */}
        <div style={{ display: isSidebarCollapsed ? 'none' : 'block', overflow: 'hidden' }}>`);
        
// Close the sidebar wrapper before RIGHT SIDE
code = code.replace("        {/* RIGHT SIDE: PREVIEW */}", 
  `        </div>
        
        {/* RIGHT SIDE: PREVIEW */}`);

fs.writeFileSync('src/App.tsx', code);

