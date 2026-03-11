
const ColorWheelExplorer = ({
  initialState = {},
  externalState,
  onStateChange,
  onEvent,
  onSubmit,
  instanceId
}) => {
  // State management with multiple useState hooks
  const [baseColor, setBaseColor] = useState(initialState.baseColor || '#3498db');
  const [schemeType, setSchemeType] = useState(initialState.schemeType || 'complementary');
  const [showHint, setShowHint] = useState(initialState.showHint || false);
  const [hintText, setHintText] = useState(initialState.hintText || '');
  
  const canvasRef = useRef(null);
  const isDragging = useRef(false);
  
  // Color scheme calculation functions
  const hexToHsl = useCallback((hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
        default: h = 0;
      }
    }
    
    return { h: h * 360, s: s * 100, l: l * 100 };
  }, []);
  
  const hslToHex = useCallback((h, s, l) => {
    h = ((h % 360) + 360) % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    
    let r, g, b;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    
    const toHex = (val) => {
      const hex = Math.round((val + m) * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }, []);
  
  // Calculate scheme colors based on type
  const calculateSchemeColors = useCallback((base, type) => {
    const hsl = hexToHsl(base);
    
    switch (type) {
      case 'complementary':
        return [base, hslToHex(hsl.h + 180, hsl.s, hsl.l)];
      case 'analogous':
        return [
          hslToHex(hsl.h - 30, hsl.s, hsl.l),
          base,
          hslToHex(hsl.h + 30, hsl.s, hsl.l)
        ];
      case 'triadic':
        return [
          base,
          hslToHex(hsl.h + 120, hsl.s, hsl.l),
          hslToHex(hsl.h + 240, hsl.s, hsl.l)
        ];
      default:
        return [base];
    }
  }, [hexToHsl, hslToHex]);
  
  const getSchemeLabel = useCallback((type) => {
    switch (type) {
      case 'complementary':
        return 'Complementary: Colors opposite each other on the wheel—high contrast and energy.';
      case 'analogous':
        return 'Analogous: Colors next to each other on the wheel—harmonious and serene.';
      case 'triadic':
        return 'Triadic: Three colors evenly spaced on the wheel—vibrant and balanced.';
      default:
        return '';
    }
  }, []);
  
  const schemeColors = useMemo(() => calculateSchemeColors(baseColor, schemeType), [baseColor, schemeType, calculateSchemeColors]);
  const schemeLabel = useMemo(() => getSchemeLabel(schemeType), [schemeType, getSchemeLabel]);
  
  // Handle external state updates
  useEffect(() => {
    if (externalState) {
      if (externalState.baseColor !== undefined) setBaseColor(externalState.baseColor);
      if (externalState.schemeType !== undefined) setSchemeType(externalState.schemeType);
      if (externalState.showHint !== undefined) setShowHint(externalState.showHint);
      if (externalState.hintText !== undefined) setHintText(externalState.hintText);
    }
  }, [externalState]);
  
  // Notify parent of state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        baseColor,
        schemeType,
        schemeColors,
        schemeLabel,
        showHint,
        hintText
      });
    }
  }, [baseColor, schemeType, schemeColors, schemeLabel, showHint, hintText, onStateChange]);
  
  // Draw the color wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw color wheel
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle - 1) * Math.PI / 180;
      const endAngle = (angle + 1) * Math.PI / 180;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.5, hslToHex(angle, 100, 50));
      gradient.addColorStop(1, hslToHex(angle, 100, 25));
      
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    
    // Draw scheme color indicators
    const baseHsl = hexToHsl(baseColor);
    schemeColors.forEach((color, index) => {
      const colorHsl = hexToHsl(color);
      const indicatorAngle = (colorHsl.h - 90) * Math.PI / 180;
      const indicatorRadius = radius * 0.7;
      const x = centerX + Math.cos(indicatorAngle) * indicatorRadius;
      const y = centerY + Math.sin(indicatorAngle) * indicatorRadius;
      
      // Outer ring
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Inner color
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      
      // Number label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((index + 1).toString(), x, y);
    });
    
    return () => {
      // Cleanup
    };
  }, [baseColor, schemeColors, hexToHsl, hslToHex]);
  
  // Handle canvas click/drag
  const handleCanvasInteraction = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = Math.min(centerX, centerY) - 10;
    
    if (distance <= radius) {
      let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
      if (angle < 0) angle += 360;
      
      const saturation = Math.min(100, (distance / radius) * 100);
      const newColor = hslToHex(angle, saturation > 20 ? 70 : saturation, 50);
      
      setBaseColor(newColor);
      
      const newSchemeColors = calculateSchemeColors(newColor, schemeType);
      onEvent?.('color-selected', {
        baseColor: newColor,
        schemeColors: newSchemeColors,
        schemeType
      });
    }
  }, [schemeType, hslToHex, calculateSchemeColors, onEvent]);
  
  const handleMouseDown = useCallback((e) => {
    isDragging.current = true;
    handleCanvasInteraction(e);
  }, [handleCanvasInteraction]);
  
  const handleMouseMove = useCallback((e) => {
    if (isDragging.current) {
      handleCanvasInteraction(e);
    }
  }, [handleCanvasInteraction]);
  
  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);
  
  // Handle scheme type change
  const handleSchemeChange = useCallback((newType) => {
    setSchemeType(newType);
    const newSchemeColors = calculateSchemeColors(baseColor, newType);
    const newLabel = getSchemeLabel(newType);
    
    onEvent?.('scheme-changed', {
      schemeType: newType,
      schemeColors: newSchemeColors,
      schemeLabel: newLabel
    });
  }, [baseColor, calculateSchemeColors, getSchemeLabel, onEvent]);
  
  // Handle hint request
  const handleHintRequest = useCallback(() => {
    setShowHint(true);
    onEvent?.('hint-requested', { schemeType });
  }, [schemeType, onEvent]);
  
  // Randomize color
  const handleRandomize = useCallback(() => {
    const randomHue = Math.floor(Math.random() * 360);
    const newColor = hslToHex(randomHue, 70, 50);
    setBaseColor(newColor);
    
    const newSchemeColors = calculateSchemeColors(newColor, schemeType);
    onEvent?.('color-selected', {
      baseColor: newColor,
      schemeColors: newSchemeColors,
      schemeType
    });
  }, [schemeType, hslToHex, calculateSchemeColors, onEvent]);
  
  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-white">Color Wheel Explorer</CardTitle>
        <CardDescription className="text-slate-300">
          Click or drag on the wheel to select a color, then explore different color schemes
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Color Wheel Canvas */}
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            className="cursor-crosshair rounded-full shadow-lg"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
        
        {/* Scheme Type Buttons */}
        <div className="flex justify-center gap-2 flex-wrap">
          {['complementary', 'analogous', 'triadic'].map((type) => (
            <Button
              key={type}
              variant={schemeType === type ? 'default' : 'outline'}
              onClick={() => handleSchemeChange(type)}
              className={`capitalize ${
                schemeType === type 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                  : 'border-slate-600 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {type}
            </Button>
          ))}
        </div>
        
        {/* Scheme Label */}
        <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <p className="text-slate-200 text-sm">{schemeLabel}</p>
        </div>
        
        {/* Color Swatches */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-300 text-center">Your Color Scheme</h3>
          <div className="flex justify-center gap-4">
            {schemeColors.map((color, index) => (
              <div key={index} className="text-center">
                <div
                  className="w-16 h-16 rounded-lg shadow-lg border-2 border-white/20 transition-transform hover:scale-110"
                  style={{ backgroundColor: color }}
                />
                <p className="text-xs text-slate-400 mt-2 font-mono">{color.toUpperCase()}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Hint Display */}
        {showHint && hintText && (
          <div className="p-4 bg-amber-500/20 border border-amber-500/40 rounded-lg">
            <p className="text-amber-200 text-sm">💡 {hintText}</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center gap-3">
        <Button
          variant="outline"
          onClick={handleRandomize}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          🎲 Randomize
        </Button>
        <Button
          variant="outline"
          onClick={handleHintRequest}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          💡 Get Hint
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ColorWheelExplorer;
