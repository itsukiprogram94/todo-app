import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { TodoService } from './todo.service';
import { Todo } from './entities/todo.entity';
import { CreateTodoInput } from './dto/create-todo.input';
import { UpdateTodoInput } from './dto/update-todo.input';

@Resolver(() => Todo)
export class TodoResolver {
  constructor(private readonly todoService: TodoService) {}

  // ① 追加の注文を受け取る（Mutation = データを書き換える操作）
  @Mutation(() => Todo)
  createTodo(@Args('createTodoInput') createTodoInput: CreateTodoInput) {
    return this.todoService.create(createTodoInput);
  }

  // ② 一覧を見せてという注文を受け取る（Query = データを見るだけの操作）
  @Query(() => [Todo], { name: 'todos' })
  findAll() {
    return this.todoService.findAll();
  }
}