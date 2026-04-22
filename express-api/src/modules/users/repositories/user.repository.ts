import { pool } from '../../../shared/database/connection';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class UserRepository {
  async findAll(): Promise<Omit<User, 'password'>[]> {
    const result = await pool.query<Omit<User, 'password'>>(
      'SELECT id, name, email, is_active, created_at, updated_at FROM users ORDER BY created_at DESC',
    );
    return result.rows;
  }

  async findById(id: string): Promise<User | null> {
    const result = await pool.query<User>(
      'SELECT * FROM users WHERE id = $1',
      [id],
    );
    return result.rows[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query<User>(
      'SELECT * FROM users WHERE email = $1',
      [email],
    );
    return result.rows[0] || null;
  }

  async create(dto: CreateUserDto & { password: string }): Promise<User> {
    const result = await pool.query<User>(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [dto.name, dto.email, dto.password],
    );
    return result.rows[0];
  }

  async update(id: string, dto: UpdateUserDto): Promise<User | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (dto.name !== undefined) { fields.push(`name = $${idx++}`); values.push(dto.name); }
    if (dto.email !== undefined) { fields.push(`email = $${idx++}`); values.push(dto.email); }

    if (fields.length === 0) return this.findById(id);

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query<User>(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
