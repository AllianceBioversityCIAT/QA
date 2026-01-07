import { TestBed } from '@angular/core/testing';
import { ExportTablesService } from './export-tables.service';
import * as FileSaver from 'file-saver';

jest.mock('file-saver', () => ({
  saveAs: jest.fn()
}));

describe('ExportTablesService', () => {
  let service: ExportTablesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExportTablesService]
    });
    service = TestBed.inject(ExportTablesService);
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('exportExcel', () => {
    it('should handle export with simple data', (done) => {
      const testData = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 }
      ];

      service.exportExcel(testData, 'test-file');

      setTimeout(() => {
        expect(FileSaver.saveAs).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should handle export with column widths', (done) => {
      const testData = [{ name: 'Test' }];
      const wscols = [{ wpx: 100 }];

      service.exportExcel(testData, 'test', wscols);

      setTimeout(() => {
        expect(FileSaver.saveAs).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should handle empty data', (done) => {
      service.exportExcel([], 'empty');

      setTimeout(() => {
        expect(FileSaver.saveAs).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('exportMultipleSheetsExcel', () => {
    it('should export multiple sheets', (done) => {
      const comments = [{ comment: 'Test comment' }];
      const assessment = [{ status: 'Completed' }];

      service.exportMultipleSheetsExcel(comments, 'multi-sheet', undefined, assessment);

      setTimeout(() => {
        expect(FileSaver.saveAs).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should export with column widths', (done) => {
      const comments = [{ comment: 'Test' }];
      const assessment = [{ status: 'Done' }];
      const wscols = [{ wpx: 150 }];

      service.exportMultipleSheetsExcel(comments, 'file', wscols, assessment);

      setTimeout(() => {
        expect(FileSaver.saveAs).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should handle empty data arrays', (done) => {
      service.exportMultipleSheetsExcel([], 'empty', undefined, []);

      setTimeout(() => {
        expect(FileSaver.saveAs).toHaveBeenCalled();
        done();
      }, 100);
    });
  });
});
