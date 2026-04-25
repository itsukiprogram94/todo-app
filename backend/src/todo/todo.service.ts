import { Injectable } from '@nestjs/common';
import { CreateTodoInput } from './dto/create-todo.input';
import { UpdateTodoInput } from './dto/update-todo.input';
import { PrismaService } from '../prisma.service'; // ★鍵をインポート

@Injectable()
export class TodoService {
  // ★シェフが鍵（Prisma）を使えるように持たせます
  constructor(private prisma: PrismaService) {}

  // ① Todoを追加する処理
  create(createTodoInput: CreateTodoInput) {
    return this.prisma.todo.create({
      data: {
        title: createTodoInput.title,
      },
    });
  }

  // ② Todoの一覧をすべて取得する処理
  findAll() {
    return this.prisma.todo.findMany();
  }
  // ③ Todoを更新する処理
  update(id: number, updateTodoInput: UpdateTodoInput) {
    return this.prisma.todo.update({
      where: { id: id },
      data: {
        isCompleted: updateTodoInput.isCompleted,
      },
    });
  }
  // ④ Todoを削除する処理
  remove(id: number) {
    return this.prisma.todo.delete({
      where: { id: id },
    });
  }
}

