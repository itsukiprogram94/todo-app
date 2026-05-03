// frontend/src/App.tsx
import React, { useState } from 'react';//画面上データを一時的に記憶するためのState
import { useQuery, useMutation, gql } from '@apollo/client';//sueQuery: データの取得、useMutation: 追加更新削除のための関数
import './App.css';
import { FilterPanel } from './components/FilterPanel'; // フィルターのコンポーネント読み込み
import { TodoItem } from './components/TodoItem'; // Todoカードのコンポーネント読み込み

// フロントエンドから送る命令
//①データベースからTodo一覧を取得する」ためのGraphQLクエリの定義
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
//$title は引数（変数）で、String! は「文字列型であり、Null不可」であることを示す。
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

  // 「追加ボタン」が押された時の関数
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
  // ★修正ポイント②：カタマリ（updateTodoInput）の中にデータを入れて送るように変更
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
  // ★新機能：削除ボタンがクリックされた時の処理
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
  // ★新機能：編集ボタンを押した時の処理（編集モードに入る）
  const handleEditStart = (todo: any) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    // 日付を <input type="date"> が読める形式(YYYY-MM-DD)に変換してセット
    setEditDueDate(todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '');
    setEditSelectedTagIds(todo.tags.map((tag: any) => tag.id) || []); // タグのIDだけ抜き取ってセット
  };

  // ★新機能：編集の「保存」を押した時の処理
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
  // ★新機能：編集の「キャンセル」を押した時の処理
  const handleEditCancel = () => {
    setEditingId(null); // 編集モードを終了するだけ
  };

  // ★新機能：画面に表示するTodoを、選択されたタグで絞り込む
  // ★ここから入れ替え：タグとステータスの「掛け合わせ（AND）絞り込み」
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
  // ★ここまで入れ替え

  // 読み込み中とエラー時の画面も作っておく
  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>エラーが発生しました: {error.message}</p>;



  //ここからUIの部分
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>個人用汎用型Todoアプリ</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input type="text" value={InputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="タスクのタイトル (必須)" style={{ padding: '8px', fontSize: '1rem' }} required />
        <textarea value={descriptionValue} onChange={(e) => setDescriptionValue(e.target.value)} placeholder="詳細な説明 (任意)" style={{ padding: '8px', fontSize: '1rem', minHeight: '60px' }} />
        
        {/* ★新機能：タグ選択エリア（新規追加用） */}
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
      {/* ... (タスク追加フォーム </form> のすぐ下に追加します) ... */}
      {/* ★自作したコンポーネントを呼び出し、Props（荷物）を渡す */}
      <FilterPanel 
        tagData={tagData}
        activeFilterTagId={activeFilterTagId}
        setActiveFilterTagId={setActiveFilterTagId}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      {/* Todoリスト */}
      
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


      {/* ★新機能：タグ管理コーナー */}
      <hr style={{ margin: '40px 0', border: 'none', borderTop: '2px dashed #ccc' }} />
      
      <h2>🏷 タグ管理</h2>
      
      {/* タグ追加フォーム */}
      <form onSubmit={handleTagSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" 
          value={tagName} 
          onChange={(e) => setTagName(e.target.value)} 
          placeholder="新しいタグ名" 
          style={{ padding: '8px', fontSize: '1rem', flexGrow: 1 }}
          required
        />
        {/* カラーピッカー（色選択）の入力欄 */}
        <input 
          type="color" 
          value={tagColor} 
          onChange={(e) => setTagColor(e.target.value)} 
          style={{ padding: '0', width: '40px', height: '40px', cursor: 'pointer', border: 'none' }}
        />
        <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>タグを作成</button>
      </form>

      {/* タグ一覧表示 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {tagData && tagData.tags.map((tag: any) => (
          <span 
            key={tag.id} 
            style={{ 
              backgroundColor: tag.color || '#eee', 
              color: '#fff', 
              padding: '6px 12px', 
              borderRadius: '20px', // 角丸にしてバッジっぽくする
              fontSize: '0.9rem',
              fontWeight: 'bold',
              textShadow: '0px 0px 2px rgba(0,0,0,0.5)' // 文字が見えやすいように影をつける
            }}
          >
            {tag.name}
          </span>
        ))}
      </div>

    </div>
  );
}


export default App;