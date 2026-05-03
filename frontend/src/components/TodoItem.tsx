import React from 'react';

// ★Propsの型定義（親から受け取る荷物リスト。今回は大量にあります！）
type TodoItemProps = {
  todo: any;
  editingId: number | null;
  editTitle: string;
  setEditTitle: (val: string) => void;
  editDescription: string;
  setEditDescription: (val: string) => void;
  editDueDate: string;
  setEditDueDate: (val: string) => void;
  editSelectedTagIds: number[];
  toggleTagSelection: (tagId: number, isEdit: boolean) => void;
  tagData: any;
  handleEditSave: (id: number) => void;
  handleEditCancel: () => void;
  expandedTodoId: number | null;
  toggleExpand: (id: number) => void;
  handleToggle: (id: number, isCompleted: boolean) => void;
  handleDelete: (id: number) => void;
  handleEditStart: (todo: any) => void;
};

// ★コンポーネント本体
export const TodoItem: React.FC<TodoItemProps> = ({
  todo, editingId, editTitle, setEditTitle, editDescription, setEditDescription,
  editDueDate, setEditDueDate, editSelectedTagIds, toggleTagSelection, tagData,
  handleEditSave, handleEditCancel, expandedTodoId, toggleExpand,
  handleToggle, handleDelete, handleEditStart
}) => {
  return (
    <li className="task-card">
      {editingId === todo.id ? (
        // --- 編集モード ---
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={{ padding: '4px', fontSize: '1rem' }} />
          <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} style={{ padding: '4px', minHeight: '60px' }} />
          {tagData?.tags && tagData.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '5px' }}>
              {tagData.tags.map((tag: any) => (
                <label key={tag.id} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input type="checkbox" checked={editSelectedTagIds.includes(tag.id)} onChange={() => toggleTagSelection(tag.id, true)} />
                  <span style={{ backgroundColor: tag.color || '#eee', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', textShadow: '0px 0px 2px rgba(0,0,0,0.5)' }}>{tag.name}</span>
                </label>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} style={{ padding: '4px' }} />
            <button onClick={() => handleEditSave(todo.id)} style={{ padding: '4px 12px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}>保存</button>
            <button onClick={handleEditCancel} style={{ padding: '4px 12px', cursor: 'pointer' }}>キャンセル</button>
          </div>
        </div>
      ) : (
        // --- 表示モード ---
        <div onClick={() => toggleExpand(todo.id)} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span onClick={(e) => { e.stopPropagation(); handleToggle(todo.id, todo.isCompleted); }} style={{ cursor: 'pointer', fontSize: '1.2rem', userSelect: 'none' }}>
              {todo.isCompleted ? '✅' : '⬜️'}
            </span>
            
            <span style={{ textDecoration: todo.isCompleted ? 'line-through' : 'none', color: todo.isCompleted ? 'gray' : 'black', fontWeight: 'bold' }}>
              {todo.title}
            </span>
            
            {todo.tags?.map((tag: any) => (
              <span key={tag.id} style={{ backgroundColor: tag.color || '#eee', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', textShadow: '0px 0px 2px rgba(0,0,0,0.5)' }}>{tag.name}</span>
            ))}

            {todo.dueDate && (
              <span style={{ fontSize: '0.8rem', color: '#d9534f', marginLeft: '4px', fontWeight: 'bold' }}>
                🗓 {new Date(todo.dueDate).toLocaleDateString('ja-JP')}
              </span>
            )}
            
            <div style={{ flexGrow: 1 }} />
            <button onClick={(e) => { e.stopPropagation(); handleEditStart(todo); }} style={{ padding: '4px 8px', cursor: 'pointer' }}>編集</button>
            <button onClick={(e) => { e.stopPropagation(); handleDelete(todo.id); }} style={{ padding: '4px 8px', cursor: 'pointer', color: 'red' }}>削除</button>
          </div>
          
          <div className={`accordion-wrapper ${expandedTodoId === todo.id ? 'open' : ''}`}>
            <div className="accordion-inner">
              <div style={{ marginLeft: '32px', marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #ccc', fontSize: '0.9rem', color: '#555' }}>
                {todo.description ? (
                  <div style={{ whiteSpace: 'pre-wrap' }}>{todo.description}</div>
                ) : (
                  <div style={{ color: '#aaa', fontStyle: 'italic' }}>詳細はありません</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </li>
  );
};