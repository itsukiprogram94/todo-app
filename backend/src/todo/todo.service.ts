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
}
