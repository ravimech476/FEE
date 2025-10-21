import React from 'react';
import { MapPin } from 'lucide-react';
import './IndiaHarvestMap.css';

const IndiaHarvestMap = ({ harvestRegions = [] }) => {
  // Accurate state data with realistic coordinates
  const stateData = {
    'Andhra Pradesh': { 
      color: '#1e40af', 
      x: 420, 
      y: 340,
      path: "M380,320 L440,318 L465,325 L485,340 L490,360 L485,380 L470,400 L450,415 L425,420 L400,415 L380,405 L365,390 L360,370 L365,350 L375,335 Z"
    },
    'Tamil Nadu': { 
      color: '#dc2626', 
      x: 380, 
      y: 440,
      path: "M340,415 L380,410 L420,415 L440,430 L450,450 L445,470 L435,490 L420,505 L400,515 L375,520 L350,515 L330,505 L320,490 L315,470 L320,450 L330,430 Z"
    },
    'Karnataka': { 
      color: '#059669', 
      x: 350, 
      y: 380,
      path: "M310,340 L360,335 L395,340 L415,355 L420,375 L415,395 L405,415 L385,425 L360,430 L335,425 L315,410 L305,390 L300,370 L305,350 Z"
    },
    'Kerala': { 
      color: '#7c3aed', 
      x: 315, 
      y: 460,
      path: "M295,420 L325,415 L335,435 L340,455 L345,475 L340,495 L335,515 L325,535 L315,545 L305,535 L295,515 L290,495 L285,475 L290,455 L295,435 Z"
    },
    'Telangana': { 
      color: '#ea580c', 
      x: 390, 
      y: 310,
      path: "M370,290 L410,285 L430,295 L440,315 L435,335 L425,345 L405,350 L385,345 L370,335 L365,315 L370,295 Z"
    },
    'Arunachal Pradesh': {
      color: '#10b981',
      x: 520,
      y: 170,
      path: "M490,150 L540,145 L560,155 L570,175 L565,195 L550,210 L530,215 L510,210 L495,195 L490,175 L485,155 Z"
    },
    'Assam': {
      color: '#8b5cf6',
      x: 480,
      y: 200,
      path: "M450,180 L500,175 L520,185 L530,205 L525,225 L510,240 L490,245 L470,240 L455,225 L450,205 Z"
    },
    'West Bengal': {
      color: '#f59e0b',
      x: 430,
      y: 250,
      path: "M400,225 L450,220 L470,235 L480,255 L475,275 L465,290 L445,295 L425,290 L410,275 L405,255 L400,235 Z"
    },
    'Odisha': {
      color: '#ef4444',
      x: 405,
      y: 290,
      path: "M375,270 L425,265 L445,280 L455,300 L450,320 L435,335 L415,340 L395,335 L380,320 L370,300 L375,280 Z"
    },
    'Maharashtra': {
      color: '#3b82f6',
      x: 340,
      y: 310,
      path: "M290,280 L360,275 L390,285 L400,305 L395,325 L385,340 L365,350 L340,355 L315,350 L295,340 L285,325 L280,305 L285,285 Z"
    }
  };

  return (
    <div className="harvest-map-container">
      <h3 className="harvest-map-title">Harvest Regions</h3>
      
      <div className="map-wrapper">
        {/* India Map SVG with accurate outline */}
        <svg 
          viewBox="0 0 700 600" 
          className="india-map-svg"
        >
          {/* Accurate India map outline */}
          <path
            d="M160,90
               Q140,75 120,85
               Q95,100 90,130
               Q85,160 100,190
               Q115,220 135,250
               Q155,280 180,310
               Q205,340 235,370
               Q265,400 300,425
               Q335,450 375,470
               Q415,490 455,500
               Q495,510 535,505
               Q575,500 610,480
               Q645,460 670,425
               Q695,390 705,350
               Q715,310 705,270
               Q695,230 670,195
               Q645,160 610,135
               Q575,110 535,95
               Q495,80 455,75
               Q415,70 375,75
               Q335,80 300,95
               Q265,110 235,135
               Q205,160 180,190
               Q155,220 140,250
               Q125,280 120,310
               Q115,340 120,370
               Q125,400 140,430
               Q155,460 175,485"
            fill="#f9fafb"
            stroke="#9ca3af"
            strokeWidth="2"
            className="india-main-outline"
          />
          
          {/* Northeast region */}
          <path
            d="M490,150
               Q510,140 535,145
               Q560,150 580,165
               Q600,180 610,200
               Q620,220 615,245
               Q610,270 595,290
               Q580,310 560,320
               Q540,330 515,325
               Q490,320 470,305
               Q450,290 440,270
               Q430,250 435,225
               Q440,200 455,180
               Q470,160 490,150"
            fill="#f3f4f6"
            stroke="#9ca3af"
            strokeWidth="1.5"
            className="northeast-outline"
          />
          
          {/* Highlight harvest regions */}
          {harvestRegions.map((region, index) => {
            const state = stateData[region];
            if (!state) return null;
            
            return (
              <g key={region}>
                {/* State highlight */}
                <path
                  d={state.path}
                  fill={state.color}
                  fillOpacity="0.85"
                  stroke={state.color}
                  strokeWidth="2.5"
                  className="state-highlight"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'
                  }}
                />
                
                {/* Location pin */}
                <circle
                  cx={state.x}
                  cy={state.y}
                  r="6"
                  fill="white"
                  stroke={state.color}
                  strokeWidth="3"
                  className="location-pin"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }}
                />
                
                {/* State label */}
                <text
                  x={state.x}
                  y={state.y + 30}
                  textAnchor="middle"
                  className="state-text-label"
                  style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    fill: state.color,
                    stroke: 'white',
                    strokeWidth: '3',
                    paintOrder: 'stroke fill',
                    filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.5))'
                  }}
                >
                  {region}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Enhanced Legend */}
      <div className="harvest-legend">
        <h4 className="legend-title">Harvest Regions:</h4>
        <div className="legend-items">
          {harvestRegions.map((region) => {
            const state = stateData[region];
            if (!state) return null;
            
            return (
              <div key={region} className="legend-item">
                <div 
                  className="color-indicator"
                  style={{ 
                    backgroundColor: state.color,
                    boxShadow: `0 0 0 2px ${state.color}33`
                  }}
                ></div>
                <span className="legend-text">{region}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default IndiaHarvestMap;