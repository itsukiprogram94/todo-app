import { Tag } from '../../tag/tag.entity';
export declare class Todo {
    id: number;
    title: string;
    isCompleted: boolean;
    description?: string;
    dueDate?: Date;
    tags?: Tag[];
}
