import { Injectable } from '@angular/core';
import { CurrenciesProvider } from '@shared/module/poe/provider';
import { Currency, Language } from '@shared/module/poe/type';
import { Observable, of } from 'rxjs';
import { flatMap, map, shareReplay } from 'rxjs/operators';
import { ContextService } from '../context.service';

const CACHE_SIZE = 1;

@Injectable({
    providedIn: 'root'
})
export class CurrencyService {
    private cache$: {
        [key: string]: Observable<Currency>
    } = {};

    constructor(
        private readonly context: ContextService,
        private readonly currenciesProvider: CurrenciesProvider) { }

    public get(language?: Language): Observable<Currency[]> {
        language = language || this.context.get().language;

        return this.currenciesProvider.provide(language);
    }

    public searchById(id: string, language?: Language): Observable<Currency> {
        language = language || this.context.get().language;

        const key = this.getCacheKey(id, language);
        return this.cache$[key] || (
            this.cache$[key] = this.searchByPredicate(language, x => x.id === id).pipe(
                shareReplay(CACHE_SIZE)
            ));
    }

    public searchByNameType(nameType: string, language?: Language): Observable<Currency> {
        language = language || this.context.get().language;

        const key = this.getCacheKey(nameType, language);
        return this.cache$[key] || (
            this.cache$[key] = this.searchByPredicate(language, x => x.nameType === nameType).pipe(
                shareReplay(CACHE_SIZE)
            ));
    }

    private getCacheKey(id: string, language: Language): string {
        return `${id}:${language}`;
    }

    private searchByPredicate(language: Language, predicate: (currency: Currency) => boolean): Observable<Currency> {
        return this.currenciesProvider.provide(language).pipe(
            map(currencies => currencies.find(predicate))
        );
    }
}
