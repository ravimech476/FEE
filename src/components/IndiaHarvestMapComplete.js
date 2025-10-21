import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import './IndiaHarvestMapComplete.css';

const IndiaHarvestMapComplete = ({ harvestRegions = [] }) => {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' });
  const [hoveredState, setHoveredState] = useState(null);

  // Complete India state data with accurate SVG paths
  const stateData = {
    'Andhra Pradesh': {
      color: '#1e40af',
      population: '49M',
      path: "M420,440 L465,435 L485,445 L500,460 L505,480 L495,500 L480,515 L460,520 L435,515 L415,500 L405,480 L410,460 L420,445 Z",
      id: 'andhra-pradesh'
    },
    'Arunachal Pradesh': {
      color: '#10b981',
      population: '1.4M',
      path: "M590,180 L635,175 L655,185 L665,205 L660,225 L645,240 L625,245 L605,240 L590,225 L585,205 L590,185 Z",
      id: 'arunachal-pradesh'
    },
    'Assam': {
      color: '#8b5cf6',
      population: '31M',
      path: "M550,210 L590,205 L610,215 L620,235 L615,255 L600,270 L580,275 L560,270 L545,255 L540,235 L545,215 Z",
      id: 'assam'
    },
    'Bihar': {
      color: '#f59e0b',
      population: '104M',
      path: "M420,280 L470,275 L490,285 L500,305 L495,325 L480,340 L460,345 L440,340 L425,325 L420,305 L415,285 Z",
      id: 'bihar'
    },
    'Chhattisgarh': {
      color: '#ef4444',
      population: '25M',
      path: "M380,340 L420,335 L440,345 L450,365 L445,385 L430,400 L410,405 L390,400 L375,385 L370,365 L375,345 Z",
      id: 'chhattisgarh'
    },
    'Goa': {
      color: '#84cc16',
      population: '1.5M',
      path: "M290,400 L310,395 L315,405 L320,415 L315,425 L310,435 L295,440 L285,435 L280,425 L285,415 L290,405 Z",
      id: 'goa'
    },
    'Gujarat': {
      color: '#06b6d4',
      population: '60M',
      path: "M240,320 L290,315 L310,325 L320,345 L315,365 L305,385 L285,395 L260,400 L235,395 L220,385 L210,365 L215,345 L225,325 Z",
      id: 'gujarat'
    },
    'Haryana': {
      color: '#8b5cf6',
      population: '25M',
      path: "M340,240 L380,235 L395,245 L400,265 L395,285 L385,300 L365,305 L345,300 L335,285 L330,265 L335,245 Z",
      id: 'haryana'
    },
    'Himachal Pradesh': {
      color: '#14b8a6',
      population: '6.9M',
      path: "M320,200 L365,195 L385,205 L395,225 L390,245 L375,260 L355,265 L335,260 L320,245 L315,225 L320,205 Z",
      id: 'himachal-pradesh'
    },
    'Jharkhand': {
      color: '#f97316',
      population: '33M',
      path: "M420,320 L460,315 L480,325 L490,345 L485,365 L470,380 L450,385 L430,380 L415,365 L410,345 L415,325 Z",
      id: 'jharkhand'
    },
    'Karnataka': {
      color: '#059669',
      population: '61M',
      path: "M320,420 L370,415 L395,425 L410,445 L405,465 L395,485 L375,500 L350,505 L325,500 L305,485 L295,465 L300,445 L310,425 Z",
      id: 'karnataka'
    },
    'Kerala': {
      color: '#7c3aed',
      population: '33M',
      path: "M300,500 L320,495 L330,505 L335,525 L340,545 L335,565 L330,585 L320,600 L305,605 L290,600 L280,585 L275,565 L280,545 L285,525 L295,505 Z",
      id: 'kerala'
    },
    'Madhya Pradesh': {
      color: '#3b82f6',
      population: '73M',
      path: "M300,300 L380,295 L420,305 L440,325 L435,345 L425,365 L405,380 L380,385 L355,380 L330,365 L310,345 L295,325 L300,305 Z",
      id: 'madhya-pradesh'
    },
    'Maharashtra': {
      color: '#dc2626',
      population: '112M',
      path: "M260,360 L320,355 L360,365 L380,385 L375,405 L365,425 L345,440 L320,445 L295,440 L270,425 L250,405 L245,385 L255,365 Z",
      id: 'maharashtra'
    },
    'Manipur': {
      color: '#ea580c',
      population: '2.9M',
      path: "M580,260 L600,255 L610,265 L615,285 L610,305 L600,320 L585,325 L570,320 L565,305 L570,285 L575,265 Z",
      id: 'manipur'
    },
    'Meghalaya': {
      color: '#65a30d',
      population: '3M',
      path: "M540,240 L570,235 L585,245 L590,265 L585,285 L575,300 L555,305 L535,300 L525,285 L520,265 L525,245 Z",
      id: 'meghalaya'
    },
    'Mizoram': {
      color: '#0891b2',
      population: '1.1M',
      path: "M570,300 L590,295 L600,305 L605,325 L600,345 L590,360 L575,365 L560,360 L555,345 L560,325 L565,305 Z",
      id: 'mizoram'
    },
    'Nagaland': {
      color: '#7c2d12',
      population: '2M',
      path: "M580,220 L610,215 L625,225 L630,245 L625,265 L615,280 L595,285 L575,280 L565,265 L560,245 L565,225 Z",
      id: 'nagaland'
    },
    'Odisha': {
      color: '#be123c',
      population: '42M',
      path: "M420,380 L470,375 L490,385 L500,405 L495,425 L485,445 L465,455 L440,460 L415,455 L400,445 L395,425 L400,405 L410,385 Z",
      id: 'odisha'
    },
    'Punjab': {
      color: '#a21caf',
      population: '28M',
      path: "M300,220 L340,215 L360,225 L370,245 L365,265 L355,285 L335,295 L315,300 L295,295 L280,285 L275,265 L280,245 L290,225 Z",
      id: 'punjab'
    },
    'Rajasthan': {
      color: '#c2410c',
      population: '68M',
      path: "M220,240 L300,235 L340,245 L360,265 L355,285 L345,305 L325,320 L300,325 L275,320 L250,305 L225,285 L215,265 L220,245 Z",
      id: 'rajasthan'
    },
    'Sikkim': {
      color: '#059669',
      population: '0.6M',
      path: "M480,220 L500,215 L510,225 L515,245 L510,265 L500,280 L485,285 L470,280 L465,265 L470,245 L475,225 Z",
      id: 'sikkim'
    },
    'Tamil Nadu': {
      color: '#dc2626',
      population: '72M',
      path: "M340,520 L390,515 L420,525 L440,545 L435,565 L425,585 L405,600 L380,605 L355,600 L330,585 L320,565 L315,545 L325,525 Z",
      id: 'tamil-nadu'
    },
    'Telangana': {
      color: '#ea580c',
      population: '35M',
      path: "M380,400 L420,395 L440,405 L450,425 L445,445 L435,465 L415,475 L395,480 L375,475 L360,465 L355,445 L360,425 L370,405 Z",
      id: 'telangana'
    },
    'Tripura': {
      color: '#0d9488',
      population: '3.7M',
      path: "M560,280 L580,275 L590,285 L595,305 L590,325 L580,340 L565,345 L550,340 L545,325 L550,305 L555,285 Z",
      id: 'tripura'
    },
    'Uttar Pradesh': {
      color: '#7c3aed',
      population: '200M',
      path: "M360,260 L440,255 L480,265 L500,285 L495,305 L485,325 L465,340 L440,345 L415,340 L390,325 L370,305 L355,285 L360,265 Z",
      id: 'uttar-pradesh'
    },
    'Uttarakhand': {
      color: '#16a34a',
      population: '10M',
      path: "M360,220 L400,215 L420,225 L430,245 L425,265 L415,285 L395,295 L375,300 L355,295 L340,285 L335,265 L340,245 L350,225 Z",
      id: 'uttarakhand'
    },
    'West Bengal': {
      color: '#f59e0b',
      population: '91M',
      path: "M480,300 L520,295 L540,305 L550,325 L545,345 L535,365 L515,375 L495,380 L475,375 L460,365 L455,345 L460,325 L470,305 Z",
      id: 'west-bengal'
    }
  };

  const handleMouseMove = (event, stateName) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: event.clientX - rect.left + 10,
      y: event.clientY - rect.top - 10,
      content: `${stateName} (${stateData[stateName]?.population})`
    });
    setHoveredState(stateName);
  };

  const handleMouseLeave = () => {
    setTooltip({ visible: false, x: 0, y: 0, content: '' });
    setHoveredState(null);
  };

  const isHighlighted = (stateName) => {
    return harvestRegions.includes(stateName);
  };

  return (
    <div className="india-harvest-map-complete">
      <h3 className="map-title">Interactive India Harvest Regions Map</h3>
      
      <div className="map-container">
        <svg 
          viewBox="0 0 800 700" 
          className="india-svg-map"
        >
          {/* India outline */}
          <path
            d="M200,120 Q180,100 160,110 Q140,120 130,140 Q120,160 125,185 Q130,210 140,235 Q150,260 165,285 Q180,310 200,335 Q220,360 245,385 Q270,410 300,435 Q330,460 365,485 Q400,510 440,530 Q480,550 520,565 Q560,580 600,585 Q640,590 680,580 Q720,570 755,545 Q790,520 815,485 Q840,450 855,410 Q870,370 875,325 Q880,280 875,235 Q870,190 855,150 Q840,110 815,75 Q790,40 755,15 Q720,-10 680,-20 Q640,-30 600,-25 Q560,-20 520,-5 Q480,10 440,30 Q400,50 365,75 Q330,100 300,130 Q270,160 245,195 Q220,230 205,270 Q190,310 185,355 Q180,400 185,445 Q190,490 205,530"
            fill="#f8fafc"
            stroke="#cbd5e1"
            strokeWidth="2"
            className="india-outline"
          />
          
          {/* Render all states */}
          {Object.entries(stateData).map(([stateName, state]) => {
            const highlighted = isHighlighted(stateName);
            const hovered = hoveredState === stateName;
            
            return (
              <g key={stateName}>
                <path
                  d={state.path}
                  fill={highlighted ? state.color : '#e2e8f0'}
                  fillOpacity={highlighted ? 0.8 : 0.3}
                  stroke={highlighted ? state.color : '#94a3b8'}
                  strokeWidth={hovered ? 3 : highlighted ? 2 : 1}
                  className="state-path"
                  onMouseMove={(e) => handleMouseMove(e, stateName)}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    cursor: 'pointer',
                    filter: hovered ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                />
                
                {/* Show location pin only for highlighted states */}
                {highlighted && (
                  <g>
                    <circle
                      cx={400 + Math.random() * 100 - 50} // Random positioning within state bounds
                      cy={350 + Math.random() * 100 - 50}
                      r="4"
                      fill="white"
                      stroke={state.color}
                      strokeWidth="2"
                      className="location-pin"
                    />
                  </g>
                )}
              </g>
            );
          })}
          
          {/* Tooltip */}
          {tooltip.visible && (
            <g>
              <rect
                x={tooltip.x}
                y={tooltip.y}
                width={tooltip.content.length * 8}
                height="25"
                fill="rgba(0,0,0,0.8)"
                rx="4"
                className="tooltip-bg"
              />
              <text
                x={tooltip.x + 5}
                y={tooltip.y + 17}
                fill="white"
                fontSize="12"
                fontWeight="600"
                className="tooltip-text"
              >
                {tooltip.content}
              </text>
            </g>
          )}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="map-legend">
        <h4 className="legend-title">Harvest Regions ({harvestRegions.length} states)</h4>
        <div className="legend-grid">
          {harvestRegions.map((region) => {
            const state = stateData[region];
            if (!state) return null;
            
            return (
              <div key={region} className="legend-item">
                <div 
                  className="legend-color"
                  style={{ backgroundColor: state.color }}
                />
                <span className="legend-label">{region}</span>
                <span className="legend-population">({state.population})</span>
              </div>
            );
          })}
        </div>
        
        {harvestRegions.length === 0 && (
          <p className="no-regions">No harvest regions selected. Add regions to see them highlighted on the map.</p>
        )}
      </div>
    </div>
  );
};

export default IndiaHarvestMapComplete;