// frontend/src/App.tsx
import { useQuery, gql } from '@apollo/client';

// ★ 厨房への注文書（GraphQLのQuery）を書く
const GET_TODOS = gql`
  query GetTodos {
    todos {
      id
      title
      isCompleted
    }
  }
`;

function App() {
  // ★ 注文書をバックエンドに送信！
  // loading: 読み込み中かどうか
  // error: エラーが起きたか
  // data: 届いたTodoデータ
  const { loading, error, data } = useQuery(GET_TODOS);

  // 読み込み中とエラー時の画面も作っておく
  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>エラーが発生しました: {error.message}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>フルスタックTodoアプリ</h1>
      
      {/* ★ 届いたデータをリスト（li）にして画面に表示する！ */}
      <ul>
        {data.todos.map((todo: { id: number, title: string, isCompleted: boolean }) => (
          <li key={todo.id}>
            {todo.isCompleted ? '✅' : '⬜️'} {todo.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;