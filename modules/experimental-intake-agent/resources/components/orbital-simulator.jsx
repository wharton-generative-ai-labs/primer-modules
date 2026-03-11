
// Planet data with real astronomical values (scaled for visualization)
const PLANET_DATA = {
  mercury: { name: 'Mercury', color: '#8c8c8c', realSemiMajorAxis: 0.387, realEccentricity: 0.206, realPeriod: 0.24, mass: 0.055 },
  venus: { name: 'Venus', color: '#e6b800', realSemiMajorAxis: 0.723, realEccentricity: 0.007, realPeriod: 0.62, mass: 0.815 },
  earth: { name: 'Earth', color: '#4d94ff', realSemiMajorAxis: 1.0, realEccentricity: 0.017, realPeriod: 1.0, mass: 1.0 },
  mars: { name: 'Mars', color: '#ff6633', realSemiMajorAxis: 1.524, realEccentricity: 0.093, realPeriod: 1.88, mass: 0.107 },
  jupiter: { name: 'Jupiter', color: '#d4a574', realSemiMajorAxis: 5.203, realEccentricity: 0.049, realPeriod: 11.86, mass: 317.8 },
  saturn: { name: 'Saturn', color: '#f4d03f', realSemiMajorAxis: 9.537, realEccentricity: 0.054, realPeriod: 29.46, mass: 95.2 }
};

const PLANET_ORDER = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn'];

export default function OrbitalSimulator({
  initialState = {},
  externalState,
  onStateChange,
  onEvent,
  onSubmit,
  instanceId
}) {
  // Core state with initialState spread
  const [mode, setMode] = useState(initialState.mode || 'observe');
  const [selectedPlanet, setSelectedPlanet] = useState(initialState.selectedPlanet || null);
  const [focusedConcept, setFocusedConcept] = useState(initialState.focusedConcept || 'free');
  const [showOrbitalPaths, setShowOrbitalPaths] = useState(initialState.showOrbitalPaths !== false);
  const [showSpeedIndicators, setShowSpeedIndicators] = useState(initialState.showSpeedIndicators || false);
  const [showDistanceMarkers, setShowDistanceMarkers] = useState(initialState.showDistanceMarkers || false);
  const [timeScale, setTimeScale] = useState(initialState.timeScale || 1);
  const [highlightedPlanet, setHighlightedPlanet] = useState(initialState.highlightedPlanet || null);
  const [infoMessage, setInfoMessage] = useState(initialState.infoMessage || 'Watch the planets orbit the Sun. Notice anything interesting about how they move?');
  const [planetOverrides, setPlanetOverrides] = useState(initialState.planetOverrides || {});
  const [lockedControls, setLockedControls] = useState(initialState.lockedControls || []);
  const [challengeMode, setChallengeMode] = useState(initialState.challengeMode || false);
  const [challengeTarget, setChallengeTarget] = useState(initialState.challengeTarget || null);

  // Animation state
  const [planetAngles, setPlanetAngles] = useState({});
  const [orbitCounts, setOrbitCounts] = useState({});
  const animationRef = useRef(null);
  const lastTimeRef = useRef(Date.now());
  const canvasRef = useRef(null);

  // Sync with external state
  useEffect(() => {
    if (externalState) {
      if (externalState.mode !== undefined) setMode(externalState.mode);
      if (externalState.selectedPlanet !== undefined) setSelectedPlanet(externalState.selectedPlanet);
      if (externalState.focusedConcept !== undefined) setFocusedConcept(externalState.focusedConcept);
      if (externalState.showOrbitalPaths !== undefined) setShowOrbitalPaths(externalState.showOrbitalPaths);
      if (externalState.showSpeedIndicators !== undefined) setShowSpeedIndicators(externalState.showSpeedIndicators);
      if (externalState.showDistanceMarkers !== undefined) setShowDistanceMarkers(externalState.showDistanceMarkers);
      if (externalState.timeScale !== undefined) setTimeScale(externalState.timeScale);
      if (externalState.highlightedPlanet !== undefined) setHighlightedPlanet(externalState.highlightedPlanet);
      if (externalState.infoMessage !== undefined) setInfoMessage(externalState.infoMessage);
      if (externalState.planetOverrides !== undefined) setPlanetOverrides(externalState.planetOverrides);
      if (externalState.lockedControls !== undefined) setLockedControls(externalState.lockedControls);
      if (externalState.challengeMode !== undefined) setChallengeMode(externalState.challengeMode);
      if (externalState.challengeTarget !== undefined) setChallengeTarget(externalState.challengeTarget);
    }
  }, [externalState]);

  // Report state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        mode,
        selectedPlanet,
        focusedConcept,
        showOrbitalPaths,
        showSpeedIndicators,
        showDistanceMarkers,
        timeScale,
        highlightedPlanet,
        infoMessage,
        planetOverrides,
        lockedControls,
        challengeMode,
        challengeTarget
      });
    }
  }, [mode, selectedPlanet, focusedConcept, showOrbitalPaths, showSpeedIndicators, showDistanceMarkers, timeScale, highlightedPlanet, infoMessage, planetOverrides, lockedControls, challengeMode, challengeTarget, onStateChange]);

  // Get planet parameters (with overrides)
  const getPlanetParams = useCallback((planetKey) => {
    const base = PLANET_DATA[planetKey];
    const overrides = planetOverrides[planetKey] || {};
    return {
      semiMajorAxis: overrides.semiMajorAxis ?? base.realSemiMajorAxis,
      eccentricity: overrides.eccentricity ?? base.realEccentricity,
      mass: overrides.mass ?? base.mass,
      color: base.color,
      name: base.name
    };
  }, [planetOverrides]);

  // Calculate orbital period based on semi-major axis (Kepler's Third Law)
  const calculatePeriod = useCallback((semiMajorAxis) => {
    return Math.pow(semiMajorAxis, 1.5);
  }, []);

  // Calculate orbital speed
  const calculateSpeed = useCallback((semiMajorAxis, eccentricity, angle) => {
    const r = semiMajorAxis * (1 - eccentricity * eccentricity) / (1 + eccentricity * Math.cos(angle));
    return Math.sqrt((2 / r) - (1 / semiMajorAxis));
  }, []);

  // Calculate position on ellipse
  const getOrbitalPosition = useCallback((semiMajorAxis, eccentricity, angle, centerX, centerY, scale) => {
    const r = semiMajorAxis * (1 - eccentricity * eccentricity) / (1 + eccentricity * Math.cos(angle));
    const x = centerX + r * Math.cos(angle) * scale;
    const y = centerY + r * Math.sin(angle) * scale;
    return { x, y, r };
  }, []);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setPlanetAngles(prev => {
        const newAngles = { ...prev };
        PLANET_ORDER.forEach(planetKey => {
          const params = getPlanetParams(planetKey);
          const period = calculatePeriod(params.semiMajorAxis);
          const angularVelocity = (2 * Math.PI) / (period * 10); // Scale time
          const currentAngle = prev[planetKey] || 0;
          let newAngle = currentAngle + angularVelocity * delta * timeScale;
          
          // Check for orbit completion
          if (newAngle >= 2 * Math.PI) {
            newAngle = newAngle % (2 * Math.PI);
            setOrbitCounts(prevCounts => {
              const newCount = (prevCounts[planetKey] || 0) + 1;
              onEvent?.('orbit-completed', {
                planet: planetKey,
                period: period,
                averageSpeed: calculateSpeed(params.semiMajorAxis, params.eccentricity, 0)
              });
              return { ...prevCounts, [planetKey]: newCount };
            });
          }
          
          newAngles[planetKey] = newAngle;
        });
        return newAngles;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [timeScale, getPlanetParams, calculatePeriod, calculateSpeed, onEvent]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) / 22; // Scale to fit Saturn's orbit

    // Clear canvas
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, width, height);

    // Draw stars background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let i = 0; i < 100; i++) {
      const x = (Math.sin(i * 123.456) * 0.5 + 0.5) * width;
      const y = (Math.cos(i * 789.012) * 0.5 + 0.5) * height;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 1.5, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw orbital paths
    if (showOrbitalPaths) {
      PLANET_ORDER.forEach(planetKey => {
        const params = getPlanetParams(planetKey);
        const a = params.semiMajorAxis * scale;
        const e = params.eccentricity;
        const b = a * Math.sqrt(1 - e * e);
        const focalOffset = a * e;

        ctx.strokeStyle = selectedPlanet === planetKey ? params.color : `${params.color}66`;
        ctx.lineWidth = selectedPlanet === planetKey || highlightedPlanet === planetKey ? 2 : 1;
        ctx.beginPath();
        ctx.ellipse(centerX + focalOffset, centerY, a, b, 0, 0, 2 * Math.PI);
        ctx.stroke();
      });
    }

    // Draw Sun
    const sunGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 15);
    sunGradient.addColorStop(0, '#ffff00');
    sunGradient.addColorStop(0.5, '#ffaa00');
    sunGradient.addColorStop(1, '#ff6600');
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
    ctx.fill();

    // Draw planets
    PLANET_ORDER.forEach(planetKey => {
      const params = getPlanetParams(planetKey);
      const angle = planetAngles[planetKey] || 0;
      const pos = getOrbitalPosition(params.semiMajorAxis, params.eccentricity, angle, centerX, centerY, scale);
      
      const isSelected = selectedPlanet === planetKey;
      const isHighlighted = highlightedPlanet === planetKey;
      const planetSize = planetKey === 'jupiter' ? 8 : planetKey === 'saturn' ? 7 : 5;
      
      // Draw planet
      ctx.fillStyle = params.color;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, isSelected || isHighlighted ? planetSize + 2 : planetSize, 0, 2 * Math.PI);
      ctx.fill();

      // Draw selection ring
      if (isSelected) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, planetSize + 5, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Draw Saturn's rings
      if (planetKey === 'saturn') {
        ctx.strokeStyle = '#c9a227';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y, 12, 4, 0.3, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Draw speed indicators
      if (showSpeedIndicators) {
        const speed = calculateSpeed(params.semiMajorAxis, params.eccentricity, angle);
        const vx = -Math.sin(angle) * speed * 15;
        const vy = Math.cos(angle) * speed * 15;
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(pos.x + vx, pos.y + vy);
        ctx.stroke();
        // Arrow head
        ctx.beginPath();
        ctx.moveTo(pos.x + vx, pos.y + vy);
        ctx.lineTo(pos.x + vx - 5, pos.y + vy - 5);
        ctx.moveTo(pos.x + vx, pos.y + vy);
        ctx.lineTo(pos.x + vx + 5, pos.y + vy - 5);
        ctx.stroke();
      }

      // Draw distance markers
      if (showDistanceMarkers && isSelected) {
        ctx.strokeStyle = '#ffffff44';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Distance label
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px sans-serif';
        ctx.fillText(`${pos.r.toFixed(2)} AU`, (centerX + pos.x) / 2, (centerY + pos.y) / 2 - 10);
      }

      // Planet label
      ctx.fillStyle = '#ffffff';
      ctx.font = isSelected ? 'bold 12px sans-serif' : '10px sans-serif';
      ctx.fillText(params.name, pos.x + planetSize + 5, pos.y + 4);
    });

  }, [planetAngles, selectedPlanet, highlightedPlanet, showOrbitalPaths, showSpeedIndicators, showDistanceMarkers, getPlanetParams, getOrbitalPosition, calculateSpeed]);

  // Handle planet selection
  const handlePlanetSelect = useCallback((planetKey) => {
    const previousPlanet = selectedPlanet;
    setSelectedPlanet(planetKey);
    onEvent?.('planet-selected', { planet: planetKey, previousPlanet });
  }, [selectedPlanet, onEvent]);

  // Handle mode change
  const handleModeChange = useCallback((newMode) => {
    setMode(newMode);
    if (newMode === 'observe') {
      setSelectedPlanet(null);
    }
    onEvent?.('mode-changed', { newMode });
  }, [onEvent]);

  // Handle parameter change
  const handleParameterChange = useCallback((parameter, newValue) => {
    if (!selectedPlanet || lockedControls.includes(parameter)) return;
    
    const currentParams = getPlanetParams(selectedPlanet);
    const oldValue = currentParams[parameter];
    
    setPlanetOverrides(prev => ({
      ...prev,
      [selectedPlanet]: {
        ...prev[selectedPlanet],
        [parameter]: newValue
      }
    }));

    const newParams = { ...currentParams, [parameter]: newValue };
    const resultingPeriod = calculatePeriod(newParams.semiMajorAxis);
    const resultingSpeed = calculateSpeed(newParams.semiMajorAxis, newParams.eccentricity, 0);

    onEvent?.('parameter-changed', {
      planet: selectedPlanet,
      parameter,
      oldValue,
      newValue,
      resultingPeriod,
      resultingSpeed
    });

    // Check for challenge completion
    if (challengeMode && challengeTarget) {
      if (challengeTarget.planet === selectedPlanet) {
        if (challengeTarget.targetPeriod && Math.abs(resultingPeriod - challengeTarget.targetPeriod) < 0.1) {
          onEvent?.('challenge-completed', {
            planet: selectedPlanet,
            targetMet: 'period',
            attempts: 1
          });
        }
      }
    }

    // Check for pattern discovery
    if (parameter === 'semiMajorAxis' && Math.abs(newValue - oldValue) > 0.5) {
      onEvent?.('pattern-discovered', {
        pattern: 'distance-period-relationship',
        planets: [selectedPlanet],
        values: { oldDistance: oldValue, newDistance: newValue, oldPeriod: calculatePeriod(oldValue), newPeriod: resultingPeriod }
      });
    }
  }, [selectedPlanet, lockedControls, getPlanetParams, calculatePeriod, calculateSpeed, onEvent, challengeMode, challengeTarget]);

  // Handle reset
  const handleReset = useCallback((scope = 'planet') => {
    if (scope === 'all') {
      setPlanetOverrides({});
    } else if (selectedPlanet) {
      setPlanetOverrides(prev => {
        const newOverrides = { ...prev };
        delete newOverrides[selectedPlanet];
        return newOverrides;
      });
    }
    onEvent?.('reset-clicked', { scope, planet: selectedPlanet });
  }, [selectedPlanet, onEvent]);

  // Get current planet info for display
  const currentPlanetInfo = useMemo(() => {
    if (!selectedPlanet) return null;
    const params = getPlanetParams(selectedPlanet);
    const period = calculatePeriod(params.semiMajorAxis);
    const speed = calculateSpeed(params.semiMajorAxis, params.eccentricity, planetAngles[selectedPlanet] || 0);
    const angle = planetAngles[selectedPlanet] || 0;
    const currentDistance = params.semiMajorAxis * (1 - params.eccentricity * params.eccentricity) / (1 + params.eccentricity * Math.cos(angle));
    
    return {
      name: params.name,
      period: period.toFixed(2),
      speed: speed.toFixed(3),
      currentDistance: currentDistance.toFixed(3),
      avgDistance: params.semiMajorAxis.toFixed(3),
      semiMajorAxis: params.semiMajorAxis,
      eccentricity: params.eccentricity,
      mass: params.mass
    };
  }, [selectedPlanet, getPlanetParams, calculatePeriod, calculateSpeed, planetAngles]);

  return (
    <Card className="w-full bg-slate-900 border-slate-700">
      <CardContent className="p-4">
        {/* Info Message */}
        {infoMessage && (
          <div className="mb-4 p-3 bg-blue-900/50 border border-blue-500/50 rounded-lg text-blue-100 text-sm">
            {infoMessage}
          </div>
        )}

        <div className="flex gap-4">
          {/* Canvas Area */}
          <div className="flex-1">
            <canvas
              ref={canvasRef}
              width={500}
              height={400}
              className="w-full rounded-lg border border-slate-600 cursor-pointer"
              onClick={(e) => {
                if (mode !== 'explore') return;
                const rect = e.target.getBoundingClientRect();
                const x = (e.clientX - rect.left) * (500 / rect.width);
                const y = (e.clientY - rect.top) * (400 / rect.height);
                const centerX = 250;
                const centerY = 200;
                const scale = 400 / 22;
                
                // Find clicked planet
                PLANET_ORDER.forEach(planetKey => {
                  const params = getPlanetParams(planetKey);
                  const angle = planetAngles[planetKey] || 0;
                  const pos = getOrbitalPosition(params.semiMajorAxis, params.eccentricity, angle, centerX, centerY, scale);
                  const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                  if (dist < 15) {
                    handlePlanetSelect(planetKey);
                  }
                });
              }}
            />
            
            {/* Time Controls */}
            <div className="mt-2 flex items-center gap-2">
              <Label className="text-slate-300 text-sm">Speed:</Label>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={timeScale}
                onChange={(e) => setTimeScale(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-slate-400 text-sm w-12">{timeScale.toFixed(1)}x</span>
            </div>
          </div>

          {/* Control Panel */}
          <div className="w-64 space-y-4">
            {/* Mode Toggle */}
            <div className="flex gap-2">
              <Button
                variant={mode === 'observe' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleModeChange('observe')}
                className="flex-1"
              >
                Observe
              </Button>
              <Button
                variant={mode === 'explore' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleModeChange('explore')}
                className="flex-1"
              >
                Explore
              </Button>
            </div>

            {mode === 'explore' && (
              <>
                {/* Planet Selector */}
                <div>
                  <Label className="text-slate-300 text-sm mb-1 block">Select Planet</Label>
                  <Select value={selectedPlanet || ''} onValueChange={handlePlanetSelect}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue placeholder="Choose a planet..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PLANET_ORDER.map(key => (
                        <SelectItem key={key} value={key}>
                          <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PLANET_DATA[key].color }} />
                            {PLANET_DATA[key].name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPlanet && currentPlanetInfo && (
                  <>
                    {/* Parameter Sliders */}
                    <div className="space-y-3">
                      <div>
                        <Label className="text-slate-300 text-sm flex justify-between">
                          <span>Semi-Major Axis (AU)</span>
                          <span className="text-slate-400">{currentPlanetInfo.semiMajorAxis.toFixed(2)}</span>
                        </Label>
                        <input
                          type="range"
                          min="0.2"
                          max="12"
                          step="0.1"
                          value={currentPlanetInfo.semiMajorAxis}
                          onChange={(e) => handleParameterChange('semiMajorAxis', parseFloat(e.target.value))}
                          disabled={lockedControls.includes('semiMajorAxis')}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label className="text-slate-300 text-sm flex justify-between">
                          <span>Eccentricity</span>
                          <span className="text-slate-400">{currentPlanetInfo.eccentricity.toFixed(3)}</span>
                        </Label>
                        <input
                          type="range"
                          min="0"
                          max="0.9"
                          step="0.01"
                          value={currentPlanetInfo.eccentricity}
                          onChange={(e) => handleParameterChange('eccentricity', parseFloat(e.target.value))}
                          disabled={lockedControls.includes('eccentricity')}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label className="text-slate-300 text-sm flex justify-between">
                          <span>Planet Mass (Earth = 1)</span>
                          <span className="text-slate-400">{currentPlanetInfo.mass.toFixed(2)}</span>
                        </Label>
                        <input
                          type="range"
                          min="0.01"
                          max="400"
                          step="0.1"
                          value={currentPlanetInfo.mass}
                          onChange={(e) => handleParameterChange('mass', parseFloat(e.target.value))}
                          disabled={lockedControls.includes('mass')}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Reset Button */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReset('planet')}
                        className="flex-1"
                      >
                        Reset Planet
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReset('all')}
                        className="flex-1"
                      >
                        Reset All
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Display Options */}
            <div className="space-y-2 pt-2 border-t border-slate-700">
              <Label className="text-slate-400 text-xs uppercase">Display Options</Label>
              <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOrbitalPaths}
                  onChange={(e) => setShowOrbitalPaths(e.target.checked)}
                  className="rounded"
                />
                Show Orbital Paths
              </label>
              <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSpeedIndicators}
                  onChange={(e) => setShowSpeedIndicators(e.target.checked)}
                  className="rounded"
                />
                Show Speed Vectors
              </label>
              <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDistanceMarkers}
                  onChange={(e) => setShowDistanceMarkers(e.target.checked)}
                  className="rounded"
                />
                Show Distance
              </label>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        {selectedPlanet && currentPlanetInfo && (
          <div className="mt-4 p-3 bg-slate-800 rounded-lg grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-slate-400 text-xs uppercase">Orbital Period</div>
              <div className="text-white font-bold">{currentPlanetInfo.period} years</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs uppercase">Current Speed</div>
              <div className="text-white font-bold">{currentPlanetInfo.speed} AU/yr</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs uppercase">Current Distance</div>
              <div className="text-white font-bold">{currentPlanetInfo.currentDistance} AU</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs uppercase">Avg Distance</div>
              <div className="text-white font-bold">{currentPlanetInfo.avgDistance} AU</div>
            </div>
          </div>
        )}

        {/* Challenge Mode Indicator */}
        {challengeMode && challengeTarget && (
          <div className="mt-4 p-3 bg-amber-900/50 border border-amber-500/50 rounded-lg text-amber-100 text-sm">
            <strong>Challenge:</strong> {challengeTarget.description || `Adjust ${challengeTarget.planet}'s orbit to achieve the target!`}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
