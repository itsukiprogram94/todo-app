import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}

  // タグをすべて取得する処理
  findAll() {
    return this.prisma.tag.findMany();
  }

  // タグを新しく作る処理
  create(name: string, color?: string) {
    return this.prisma.tag.create({
      data: { name: name, color: color },
    });
  }
  updateTag(id: number, name: string, color?: string) {
    return this.prisma.tag.update({
      where: { id: id }, // どのIDのタグを更新するか指定
      data: { name: name, color: color }, // 新しい名前と色
    });
  }

  // ★追加：タグを削除する処理
  deleteTag(id: number) {
    return this.prisma.tag.delete({
      where: { id: id }, // どのIDのタグを削除するか指定
    });
  }
}

