// frontend/src/App.tsx
import React, { useState } from 'react';//画面上データを一時的に記憶するためのState
import { useQuery, useMutation, gql } from '@apollo/client';//sueQuery: データの取得、useMutation: 追加更新削除のための関数
import './App.css';
import { FilterPanel } from './components/FilterPanel'; // フィルターのコンポーネント読み込み
import { TodoItem } from './components/TodoItem'; // Todoカードのコンポーネント読み込み

// フロントエンドから送る命令
//①データベースからTodo一覧を取得するためのGraphQLクエリの定義
const GET_TODOS = gql`
  query GetTodos {
    todos {
      id
      title
      isCompleted
      description
      dueDate
      tags{id name color}
    }
  }
`;

//②データの追加(Mutation)の注文書を定義
////createTodo という名前のリゾルバ（処理関数）を呼び出します。
const CREATE_TODO = gql`
  mutation CREATE_TODO($title: String!, $description: String, $dueDate: DateTime, $tagIds: [Int!]!) {
    createTodo(createTodoInput:{title:$title, description: $description, dueDate: $dueDate, tagIds:$tagIds}) { 
      id
      title
      isCompleted
    }
  }
`;
// ③ データの更新（Mutation）の注文書を追加！
const UPDATE_TODO = gql`
  mutation UpdateTodo($updateTodoInput: UpdateTodoInput!) {
    updateTodo(updateTodoInput: $updateTodoInput) { id }
  }
`;
// ④ データの削除（Mutation）のリクエスト定義
const REMOVE_TODO = gql`
  mutation RemoveTodo($id: Int!) {
    removeTodo(id: $id) {
      id
    }
  }
`;
// ⑤ タグのデータを取得するクエリも定義
const GET_TAGS = gql`
  query GetTags {
    tags {
      id
      name
      color
    }
  }
`;
// ⑥ タグを新しく作るMutationも定義
const CREATE_TAG = gql`
  mutation CreateTag($name: String!, $color: String) {
    createTag(name: $name, color: $color) {
      id
      name
      color
    }
  }
`;

// ⑦タグを更新する注文書
const UPDATE_TAG = gql`
  mutation UpdateTag($id: Int!, $name: String!, $color: String) {
    updateTag(id: $id, name: $name, color: $color) {
      id
      name
      color
    }
  }
`;

// ⑧タグを削除する注文書
const DELETE_TAG = gql`
  mutation DeleteTag($id: Int!) {
    deleteTag(id: $id) {
      id
    }
  }
`;

//Appコンポーネントの定義
function App() {
  //入力欄の記憶するためのState、初期値なので空欄
  const [InputValue, setInputValue] = useState('');
  const [descriptionValue, setDescriptionValue] = useState('');
  const [dueDateValue, setDueDateValue] = useState('');
  // 選択されたタグのIDを記憶するState（複数選択できるように配列で管理）初期値は空の配列
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]); 

  // 編集用のステートを定義
  const [editingId, setEditingId] = useState<number | null>(null); // 現在編集中のTodoのID
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editSelectedTagIds, setEditSelectedTagIds] = useState<number[]>([]); // 編集モードで選択されたタグのIDを記憶するState

  //タグ用のStateも定義
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#4CAF50'); // デフォルトは緑色

  // フィルター：現在フィルターで選択されているタグのID（null なら「すべて表示」）
  const [activeFilterTagId, setActiveFilterTagId] = useState<number | null>(null);

  // ステータスフィルター用のステート（'ALL'=すべて, 'ACTIVE'=未完了, 'COMPLETED'=完了）
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  //どの詳細を開いているかを記憶するStateも定義（初期値はnullで、どれも開いていない状態）
  const [expandedTodoId, setExpandedTodoId] = useState<number | null>(null);
  //カードクリック時に開閉の切り替え関数
  const toggleExpand = (id: number) => {
    setExpandedTodoId(prevId => prevId === id ? null : id); // 同じカードをクリックしたら閉じる、別のカードをクリックしたらそちらを開く
  };





  // 注文書をバックエンドに送信するためのフックを呼び出す
  const { loading, error, data } = useQuery(GET_TODOS); 

  // ★新機能：タグ用の通信フックを追加
  const { data: tagData } = useQuery(GET_TAGS);
  const [addTag] = useMutation(CREATE_TAG, {
    refetchQueries: [{ query: GET_TAGS }], // タグ追加後に一覧を再取得
  });

  //データを追加する通信関数addTodoを定義する
  const [addTodo] = useMutation(CREATE_TODO, {
    refetchQueries: [{ query: GET_TODOS }],// refetchQueries: Mutation（追加）が成功したら、自動的にもう一度 GET_TODOS を実行して、最新のリストをバックエンドから取得し直してくれるオプション
  });
  //更新機能の準備！updateTodoという関数を定義する
  const [updateTodo] = useMutation(UPDATE_TODO, {
    refetchQueries: [{ query: GET_TODOS }],
  });
  // 削除機能の準備（削除成功後にリストを再取得する）
  const [removeTodo] = useMutation(REMOVE_TODO, {
    refetchQueries: [{ query: GET_TODOS }],
  });
  // タグの追加ボタンが押された時の処理
  const handleTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    try {
      await addTag({
        variables: {
          name: tagName,
          color: tagColor,
        },
      });
      setTagName(''); // 成功したら名前の入力欄だけ空にする
    } catch (err: any) {
      console.error("タグ追加エラー:", err);
      // データベースで @unique（重複禁止）にしているため、同じ名前だとエラーになります
      if (err.message.includes('Unique constraint failed')) {
        alert("その名前のタグはすでに存在します！別の名前をつけてください。");
      }
    }
  };

  // 「追加ボタン」が押された時の関数をqueryから呼び出せるように定義する
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!InputValue.trim()) return;
    try {
      // カレンダーの日付(YYYY-MM-DD)を、バックエンドが読める国際標準規格(ISO文字列)に変換
      const formattedDate = dueDateValue ? new Date(dueDateValue).toISOString() : null;
      await addTodo({
        variables: {
          title: InputValue,
          description: descriptionValue || null, // 空っぽならnullを送る
          dueDate: formattedDate,
          tagIds: selectedTagIds, // 新機能：選択されたタグのIDを送る
        },
      });

      // 成功したら入力欄をすべて空に戻す
      setInputValue('');
      setDescriptionValue('');
      setDueDateValue('');
      setSelectedTagIds([]);
    } catch (err) {
      console.error("追加エラー:", err);
    }
  };
  // カタマリ（updateTodoInput）の中にデータを入れて送るように変更
  const handleToggle = async (id: number, currentStatus: boolean) => {
    try {
      await updateTodo({ 
        variables: { 
          updateTodoInput: { id: id, isCompleted: !currentStatus } 
        } 
      });
    } catch (err) {
      console.error("更新エラー:", err);
    }
  };
  // 削除ボタンがクリックされた時の処理
  const handleDelete = async (id: number) => {
    // 誤操作を防ぐために、ブラウザ標準の確認ダイアログを出す
    const isConfirmed = window.confirm("本当にこのTodoを削除しますか？");
    if (!isConfirmed) return;

    try {
      await removeTodo({ variables: { id: id } });
    } catch (err) {
      console.error("削除エラー:", err);
    }
  };
  // 編集ボタンを押した時の処理（編集モードに入る）
  const handleEditStart = (todo: any) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    // 日付を <input type="date"> が読める形式(YYYY-MM-DD)に変換してセット
    setEditDueDate(todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '');
    setEditSelectedTagIds(todo.tags.map((tag: any) => tag.id) || []); // タグのIDだけ抜き取ってセット
  };

  // 編集の「保存」を押した時の処理
  const handleEditSave = async (id: number) => {
    if (!editTitle.trim()) return;
    try {
      const formattedDate = editDueDate ? new Date(editDueDate).toISOString() : null;
      await updateTodo({
        variables: {
          updateTodoInput: {
            id: id,
            title: editTitle,
            description: editDescription || null,
            dueDate: formattedDate,
            tagIds: editSelectedTagIds, // 新機能：編集モードで選択されたタグのIDを送る
          }
        },
      });
      setEditingId(null);
    } catch (err) {
      console.error("編集保存エラー:", err);
    }
  };
  // タグのチェックボックス切り替え処理
  const toggleTagSelection = (tagId: number, isEditing: boolean) => {
    if (isEditing) {
      setEditSelectedTagIds(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
    } else {
      setSelectedTagIds(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
    }
  };
  // 編集の「キャンセル」を押した時の処理
  const handleEditCancel = () => {
    setEditingId(null); // 編集モードを終了するだけ
  };

  // 画面に表示するTodoを、選択されたタグで絞り込む
  // タグとステータスの「掛け合わせ（AND）絞り込み」
  const filteredTodos = (data?.todos || []).filter((todo: any) => {
    // 1. タグの条件をチェック（nullなら全員通過、IDがあれば一致するタスクだけ通過）
    const matchTag = activeFilterTagId === null || todo.tags?.some((tag: any) => tag.id === activeFilterTagId);
    
    // 2. ステータスの条件をチェック
    let matchStatus = true;
    if (filterStatus === 'ACTIVE') matchStatus = !todo.isCompleted;   // 未完了のみ通過
    if (filterStatus === 'COMPLETED') matchStatus = todo.isCompleted; // 完了のみ通過

    // 3. 両方の条件をクリア（同時押し）したタスクだけを画面に返す
    return matchTag && matchStatus;
  });
  // ★追加：現在編集中のタグIDを記憶するState（nullなら「新規作成モード」）
  const [editingTagId, setEditingTagId] = useState<number | null>(null);

  // ★追加：更新と削除のMutationを準備
  const [updateTag] = useMutation(UPDATE_TAG, {
    refetchQueries: [{ query: GET_TAGS }, { query: GET_TODOS }],
  });
  const [deleteTag] = useMutation(DELETE_TAG, {
    refetchQueries: [{ query: GET_TAGS }, { query: GET_TODOS }],
  });

  // ★修正：タグがクリックされた時に、フォームを「編集モード」にする関数
  const handleTagClick = (tag: any) => {
    setEditingTagId(tag.id);
    setTagName(tag.name);                // ← newTagName から tagName に修正
    setTagColor(tag.color || '#eeeeee'); // ← newTagColor から tagColor に修正
  };

  // ★修正：編集モードをキャンセルして「新規作成モード」に戻す関数
  const resetTagForm = () => {
    setEditingTagId(null);
    setTagName('');           // ← 修正
    setTagColor('#eeeeee');   // ← 修正
  };

  // ★修正：タグ更新の実行
  const handleUpdateTag = async () => {
    if (!tagName.trim() || !editingTagId) return; // ← 修正
    try {
      await updateTag({ variables: { id: editingTagId, name: tagName, color: tagColor } }); // ← 修正
      resetTagForm(); 
    } catch (error) {
      console.error("タグの更新に失敗しました", error);
    }
  };

  // ★追加：タグ削除の実行
  const handleDeleteTag = async () => {
    if (!editingTagId) return;
    if (!window.confirm("本当にこのタグを削除しますか？紐づいているタスクからも解除されます。")) return;
    
    try {
      await deleteTag({ variables: { id: editingTagId } });
      resetTagForm();
    } catch (error) {
      console.error("タグの削除に失敗しました", error);
    }
  };

  // 読み込み中とエラー時の画面表示
  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>エラーが発生しました: {error.message}</p>;



  //ここからUIの部分
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>個人用汎用型Todoアプリ</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input type="text" value={InputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="タスクのタイトル (必須)" style={{ padding: '8px', fontSize: '1rem' }} required />
        <textarea value={descriptionValue} onChange={(e) => setDescriptionValue(e.target.value)} placeholder="詳細な説明 (任意)" style={{ padding: '8px', fontSize: '1rem', minHeight: '60px' }} />
        
        {/* タグ選択エリア（新規追加用） */}
        {tagData && tagData.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.9rem', color: '#555' }}>タグを選択:</span>
            {tagData.tags.map((tag: any) => (
              <label key={tag.id} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input 
                  type="checkbox" 
                  checked={selectedTagIds.includes(tag.id)} 
                  onChange={() => toggleTagSelection(tag.id, false)} 
                />
                <span style={{ backgroundColor: tag.color || '#eee', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', textShadow: '0px 0px 2px rgba(0,0,0,0.5)' }}>
                  {tag.name}
                </span>
              </label>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="date" value={dueDateValue} onChange={(e) => setDueDateValue(e.target.value)} style={{ padding: '8px', fontSize: '1rem' }} />
          <button type="submit" style={{ padding: '8px 16px', flexGrow: 1, cursor: 'pointer' }}>タスクを追加</button>
        </div>
      </form>
      {/* 自作したコンポーネントを呼び出し、Propsを渡す */}
      <FilterPanel 
        tagData={tagData}
        activeFilterTagId={activeFilterTagId}
        setActiveFilterTagId={setActiveFilterTagId}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      {/* Todoリスト */}
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {filteredTodos.map((todo: any) => (
          <TodoItem 
            key={todo.id}
            todo={todo}
            editingId={editingId}
            editTitle={editTitle}
            setEditTitle={setEditTitle}
            editDescription={editDescription}
            setEditDescription={setEditDescription}
            editDueDate={editDueDate}
            setEditDueDate={setEditDueDate}
            editSelectedTagIds={editSelectedTagIds}
            toggleTagSelection={toggleTagSelection}
            tagData={tagData}
            handleEditSave={handleEditSave}
            handleEditCancel={handleEditCancel}
            expandedTodoId={expandedTodoId}
            toggleExpand={toggleExpand}
            handleToggle={handleToggle}
            handleDelete={handleDelete}
            handleEditStart={handleEditStart}
          />
        ))}
      </ul>

      {/* タグ管理エリア */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>🏷 タグ管理</h3>
        
        {/* タグ一覧（クリックで編集モードへ） */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {tagData?.tags?.map((tag: any) => (
            <span 
              key={tag.id} 
              onClick={() => handleTagClick(tag)}
              style={{ 
                backgroundColor: tag.color || '#ccc', 
                color: '#fff', 
                padding: '4px 10px', 
                borderRadius: '16px', 
                fontSize: '0.85rem', 
                fontWeight: 'bold',
                cursor: 'pointer', // ★クリックできることを伝える
                border: editingTagId === tag.id ? '2px solid #000' : 'none', // ★編集中は枠線をつける
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>

        {/* フォーム部分（作成モードと編集モードで動的に切り替わる） */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input 
            type="text" 
            value={tagName} // ← 修正
            onChange={(e) => setTagName(e.target.value)} // ← 修正
            placeholder={editingTagId ? "タグ名を編集..." : "新しいタグ名..."} 
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} 
          />
          <input 
            type="color" 
            value={tagColor} // ← 修正
            onChange={(e) => setTagColor(e.target.value)} // ← 修正
            style={{ padding: '0', cursor: 'pointer', border: 'none', background: 'none' }} 
          />
          
          {editingTagId ? (
            // --- 編集モードのボタン ---
            <>
              <button onClick={handleUpdateTag} style={{ padding: '6px 12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>更新</button>
              <button onClick={handleDeleteTag} style={{ padding: '6px 12px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>削除</button>
              <button onClick={resetTagForm} style={{ padding: '6px 12px', backgroundColor: '#9e9e9e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>キャンセル</button>
            </>
          ) : (
            // --- 新規作成モードのボタン ---
            <button onClick={handleTagSubmit} style={{ padding: '6px 12px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>追加</button>
          )}
        </div>
      </div>

    </div>
  );
}


export default App;