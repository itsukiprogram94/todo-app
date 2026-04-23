import { TodoService } from './todo.service';
import { CreateTodoInput } from './dto/create-todo.input';
export declare class TodoResolver {
    private readonly todoService;
    constructor(todoService: TodoService);
    createTodo(createTodoInput: CreateTodoInput): import("@prisma/client").Prisma.Prisma__TodoClient<{
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
