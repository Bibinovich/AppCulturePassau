import { useMemo } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';

interface Locatable {
  country: string;
  city: string;
}

export function useLocationFilter() {
  const { state } = useOnboarding();
  const { country, city } = state;

  const filterByLocation = useMemo(() => {
    return <T extends Locatable>(items: T[]): T[] => {
      if (!country) return items;
      const countryFiltered = items.filter(item => item.country === country);
      if (!city) return countryFiltered;

      const cityLower = city.toLowerCase();

      const cityFiltered = countryFiltered.filter(item => {
        const itemCity = item.city?.toLowerCase() || '';
        const itemLocation = (item as any).location?.toLowerCase() || '';
        const itemAddress = (item as any).address?.toLowerCase() || '';
        const itemVenue = (item as any).venue?.toLowerCase() || '';

        return itemCity.includes(cityLower) ||
               itemLocation.includes(cityLower) ||
               itemAddress.includes(cityLower) ||
               itemVenue.includes(cityLower);
      });

      return cityFiltered;
    };
  }, [country, city]);

  return { filterByLocation, country, city };
}
