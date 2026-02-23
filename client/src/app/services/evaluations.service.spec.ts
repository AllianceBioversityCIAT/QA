import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EvaluationsService } from './evaluations.service';
import { environment } from '../../environments/environment';

describe('EvaluationsService', () => {
  let service: EvaluationsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EvaluationsService]
    });
    service = TestBed.inject(EvaluationsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDataEvaluation', () => {
    it('should make POST request to get evaluation data', () => {
      const id = 123;
      const params = { criteria: 'test' };
      const mockResponse = { data: { evaluation: 'test' } };

      service.getDataEvaluation(id, params).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}evaluation/${id}/detail`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(params);
      req.flush(mockResponse);
    });
  });

  describe('updateDataEvaluation', () => {
    it('should make PATCH request to update evaluation data', () => {
      const id = 456;
      const params = { comment: 'updated' };
      const mockResponse = { success: true };

      service.updateDataEvaluation(params, id).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}evaluation/${id}/detail/`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(params);
      req.flush(mockResponse);
    });
  });

  describe('updateRequireSecondAssessmentEvaluation', () => {
    it('should make PATCH request to update second assessment requirement', () => {
      const id = 789;
      const params = { require_second: true };
      const mockResponse = { updated: true };

      service.updateRequireSecondAssessmentEvaluation(id, params).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}evaluation/${id}/detail/second_assessment`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(params);
      req.flush(mockResponse);
    });
  });

  describe('getCriteriaByIndicator', () => {
    it('should make GET request to get criteria by indicator', () => {
      const id = 111;
      const mockResponse = { criteria: ['c1', 'c2'] };

      service.getCriteriaByIndicator(id).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}evaluation/indicator/${id}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getAssessorsByEvaluation', () => {
    it('should make GET request to get assessors', () => {
      const id = 222;
      const mockResponse = { assessors: ['assessor1', 'assessor2'] };

      service.getAssessorsByEvaluation(id).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}evaluation/${id}/assessors`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getEvaluationStatus', () => {
    it('should make GET request to get evaluation status', () => {
      const resultId = 333;
      const mockResponse = { status: 'completed' };

      service.getEvaluationStatus(resultId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}evaluation/status/${resultId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
