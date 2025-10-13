/**
 * Base Repository Interface
 * Define operaciones CRUD básicas que todos los repositorios deben implementar
 */
export interface IRepository<T, ID = string> {
  findById(id: ID): Promise<T | null>
  findAll(): Promise<T[]>
  create(data: Partial<T>): Promise<T>
  update(id: ID, data: Partial<T>): Promise<T>
  delete(id: ID): Promise<void>
}

/**
 * Query Repository Interface
 * Para repositorios que solo necesitan lectura
 */
export interface IQueryRepository<T, ID = string> {
  findById(id: ID): Promise<T | null>
  findAll(): Promise<T[]>
}
