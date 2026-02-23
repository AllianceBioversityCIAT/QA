import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { IndicatorsService } from './indicators.service';
import { environment } from '../../environments/environment';

describe('IndicatorsService', () => {
  let service: IndicatorsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [IndicatorsService]
    });
    service = TestBed.inject(IndicatorsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    service.cleanAllOrders();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getIndicatorsByUser', () => {
    it('should fetch indicators by user', () => {
      const userId = 123;
      const crpId = 456;
      const mockData = { indicators: [] };

      service.getIndicatorsByUser(userId, crpId).subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}indicator/user/123?crp_id=456`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });

  describe('updateIndicatorsByUser', () => {
    it('should update indicators by user', () => {
      const userId = 789;
      const params = { enabled: true };
      const mockData = { success: true };

      service.updateIndicatorsByUser(userId, params).subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}indicator/789/user`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(params);
      req.flush(mockData);
    });
  });

  describe('getIndicators', () => {
    it('should fetch all indicators', () => {
      const mockData = { all: [] };

      service.getIndicators().subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}indicator/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });

  describe('getActionAreas', () => {
    it('should fetch action areas', () => {
      const mockData = { areas: [] };

      service.getActionAreas().subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}indicator/action-areas`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });

  describe('getCRP', () => {
    it('should fetch CRP by id', () => {
      const crpId = 10;
      const mockData = { crp: {} };

      service.getCRP(crpId).subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}indicator/crp/10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });

  describe('Order management', () => {
    it('should get current order when set', () => {
      service.setOrderByStatus(true);
      const current = service.getCurrentOrder();
      expect(current.type).toBe('orderByStatus');
      expect(current.value).toBe(true);
    });

    it('should return null when no order is set', () => {
      service.cleanAllOrders();
      const current = service.getCurrentOrder();
      expect(current.type).toBeNull();
      expect(current.value).toBeNull();
    });

    it('should get orderByStatus', () => {
      service.setOrderByStatus(true);
      expect(service.getOrderByStatus()).toBe(true);
    });

    it('should get orderByAcceptedWC', () => {
      service.setOrderByAccpetedWC(false);
      expect(service.getOrderByAcceptedWC()).toBe(false);
    });

    it('should get orderByDisagree', () => {
      service.setOrderByDisagree(true);
      expect(service.getOrderByDisagree()).toBe(true);
    });

    it('should get orderByClarification', () => {
      service.setOrderByClarification(false);
      expect(service.getOrderByClarification()).toBe(false);
    });

    it('should clean all orders', () => {
      service.setOrderByStatus(true);
      service.cleanAllOrders();
      expect(service.getOrderByStatus()).toBeNull();
      expect(service.getOrderByAcceptedWC()).toBeNull();
      expect(service.getOrderByDisagree()).toBeNull();
      expect(service.getOrderByClarification()).toBeNull();
    });

    it('should clean all orders when setting orderByStatus', () => {
      service.setOrderByDisagree(true);
      service.setOrderByStatus(false);
      expect(service.getOrderByDisagree()).toBeNull();
      expect(service.getOrderByStatus()).toBe(false);
    });

    it('should clean all orders when setting orderByAcceptedWC', () => {
      service.setOrderByStatus(true);
      service.setOrderByAccpetedWC(false);
      expect(service.getOrderByStatus()).toBeNull();
      expect(service.getOrderByAcceptedWC()).toBe(false);
    });

    it('should clean all orders when setting orderByDisagree', () => {
      service.setOrderByAccpetedWC(true);
      service.setOrderByDisagree(false);
      expect(service.getOrderByAcceptedWC()).toBeNull();
      expect(service.getOrderByDisagree()).toBe(false);
    });

    it('should clean all orders when setting orderByClarification', () => {
      service.setOrderByStatus(true);
      service.setOrderByClarification(false);
      expect(service.getOrderByStatus()).toBeNull();
      expect(service.getOrderByClarification()).toBe(false);
    });
  });

  describe('getItemStatusByIndicator', () => {
    it('should fetch item status by indicator', () => {
      const indicatorName = 'test_indicator';
      const crpId = 5;
      const mockData = { items: [] };

      service.getItemStatusByIndicator(indicatorName, crpId).subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}indicator/items/test_indicator?crp_id=5`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });

  describe('getAllItemStatusByIndicator', () => {
    it('should fetch all item status', () => {
      const mockData = { allItems: {} };

      service.getAllItemStatusByIndicator().subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}indicator/items`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });

  describe('formatItemStatusByIndicator', () => {
    it('should format item status object to array', () => {
      const obj = {
        item1: { approved_without_comment: 5, assessment_with_comments: 3, pending: 2 },
        item2: { approved_without_comment: 1, assessment_with_comments: 4, pending: 6 }
      };

      const result = service.formatItemStatusByIndicator(obj);

      expect(result).toHaveLength(2);
      expect(result[0].item).toBe('item1');
      expect(result[0].approved_without_comment).toBe(5);
      expect(result[1].item).toBe('item2');
      expect(result[1].pending).toBe(6);
    });

    it('should handle null input', () => {
      const result = service.formatItemStatusByIndicator(null);
      expect(result).toEqual([]);
    });

    it('should handle empty object', () => {
      const result = service.formatItemStatusByIndicator({});
      expect(result).toEqual([]);
    });

    it('should add default values for missing properties', () => {
      const obj = {
        item1: { approved_without_comment: 5 }
      };

      const result = service.formatItemStatusByIndicator(obj);

      expect(result[0].assessment_with_comments).toBe(0);
      expect(result[0].pending).toBe(0);
    });
  });

  describe('formatAllItemStatusByIndicator', () => {
    it('should format all items to values', () => {
      const allItems = {
        indicator1: { item1: { value: 1 }, item2: { value: 2 } },
        indicator2: { item3: { value: 3 } }
      };

      const result = service.formatAllItemStatusByIndicator(allItems);

      expect(Array.isArray(result.indicator1)).toBe(true);
      expect(Array.isArray(result.indicator2)).toBe(true);
      expect(result.indicator1).toHaveLength(2);
      expect(result.indicator2).toHaveLength(1);
    });

    it('should handle null input', () => {
      const result = service.formatAllItemStatusByIndicator(null);
      expect(result).toBeNull();
    });

    it('should handle empty object', () => {
      const result = service.formatAllItemStatusByIndicator({});
      expect(result).toEqual({});
    });
  });

  describe('Page list management', () => {
    it('should get page list for indicator', () => {
      const page = service.getPageList('qa_impact_contribution');
      expect(page).toBe(1);
    });

    it('should set page list for indicator', () => {
      service.setPageList(5, 'qa_other_outcome');
      expect(service.getPageList('qa_other_outcome')).toBe(5);
    });

    it('should get all pages indicator list', () => {
      const pages = service.getPagesIndicatorList();
      expect(pages).toBeDefined();
      expect(pages.qa_impact_contribution).toBe(1);
    });

    it('should set full page list', () => {
      const newPages = {
        qa_impact_contribution: 10,
        qa_other_outcome: 20
      };

      service.setFullPageList(newPages as any);
      const result = service.getPagesIndicatorList();

      expect(result.qa_impact_contribution).toBe(10);
      expect(result.qa_other_outcome).toBe(20);
    });

    it('should maintain page values across sets', () => {
      service.setPageList(3, 'qa_capdev');
      service.setPageList(7, 'qa_knowledge_product');

      expect(service.getPageList('qa_capdev')).toBe(3);
      expect(service.getPageList('qa_knowledge_product')).toBe(7);
    });
  });
});
