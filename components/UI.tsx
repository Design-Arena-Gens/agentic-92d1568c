import { useGameStore } from '../lib/gameStore';

export default function UI() {
  const {
    playerName,
    playerLevel,
    playerExp,
    playerMaxExp,
    playerHealth,
    playerMaxHealth,
    playerMana,
    playerMaxMana,
    playerAttack,
    playerDefense,
    gold,
    skills,
    shadows,
    activeShadows,
    inventory,
    equippedItems,
    quests,
    showInventory,
    showSkillTree,
    showQuests,
    toggleInventory,
    toggleSkillTree,
    toggleQuests,
    useSkill,
    summonShadow,
    equipItem,
    damageEnemy,
    enemies
  } = useGameStore();

  const handleSkillClick = (skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (skill && skill.currentCooldown === 0) {
      useSkill(skillId);
      // Apply skill effect
      if (skill.type === 'attack' && enemies.length > 0) {
        enemies.forEach(enemy => {
          damageEnemy(enemy.id, skill.damage);
        });
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      color: 'white',
      fontFamily: 'monospace',
      zIndex: 1000
    }}>
      {/* Top bar - Player stats */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '15px',
        borderRadius: '8px',
        minWidth: '300px',
        border: '2px solid rgba(99, 102, 241, 0.5)'
      }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px', color: '#818cf8' }}>
          {playerName}
        </div>
        <div style={{ fontSize: '14px', marginBottom: '5px' }}>
          Level: {playerLevel} | Gold: {gold}
        </div>

        {/* Health bar */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '12px', marginBottom: '3px' }}>
            HP: {playerHealth}/{playerMaxHealth}
          </div>
          <div style={{
            width: '100%',
            height: '20px',
            background: '#1f2937',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(playerHealth / playerMaxHealth) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #ef4444, #f87171)',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>

        {/* Mana bar */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '12px', marginBottom: '3px' }}>
            MP: {playerMana}/{playerMaxMana}
          </div>
          <div style={{
            width: '100%',
            height: '20px',
            background: '#1f2937',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(playerMana / playerMaxMana) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>

        {/* EXP bar */}
        <div>
          <div style={{ fontSize: '12px', marginBottom: '3px' }}>
            EXP: {playerExp}/{playerMaxExp}
          </div>
          <div style={{
            width: '100%',
            height: '15px',
            background: '#1f2937',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(playerExp / playerMaxExp) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #fbbf24, #fcd34d)',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>

        <div style={{ fontSize: '12px', marginTop: '8px', display: 'flex', gap: '15px' }}>
          <span>ATK: {playerAttack}</span>
          <span>DEF: {playerDefense}</span>
        </div>
      </div>

      {/* Skills hotbar */}
      <div style={{
        position: 'absolute',
        bottom: 30,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '10px',
        pointerEvents: 'auto'
      }}>
        {skills.map((skill, index) => (
          <button
            key={skill.id}
            onClick={() => handleSkillClick(skill.id)}
            disabled={skill.currentCooldown > 0}
            style={{
              width: '70px',
              height: '70px',
              background: skill.currentCooldown > 0 ? 'rgba(31, 41, 55, 0.9)' : 'rgba(99, 102, 241, 0.9)',
              border: '2px solid rgba(129, 140, 248, 0.5)',
              borderRadius: '8px',
              color: 'white',
              cursor: skill.currentCooldown > 0 ? 'not-allowed' : 'pointer',
              fontSize: '11px',
              padding: '5px',
              position: 'relative',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (skill.currentCooldown === 0) {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.background = 'rgba(129, 140, 248, 0.9)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              if (skill.currentCooldown === 0) {
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.9)';
              }
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: 'bold' }}>{index + 1}</div>
            <div style={{ fontSize: '10px', marginTop: '5px' }}>{skill.name}</div>
            {skill.currentCooldown > 0 && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                borderRadius: '8px'
              }}>
                {Math.ceil(skill.currentCooldown)}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Menu buttons */}
      <div style={{
        position: 'absolute',
        top: 20,
        right: 20,
        display: 'flex',
        gap: '10px',
        pointerEvents: 'auto'
      }}>
        <button
          onClick={toggleInventory}
          style={{
            padding: '10px 20px',
            background: showInventory ? 'rgba(129, 140, 248, 0.9)' : 'rgba(31, 41, 55, 0.9)',
            border: '2px solid rgba(99, 102, 241, 0.5)',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Inventory (I)
        </button>
        <button
          onClick={toggleSkillTree}
          style={{
            padding: '10px 20px',
            background: showSkillTree ? 'rgba(129, 140, 248, 0.9)' : 'rgba(31, 41, 55, 0.9)',
            border: '2px solid rgba(99, 102, 241, 0.5)',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Skills (K)
        </button>
        <button
          onClick={toggleQuests}
          style={{
            padding: '10px 20px',
            background: showQuests ? 'rgba(129, 140, 248, 0.9)' : 'rgba(31, 41, 55, 0.9)',
            border: '2px solid rgba(99, 102, 241, 0.5)',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Quests (Q)
        </button>
      </div>

      {/* Active shadows indicator */}
      {activeShadows.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 120,
          left: 20,
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '10px',
          borderRadius: '8px',
          border: '2px solid rgba(168, 85, 247, 0.5)'
        }}>
          <div style={{ fontSize: '14px', marginBottom: '8px', color: '#a855f7', fontWeight: 'bold' }}>
            Active Shadows: {activeShadows.length}/5
          </div>
          {activeShadows.map(shadow => (
            <div key={shadow.id} style={{ fontSize: '12px', marginBottom: '4px' }}>
              {shadow.name} (Lv.{shadow.level})
            </div>
          ))}
        </div>
      )}

      {/* Inventory panel */}
      {showInventory && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0, 0, 0, 0.95)',
          padding: '30px',
          borderRadius: '12px',
          border: '3px solid rgba(99, 102, 241, 0.5)',
          minWidth: '500px',
          maxHeight: '70vh',
          overflow: 'auto',
          pointerEvents: 'auto'
        }}>
          <h2 style={{ marginTop: 0, color: '#818cf8' }}>Inventory</h2>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#a5b4fc' }}>Equipped</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {Object.entries(equippedItems).map(([slot, item]) => item && (
                <div key={item.id} style={{
                  padding: '10px',
                  background: 'rgba(99, 102, 241, 0.2)',
                  borderRadius: '6px',
                  border: '1px solid rgba(129, 140, 248, 0.3)'
                }}>
                  <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {slot.toUpperCase()} | {item.rarity.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ color: '#a5b4fc' }}>Items ({inventory.length})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {inventory.map(item => (
                <div key={item.id} style={{
                  padding: '10px',
                  background: 'rgba(31, 41, 55, 0.8)',
                  borderRadius: '6px',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  cursor: 'pointer'
                }}
                onClick={() => equipItem(item)}
                >
                  <div style={{ fontWeight: 'bold', color: getRarityColor(item.rarity) }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '5px' }}>
                    {item.slot.toUpperCase()}
                  </div>
                  {item.stats.attack && <div style={{ fontSize: '11px' }}>ATK +{item.stats.attack}</div>}
                  {item.stats.defense && <div style={{ fontSize: '11px' }}>DEF +{item.stats.defense}</div>}
                  {item.stats.health && <div style={{ fontSize: '11px' }}>HP +{item.stats.health}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Skill tree panel */}
      {showSkillTree && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0, 0, 0, 0.95)',
          padding: '30px',
          borderRadius: '12px',
          border: '3px solid rgba(99, 102, 241, 0.5)',
          minWidth: '600px',
          maxHeight: '70vh',
          overflow: 'auto',
          pointerEvents: 'auto'
        }}>
          <h2 style={{ marginTop: 0, color: '#818cf8' }}>Skills & Abilities</h2>

          <div style={{ display: 'grid', gap: '15px' }}>
            {skills.map(skill => (
              <div key={skill.id} style={{
                padding: '15px',
                background: 'rgba(31, 41, 55, 0.8)',
                borderRadius: '8px',
                border: '2px solid rgba(99, 102, 241, 0.3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{skill.name}</div>
                  <div style={{ color: '#fbbf24' }}>Lv.{skill.level}/{skill.maxLevel}</div>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>
                  {skill.description}
                </div>
                <div style={{ display: 'flex', gap: '15px', fontSize: '12px' }}>
                  <span>Damage: {skill.damage}</span>
                  <span>Cooldown: {skill.cooldown}s</span>
                  <span style={{
                    color: skill.type === 'attack' ? '#ef4444' :
                           skill.type === 'summon' ? '#a855f7' : '#10b981'
                  }}>
                    {skill.type.toUpperCase()}
                  </span>
                </div>
                <div style={{
                  marginTop: '10px',
                  width: '100%',
                  height: '8px',
                  background: '#1f2937',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(skill.level / skill.maxLevel) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #6366f1, #818cf8)'
                  }} />
                </div>
              </div>
            ))}
          </div>

          {shadows.length > 0 && (
            <>
              <h3 style={{ color: '#a855f7', marginTop: '30px' }}>Shadow Army</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                {shadows.map(shadow => (
                  <div key={shadow.id} style={{
                    padding: '12px',
                    background: 'rgba(168, 85, 247, 0.1)',
                    borderRadius: '6px',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    cursor: 'pointer'
                  }}
                  onClick={() => summonShadow(shadow.id)}
                  >
                    <div style={{ fontWeight: 'bold' }}>{shadow.name}</div>
                    <div style={{ fontSize: '12px', color: '#c4b5fd' }}>
                      Lv.{shadow.level} | {shadow.type.toUpperCase()} | ATK: {shadow.attack}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Quests panel */}
      {showQuests && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0, 0, 0, 0.95)',
          padding: '30px',
          borderRadius: '12px',
          border: '3px solid rgba(99, 102, 241, 0.5)',
          minWidth: '500px',
          maxHeight: '70vh',
          overflow: 'auto',
          pointerEvents: 'auto'
        }}>
          <h2 style={{ marginTop: 0, color: '#818cf8' }}>Active Quests</h2>

          <div style={{ display: 'grid', gap: '15px' }}>
            {quests.map(quest => (
              <div key={quest.id} style={{
                padding: '15px',
                background: 'rgba(31, 41, 55, 0.8)',
                borderRadius: '8px',
                border: `2px solid ${
                  quest.type === 'main' ? 'rgba(239, 68, 68, 0.5)' :
                  quest.type === 'side' ? 'rgba(59, 130, 246, 0.5)' :
                  'rgba(16, 185, 129, 0.5)'
                }`
              }}>
                <div style={{ display: 'flex', justifyContent: 'between', marginBottom: '10px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{quest.title}</div>
                  <div style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: quest.type === 'main' ? '#ef4444' :
                               quest.type === 'side' ? '#3b82f6' : '#10b981'
                  }}>
                    {quest.type.toUpperCase()}
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '10px' }}>
                  {quest.description}
                </div>
                <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                  Progress: {quest.progress}/{quest.maxProgress}
                </div>
                <div style={{
                  width: '100%',
                  height: '10px',
                  background: '#1f2937',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    width: `${(quest.progress / quest.maxProgress) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #10b981, #34d399)'
                  }} />
                </div>
                <div style={{ fontSize: '12px', color: '#fbbf24' }}>
                  Rewards: {quest.rewards.exp} EXP | {quest.rewards.gold} Gold
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls help */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '12px',
        border: '1px solid rgba(99, 102, 241, 0.3)'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#818cf8' }}>Controls</div>
        <div>WASD - Move</div>
        <div>1-3 - Use Skills</div>
        <div>I - Inventory</div>
        <div>K - Skill Tree</div>
        <div>Q - Quests</div>
        <div>Click Enemy - Attack</div>
      </div>
    </div>
  );
}

function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common': return '#9ca3af';
    case 'rare': return '#3b82f6';
    case 'epic': return '#a855f7';
    case 'legendary': return '#f59e0b';
    case 'mythic': return '#ef4444';
    default: return '#9ca3af';
  }
}
