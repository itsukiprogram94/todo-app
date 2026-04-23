import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoResolver } from './todo.resolver';
import { PrismaService } from '../prisma.service'; // ★ 追加1：さっき作った鍵を読み込む

@Module({
  // ★ 追加2：providers の中に PrismaService を追加する（これでTodo機能の中で鍵が使えるようになります）
  providers: [TodoResolver, TodoService, PrismaService],
})
export class TodoModule {}
