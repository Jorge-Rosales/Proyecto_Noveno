import { TestBed } from '@angular/core/testing';
import { SeriesDraft } from '../models/series.model';
import { SeriesService } from './series.service';

describe('SeriesService', () => {
  let service: SeriesService;
  const draft: SeriesDraft = {
    title: 'Serie de prueba',
    creator: '',
    genre: '',
    rating: null,
    status: 'En progreso',
    totalSeasons: null,
    currentSeason: null,
    lastEpisode: null,
    startDate: '',
    finishDate: '',
    opinion: '',
    favoriteQuote: '',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeriesService);
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2026-01-01T12:00:00.000Z'));
  });

  afterEach(() => jasmine.clock().uninstall());

  it('creates, updates and deletes only the selected record', () => {
    const first = service.addSeries(draft);
    const second = service.addSeries({ ...draft, title: 'Otra serie' });

    expect(first.id).not.toBe(second.id);
    expect(Number.isNaN(Date.parse(first.createdAt))).toBeFalse();
    expect(first.updatedAt).toBe(first.createdAt);

    jasmine.clock().mockDate(new Date('2026-01-02T12:00:00.000Z'));
    service.updateSeries(first.id, { ...draft, title: 'Serie actualizada' });
    const updated = service.series().find((entry) => entry.id === first.id);
    expect(updated?.title).toBe('Serie actualizada');
    expect(updated?.createdAt).toBe(first.createdAt);
    expect(updated?.updatedAt).toBe('2026-01-02T12:00:00.000Z');
    expect(updated?.id).toBe(first.id);
    expect(service.series().find((entry) => entry.id === second.id)?.title).toBe('Otra serie');

    service.deleteSeries(first.id);
    expect(service.series().map((entry) => entry.id)).toEqual([second.id]);
  });
});
