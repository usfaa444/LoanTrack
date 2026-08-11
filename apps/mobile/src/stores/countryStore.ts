import { create } from 'zustand';
import { Country, countries, defaultCountry } from '../data/countries';

interface CountryState {
  selected: Country;
  setCountry: (country: Country) => void;
}

export const useCountryStore = create<CountryState>((set) => ({
  selected: defaultCountry,
  setCountry: (selected) => set({ selected }),
}));