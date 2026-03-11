
const PosterDesignStudio = ({
  initialState = {},
  externalState,
  onStateChange,
  onEvent,
  onSubmit,
  instanceId
}) => {
  // Default state values
  const defaultState = {
    posterTitle: 'Spring Concert',
    headlineText: 'Spring Concert',
    headlineColor: '#2c3e50',
    headlineFontSize: 48,
    headlineFontWeight: 'bold',
    headlineAlignment: 'center',
    subheadlineText: 'Featuring the School Orchestra',
    subheadlineColor: '#34495e',
    subheadlineFontSize: 24,
    bodyText: 'Friday, May 10 | 7:00 PM | Main Auditorium',
    bodyColor: '#7f8c8d',
    bodyFontSize: 16,
    backgroundColor: '#ecf0f1',
    showFeedback: false,
    feedbackText: ''
  };

  // State management
  const [headlineText, setHeadlineText] = useState(initialState.headlineText || defaultState.headlineText);
  const [headlineColor, setHeadlineColor] = useState(initialState.headlineColor || defaultState.headlineColor);
  const [headlineFontSize, setHeadlineFontSize] = useState(initialState.headlineFontSize || defaultState.headlineFontSize);
  const [headlineFontWeight, setHeadlineFontWeight] = useState(initialState.headlineFontWeight || defaultState.headlineFontWeight);
  const [headlineAlignment, setHeadlineAlignment] = useState(initialState.headlineAlignment || defaultState.headlineAlignment);
  
  const [subheadlineText, setSubheadlineText] = useState(initialState.subheadlineText || defaultState.subheadlineText);
  const [subheadlineColor, setSubheadlineColor] = useState(initialState.subheadlineColor || defaultState.subheadlineColor);
  const [subheadlineFontSize, setSubheadlineFontSize] = useState(initialState.subheadlineFontSize || defaultState.subheadlineFontSize);
  
  const [bodyText, setBodyText] = useState(initialState.bodyText || defaultState.bodyText);
  const [bodyColor, setBodyColor] = useState(initialState.bodyColor || defaultState.bodyColor);
  const [bodyFontSize, setBodyFontSize] = useState(initialState.bodyFontSize || defaultState.bodyFontSize);
  
  const [backgroundColor, setBackgroundColor] = useState(initialState.backgroundColor || defaultState.backgroundColor);
  const [showFeedback, setShowFeedback] = useState(initialState.showFeedback || defaultState.showFeedback);
  const [feedbackText, setFeedbackText] = useState(initialState.feedbackText || defaultState.feedbackText);
  
  const [selectedElement, setSelectedElement] = useState('headline');
  
  // Block positions for draggable elements
  const [layoutBlocks, setLayoutBlocks] = useState(initialState.layoutBlocks || [
    { id: 'headline', type: 'text', x: 20, y: 40 },
    { id: 'subheadline', type: 'text', x: 20, y: 120 },
    { id: 'image', type: 'image', x: 60, y: 180 },
    { id: 'body', type: 'text', x: 20, y: 380 }
  ]);
  
  const [draggingBlock, setDraggingBlock] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const posterRef = useRef(null);

  // Handle external state updates
  useEffect(() => {
    if (externalState) {
      if (externalState.headlineText !== undefined) setHeadlineText(externalState.headlineText);
      if (externalState.headlineColor !== undefined) setHeadlineColor(externalState.headlineColor);
      if (externalState.headlineFontSize !== undefined) setHeadlineFontSize(externalState.headlineFontSize);
      if (externalState.headlineFontWeight !== undefined) setHeadlineFontWeight(externalState.headlineFontWeight);
      if (externalState.headlineAlignment !== undefined) setHeadlineAlignment(externalState.headlineAlignment);
      if (externalState.subheadlineText !== undefined) setSubheadlineText(externalState.subheadlineText);
      if (externalState.subheadlineColor !== undefined) setSubheadlineColor(externalState.subheadlineColor);
      if (externalState.subheadlineFontSize !== undefined) setSubheadlineFontSize(externalState.subheadlineFontSize);
      if (externalState.bodyText !== undefined) setBodyText(externalState.bodyText);
      if (externalState.bodyColor !== undefined) setBodyColor(externalState.bodyColor);
      if (externalState.bodyFontSize !== undefined) setBodyFontSize(externalState.bodyFontSize);
      if (externalState.backgroundColor !== undefined) setBackgroundColor(externalState.backgroundColor);
      if (externalState.showFeedback !== undefined) setShowFeedback(externalState.showFeedback);
      if (externalState.feedbackText !== undefined) setFeedbackText(externalState.feedbackText);
      if (externalState.layoutBlocks !== undefined) setLayoutBlocks(externalState.layoutBlocks);
    }
  }, [externalState]);

  // Notify parent of state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        posterTitle: headlineText,
        headlineText,
        headlineColor,
        headlineFontSize,
        headlineFontWeight,
        headlineAlignment,
        subheadlineText,
        subheadlineColor,
        subheadlineFontSize,
        bodyText,
        bodyColor,
        bodyFontSize,
        backgroundColor,
        imagePosition: layoutBlocks.find(b => b.id === 'image') || { x: 60, y: 180 },
        layoutBlocks,
        showFeedback,
        feedbackText
      });
    }
  }, [headlineText, headlineColor, headlineFontSize, headlineFontWeight, headlineAlignment,
      subheadlineText, subheadlineColor, subheadlineFontSize,
      bodyText, bodyColor, bodyFontSize, backgroundColor, layoutBlocks,
      showFeedback, feedbackText, onStateChange]);

  // Get current element properties
  const getCurrentElementProps = useCallback(() => {
    switch (selectedElement) {
      case 'headline':
        return { color: headlineColor, fontSize: headlineFontSize, fontWeight: headlineFontWeight, alignment: headlineAlignment };
      case 'subheadline':
        return { color: subheadlineColor, fontSize: subheadlineFontSize, fontWeight: 'normal', alignment: 'center' };
      case 'body':
        return { color: bodyColor, fontSize: bodyFontSize, fontWeight: 'normal', alignment: 'center' };
      default:
        return { color: '#000000', fontSize: 16, fontWeight: 'normal', alignment: 'left' };
    }
  }, [selectedElement, headlineColor, headlineFontSize, headlineFontWeight, headlineAlignment,
      subheadlineColor, subheadlineFontSize, bodyColor, bodyFontSize]);

  // Handle color change
  const handleColorChange = useCallback((color) => {
    switch (selectedElement) {
      case 'headline':
        setHeadlineColor(color);
        break;
      case 'subheadline':
        setSubheadlineColor(color);
        break;
      case 'body':
        setBodyColor(color);
        break;
      case 'background':
        setBackgroundColor(color);
        break;
    }
    onEvent?.('color-changed', { element: selectedElement, color });
  }, [selectedElement, onEvent]);

  // Handle font size change
  const handleFontSizeChange = useCallback((size) => {
    const numSize = parseInt(size, 10);
    switch (selectedElement) {
      case 'headline':
        setHeadlineFontSize(numSize);
        break;
      case 'subheadline':
        setSubheadlineFontSize(numSize);
        break;
      case 'body':
        setBodyFontSize(numSize);
        break;
    }
    onEvent?.('typography-changed', {
      element: selectedElement,
      fontSize: numSize,
      fontWeight: getCurrentElementProps().fontWeight,
      alignment: getCurrentElementProps().alignment
    });
  }, [selectedElement, getCurrentElementProps, onEvent]);

  // Handle font weight change
  const handleFontWeightChange = useCallback((weight) => {
    if (selectedElement === 'headline') {
      setHeadlineFontWeight(weight);
      onEvent?.('typography-changed', {
        element: 'headline',
        fontSize: headlineFontSize,
        fontWeight: weight,
        alignment: headlineAlignment
      });
    }
  }, [selectedElement, headlineFontSize, headlineAlignment, onEvent]);

  // Handle alignment change
  const handleAlignmentChange = useCallback((align) => {
    if (selectedElement === 'headline') {
      setHeadlineAlignment(align);
      onEvent?.('typography-changed', {
        element: 'headline',
        fontSize: headlineFontSize,
        fontWeight: headlineFontWeight,
        alignment: align
      });
    }
  }, [selectedElement, headlineFontSize, headlineFontWeight, onEvent]);

  // Drag handlers
  const handleDragStart = useCallback((e, blockId) => {
    const block = layoutBlocks.find(b => b.id === blockId);
    if (!block) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setDraggingBlock(blockId);
    setSelectedElement(blockId);
  }, [layoutBlocks]);

  const handleDrag = useCallback((e) => {
    if (!draggingBlock || !posterRef.current) return;
    
    const posterRect = posterRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(e.clientX - posterRect.left - dragOffset.x, posterRect.width - 50));
    const newY = Math.max(0, Math.min(e.clientY - posterRect.top - dragOffset.y, posterRect.height - 30));
    
    setLayoutBlocks(prev => prev.map(block => 
      block.id === draggingBlock 
        ? { ...block, x: newX, y: newY }
        : block
    ));
  }, [draggingBlock, dragOffset]);

  const handleDragEnd = useCallback(() => {
    if (draggingBlock) {
      const block = layoutBlocks.find(b => b.id === draggingBlock);
      if (block) {
        onEvent?.('block-moved', {
          blockId: block.id,
          blockType: block.type,
          x: block.x,
          y: block.y
        });
      }
    }
    setDraggingBlock(null);
  }, [draggingBlock, layoutBlocks, onEvent]);

  // Handle feedback request
  const handleFeedbackRequest = useCallback(() => {
    setShowFeedback(true);
    onEvent?.('feedback-requested', {
      currentState: {
        headlineText, headlineColor, headlineFontSize, headlineFontWeight, headlineAlignment,
        subheadlineText, subheadlineColor, subheadlineFontSize,
        bodyText, bodyColor, bodyFontSize,
        backgroundColor, layoutBlocks
      }
    });
  }, [headlineText, headlineColor, headlineFontSize, headlineFontWeight, headlineAlignment,
      subheadlineText, subheadlineColor, subheadlineFontSize,
      bodyText, bodyColor, bodyFontSize, backgroundColor, layoutBlocks, onEvent]);

  // Handle reset
  const handleReset = useCallback(() => {
    setHeadlineText(defaultState.headlineText);
    setHeadlineColor(defaultState.headlineColor);
    setHeadlineFontSize(defaultState.headlineFontSize);
    setHeadlineFontWeight(defaultState.headlineFontWeight);
    setHeadlineAlignment(defaultState.headlineAlignment);
    setSubheadlineText(defaultState.subheadlineText);
    setSubheadlineColor(defaultState.subheadlineColor);
    setSubheadlineFontSize(defaultState.subheadlineFontSize);
    setBodyText(defaultState.bodyText);
    setBodyColor(defaultState.bodyColor);
    setBodyFontSize(defaultState.bodyFontSize);
    setBackgroundColor(defaultState.backgroundColor);
    setShowFeedback(false);
    setFeedbackText('');
    setLayoutBlocks([
      { id: 'headline', type: 'text', x: 20, y: 40 },
      { id: 'subheadline', type: 'text', x: 20, y: 120 },
      { id: 'image', type: 'image', x: 60, y: 180 },
      { id: 'body', type: 'text', x: 20, y: 380 }
    ]);
    onEvent?.('design-reset', {});
  }, [onEvent]);

  // Preset color palettes
  const colorPalettes = [
    { name: 'Complementary', colors: ['#3498db', '#e67e22', '#2c3e50', '#ecf0f1'] },
    { name: 'Analogous', colors: ['#1abc9c', '#16a085', '#2ecc71', '#27ae60'] },
    { name: 'Triadic', colors: ['#9b59b6', '#e74c3c', '#f1c40f', '#2c3e50'] },
    { name: 'Monochrome', colors: ['#2c3e50', '#34495e', '#7f8c8d', '#bdc3c7'] }
  ];

  const getBlockPosition = (blockId) => {
    const block = layoutBlocks.find(b => b.id === blockId);
    return block || { x: 0, y: 0 };
  };

  const currentProps = getCurrentElementProps();

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white text-center">Poster Design Studio</CardTitle>
          <CardDescription className="text-slate-300 text-center">
            Drag elements to reposition, select to customize colors and typography
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Poster Canvas */}
            <div className="flex-1">
              <div
                ref={posterRef}
                className="relative w-full aspect-[3/4] rounded-lg shadow-2xl overflow-hidden cursor-default"
                style={{ backgroundColor }}
                onMouseMove={handleDrag}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
              >
                {/* Headline */}
                <div
                  className={`absolute cursor-move select-none px-2 ${selectedElement === 'headline' ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                  style={{
                    left: getBlockPosition('headline').x,
                    top: getBlockPosition('headline').y,
                    color: headlineColor,
                    fontSize: `${headlineFontSize}px`,
                    fontWeight: headlineFontWeight,
                    textAlign: headlineAlignment,
                    width: 'calc(100% - 40px)'
                  }}
                  onMouseDown={(e) => handleDragStart(e, 'headline')}
                  onClick={() => setSelectedElement('headline')}
                >
                  {headlineText}
                </div>
                
                {/* Subheadline */}
                <div
                  className={`absolute cursor-move select-none px-2 ${selectedElement === 'subheadline' ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                  style={{
                    left: getBlockPosition('subheadline').x,
                    top: getBlockPosition('subheadline').y,
                    color: subheadlineColor,
                    fontSize: `${subheadlineFontSize}px`,
                    width: 'calc(100% - 40px)',
                    textAlign: 'center'
                  }}
                  onMouseDown={(e) => handleDragStart(e, 'subheadline')}
                  onClick={() => setSelectedElement('subheadline')}
                >
                  {subheadlineText}
                </div>
                
                {/* Image Placeholder */}
                <div
                  className={`absolute cursor-move select-none ${selectedElement === 'image' ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                  style={{
                    left: getBlockPosition('image').x,
                    top: getBlockPosition('image').y,
                    width: '200px',
                    height: '150px'
                  }}
                  onMouseDown={(e) => handleDragStart(e, 'image')}
                  onClick={() => setSelectedElement('image')}
                >
                  <div className="w-full h-full bg-slate-300 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-400">
                    <span className="text-slate-500 text-sm">📷 Image</span>
                  </div>
                </div>
                
                {/* Body Text */}
                <div
                  className={`absolute cursor-move select-none px-2 ${selectedElement === 'body' ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                  style={{
                    left: getBlockPosition('body').x,
                    top: getBlockPosition('body').y,
                    color: bodyColor,
                    fontSize: `${bodyFontSize}px`,
                    width: 'calc(100% - 40px)',
                    textAlign: 'center'
                  }}
                  onMouseDown={(e) => handleDragStart(e, 'body')}
                  onClick={() => setSelectedElement('body')}
                >
                  {bodyText}
                </div>
              </div>
            </div>
            
            {/* Sidebar Controls */}
            <div className="w-full lg:w-72 space-y-4">
              {/* Element Selector */}
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <Label className="text-slate-300 text-sm mb-2 block">Select Element</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['headline', 'subheadline', 'body', 'background'].map((el) => (
                    <Button
                      key={el}
                      variant={selectedElement === el ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedElement(el)}
                      className={`capitalize text-xs ${
                        selectedElement === el
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {el}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Color Picker */}
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <Label className="text-slate-300 text-sm mb-2 block">Color</Label>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="color"
                    value={selectedElement === 'background' ? backgroundColor : currentProps.color}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer border-0"
                  />
                  <Input
                    value={selectedElement === 'background' ? backgroundColor : currentProps.color}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="flex-1 bg-slate-700 border-slate-600 text-slate-200 text-sm font-mono"
                  />
                </div>
                
                {/* Color Palettes */}
                <div className="space-y-2">
                  {colorPalettes.map((palette) => (
                    <div key={palette.name}>
                      <p className="text-xs text-slate-400 mb-1">{palette.name}</p>
                      <div className="flex gap-1">
                        {palette.colors.map((color, i) => (
                          <button
                            key={i}
                            className="w-8 h-8 rounded border border-white/20 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            onClick={() => handleColorChange(color)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Typography Controls (only for text elements) */}
              {selectedElement !== 'background' && selectedElement !== 'image' && (
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <Label className="text-slate-300 text-sm mb-2 block">Typography</Label>
                  
                  {/* Font Size */}
                  <div className="mb-3">
                    <p className="text-xs text-slate-400 mb-1">Font Size: {currentProps.fontSize}px</p>
                    <input
                      type="range"
                      min="12"
                      max="72"
                      value={currentProps.fontSize}
                      onChange={(e) => handleFontSizeChange(e.target.value)}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                  
                  {/* Font Weight (headline only) */}
                  {selectedElement === 'headline' && (
                    <div className="mb-3">
                      <p className="text-xs text-slate-400 mb-1">Font Weight</p>
                      <div className="flex gap-1">
                        {['light', 'normal', 'bold'].map((weight) => (
                          <Button
                            key={weight}
                            variant={headlineFontWeight === weight ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleFontWeightChange(weight)}
                            className={`flex-1 capitalize text-xs ${
                              headlineFontWeight === weight
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {weight}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Alignment (headline only) */}
                  {selectedElement === 'headline' && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Alignment</p>
                      <div className="flex gap-1">
                        {['left', 'center', 'right'].map((align) => (
                          <Button
                            key={align}
                            variant={headlineAlignment === align ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleAlignmentChange(align)}
                            className={`flex-1 text-xs ${
                              headlineAlignment === align
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {align === 'left' ? '⬅' : align === 'center' ? '⬌' : '➡'}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Text Content Editor */}
              {selectedElement !== 'background' && selectedElement !== 'image' && (
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <Label className="text-slate-300 text-sm mb-2 block">Edit Text</Label>
                  <Textarea
                    value={
                      selectedElement === 'headline' ? headlineText :
                      selectedElement === 'subheadline' ? subheadlineText :
                      bodyText
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (selectedElement === 'headline') setHeadlineText(val);
                      else if (selectedElement === 'subheadline') setSubheadlineText(val);
                      else setBodyText(val);
                    }}
                    className="bg-slate-700 border-slate-600 text-slate-200 text-sm"
                    rows={2}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Feedback Display */}
          {showFeedback && feedbackText && (
            <div className="mt-4 p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-lg">
              <p className="text-emerald-200 text-sm">📝 {feedbackText}</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            🔄 Reset
          </Button>
          <Button
            onClick={handleFeedbackRequest}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            📋 Get Feedback
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PosterDesignStudio;
