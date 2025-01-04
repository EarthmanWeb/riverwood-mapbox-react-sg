export class FilterService {
  static cleanFilters(filters) {
    // console.log('🔍 FilterService: Cleaning filters:', {
    //   input: filters,
    //   isTypeArray: Array.isArray(filters.type)
    // });

    // Start with known structure
    const cleaned = {
      keyword: filters.keyword || '',
      type: Array.isArray(filters.type) ? filters.type : 
            filters.type ? [filters.type] : [],
      labels: Array.isArray(filters.labels) ? filters.labels :
            filters.labels ? [filters.labels] : [],
      features: Array.isArray(filters.features) ? filters.features :
            filters.features ? [filters.features] : [],
      status: filters.status || ''
    };

    // Remove empty values but preserve empty arrays
    const result = Object.fromEntries(
      Object.entries(cleaned).filter(([_, value]) => {
        if (Array.isArray(value)) return true; // Keep all arrays
        return Boolean(value);
      })
    );

    // console.log('🔍 FilterService: Cleaned filters:', result);
    return result;
  }

  static normalizeArrayValue(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    return [value].filter(Boolean);
  }

  static countMatchesForTerm(features, filterType, term, currentFilters) {
    const filtersExceptCurrentType = { ...currentFilters };
    delete filtersExceptCurrentType[filterType];

    // First filter by other types only
    const filteredByOtherTypes = this.filterFeatures(features, filtersExceptCurrentType);
    
    // Then count matches for this term
    return filteredByOtherTypes.filter(feature => {
      switch (filterType) {
        case 'type':
          return feature.properties.type === term;
        case 'labels':
          return feature.properties.labels?.includes(term);
        case 'features':
          return feature.properties.features?.includes(term);
        default:
          return false;
      }
    }).length;
  }

  static filterFeatures(features, filters) {
    // console.log('🔍 FilterService: Filtering features:', {
    //   featureCount: features?.length,
    //   filters,
    //   filterKeys: Object.keys(filters)
    // });

    if (!features?.length) return features;
    
    const cleanFilters = this.cleanFilters(filters);
    if (!Object.keys(cleanFilters).length) return features;

    return features.filter(feature => {
      const keywordMatch = !cleanFilters.keyword || 
        this.applyKeywordFilter(feature, cleanFilters.keyword);

      const typeMatch = !cleanFilters.type?.length || 
        cleanFilters.type.some(t => feature.properties.type === t);

      const labelMatch = !cleanFilters.labels?.length ||
        cleanFilters.labels.some(l => feature.properties.labels?.includes(l));

      const featureMatch = !cleanFilters.features?.length ||
        cleanFilters.features.some(f => feature.properties.features?.includes(f));

      return keywordMatch && typeMatch && labelMatch && featureMatch;
    });
  }

  static applyKeywordFilter(feature, keywords) {
    if (!keywords) return true;
    
    const searchText = `${feature.properties.title} ${feature.properties.description}`.toLowerCase();
    
    const terms = [];
    let remaining = keywords;
    
    const quotes = remaining.match(/"([^"]+)"/g) || [];
    quotes.forEach(quote => {
      terms.push(quote.slice(1, -1));
      remaining = remaining.replace(quote, '');
    });
    
    const individualTerms = remaining
      .split(/\s+/)
      .map(term => term.trim().toLowerCase())
      .filter(term => term.length > 0);
    
    terms.push(...individualTerms);

    return terms.every(term => {
      if (term.includes(' ')) {
        return searchText.includes(term.toLowerCase());
      }
      return searchText.includes(term.toLowerCase());
    });
  }

  static getFilteredResults(features, filters) {
    console.log('🎯 Getting filtered results:', { 
      featureCount: features?.length, 
      filters 
    });
    return this.filterFeatures(features, filters);
  }

  static getOptionsWithCount(features, filterType, options, currentFilters) {
    // Remove current filter type selections from counting
    const filtersForCounting = { ...currentFilters };
    delete filtersForCounting[filterType];

    console.log('📊 Counting matches for options:', {
      filterType,
      optionsCount: options.length,
      currentFilters,
      filtersForCounting,
      featureCount: features?.length
    });

    // First filter by other active filters
    const filteredByOthers = this.filterFeatures(features, filtersForCounting);
    
    console.log('📊 Features after other filters:', {
      filterType,
      remainingCount: filteredByOthers.length
    });

    // Count matches for each option
    return options.map(option => {
      const count = filteredByOthers.filter(feature => {
        switch (filterType) {
          case 'type':
            return feature.properties.type === option;
          case 'labels':
            return feature.properties.labels?.includes(option);
          default:
            return false;
        }
      }).length;

      return {
        label: option,
        value: option,
        count
      };
    });
  }
}
