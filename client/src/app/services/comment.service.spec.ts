import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CommentService } from './comment.service';
import { environment } from '../../environments/environment';

describe('CommentService', () => {
  let service: CommentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CommentService]
    });
    service = TestBed.inject(CommentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have refresh$ observable', () => {
    expect(service.refresh$).toBeDefined();
  });

  describe('getCommentCRPStats', () => {
    it('should fetch CRP stats', () => {
      const params = { crp_id: 1, id: 2 };
      const mockData = { stats: 'data' };

      service.getCommentCRPStats(params).subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}comment/?crp_id=1&id=2`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });

  describe('getDataComment', () => {
    it('should fetch comment data', () => {
      const params = { evaluationId: 10, metaId: 20 };
      const mockData = { comment: 'test' };

      service.getDataComment(params).subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}evaluation/10/detail/comment/20`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });

  describe('createDataComment', () => {
    it('should create comment', () => {
      const params = { text: 'new comment' };
      const mockResponse = { id: 1 };

      service.createDataComment(params).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}evaluation/detail/comment`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(params);
      req.flush(mockResponse);
    });
  });

  describe('updateDataComment', () => {
    it('should update comment and trigger refresh', (done) => {
      const params = { id: 1, text: 'updated' };
      const mockResponse = { success: true };

      let refreshTriggered = false;
      service.refresh$.subscribe(() => {
        refreshTriggered = true;
      });

      service.updateDataComment(params).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(refreshTriggered).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}evaluation/detail/comment`);
      expect(req.request.method).toBe('PATCH');
      req.flush(mockResponse);
    });
  });

  describe('createDataCommentReply', () => {
    it('should create comment reply', () => {
      const params = { commentId: 1, reply: 'test reply' };
      const mockResponse = { id: 2 };

      service.createDataCommentReply(params).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}evaluation/detail/comment/reply`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('updateCommentReply', () => {
    it('should update comment reply', () => {
      const params = { id: 1, reply: 'updated reply' };
      const mockResponse = { success: true };

      service.updateCommentReply(params).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}evaluation/detail/comment/reply`);
      expect(req.request.method).toBe('PATCH');
      req.flush(mockResponse);
    });
  });

  describe('getDataCommentReply', () => {
    it('should fetch comment replies', () => {
      const params = { evaluationId: 10, commentId: 5 };
      const mockData = { replies: [] };

      service.getDataCommentReply(params).subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}evaluation/10/detail/comment/5/replies`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });

  describe('getCommentsExcel', () => {
    it('should fetch comments excel', () => {
      const params = {
        evaluationId: 1,
        id: 2,
        name: 'test',
        crp_id: 3,
        indicatorName: 'indicator'
      };

      service.getCommentsExcel(params).subscribe();

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}comment/excel/1?userId=2&name=test&crp_id=3&indicatorName=indicator`
      );
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });

  describe('getCommentsExcelByInitiative', () => {
    it('should fetch comments excel by initiative', () => {
      const crpId = 5;

      service.getCommentsExcelByInitiative(crpId).subscribe();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}comment/excel/initiative/5`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });

  describe('getCommentsRawExcel', () => {
    it('should fetch raw excel data', () => {
      const crpId = 10;

      service.getCommentsRawExcel(crpId).subscribe();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}comment/excel-raw/10`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });

  describe('getRawComments', () => {
    it('should fetch raw comments', () => {
      const params = { crp_id: 7 };

      service.getRawComments(params).subscribe();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}comment/raw/7`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });

  describe('getCycles', () => {
    it('should fetch cycles', () => {
      service.getCycles().subscribe();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}comment/cycles`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });

  describe('updateCycle', () => {
    it('should update cycle', () => {
      const params = { id: 1, status: 'active' };

      service.updateCycle(params).subscribe();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}comment/cycles/update`);
      expect(req.request.method).toBe('PATCH');
      req.flush({});
    });
  });

  describe('toggleApprovedNoComments', () => {
    it('should toggle approved status', () => {
      const params = { approved: true };
      const evaluationId = 15;

      service.toggleApprovedNoComments(params, evaluationId).subscribe();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}comment/approved/15`);
      expect(req.request.method).toBe('POST');
      req.flush({});
    });
  });

  describe('createTag', () => {
    it('should create tag', () => {
      const params = { tag: 'test' };

      service.createTag(params).subscribe();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}evaluation/detail/comment/tag`);
      expect(req.request.method).toBe('POST');
      req.flush({});
    });
  });

  describe('deleteTag', () => {
    it('should delete tag', () => {
      const id = 25;

      service.deleteTag(id).subscribe();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}evaluation/detail/comment/tag/25`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('getTagId', () => {
    it('should fetch tag by id', () => {
      const params = { commentId: 1, tagTypeId: 2, userId: 3 };

      service.getTagId(params).subscribe();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}evaluation/detail/comment/tag/1/2/3`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });

  describe('getAllTags', () => {
    it('should fetch all tags', () => {
      const crpId = 5;

      service.getAllTags(crpId).subscribe();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}comment/tags/?crp_id=5`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });

  describe('getFeedTags', () => {
    it('should fetch feed tags', () => {
      const indicatorName = 'test';
      const tagTypeId = 3;

      service.getFeedTags(indicatorName, tagTypeId).subscribe();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}comment/tags/feed/?indicator_view_name=test&tagTypeId=3`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });

  describe('groupTags', () => {
    it('should group tags by indicator', () => {
      const tags = [
        { indicator_view_name: 'qa_impact_contribution', tagType: 'agree', total: '5' },
        { indicator_view_name: 'qa_impact_contribution', tagType: 'disagree', total: '3' }
      ];

      const result = service.groupTags(tags);

      expect(result).toBeDefined();
      expect(result['qa_impact_contribution']).toBeDefined();
      expect(result['qa_impact_contribution']['agree']).toBe(5);
      expect(result['qa_impact_contribution']['disagree']).toBe(3);
    });

    it('should handle missing tags', () => {
      const tags: any[] = [];

      const result = service.groupTags(tags);

      expect(result).toBeDefined();
      expect(result['qa_impact_contribution']['agree']).toBe(0);
    });

    it('should set notsure to 0 when not present', () => {
      const tags = [
        { indicator_view_name: 'qa_other_outcome', tagType: 'agree', total: '2' }
      ];

      const result = service.groupTags(tags);

      expect(result['qa_other_outcome']['notsure']).toBe(0);
    });
  });

  describe('getBatches', () => {
    it('should fetch batches', () => {
      service.getBatches().subscribe();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}comment/batches`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });

  describe('getQuickComments', () => {
    it('should fetch quick comments', () => {
      service.getQuickComments().subscribe();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}comment/default-list`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });

  describe('patchHighlightComment', () => {
    it('should patch highlight comment', () => {
      const params = { highlight: true };

      service.patchHighlightComment(params).subscribe();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}evaluation/highlight-comment`);
      expect(req.request.method).toBe('PATCH');
      req.flush({});
    });
  });

  describe('patchRequireChanges', () => {
    it('should patch require changes and trigger refresh', (done) => {
      const params = { require: true };
      let refreshTriggered = false;

      service.refresh$.subscribe(() => {
        refreshTriggered = true;
      });

      service.patchRequireChanges(params).subscribe(() => {
        expect(refreshTriggered).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}evaluation/require-changes`);
      expect(req.request.method).toBe('PATCH');
      req.flush({});
    });
  });

  describe('patchPpuChanges', () => {
    it('should patch ppu changes', () => {
      const params = { ppu: 'value' };

      service.patchPpuChanges(params).subscribe();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}comment/ppu`);
      expect(req.request.method).toBe('PATCH');
      req.flush({});
    });
  });

  describe('getEvaluationStatus', () => {
    it('should fetch evaluation status', () => {
      const resultId = 100;

      service.getEvaluationStatus(resultId).subscribe();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}evaluation/status/100`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });
});
