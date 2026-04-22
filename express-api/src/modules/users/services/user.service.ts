import { UserRepository, User } from '../repositories/user.repository';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { AppError } from '../../../shared/middleware/error.middleware';
import bcrypt from 'bcryptjs';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    return this.userRepository.findAll();
  }

  async findById(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new AppError('User not found', 404);
    const { password: _password, ...safe } = user;
    return safe;
  }

  async create(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) throw new AppError('Email already in use', 409);

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await this.userRepository.create({ ...dto, password: hashedPassword });
    const { password: _password, ...safe } = user;
    return safe;
  }

  async update(id: string, dto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    if (dto.email) {
      const existing = await this.userRepository.findByEmail(dto.email);
      if (existing && existing.id !== id) throw new AppError('Email already in use', 409);
    }

    const user = await this.userRepository.update(id, dto);
    if (!user) throw new AppError('User not found', 404);
    const { password: _password, ...safe } = user;
    return safe;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.userRepository.delete(id);
    if (!deleted) throw new AppError('User not found', 404);
  }
}
