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
  async findAll(): Promise<User[]> {
    const result = await pool.query<User>(
      'SELECT id, name, email, is_active, created_at, updated_at FROM users WHERE is_active = true ORDER BY created_at DESC',
    );
    return result.rows;
  }

  async findById(id: string): Promise<User | null> {
    const result = await pool.query<User>(
      'SELECT * FROM users WHERE id = $1 AND is_active = true',
      [id],
    );
    return result.rows[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query<User>(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email],
    );
    return result.rows[0] || null;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const result = await pool.query<User>(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [dto.name, dto.email, dto.password],
    );
    return result.rows[0];
  }

  async update(id: string, dto: UpdateUserDto): Promise<User | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (dto.name) {
      fields.push(`name = $${paramIndex++}`);
      values.push(dto.name);
    }
    if (dto.email) {
      fields.push(`email = $${paramIndex++}`);
      values.push(dto.email);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query<User>(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} AND is_active = true RETURNING *`,
      values,
    );
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 AND is_active = true',
      [id],
    );
    return (result.rowCount ?? 0) > 0;
  }
}
