import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';
import { environment } from '../../environments/environment';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DashboardService]
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDashboardEvaluations', () => {
    it('should fetch dashboard evaluations by user id', () => {
      const userId = 123;
      const mockData = { evaluations: [] };

      service.getDashboardEvaluations(userId).subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}evaluation/user/123`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });

  describe('geListDashboardEvaluations', () => {
    it('should fetch list dashboard evaluations', () => {
      const id = 1;
      const viewName = 'test_view';
      const viewPrimaryField = 'id';
      const crpId = 5;
      const mockData = { list: [] };

      service.geListDashboardEvaluations(id, viewName, viewPrimaryField, crpId).subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}evaluation/1/list?crp_id=5`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        view_name: viewName,
        view_primary_field: viewPrimaryField
      });
      req.flush(mockData);
    });

    it('should handle undefined crp_id', () => {
      service.geListDashboardEvaluations(1, 'view', 'field').subscribe();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}evaluation/1/list?crp_id=undefined`);
      expect(req.request.method).toBe('POST');
      req.flush({});
    });
  });

  describe('getAllDashboardEvaluations', () => {
    it('should fetch all dashboard evaluations', () => {
      const crpId = 10;
      const mockData = { all: [] };

      service.getAllDashboardEvaluations(crpId).subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(request =>
        request.url === `${environment.apiBaseUrl}evaluation/` &&
        request.params.get('crp_id') === '10'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should handle undefined crp_id', () => {
      service.getAllDashboardEvaluations().subscribe();

      const req = httpMock.expectOne(request =>
        request.url === `${environment.apiBaseUrl}evaluation/`
      );
      req.flush({});
    });
  });

  describe('getAllDashboardEvaluationsByCRP', () => {
    it('should fetch all dashboard evaluations by CRP', () => {
      const crpId = 15;
      const mockData = { crp: [] };

      service.getAllDashboardEvaluationsByCRP(crpId).subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(request =>
        request.url === `${environment.apiBaseUrl}evaluation/status/crp` &&
        request.params.get('crp_id') === '15'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });

  describe('getCRPS', () => {
    it('should fetch all CRPs', () => {
      const mockData = { crps: [] };

      service.getCRPS().subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}evaluation/crp`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });

  describe('getIndicatorsByCRP', () => {
    it('should fetch indicators by CRP', () => {
      const mockData = { indicators: [] };

      service.getIndicatorsByCRP().subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}evaluation/crp/indicators`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });

  describe('getAllBatches', () => {
    it('should fetch all batches', () => {
      const mockData = { batches: [] };

      service.getAllBatches().subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}comment/batches`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });

  describe('getHighlightedData', () => {
    it('should fetch highlighted data without type', () => {
      const mockData = { highlighted: [] };

      service.getHighlightedData().subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}evaluation/highlight-status`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should fetch highlighted data with type', () => {
      const mockData = { highlighted: [] };

      service.getHighlightedData('specific').subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}evaluation/highlight-status?type=specific`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });

  describe('sortProperties', () => {
    it('should sort object properties by value', () => {
      const obj = { a: 3, b: 1, c: 2 };
      const result = service.sortProperties(obj);

      expect(result).toEqual([
        ['b', 1],
        ['c', 2],
        ['a', 3]
      ]);
    });

    it('should handle empty object', () => {
      const obj = {};
      const result = service.sortProperties(obj);

      expect(result).toEqual([]);
    });

    it('should handle negative numbers', () => {
      const obj = { x: -5, y: 10, z: 0 };
      const result = service.sortProperties(obj);

      expect(result[0]).toEqual(['x', -5]);
      expect(result[1]).toEqual(['z', 0]);
      expect(result[2]).toEqual(['y', 10]);
    });
  });

  describe('groupData', () => {
    it('should group data and calculate totals', () => {
      const data = {
        group1: [
          { value: '10', order: 1 },
          { value: '20', order: 1 }
        ],
        group2: [
          { value: '5', order: 2 }
        ]
      };

      const result = service.groupData(data);

      expect(result.group1.total).toBe(30);
      expect(result.group1.order).toBe(1);
      expect(result.group2.total).toBe(5);
      expect(result.group2.order).toBe(2);
    });

    it('should handle empty groups', () => {
      const data = {};
      const result = service.groupData(data);

      expect(result).toEqual({});
    });

    it('should handle string values', () => {
      const data = {
        test: [
          { value: '100', order: 1 },
          { value: '200', order: 1 }
        ]
      };

      const result = service.groupData(data);

      expect(result.test.total).toBe(300);
    });
  });

  describe('groupByProp', () => {
    it('should group array by property', () => {
      const array = [
        { category: 'A', value: 1 },
        { category: 'B', value: 2 },
        { category: 'A', value: 3 }
      ];

      const result = service.groupByProp(array, 'category');

      expect(result['A']).toHaveLength(2);
      expect(result['B']).toHaveLength(1);
      expect(result['A'][0].value).toBe(1);
      expect(result['A'][1].value).toBe(3);
    });

    it('should handle empty array', () => {
      const array: any[] = [];
      const result = service.groupByProp(array, 'key');

      expect(result).toEqual({});
    });

    it('should handle different property keys', () => {
      const array = [
        { type: 'X', name: 'Item1' },
        { type: 'Y', name: 'Item2' },
        { type: 'X', name: 'Item3' }
      ];

      const result = service.groupByProp(array, 'type');

      expect(Object.keys(result)).toEqual(['X', 'Y']);
      expect(result['X']).toHaveLength(2);
      expect(result['Y']).toHaveLength(1);
    });
  });
});
