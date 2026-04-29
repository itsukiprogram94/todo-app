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
        description: createTodoInput.description,
        dueDate: createTodoInput.dueDate,
        // タグの紐づけも同時に行います
        tags: {
          connect: createTodoInput.tagIds?.map((tagId) => ({ id: tagId })) || [],
        },
      },
      include: { tags: true }, // 作成したTodoに紐づいているタグの情報も一緒に返すようにします
    });
  }

  // ② Todoの一覧をすべて取得する処理
  findAll() {
    return this.prisma.todo.findMany({
      include: { tags: true }, // Todoを取得するときに、紐づいているタグの情報も一緒に返すようにします
    });
  }
  // ③ Todoを更新する処理
  update(id: number, updateTodoInput: UpdateTodoInput) {
    return this.prisma.todo.update({
      where: { id: id },
      data: {
        isCompleted: updateTodoInput.isCompleted,
        title: updateTodoInput.title,
        description: updateTodoInput.description,
        dueDate: updateTodoInput.dueDate,
        // タグの付け替えも同時に行います 
        tags: updateTodoInput.tagIds
          ? {
              set: updateTodoInput.tagIds.map((tagId) => ({ id: tagId })),
            }
          : undefined,
      },
      include: { tags: true }, // 更新したTodoに紐づいているタグの情報も一緒に返すようにします
    });
  }
  // ④ Todoを削除する処理
  remove(id: number) {
    return this.prisma.todo.delete({
      where: { id: id },
    });
  }
}

