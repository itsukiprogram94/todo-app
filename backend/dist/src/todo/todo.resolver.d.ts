import { TodoService } from './todo.service';
import { CreateTodoInput } from './dto/create-todo.input';
import { UpdateTodoInput } from './dto/update-todo.input';
export declare class TodoResolver {
    private readonly todoService;
    constructor(todoService: TodoService);
    createTodo(createTodoInput: CreateTodoInput): import("@prisma/client").Prisma.Prisma__TodoClient<{
        title: string;
        isCompleted: boolean;
        createdAt: Date;
        id: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        title: string;
        isCompleted: boolean;
        createdAt: Date;
        id: number;
    }[]>;
    updateTodo(updateTodoInput: UpdateTodoInput): import("@prisma/client").Prisma.Prisma__TodoClient<{
        title: string;
        isCompleted: boolean;
        createdAt: Date;
        id: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    removeTodo(id: number): import("@prisma/client").Prisma.Prisma__TodoClient<{
        title: string;
        isCompleted: boolean;
        createdAt: Date;
        id: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
