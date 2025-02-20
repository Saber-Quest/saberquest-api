import { Test, TestingModule } from '@nestjs/testing';
import { ResourceGateway } from './resource.gateway';

describe('ResourceGateway', () => {
  let gateway: ResourceGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResourceGateway],
    }).compile();

    gateway = module.get<ResourceGateway>(ResourceGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
