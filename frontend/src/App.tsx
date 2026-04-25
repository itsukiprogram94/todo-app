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
    }
  }
`;

//データの追加(Mutation)
//mutation CreateTodo($title: String!):データを追加・変更する「Mutation」の定義。
//$title は引数（変数）で、String! は「文字列型であり、Null不可」であることを示す。
////createTodo という名前のリゾルバ（処理関数）を呼び出します。
const CREATE_TODO = gql`
  mutation CREATE_TODO($title: String!) {
    createTodo(createTodoInput:{title:$title}) { 
      id
      title
      isCompleted
    }
  }
`;
// ③ データの更新（Mutation）の注文書を追加！
const UPDATE_TODO = gql`
  mutation UpdateTodo($id: Int!, $isCompleted: Boolean!) {
    updateTodo(updateTodoInput: { id: $id, isCompleted: $isCompleted }) {
      id
      title
      isCompleted
    }
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
  //入力欄の記憶するためのState、初期値なので空欄

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
  // ★新機能：削除機能の準備（削除成功後にリストを再取得する）
  const [removeTodo] = useMutation(REMOVE_TODO, {
    refetchQueries: [{ query: GET_TODOS }],
  });

  // 「追加ボタン」が押された時の関数
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ボタンを押した時に画面全体がリロードされるのを防ぐやつ
    if (!InputValue.trim()) return; // 入力欄が空っぽなら何もしないよ

    try {
      // バックエンドに注文書（Mutation）を送信！title という引数に、InputValueの中身を入れて送る
      await addTodo({ variables: { title: InputValue } });
      // 成功したら、次の入力のために枠を空っぽに戻す
      setInputValue('');
    } catch (err) {
      console.error("追加エラー:", err);
    }
  };

  const handleToggle = async (id: number, currentStatus: boolean) => {
    try {
      // 現在のステータスの「逆（!currentStatus）」をバックエンドに送信して上書きする
      await updateTodo({
        variables: { id: id, isCompleted: !currentStatus },
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

  // 読み込み中とエラー時の画面も作っておく
  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>エラーが発生しました: {error.message}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>フルスタックTodoアプリ</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={InputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="新しいTodoを入力..."
          style={{ padding: '8px', marginRight: '10px', width: '200px' }}
        />
        <button type="submit" style={{ padding: '8px 16px' }}>追加</button>
      </form>
      
      <ul>
        {data.todos.map((todo: { id: number, title: string, isCompleted: boolean }) => (
          <li key={todo.id} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
            
            <span 
              onClick={() => handleToggle(todo.id, todo.isCompleted)}
              style={{ cursor: 'pointer', marginRight: '8px', fontSize: '1.2rem', userSelect: 'none' }}
            >
              {todo.isCompleted ? '✅' : '⬜️'}
            </span>
            
            <span style={{ 
              textDecoration: todo.isCompleted ? 'line-through' : 'none', 
              color: todo.isCompleted ? 'gray' : 'black',
              flexGrow: 1 // ★文字部分が可能な限り横幅を取るように調整
            }}>
              {todo.title}
            </span>

            {/* ★新機能：削除ボタンの追加 */}
            <button 
              onClick={() => handleDelete(todo.id)}
              style={{ marginLeft: '10px', padding: '4px 8px', cursor: 'pointer', color: 'red' }}
            >
              削除
            </button>

          </li>
        ))}
      </ul>
    </div>
  );
}
export default App;