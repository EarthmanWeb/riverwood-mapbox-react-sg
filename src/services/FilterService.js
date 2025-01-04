export class FilterService {
  static cleanFilters(filters) {
    console.log('🔍 FilterService: Cleaning filters:', {
      input: filters,
      isTypeArray: Array.isArray(filters.type)
    });

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

    console.log('🔍 FilterService: Cleaned filters:', result);
    return result;
  }

  static normalizeArrayValue(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    return [value].filter(Boolean);
  }

  static filterFeatures(features, filters) {
    console.log('🔍 FilterService: Filtering features:', {
      featureCount: features?.length,
      filters,
      filterKeys: Object.keys(filters)
    });

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

      return keywordMatch && typeMatch && labelMatch;
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
}
