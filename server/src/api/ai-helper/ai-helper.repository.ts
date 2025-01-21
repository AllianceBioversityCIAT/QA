import { Injectable } from "@nestjs/common";
import { Repository, DataSource } from "typeorm";
import { AiHelper } from "./entities/ai-helper.entity";

@Injectable()
export class AiHelperRepository extends Repository<AiHelper> {
  constructor(private dataSource: DataSource) {
    super(AiHelper, dataSource.createEntityManager());
  }
}
