import React from 'react';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import '../../styles/service-filters.scss';
import { ServiceType } from '../../types/service';

interface ServiceFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedType: ServiceType | 'all';
  setSelectedType: (type: ServiceType | 'all') => void;
  selectedPriceRange: string;
  setSelectedPriceRange: (range: string) => void;
}

const ServiceFilters: React.FC<ServiceFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedType,
  setSelectedType,
  selectedPriceRange,
  setSelectedPriceRange
}) => {
  return (
    <div className="service-filters">
      <div className="search-box">
        <SearchIcon />
        <input
          type="text"
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="filters">
        <div className="filter-group">
          <label>
            <FilterListIcon />
            <span>Type</span>
          </label>
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value as ServiceType | 'all')}
          >
            <option value="all">All Types</option>
            <option value="gym">Gym</option>
            <option value="co-working">Co-working Space</option>
            <option value="banquet">Banquet Hall</option>
            <option value="cafe">Cafe</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="filter-group">
          <label>
            <FilterListIcon />
            <span>Price Range</span>
          </label>
          <select
            value={selectedPriceRange}
            onChange={(e) => setSelectedPriceRange(e.target.value)}
          >
            <option value="all">All Prices</option>
            <option value="0-50">$0 - $50</option>
            <option value="51-100">$51 - $100</option>
            <option value="101-200">$101 - $200</option>
            <option value="201+">$201+</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ServiceFilters;
