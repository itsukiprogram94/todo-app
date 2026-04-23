import { CreateTodoInput } from './dto/create-todo.input';
import { PrismaService } from '../prisma.service';
export declare class TodoService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createTodoInput: CreateTodoInput): import("@prisma/client").Prisma.Prisma__TodoClient<{
        title: string;
        id: number;
        isCompleted: boolean;
        createdAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        title: string;
        id: number;
        isCompleted: boolean;
        createdAt: Date;
    }[]>;
}
