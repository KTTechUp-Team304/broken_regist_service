import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CTF_FLAG_SEEDS } from './ctf-flags.constants';
import { SubmitFlagDto } from './dto/submit-flag.dto';
import { CapturedFlag } from './entities/captured-flag.entity';
import { Flag } from './entities/flag.entity';

@Injectable()
export class FlagsService implements OnModuleInit {
  constructor(
    @InjectRepository(Flag)
    private readonly flagRepo: Repository<Flag>,
    @InjectRepository(CapturedFlag)
    private readonly capturedRepo: Repository<CapturedFlag>,
  ) {}

  async onModuleInit() {
    for (const seed of CTF_FLAG_SEEDS) {
      const existing = await this.flagRepo.findOne({
        where: { flagValue: seed.flagValue },
      });
      if (!existing) {
        await this.flagRepo.save(this.flagRepo.create({ ...seed }));
      }
    }
  }

  async getAll(): Promise<any[]> {
    const flags = await this.flagRepo.find({ order: { id: 'ASC' } });
    const captured = await this.capturedRepo.find();
    const capturedMap = new Map(
      captured.map((c) => [Number(c.flagId), c.capturedAt]),
    );

    return flags.map((f) => {
      const isCaptured = capturedMap.has(Number(f.id));
      return {
        id: f.id,
        name: f.name,
        category: f.category,
        description: f.description,
        hint: f.hint,
        points: f.points,
        difficulty: f.difficulty,
        // 이미 획득한 flag만 값 노출 — 미획득 flag는 네트워크 탭에서도 숨김
        ...(isCaptured && { flagValue: f.flagValue }),
        captured: isCaptured,
        capturedAt: capturedMap.get(Number(f.id)) ?? null,
      };
    });
  }

  async submit(dto: SubmitFlagDto): Promise<{
    success: boolean;
    message: string;
    points?: number;
    flagName?: string;
  }> {
    const flag = await this.flagRepo.findOne({
      where: { flagValue: dto.flag },
    });
    if (!flag) {
      return { success: false, message: '잘못된 FLAG 값입니다.' };
    }

    const existing = await this.capturedRepo.findOne({
      where: { flagId: Number(flag.id) },
    });
    if (existing) {
      return { success: false, message: '이미 획득한 FLAG입니다.', flagName: flag.name };
    }

    await this.capturedRepo.save(
      this.capturedRepo.create({ flagId: Number(flag.id) }),
    );
    return {
      success: true,
      message: `FLAG 획득 성공! +${flag.points}pt`,
      points: flag.points,
      flagName: flag.name,
    };
  }
}
