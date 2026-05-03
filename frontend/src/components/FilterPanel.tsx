import React from 'react';

// ★Props（プロップス）の型定義：親(App.tsx)から受け取る「荷物」のルールブック
type FilterPanelProps = {
  tagData: any;
  activeFilterTagId: number | null;
  setActiveFilterTagId: (id: number | null) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
};

// ★コンポーネント本体
export const FilterPanel: React.FC<FilterPanelProps> = ({
  tagData,
  activeFilterTagId,
  setActiveFilterTagId,
  filterStatus,
  setFilterStatus,
}) => {
  return (
    <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
      
      {/* 1段目：タグフィルター */}
      {tagData?.tags && tagData.tags.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#555' }}>🏷 タグ:</span>
          <button 
            onClick={() => setActiveFilterTagId(null)} 
            style={{ padding: '4px 12px', borderRadius: '16px', border: activeFilterTagId === null ? '2px solid #333' : '1px solid #ccc', backgroundColor: activeFilterTagId === null ? '#333' : '#fff', color: activeFilterTagId === null ? '#fff' : '#333', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
          >
            すべて
          </button>
          {tagData.tags.map((tag: any) => (
            <button 
              key={tag.id} 
              onClick={() => setActiveFilterTagId(tag.id)} 
              style={{ padding: '4px 12px', borderRadius: '16px', border: activeFilterTagId === tag.id ? `2px solid ${tag.color || '#888'}` : '1px solid #ccc', backgroundColor: activeFilterTagId === tag.id ? (tag.color || '#eee') : '#fff', color: activeFilterTagId === tag.id ? '#fff' : '#333', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* 2段目：ステータスフィルター */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#555' }}>✅ 状態:</span>
        <button 
          onClick={() => setFilterStatus('ALL')}
          style={{ padding: '4px 12px', borderRadius: '16px', border: filterStatus === 'ALL' ? '2px solid #333' : '1px solid #ccc', backgroundColor: filterStatus === 'ALL' ? '#333' : '#fff', color: filterStatus === 'ALL' ? '#fff' : '#333', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
        >すべて</button>
        <button 
          onClick={() => setFilterStatus('ACTIVE')}
          style={{ padding: '4px 12px', borderRadius: '16px', border: filterStatus === 'ACTIVE' ? '2px solid #4CAF50' : '1px solid #ccc', backgroundColor: filterStatus === 'ACTIVE' ? '#4CAF50' : '#fff', color: filterStatus === 'ACTIVE' ? '#fff' : '#333', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
        >未完了</button>
        <button 
          onClick={() => setFilterStatus('COMPLETED')}
          style={{ padding: '4px 12px', borderRadius: '16px', border: filterStatus === 'COMPLETED' ? '2px solid #9E9E9E' : '1px solid #ccc', backgroundColor: filterStatus === 'COMPLETED' ? '#9E9E9E' : '#fff', color: filterStatus === 'COMPLETED' ? '#fff' : '#333', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
        >完了</button>
      </div>
    </div>
  );
};