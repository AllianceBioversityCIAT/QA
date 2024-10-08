import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Tags } from '../entities/tags.entity';

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
}
