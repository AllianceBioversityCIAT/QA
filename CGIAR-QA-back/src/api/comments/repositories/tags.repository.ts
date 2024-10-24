import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Tags } from '../entities/tags.entity';
import { Users } from '../../users/entities/user.entity';
import { Comments } from '../entities/comments.entity';
import { TagType } from '../entities/tags-type.entity';

@Injectable()
export class TagsRepository extends Repository<Tags> {
  constructor(private dataSource: DataSource) {
    super(Tags, dataSource.createEntityManager());
  }

  async fetchTagsByCRP(crp_id: string) {
    const query = `
      SELECT qe.indicator_view_name, tt.name as tagType, count(*) as total
      FROM qa_tags tag 
      LEFT JOIN qa_tag_type tt ON tt.id = tag.tagTypeId
      LEFT JOIN qa_users us ON us.id = tag.userId
      LEFT JOIN qa_comments qc ON qc.id = tag.commentId
      LEFT JOIN qa_evaluations qe ON qe.id = qc.evaluationId
      WHERE tt.name NOT LIKE 'seen'
      AND qe.crp_id = :crp_id
      AND qe.phase_year = actual_phase_year()
      GROUP BY qe.indicator_view_name, tt.name`;

    return await this.query(query, [crp_id]);
  }

  async fetchAllTags() {
    const query = `
      SELECT qe.indicator_view_name, tt.name as tagType, count(*) as total
      FROM qa_tags tag 
      LEFT JOIN qa_tag_type tt ON tt.id = tag.tagTypeId
      LEFT JOIN qa_users us ON us.id = tag.userId
      LEFT JOIN qa_comments qc ON qc.id = tag.commentId
      LEFT JOIN qa_evaluations qe ON qe.id = qc.evaluationId
      WHERE tt.name NOT LIKE 'seen'
      AND qe.phase_year = actual_phase_year()
      GROUP BY qe.indicator_view_name, tt.name`;

    return await this.query(query);
  }

  async fetchFeedTagsByIndicatorAndTagType(
    indicator_view_name: string,
    tagTypeId: string,
  ) {
    const query = `
      SELECT us.id, us.name, tt.name as tagName, tt.id as tagId, tag.createdAt, tag.updatedAt, qe.indicator_view_id, qe.indicator_view_name
      FROM qa_tags tag
      LEFT JOIN qa_tag_type tt ON tt.id = tag.tagTypeId
      LEFT JOIN qa_users us ON us.id = tag.userId
      LEFT JOIN qa_comments qc ON qc.id = tag.commentId
      LEFT JOIN qa_evaluations qe ON qe.id = qc.evaluationId
      WHERE qe.indicator_view_name = :indicator_view_name
      AND tt.id = :tagTypeId
      ORDER BY tag.createdAt DESC`;

    return await this.query(query, [indicator_view_name, tagTypeId]);
  }

  async fetchFeedTagsByIndicator(indicator_view_name: string) {
    const query = `
      SELECT us.id, us.name, tt.name as tagName, tt.id as tagId, tag.createdAt, tag.updatedAt, qe.indicator_view_id, qe.indicator_view_name
      FROM qa_tags tag
      LEFT JOIN qa_tag_type tt ON tt.id = tag.tagTypeId
      LEFT JOIN qa_users us ON us.id = tag.userId
      LEFT JOIN qa_comments qc ON qc.id = tag.commentId
      LEFT JOIN qa_evaluations qe ON qe.id = qc.evaluationId
      WHERE qe.indicator_view_name = :indicator_view_name
      ORDER BY tag.createdAt DESC`;

    return await this.query(query, [indicator_view_name]);
  }

  async fetchAllFeedTags() {
    const query = `
      SELECT us.id, us.name, tt.name as tagName, tt.id as tagId, tag.createdAt, tag.updatedAt, qe.indicator_view_id, qe.indicator_view_name
      FROM qa_tags tag
      LEFT JOIN qa_tag_type tt ON tt.id = tag.tagTypeId
      LEFT JOIN qa_users us ON us.id = tag.userId
      LEFT JOIN qa_comments qc ON qc.id = tag.commentId
      LEFT JOIN qa_evaluations qe ON qe.id = qc.evaluationId
      ORDER BY tag.createdAt DESC;`;

    return await this.query(query);
  }

  async findTagId(
    commentId: number,
    tagTypeId: number,
    userId: number,
  ): Promise<any> {
    const sqlQuery = `
      SELECT tag.id as tagId
      FROM qa_tags tag 
      JOIN qa_tag_type tt ON tt.id = tag.tagTypeId
      JOIN qa_users us ON us.id = tag.userId
      WHERE tag.commentId = :commentId
        AND tag.tagTypeId = :tagTypeId
        AND tag.userId = :userId;
    `;
    const queryRunner = this.dataSource.createQueryRunner();
    const [query, parameters] =
      queryRunner.connection.driver.escapeQueryWithParameters(
        sqlQuery,
        { commentId, tagTypeId, userId },
        {},
      );
    const result = await queryRunner.connection.query(query, parameters);
    return result.length > 0 ? result[0].tagId : null;
  }

  async findTagByCommentAndUser(
    commentId: number,
    userId: number,
  ): Promise<Tags | null> {
    return await this.findOne({
      where: { commentId, userId },
    });
  }

  async createTag(
    userId: number,
    tagTypeId: number,
    commentId: number,
  ): Promise<Tags | null> {
    try {
      const userRepository = this.dataSource.getRepository(Users);
      const commentsRepository = this.dataSource.getRepository(Comments);
      const tagTypeRepository = this.dataSource.getRepository(TagType);

      const user = await userRepository.findOneOrFail({
        where: { id: userId },
      });
      const tagType = await tagTypeRepository.findOneOrFail({
        where: { id: tagTypeId },
      });
      const comment = await commentsRepository.findOneOrFail({
        where: { id: commentId },
      });

      const newTag = this.create({
        userId,
        tagTypeId,
        commentId,
      });

      return await this.save(newTag);
    } catch (error) {
      return null;
    }
  }

  async findOneById(id: number): Promise<Tags | null> {
    return await this.findOne({ where: { id } });
  }
}
