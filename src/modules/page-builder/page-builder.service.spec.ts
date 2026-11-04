import { BadRequestException } from '@nestjs/common';
import { PageBuilderService } from './page-builder.service';

function makeService(model: Record<string, jest.Mock>) {
  return new PageBuilderService(model as never);
}

describe('PageBuilderService', () => {
  it('rejects a slug owned by a built-in route', async () => {
    const service = makeService({ findOne: jest.fn(), create: jest.fn() });
    await expect(service.create({ title: 'About', slug: 'about' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it("refuses to change a built-in page's URL", async () => {
    const save = jest.fn();
    const service = makeService({ findById: jest.fn().mockResolvedValue({ systemKey: 'about', slug: 'about', save }) });
    await expect(service.update('id', { slug: 'about-us' })).rejects.toBeInstanceOf(BadRequestException);
    expect(save).not.toHaveBeenCalled();
  });

  it('refuses to delete a system page', async () => {
    const deleteOne = jest.fn();
    const service = makeService({ findById: jest.fn().mockResolvedValue({ systemKey: 'skin-treatment', deleteOne }) });
    await expect(service.remove('id')).rejects.toBeInstanceOf(BadRequestException);
    expect(deleteOne).not.toHaveBeenCalled();
  });

  it('deletes an ordinary page', async () => {
    const deleteOne = jest.fn();
    const service = makeService({ findById: jest.fn().mockResolvedValue({ systemKey: null, deleteOne }) });
    await expect(service.remove('id')).resolves.toEqual({ success: true });
    expect(deleteOne).toHaveBeenCalled();
  });

  it('registers a missing system page without overwriting an existing one', async () => {
    const updateOne = jest.fn();
    const exists = jest.fn().mockResolvedValueOnce(null).mockResolvedValue({ _id: 'x' });
    const service = makeService({ exists, updateOne });

    await service.onApplicationBootstrap();
    expect(updateOne).toHaveBeenCalledTimes(1);
    expect(updateOne.mock.calls[0][0]).toEqual({ slug: 'skin-treatment' });
    expect(updateOne.mock.calls[0][1].$setOnInsert).not.toHaveProperty('systemKey');

    await service.onApplicationBootstrap();
    expect(updateOne).toHaveBeenCalledTimes(1);
  });
});
