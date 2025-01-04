export class FilterService {
  static filterFeatures(features, filters) {
    console.log('FilterService.filterFeatures called with:', {
      featureCount: features.length,
      filters,
      hasFilters: Object.keys(filters).length > 0
    });

    // If no filters are active, return all features
    if (!Object.keys(filters).length) {
      console.log('No active filters, returning all features');
      return features;
    }

    const filtered = features.filter(feature => {
      // Apply all active filters
      return Object.entries(filters).every(([filterType, value]) => {
        const result = this.applySingleFilter(filterType, value, feature);
        console.log(`Filter ${filterType}:`, { value, passed: result });
        return result;
      });
    });

    console.log('Filtering complete:', {
      inputCount: features.length,
      outputCount: filtered.length,
      activeFilters: Object.keys(filters)
    });

    return filtered;
  }

  static applySingleFilter(filterType, value, feature) {
    switch (filterType) {
      case 'keyword':
        return this.applyKeywordFilter(feature, value);
      case 'type':
        return this.applyTypeFilter(feature, value);
      case 'status':
        return this.applyStatusFilter(feature, value);
      case 'features':
        return this.applyFeaturesFilter(feature, value);
      default:
        console.log('Unknown filter type:', filterType);
        return true;
    }
  }

  static applyKeywordFilter(feature, keyword) {
    if (!keyword) return true;
    const searchText = `${feature.properties.title} ${feature.properties.description}`.toLowerCase();
    return searchText.includes(keyword.toLowerCase());
  }

  static applyTypeFilter(feature, types) {
    if (!types?.length) return true;
    return types.includes(feature.properties.type);
  }

  static applyStatusFilter(feature, status) {
    if (!status) return true;
    return feature.properties.status === status;
  }

  static applyFeaturesFilter(feature, features) {
    if (!features?.length) return true;
    return features.every(f => feature.properties.features.includes(f));
  }

  static cleanFilters(filters) {
    return Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => {
        if (Array.isArray(value)) return value.length > 0;
        return Boolean(value);
      })
    );
  }
}
