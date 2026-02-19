export interface Todo {
  _id: string;
  owner: string;
  status: boolean;
  body: string;
  category: string;
}
export type TodoSort =
  | 'ownerAsc'
  | 'ownerDesc'
  | 'bodyAsc'
  | 'bodyDesc'
  | 'categoryAsc'
  | 'categoryDesc'
  | 'status';
