import { PrismaService } from '../prisma.service';
export declare class TagService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        name: string;
        color: string | null;
    }[]>;
    create(name: string, color?: string): import("@prisma/client").Prisma.Prisma__TagClient<{
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
