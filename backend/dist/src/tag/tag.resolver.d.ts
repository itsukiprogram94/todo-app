import { TagService } from './tag.service';
export declare class TagResolver {
    private readonly tagService;
    constructor(tagService: TagService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        name: string;
        color: string | null;
    }[]>;
    createTag(name: string, color?: string): import("@prisma/client").Prisma.Prisma__TagClient<{
        id: number;
        name: string;
        color: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateTag(id: number, name: string, color?: string): import("@prisma/client").Prisma.Prisma__TagClient<{
        id: number;
        name: string;
        color: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    deleteTag(id: number): import("@prisma/client").Prisma.Prisma__TagClient<{
        id: number;
        name: string;
        color: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
