import React, { useState, useEffect, useCallback } from 'react';

interface Plant {
  id: string;
  type: 'flower' | 'vegetable' | 'tree';
  name: string;
  emoji: string;
  stage: number; // 0=seed, 1=sprout, 2=growing, 3=mature, 4=ready
  watered: boolean;
  plantedAt: number;
  lastWateredAt: number;
}

interface GardeningGameProps {
  onClose: () => void;
  onReward?: (coins: number, item?: string) => void;
}

const PLANT_TYPES = {
  flower: [
    { name: 'Sunflower', emoji: '🌻', reward: 10 },
    { name: 'Rose', emoji: '🌹', reward: 15 },
    { name: 'Tulip', emoji: '🌷', reward: 12 },
    { name: 'Daisy', emoji: '🌼', reward: 8 },
  ],
  vegetable: [
    { name: 'Carrot', emoji: '🥕', reward: 20 },
    { name: 'Tomato', emoji: '🍅', reward: 18 },
    { name: 'Corn', emoji: '🌽', reward: 15 },
    { name: 'Broccoli', emoji: '🥦', reward: 22 },
  ],
  tree: [
    { name: 'Apple Tree', emoji: '🍎', reward: 30 },
    { name: 'Cherry Tree', emoji: '🍒', reward: 35 },
    { name: 'Orange Tree', emoji: '🍊', reward: 28 },
    { name: 'Lemon Tree', emoji: '🍋', reward: 25 },
  ],
};

const GROWTH_STAGES = ['🟤', '🌱', '🌿', '🪴', '✨'];

const GardeningGame: React.FC<GardeningGameProps> = ({ onClose, onReward }) => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedSeed, setSelectedSeed] = useState<{type: Plant['type'], index: number} | null>(null);
  const [wateringCan, setWateringCan] = useState(false);
  const [coins, setCoins] = useState(0);
  const [harvested, setHarvested] = useState<string[]>([]);
  const [showSeedMenu, setShowSeedMenu] = useState(false);
  
  // 6 garden plots
  const PLOT_COUNT = 6;

  // Grow plants over time (accelerated for fun - every 2 seconds)
  useEffect(() => {
    const growthInterval = setInterval(() => {
      setPlants(prev => prev.map(plant => {
        if (plant.stage < 4 && plant.watered) {
          const timeSinceWatered = Date.now() - plant.lastWateredAt;
          // Grow every 2 seconds if watered
          if (timeSinceWatered > 2000) {
            return {
              ...plant,
              stage: Math.min(4, plant.stage + 1),
              watered: false, // Needs water again
            };
          }
        }
        return plant;
      }));
    }, 500);

    return () => clearInterval(growthInterval);
  }, []);

  const plantSeed = useCallback((plotIndex: number) => {
    if (!selectedSeed || plants.find(p => p.id === `plot-${plotIndex}`)) return;

    const typeList = PLANT_TYPES[selectedSeed.type];
    const plantInfo = typeList[selectedSeed.index];

    const newPlant: Plant = {
      id: `plot-${plotIndex}`,
      type: selectedSeed.type,
      name: plantInfo.name,
      emoji: plantInfo.emoji,
      stage: 0,
      watered: false,
      plantedAt: Date.now(),
      lastWateredAt: 0,
    };

    setPlants(prev => [...prev, newPlant]);
    setSelectedSeed(null);
  }, [selectedSeed, plants]);

  const waterPlant = useCallback((plotIndex: number) => {
    setPlants(prev => prev.map(plant => {
      if (plant.id === `plot-${plotIndex}` && !plant.watered && plant.stage < 4) {
        return {
          ...plant,
          watered: true,
          lastWateredAt: Date.now(),
        };
      }
      return plant;
    }));
  }, []);

  const harvestPlant = useCallback((plotIndex: number) => {
    const plant = plants.find(p => p.id === `plot-${plotIndex}`);
    if (!plant || plant.stage < 4) return;

    const typeList = PLANT_TYPES[plant.type];
    const plantInfo = typeList.find(p => p.emoji === plant.emoji);
    const reward = plantInfo?.reward || 10;

    setCoins(prev => prev + reward);
    setHarvested(prev => [...prev, plant.emoji]);
    setPlants(prev => prev.filter(p => p.id !== `plot-${plotIndex}`));
    
    if (onReward) {
      onReward(reward, plant.name);
    }
  }, [plants, onReward]);

  const handlePlotClick = (plotIndex: number) => {
    const existingPlant = plants.find(p => p.id === `plot-${plotIndex}`);
    
    if (wateringCan && existingPlant && existingPlant.stage < 4) {
      waterPlant(plotIndex);
      setWateringCan(false);
    } else if (existingPlant && existingPlant.stage >= 4) {
      harvestPlant(plotIndex);
    } else if (selectedSeed && !existingPlant) {
      plantSeed(plotIndex);
    }
  };

  const renderPlot = (plotIndex: number) => {
    const plant = plants.find(p => p.id === `plot-${plotIndex}`);
    
    return (
      <div
        key={plotIndex}
        onClick={() => handlePlotClick(plotIndex)}
        style={{
          width: '80px',
          height: '80px',
          background: plant 
            ? 'linear-gradient(145deg, #5d4037, #3e2723)'
            : 'linear-gradient(145deg, #795548, #5d4037)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: selectedSeed && !plant 
            ? '3px dashed #81c784' 
            : wateringCan && plant && plant.stage < 4 && !plant.watered
              ? '3px solid #4fc3f7'
              : plant?.stage === 4
                ? '3px solid #ffd700'
                : '2px solid #4a332d',
          boxShadow: plant?.stage === 4 
            ? '0 0 15px rgba(255, 215, 0, 0.5)'
            : '0 2px 4px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease',
          animation: plant?.watered ? 'waterShimmer 1s infinite' : undefined,
        }}
      >
        {plant ? (
          <>
            <span style={{ fontSize: '28px' }}>
              {plant.stage < 4 ? GROWTH_STAGES[plant.stage] : plant.emoji}
            </span>
            {plant.stage < 4 && (
              <span style={{ 
                fontSize: '10px', 
                color: plant.watered ? '#4fc3f7' : '#ffcc80',
                marginTop: '2px',
              }}>
                {plant.watered ? '💧 Growing...' : 'Needs water!'}
              </span>
            )}
            {plant.stage === 4 && (
              <span style={{ 
                fontSize: '10px', 
                color: '#ffd700',
                marginTop: '2px',
              }}>
                🎉 Harvest!
              </span>
            )}
          </>
        ) : (
          <span style={{ fontSize: '24px', opacity: 0.5 }}>🕳️</span>
        )}
      </div>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'linear-gradient(180deg, #87ceeb 0%, #98fb98 100%)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        background: 'rgba(255,255,255,0.9)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}>
        <button
          onClick={onClose}
          style={{
            background: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 16px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
        <h2 style={{ margin: 0, color: '#2e7d32', fontSize: '20px' }}>
          🌱 Magic Garden
        </h2>
        <div style={{
          background: '#ffd700',
          borderRadius: '20px',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: 'bold',
        }}>
          🪙 {coins}
        </div>
      </div>

      {/* Garden Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        gap: '20px',
      }}>
        {/* Garden Plots */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          background: 'rgba(139, 69, 19, 0.3)',
          padding: '24px',
          borderRadius: '20px',
          border: '4px solid #5d4037',
        }}>
          {Array.from({ length: PLOT_COUNT }, (_, i) => renderPlot(i))}
        </div>

        {/* Harvested Items */}
        {harvested.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ fontSize: '14px', color: '#333' }}>Harvested:</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {harvested.slice(-10).map((emoji, i) => (
                <span key={i} style={{ fontSize: '20px' }}>{emoji}</span>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div style={{
          background: 'rgba(255,255,255,0.8)',
          borderRadius: '12px',
          padding: '12px 20px',
          fontSize: '13px',
          color: '#333',
          textAlign: 'center',
          maxWidth: '300px',
        }}>
          {selectedSeed 
            ? '👆 Tap an empty plot to plant!' 
            : wateringCan
              ? '💧 Tap a plant to water it!'
              : '🌱 Choose a seed or water your plants!'}
        </div>
      </div>

      {/* Tools Bar */}
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        padding: '16px',
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
      }}>
        {/* Seed Selection */}
        <button
          onClick={() => {
            setShowSeedMenu(!showSeedMenu);
            setWateringCan(false);
          }}
          style={{
            background: selectedSeed ? '#81c784' : '#e8f5e9',
            border: '2px solid #4caf50',
            borderRadius: '12px',
            padding: '12px 20px',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          🌱 Seeds
        </button>

        {/* Watering Can */}
        <button
          onClick={() => {
            setWateringCan(!wateringCan);
            setSelectedSeed(null);
            setShowSeedMenu(false);
          }}
          style={{
            background: wateringCan ? '#4fc3f7' : '#e1f5fe',
            border: '2px solid #03a9f4',
            borderRadius: '12px',
            padding: '12px 20px',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          🚿 Water
        </button>
      </div>

      {/* Seed Menu */}
      {showSeedMenu && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'white',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxWidth: '320px',
          width: '90%',
        }}>
          {(['flower', 'vegetable', 'tree'] as const).map(type => (
            <div key={type}>
              <div style={{ 
                fontSize: '12px', 
                color: '#666', 
                marginBottom: '6px',
                textTransform: 'capitalize',
              }}>
                {type === 'flower' ? '🌸 Flowers' : type === 'vegetable' ? '🥬 Vegetables' : '🌳 Trees'}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {PLANT_TYPES[type].map((plant, idx) => (
                  <button
                    key={plant.name}
                    onClick={() => {
                      setSelectedSeed({ type, index: idx });
                      setShowSeedMenu(false);
                    }}
                    style={{
                      background: '#f5f5f5',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '14px',
                    }}
                  >
                    <span>{plant.emoji}</span>
                    <span style={{ fontSize: '10px', color: '#888' }}>+{plant.reward}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes waterShimmer {
          0%, 100% { box-shadow: 0 0 5px rgba(79, 195, 247, 0.5); }
          50% { box-shadow: 0 0 15px rgba(79, 195, 247, 0.8); }
        }
      `}</style>
    </div>
  );
};

export default GardeningGame;
