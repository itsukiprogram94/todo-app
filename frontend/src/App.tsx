// frontend/src/App.tsx

import React, { useState } from 'react';//画面上データを一時的に記憶するためのStateを使う
import { useQuery, useMutation } from '@apollo/client/react';//sueQuery: データの取得、useMutation: 追加更新削除のための関数
import {gql} from '@apollo/client/core';//文字列として書かれたGraphQLの構文を、Apollo Clientが解析できるASTというデータ形式に変換するため

// フロントエンドから送る命令
//データベースからTodo一覧を取得する」ためのGraphQLクエリの定義
const GET_TODOS = gql`
  query GetTodos {
    todos {
      id
      title
      isCompleted
      description
      dueDate
    }
  }
`;

//データの追加(Mutation)
//mutation CreateTodo($title: String!):データを追加・変更する「Mutation」の定義。
//$title は引数（変数）で、String! は「文字列型であり、Null不可」であることを示す。
////createTodo という名前のリゾルバ（処理関数）を呼び出します。
const CREATE_TODO = gql`
  mutation CREATE_TODO($title: String!, $description: String!, $dueDate: DateTime) {
    createTodo(createTodoInput:{title:$title, description: $description, dueDate: $dueDate}) { 
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

function App() {
  const [InputValue, setInputValue] = useState('');
  const [descriptionValue, setDescriptionValue] = useState('');
  const [dueDateValue, setDueDateValue] = useState('');
  
  //入力欄の記憶するためのState、初期値なので空欄

  // ★新機能：編集用のステート
  const [editingId, setEditingId] = useState<number | null>(null); // 現在編集中のTodoのID
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');

  // 注文書をバックエンドに送信！
  // loading: 読み込み中かどうか
  // error: エラーが起きたか
  // data: 届いたTodoデータ
  const { loading, error, data } = useQuery(GET_TODOS);
//コンポーネントが画面に表示された瞬間、自動的に GET_TODOS をバックエンドに送信します。通信中は loading が true になり、完了すると data に結果が格納されます。

  //データを追加する通信関数addTodoを定義する
  // refetchQueries: Mutation（追加）が成功したら、自動的にもう一度 GET_TODOS を実行して、最新のリストをバックエンドから取得し直してくれるオプション
  const [addTodo] = useMutation(CREATE_TODO, {
    refetchQueries: [{ query: GET_TODOS }],
  });
  //更新機能の準備！updateTodoという関数を定義する
  const [updateTodo] = useMutation(UPDATE_TODO, {
    refetchQueries: [{ query: GET_TODOS }],
  });
  // 削除機能の準備（削除成功後にリストを再取得する）
  const [removeTodo] = useMutation(REMOVE_TODO, {
    refetchQueries: [{ query: GET_TODOS }],
  });

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
        },
      });

      // 成功したら入力欄をすべて空に戻す
      setInputValue('');
      setDescriptionValue('');
      setDueDateValue('');
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
          }
        },
      });
      setEditingId(null);
    } catch (err) {
      console.error("編集保存エラー:", err);
    }
  };

  // ★新機能：編集の「キャンセル」を押した時の処理
  const handleEditCancel = () => {
    setEditingId(null); // 編集モードを終了するだけ
  };

  // 読み込み中とエラー時の画面も作っておく
  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>エラーが発生しました: {error.message}</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>フルスタックTodoアプリ</h1>

      {/* 新規追加フォーム */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input type="text" value={InputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="タスクのタイトル (必須)" style={{ padding: '8px', fontSize: '1rem' }} required />
        <textarea value={descriptionValue} onChange={(e) => setDescriptionValue(e.target.value)} placeholder="詳細な説明 (任意)" style={{ padding: '8px', fontSize: '1rem', minHeight: '60px' }} />
        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="date" value={dueDateValue} onChange={(e) => setDueDateValue(e.target.value)} style={{ padding: '8px', fontSize: '1rem' }} />
          <button type="submit" style={{ padding: '8px 16px', flexGrow: 1, cursor: 'pointer' }}>タスクを追加</button>
        </div>
      </form>
      
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {data.todos.map((todo: any) => (
          <li key={todo.id} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ccc', borderRadius: '8px' }}>
            
            {/* ★条件分岐：editingIdがこのTodoのIDと同じなら「編集フォーム」を表示、違うなら「通常表示」 */}
            {editingId === todo.id ? (
              // ---------------- 【編集モードの画面】 ----------------
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input 
                  type="text" 
                  value={editTitle} 
                  onChange={(e) => setEditTitle(e.target.value)} 
                  style={{ padding: '4px', fontSize: '1rem' }} 
                />
                <textarea 
                  value={editDescription} 
                  onChange={(e) => setEditDescription(e.target.value)} 
                  style={{ padding: '4px', minHeight: '60px' }} 
                />
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    type="date" 
                    value={editDueDate} 
                    onChange={(e) => setEditDueDate(e.target.value)} 
                    style={{ padding: '4px' }} 
                  />
                  <button onClick={() => handleEditSave(todo.id)} style={{ padding: '4px 12px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}>保存</button>
                  <button onClick={handleEditCancel} style={{ padding: '4px 12px', cursor: 'pointer' }}>キャンセル</button>
                </div>
              </div>
            ) : (
              // ---------------- 【通常表示モードの画面】 ----------------
              <>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span onClick={() => handleToggle(todo.id, todo.isCompleted)} style={{ cursor: 'pointer', marginRight: '8px', fontSize: '1.2rem', userSelect: 'none' }}>
                    {todo.isCompleted ? '✅' : '⬜️'}
                  </span>
                  <span style={{ textDecoration: todo.isCompleted ? 'line-through' : 'none', color: todo.isCompleted ? 'gray' : 'black', fontWeight: 'bold', flexGrow: 1 }}>
                    {todo.title}
                  </span>
                  
                  {/* ★新機能：編集ボタン */}
                  <button onClick={() => handleEditStart(todo)} style={{ padding: '4px 8px', cursor: 'pointer', marginRight: '8px' }}>
                    編集
                  </button>
                  <button onClick={() => handleDelete(todo.id)} style={{ padding: '4px 8px', cursor: 'pointer', color: 'red' }}>
                    削除
                  </button>
                </div>
                
                <div style={{ marginLeft: '32px', marginTop: '8px', fontSize: '0.9rem', color: '#555' }}>
                  {todo.dueDate && (
                    <div style={{ color: '#d9534f', marginBottom: '4px' }}>
                      🗓 期限: {new Date(todo.dueDate).toLocaleDateString('ja-JP')}
                    </div>
                  )}
                  {todo.description && (
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {todo.description}
                    </div>
                  )}
                </div>
              </>
            )}

          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;