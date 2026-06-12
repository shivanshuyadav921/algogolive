import { NotFoundException } from '@nestjs/common';
import { LearningSessionsService } from './learning-sessions.service';

describe('LearningSessionsService', () => {
  const create = jest.fn();
  const findUnique = jest.fn();
  const update = jest.fn();
  const service = new LearningSessionsService({
    learningSession: { create, findUnique, update },
  } as never);

  beforeEach(() => jest.resetAllMocks());

  it('creates a persisted learning session', async () => {
    create.mockResolvedValue({ id: 'session-1' });
    const result = { pattern: 'Binary Search Pattern' };

    await expect(
      service.create({ rawQuery: 'Binary Search', result }),
    ).resolves.toEqual({ id: 'session-1' });
    expect(create).toHaveBeenCalledWith({
      data: {
        rawQuery: 'Binary Search',
        result,
        userId: undefined,
      },
    });
  });

  it('restores an existing session', async () => {
    findUnique.mockResolvedValue({
      id: 'session-1',
      currentStep: 3,
      revealedHints: 2,
    });

    await expect(service.findOne('session-1')).resolves.toMatchObject({
      currentStep: 3,
      revealedHints: 2,
    });
  });

  it('reports a missing session', async () => {
    findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates trace, hint, and code-draft state', async () => {
    findUnique.mockResolvedValue({ id: 'session-1' });
    update.mockResolvedValue({ id: 'session-1', currentStep: 2 });

    await service.update('session-1', {
      currentStep: 2,
      revealedHints: 1,
      codeDrafts: { python: 'def solve(): pass' },
    });

    expect(update).toHaveBeenCalledWith({
      where: { id: 'session-1' },
      data: {
        currentStep: 2,
        revealedHints: 1,
        codeDrafts: { python: 'def solve(): pass' },
      },
    });
  });
});
