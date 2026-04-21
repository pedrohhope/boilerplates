import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../../users/repositories/user.repository';
import { AuthRepository } from '../repositories/auth.repository';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { AppError } from '../../../shared/middleware/error.middleware';
import { JwtPayload } from '../../../shared/types';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  tokens: TokenPair;
}

export class AuthService {
  private userRepository: UserRepository;
  private authRepository: AuthRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.authRepository = new AuthRepository();
  }

  private generateTokens(payload: JwtPayload): TokenPair {
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }

  private getRefreshTokenExpiry(): Date {
    const days = parseInt(process.env.JWT_REFRESH_EXPIRES_IN?.replace('d', '') || '30', 10);
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) throw new AppError('Email already in use', 409);

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await this.userRepository.create({ ...dto, password: hashedPassword });

    const payload: JwtPayload = { id: user.id, email: user.email };
    const tokens = this.generateTokens(payload);

    await this.authRepository.saveRefreshToken(user.id, tokens.refreshToken, this.getRefreshTokenExpiry());

    return {
      user: { id: user.id, name: user.name, email: user.email },
      tokens,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) throw new AppError('Invalid credentials', 401);

    const isValidPassword = await bcrypt.compare(dto.password, user.password);
    if (!isValidPassword) throw new AppError('Invalid credentials', 401);

    const payload: JwtPayload = { id: user.id, email: user.email };
    const tokens = this.generateTokens(payload);

    await this.authRepository.saveRefreshToken(user.id, tokens.refreshToken, this.getRefreshTokenExpiry());

    return {
      user: { id: user.id, name: user.name, email: user.email },
      tokens,
    };
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    const stored = await this.authRepository.findRefreshToken(refreshToken);
    if (!stored) throw new AppError('Invalid or expired refresh token', 401);

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as JwtPayload;
    } catch {
      await this.authRepository.deleteRefreshToken(refreshToken);
      throw new AppError('Invalid or expired refresh token', 401);
    }

    await this.authRepository.deleteRefreshToken(refreshToken);

    const payload: JwtPayload = { id: decoded.id, email: decoded.email };
    const tokens = this.generateTokens(payload);

    await this.authRepository.saveRefreshToken(stored.user_id, tokens.refreshToken, this.getRefreshTokenExpiry());

    return tokens;
  }

  async logout(refreshToken: string): Promise<void> {
    await this.authRepository.deleteRefreshToken(refreshToken);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.authRepository.deleteAllUserRefreshTokens(userId);
  }
}
