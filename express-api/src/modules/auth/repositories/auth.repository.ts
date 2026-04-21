import { pool } from '../../../shared/database/connection';

export interface RefreshToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
}

export class AuthRepository {
  async saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    const result = await pool.query<RefreshToken>(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING *',
      [userId, token, expiresAt],
    );
    return result.rows[0];
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    const result = await pool.query<RefreshToken>(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [token],
    );
    return result.rows[0] || null;
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
  }

  async deleteAllUserRefreshTokens(userId: string): Promise<void> {
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
  }
}
